import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { Megaphone, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, LayoutGrid, Menu, X as XIcon, Clock, BookOpen } from 'lucide-react';
import axios from 'axios';

import { ExamSession, Question, ExamUser } from '@/types';

export default function ExamEngine({
    session,
    questions,
    examUser,
    serverTimeLeft,
    existingAnswers
}: {
    session: ExamSession,
    questions: Question[],
    examUser: ExamUser,
    serverTimeLeft: number,
    existingAnswers: Record<string, string>
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
    const [isTimeWarningShown, setIsTimeWarningShown] = useState(false);
    const currentQuestion = questions[currentQuestionIndex];

    const { data, setData, post, processing } = useForm({
        answers: existingAnswers || {} as Record<string, string>, // question_id: answer
    });

    // Debounce timer ref untuk auto-save agar tidak spam request per klik/karakter
    const autoSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // State untuk modal konfirmasi selesai ujian
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Trigger auto submit when time's up using global router since useForm might be rendering
                    router.post(route('siswa.exams.submit'), {
                        exam_session_id: session.id,
                        answers: data.answers,
                        finish: true
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            window.location.href = route('siswa.dashboard');
                        }
                    });
                    return 0;
                }

                // Show warning when time is less than 5 minutes (300 seconds)
                if (prev === 300 && !isTimeWarningShown) {
                    toast.warning('WAKTU HAMPIR HABIS!', {
                        description: 'Waktu ujian Anda tersisa 5 menit lagi.',
                        icon: <Megaphone className="w-5 h-5 text-orange-500" />
                    });
                    setIsTimeWarningShown(true);
                }
                return prev - 1;
            });
        }, 1000);

        // Anti-Cheat Handlers
        const reportViolation = (type: string) => {
            axios.post(route('siswa.exams.report-cheat'), {
                exam_session_id: session.id,
                type: type
            }).then(response => {
                const resData = response.data;
                if (resData.status === 'disqualified') {
                    toast.error('DISKUALIFIKASI', { description: resData.message, duration: 5000 });
                    setTimeout(() => window.location.href = route('siswa.dashboard'), 3000);
                } else if (resData.status === 'success') {
                    toast.warning('PERINGATAN KECURANGAN!', {
                        description: `Aktivitas mencurigakan terdeteksi. (Peringatan ke-${resData.warnings})`,
                        duration: 5000
                    });
                }
            }).catch(console.error);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) reportViolation('tab_switch');
        };

        const handleBlur = () => {
            reportViolation('window_blur');
        };

        const handleContextMenu = (e: Event) => e.preventDefault();

        const handleCopyPaste = (e: Event) => {
            e.preventDefault();
            reportViolation('copy_paste_attempt');
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F12' || (e.ctrlKey && (e.key.toLowerCase() === 'u' || (e.shiftKey && e.key.toLowerCase() === 'i')))) {
                e.preventDefault();
                reportViolation('developer_tools_attempt');
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                reportViolation('exited_fullscreen');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Real-time Broadcast Listeners
        if (window.Echo) {
            const sessionChannel = window.Echo.private(`exam.session.${session.id}`);
            const globalChannel = window.Echo.private(`proktor.broadcast.global`);

            const handleAnnouncement = (e: any) => {
                console.log('Announcement received:', e);

                // Handle technical commands
                if (e.message === 'force_logout') {
                    toast.error('SESI DIHENTIKAN', { description: 'Proktor telah menghentikan sesi ini. Anda akan diarahkan keluar.' });
                    setTimeout(() => window.location.href = route('siswa.dashboard'), 3000);
                    return;
                }

                if (e.message.startsWith('force_logout_user:')) {
                    const targetUserId = parseInt(e.message.split(':')[1]);
                    if (targetUserId === examUser.user_id) {
                        toast.error('AKSES DICABUT', { description: 'Akses Anda ke sesi ini telah dicabut oleh Proktor.' });
                        setTimeout(() => window.location.href = route('siswa.dashboard'), 3000);
                    }
                    return;
                }

                if (e.message.startsWith('extend_time|')) {
                    const minutes = parseInt(e.message.split('|')[1]);
                    setTimeLeft(prev => prev + (minutes * 60));
                    toast.success('WAKTU BERTAMBAH!', {
                        description: `Proktor menambah waktu ujian sebanyak ${minutes} menit.`,
                        duration: 10000
                    });
                    return;
                }

                // Normal announcement
                toast(e.message, {
                    duration: 10000,
                    icon: <Megaphone className="w-5 h-5 text-indigo-600" />,
                    description: `Pesan dari Proktor (${e.senderName})`,
                    style: {
                        background: '#f0f4ff',
                        border: '2px solid #4f46e5',
                    }
                });

                // Audio alert
                try {
                    const audio = new Audio('/audio/notification.mp3');
                    audio.play();
                } catch (err) {
                    console.log('Audio play failed');
                }
            };

            sessionChannel.listen('.proktor.announcement', handleAnnouncement);
            globalChannel.listen('.proktor.announcement', handleAnnouncement);

            return () => {
                sessionChannel.stopListening('.proktor.announcement');
                globalChannel.stopListening('.proktor.announcement');
                window.Echo.leave(`exam.session.${session.id}`);
                window.Echo.leave(`proktor.broadcast.global`);
            };
        }

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleAnswer = (questionId: number, answer: string) => {
        const newAnswers = { ...data.answers, [questionId]: answer };
        setData('answers', newAnswers);

        // Debounce auto-save: 500ms untuk PG, 1000ms untuk essay
        if (autoSaveDebounceRef.current) clearTimeout(autoSaveDebounceRef.current);
        const delay = currentQuestion?.type === 'essay' ? 1000 : 500;
        autoSaveDebounceRef.current = setTimeout(() => {
            router.post(route('siswa.exams.submit'), {
                exam_session_id: session.id,
                answers: newAnswers
            }, {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () => {
                    // Sesi sudah tidak aktif atau sudah finished — tidak perlu lakukan apapun
                }
            });
        }, delay);
    };

    const handleFinishConfirmed = () => {
        setIsSubmitting(true);
        router.post(route('siswa.exams.submit'), {
            exam_session_id: session.id,
            answers: data.answers,
            finish: true
        }, {
            onSuccess: () => {
                window.location.href = route('siswa.dashboard');
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const finishExam = () => {
        setIsFinishModalOpen(true);
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
            <Head title={`Ujian: ${session.exam?.title || 'Ujian'}`} />

            {/* Sticky Header Baru */}
            <header className="fixed top-0 inset-x-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-none rotate-3 group-hover:rotate-0 transition-transform">
                            E
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{session.exam?.title}</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{session.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all ${timeLeft < 300 ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                            <span className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</span>
                        </div>
                        
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Linear Progress Bar */}
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </header>

            <main className="flex-1 flex pt-20 pb-24 lg:pb-0 overflow-hidden">
                {/* Side Navigation for Desktop */}
                <aside className="hidden lg:flex w-80 flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-6 overflow-y-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigasi Soal</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                            {Object.keys(data.answers).length} / {questions.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 pb-6">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => {
                                    setCurrentQuestionIndex(idx);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95 ${
                                    currentQuestionIndex === idx
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none ring-4 ring-indigo-50 dark:ring-indigo-950'
                                        : data.answers[q.id]
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 shadow-sm'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30">
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Mata Pelajaran</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{session.exam?.title}</p>
                        </div>
                        <button
                            onClick={finishExam}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Selesai Ujian
                        </button>
                    </div>
                </aside>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-12 bg-gray-50/30 dark:bg-gray-950/30">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Question Badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                    {currentQuestionIndex + 1}
                                </span>
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">PERTANYAAN</h3>
                            </div>
                            <div className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {currentQuestion.type === 'essay' ? 'Uraian' : 'Pilihan Ganda'}
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="prose dark:prose-invert max-w-none text-lg sm:text-xl font-medium leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
                        </div>

                        {/* Options / Answer Area */}
                        <div className="space-y-4">
                            {currentQuestion.type === 'pilihan_ganda' ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.options && Object.entries(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : (currentQuestion.options as object)).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleAnswer(currentQuestion.id, key)}
                                            className={`group relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                                                data.answers[currentQuestion.id] === key
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md shadow-indigo-100/50 dark:shadow-none translate-x-1'
                                                    : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                                                data.answers[currentQuestion.id] === key
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                            }`}>
                                                {key.toUpperCase()}
                                            </div>
                                            <div className="flex-1 pt-1.5 prose-sm sm:prose dark:prose-invert text-gray-700 dark:text-gray-300 font-medium" dangerouslySetInnerHTML={{ __html: value as string }} />
                                            {data.answers[currentQuestion.id] === key && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <textarea
                                        className="w-full p-6 sm:p-8 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 outline-none transition text-lg dark:text-gray-200 min-h-[300px]"
                                        placeholder="Tuliskan jawaban lengkap Anda di sini..."
                                        value={data.answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                    ></textarea>
                                    <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                                        <BookOpen className="w-4 h-4" /> Autosafe Active
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation Buttons */}
                        <div className="hidden lg:flex items-center justify-between pt-6">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" /> Sebelumnya
                            </button>
                            
                            <div className="flex items-center gap-4">
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <button
                                        onClick={nextQuestion}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:translate-x-1 transition-all"
                                    >
                                        Selanjutnya <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={finishExam}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-700 transition-all"
                                    >
                                        Selesaikan Ujian <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4 pb-safe flex items-center justify-between z-40 pointer-events-auto">
                <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl disabled:opacity-30"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex-1 max-w-[140px] px-4 py-3 mx-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Soal {currentQuestionIndex + 1} / {questions.length}
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        onClick={nextQuestion}
                        className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                ) : (
                    <button
                        onClick={finishExam}
                        className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 dark:shadow-none"
                    >
                        <CheckCircle className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Mobile Navigation Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
                    <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-[3rem] p-8 pb-10 shadow-2xl transition-transform transform translate-y-0">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Daftar Soal</h3>
                                <p className="text-sm text-gray-500 font-medium">Lompat ke nomor pertanyaan apapun</p>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => {
                                        setCurrentQuestionIndex(idx);
                                        setIsDrawerOpen(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`aspect-square flex items-center justify-center rounded-2xl font-bold text-sm transition-all ${
                                        currentQuestionIndex === idx
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : data.answers[q.id]
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setIsDrawerOpen(false);
                                finishExam();
                            }}
                            className="w-full py-5 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-100 dark:shadow-none text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Selesaikan Ujian Sekarang
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Selesai Ujian */}
            {isFinishModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-md p-8 sm:p-10 border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                <AlertTriangle className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                                Selesaikan Ujian?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                                Anda telah menjawab <span className="font-bold text-indigo-600">{Object.keys(data.answers).length}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{questions.length}</span> soal yang tersedia.
                            </p>
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mb-8">
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Peringatan Penting</p>
                                <p className="text-sm text-red-500 mt-1">Setelah diselesaikan, Anda tidak dapat kembali dan mengubah jawaban apa pun.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleFinishConfirmed}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-100 dark:shadow-none active:scale-95 disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            YA, SELESAIKAN SEKARANG
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsFinishModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-2xl transition-colors active:scale-95"
                                >
                                    BATAL, LANJUTKAN UJIAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="top-center" expand={true} richColors />
        </div>
    );
}
