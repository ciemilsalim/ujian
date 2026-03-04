import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { Megaphone } from 'lucide-react';

export default function ExamEngine({ session, questions, examUser }: { session: any, questions: any[], examUser: any }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(session.exam.duration * 60);
    const currentQuestion: any = questions[currentQuestionIndex];

    const { data, setData, post, processing } = useForm({
        answers: {} as Record<number, string>, // question_id: answer
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Security: Tab switch detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                router.post(route('siswa.exams.report-cheat'), {
                    exam_session_id: session.id,
                    type: 'tab_switch'
                }, { preserveState: true, preserveScroll: true });
            }
        };

        const handleBlur = () => {
            router.post(route('siswa.exams.report-cheat'), {
                exam_session_id: session.id,
                type: 'window_blur'
            }, { preserveState: true, preserveScroll: true });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        // Real-time Broadcast Listeners
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
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch (err) {
                console.log('Audio play failed');
            }
        };

        sessionChannel.listen('.proktor.announcement', handleAnnouncement);
        globalChannel.listen('.proktor.announcement', handleAnnouncement);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            sessionChannel.stopListening('.proktor.announcement');
            globalChannel.stopListening('.proktor.announcement');
            window.Echo.leave(`exam.session.${session.id}`);
            window.Echo.leave(`proktor.broadcast.global`);
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

        // Auto-save logic
        router.post(route('siswa.exams.submit'), {
            exam_session_id: session.id,
            answers: newAnswers
        }, {
            preserveScroll: true,
            preserveState: true,
            only: [], // Don't refresh anything
        });
    };

    const finishExam = () => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan ujian ini?')) {
            router.post(route('siswa.exams.submit'), {
                exam_session_id: session.id,
                answers: data.answers,
                finish: true
            }, {
                onSuccess: () => {
                    window.location.href = route('siswa.dashboard');
                }
            });
        }
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Head title={`Ujian: ${session.exam.title}`} />

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">CAT</div>
                    <div>
                        <h1 className="text-sm font-bold truncate max-w-xs">{session.exam.title}</h1>
                        <p className="text-xs text-gray-500">{session.name}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Sisa Waktu</p>
                        <p className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-gray-100'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-bold text-indigo-600 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                    SOAL NOMOR {currentQuestionIndex + 1}
                                </span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-lg mb-8 leading-relaxed">
                                {currentQuestion.question_text}
                            </div>

                            {currentQuestion.type === 'pilihan_ganda' ? (
                                <div className="space-y-3">
                                    {(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options) !== null &&
                                        Object.entries((typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options) as Record<string, string>).map(([key, value]) => (
                                            <label
                                                key={key}
                                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${data.answers[currentQuestion.id] === key
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${currentQuestion.id}`}
                                                    className="hidden"
                                                    checked={data.answers[currentQuestion.id] === key}
                                                    onChange={() => handleAnswer(currentQuestion.id, key)}
                                                />
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold mr-4 ${data.answers[currentQuestion.id] === key
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                                                    }`}>
                                                    {key.toUpperCase()}
                                                </span>
                                                <span className="text-gray-800 dark:text-gray-200">{value}</span>
                                            </label>
                                        ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:border-indigo-500 outline-none transition"
                                    rows={6}
                                    placeholder="Ketik jawaban Anda di sini..."
                                    value={data.answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                ></textarea>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
                            >
                                Sebelumnya
                            </button>
                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={nextQuestion}
                                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition"
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button
                                    onClick={finishExam}
                                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition"
                                >
                                    Selesai Ujian
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <aside className="w-80 bg-white dark:bg-gray-800 shadow-lg p-6 overflow-y-auto hidden lg:block border-l border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Navigasi Soal</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${currentQuestionIndex === idx
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30'
                                    : data.answers[q.id]
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex justify-between text-xs mb-2">
                            <span>Terjawab</span>
                            <span className="font-bold">{Object.keys(data.answers).length} / {questions.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${(Object.keys(data.answers).length / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </aside>
            </main>
            <Toaster position="top-center" expand={true} richColors />
        </div>
    );
}
