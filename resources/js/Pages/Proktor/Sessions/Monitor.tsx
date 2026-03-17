import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Users, CheckCircle, Clock, Megaphone, Send, Layout, Table, User as UserIcon, LogOut, RotateCcw, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { ExamSession, ExamUser } from '@/types';

export default function Monitor({ session }: { session: ExamSession }) {
    // Local state for real-time participants data
    const [participants, setParticipants] = useState<ExamUser[]>(session.exam_users || []);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'visual'>(session.classroom?.id ? 'visual' : 'table');
    const [currentTime, setCurrentTime] = useState(session.end_time);

    const handleForceLogoutAll = () => {
        if (confirm('Apakah Anda yakin ingin mengeluarkan PAKSA seluruh siswa di sesi ini?')) {
            router.post(route('proktor.sessions.force-logout', session.id), {}, {
                onSuccess: () => toast.success('Perintah Logout paksa dikirim.')
            });
        }
    };

    const handleExtendTime = (minutes: number) => {
        router.post(route('proktor.sessions.extend-time', session.id), { minutes }, {
            onSuccess: () => toast.success(`Waktu berhasil ditambah ${minutes} menit.`)
        });
    };

    const handleResetLogin = (participantId: number) => {
        router.post(route('proktor.sessions.reset-login', participantId), {}, {
            onSuccess: () => toast.success('Login siswa berhasil di-reset.')
        });
    };

    const handleForceLogoutUser = (participantId: number) => {
        if (confirm('Keluarkan siswa ini secara paksa?')) {
            router.post(route('proktor.sessions.force-logout-user', participantId), {}, {
                onSuccess: () => toast.success('Perintah Logout paksa dikirim.')
            });
        }
    };

    const handleResetExam = (participantId: number, studentName: string) => {
        if (confirm(`Hapus SELURUH progres dan jawaban ${studentName}? Siswa akan mengulang dari nol.`)) {
            router.post(route('proktor.sessions.reset-exam', participantId), {}, {
                onSuccess: () => toast.success('Progres ujian siswa berhasil di-reset.')
            });
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!broadcastMessage.trim()) return;

        setIsSending(true);
        try {
            await axios.post(route('proktor.sessions.broadcast', session.id), {
                message: broadcastMessage
            });
            toast.success('Pengumuman berhasil terkirim ke semua siswa di sesi ini!');
            setBroadcastMessage('');
        } catch (error) {
            toast.error('Gagal mengirim pengumuman.');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        if (!window.Echo) return;

        // Listen to Reverb private channel
        const channel = window.Echo.private(`exam.session.${session.id}`);

        channel.listen('.student.updated', (e: any) => {
            console.log('Real-time event received:', e);
            setParticipants((prevParticipants: ExamUser[]) => {
                const existing = prevParticipants.find(p => p.user_id === e.userId);

                if (existing) {
                    // Update existing participant
                    return prevParticipants.map(p =>
                        p.user_id === e.userId
                            ? { ...p, status: e.status, score: e.score ?? p.score }
                            : p
                    );
                } else {
                    // New participant joined
                    const newUser: ExamUser = {
                        id: e.participantId || Math.random(),
                        user_id: e.userId,
                        exam_session_id: session.id,
                        status: e.status,
                        score: e.score,
                        user: { name: e.name } as any,
                        cheat_warnings: 0,
                        answers: [],
                        started_at: null,
                        finished_at: null,
                    };
                    return [...prevParticipants, newUser];
                }
            });
        });

        // Listen for proktor announcement (time extension)
        channel.listen('.proktor.announcement', (e: any) => {
            if (e.message.startsWith('extend_time|')) {
                const minutes = parseInt(e.message.split('|')[1]);
                const newTime = new Date(new Date(currentTime).getTime() + minutes * 60000).toISOString();
                setCurrentTime(newTime);
                toast.info(`Waktu sesi ini telah diperpanjang ${minutes} menit oleh ${e.senderName}`);
            }
        });

        return () => {
            channel.stopListening('.student.updated');
            channel.stopListening('.proktor.announcement');
            window.Echo.leave(`exam.session.${session.id}`);
        };
    }, [session.id, currentTime]);

    // Sort and Filter: Show finished first, then working. Hide waiting.
    const filteredParticipants = participants
        .filter(p => p.status !== 'waiting')
        .sort((a, b) => {
            if (a.status === 'finished' && b.status !== 'finished') return -1;
            if (a.status !== 'finished' && b.status === 'finished') return 1;
            return 0;
        });

    const activeCount = participants.filter((p: ExamUser) => p.status === 'working').length;
    const finishedCount = participants.filter((p: ExamUser) => p.status === 'finished').length;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Live Monitor: {session.name}</h2>}
        >
            <Head title={`Monitor ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link href={route('proktor.sessions.index')} className="text-indigo-600 hover:underline flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Sesi
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/50 dark:text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Peserta Hadir</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{participants.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full dark:bg-yellow-900/50 dark:text-yellow-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sedang Mengerjakan</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900/50 dark:text-green-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Selesai</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{finishedCount}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900/50 dark:text-indigo-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Waktu Selesai</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleExtendTime(5)} className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black py-2 rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-1 uppercase">
                                    <PlusCircle className="w-3 h-3" /> +5 Min
                                </button>
                                <button onClick={() => handleExtendTime(10)} className="flex-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-black py-2 rounded-lg hover:bg-violet-100 transition flex items-center justify-center gap-1 uppercase">
                                    <PlusCircle className="w-3 h-3" /> +10 Min
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={handleForceLogoutAll}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-5 h-5" /> Force Logout Semua Siswa
                        </button>
                    </div>

                    {/* Broadcast System Widget */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-lg mb-8 text-white relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform">
                            <Megaphone className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Megaphone className="w-6 h-6 text-amber-300" />
                                <h3 className="text-lg font-bold">Proktor Broadcast System</h3>
                            </div>
                            <p className="text-indigo-100 text-sm mb-6 max-w-2xl">
                                Kirimkan pesan pengumuman instan ke seluruh siswa yang sedang mengerjakan ujian di sesi ini secara real-time.
                            </p>

                            <form onSubmit={handleBroadcast} className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Ketik pengumuman di sini... (Contoh: Waktu sisa 10 menit!)"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSending || !broadcastMessage.trim()}
                                    className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {isSending ? 'Mengirim...' : 'Kirim Sekarang'}
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status Peserta Sesi Secara Live</h3>
                                <div className="flex items-center gap-4">
                                    {session.classroom?.id && (
                                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <Table className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('visual')}
                                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'visual' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <Layout className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <span className="text-sm text-green-600 font-medium">Live connection active</span>
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'table' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Nama Peserta</th>
                                                <th className="px-6 py-3">Status Saat Ini</th>
                                                <th className="px-6 py-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredParticipants.map((eu: ExamUser, index) => (
                                                <tr 
                                                    key={eu.id} 
                                                    className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900/40' : 'bg-gray-50/20 dark:bg-gray-800/10'}`}
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${eu.status === 'finished' ? 'bg-green-500' : eu.status === 'working' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                                        {eu.user?.name}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {eu.status === 'finished' ? (
                                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Selesai</span>
                                                        ) : eu.status === 'waiting' ? (
                                                            <span className="text-gray-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Belum Mulai</span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                 <span className="text-blue-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Mengerjakan</span>
                                                                <div className="flex bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-800 text-[10px] text-amber-700 dark:text-amber-400 font-bold items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" /> Online
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleResetLogin(eu.id)}
                                                                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                                                title="Reset Login (Allow login from other device)"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetExam(eu.id, eu.user?.name || 'Siswa')}
                                                                className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-600 hover:text-white transition shadow-sm"
                                                                title="Reset Progress (Delete all answers and restart)"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleForceLogoutUser(eu.id)}
                                                                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm"
                                                                title="Force Logout this student"
                                                            >
                                                                <LogOut className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredParticipants.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                                        Belum ada peserta yang memulai ujian.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="mb-6 text-center">
                                        <div className="inline-block bg-gray-200 dark:bg-gray-700 px-8 py-2 rounded-t-lg font-bold text-gray-500 text-[10px] uppercase tracking-widest">
                                            DEPAN / PENGAWAS
                                        </div>
                                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-1/3"></div>
                                    </div>

                                    <div className="flex justify-center overflow-x-auto pb-4">
                                        <div
                                            className="grid gap-3"
                                            style={{
                                                gridTemplateColumns: `repeat(${(session.classroom as any)?.seating_grid?.cols || 4}, minmax(0, 1fr))`,
                                                width: 'fit-content'
                                            }}
                                        >
                                            {Array.from({ length: (session.classroom as any)?.seating_grid?.rows || 5 }).map((_, r) => (
                                                Array.from({ length: (session.classroom as any)?.seating_grid?.cols || 4 }).map((_, c) => {
                                                    const key = `${r}-${c}`;
                                                    const studentId = (session.classroom as any)?.seating_plan?.[key];
                                                    const participant = participants.find((p: ExamUser) => p.user_id === studentId);

                                                    return (
                                                        <div
                                                            key={key}
                                                            className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center p-2 transition-all border ${participant
                                                                ? participant.status === 'finished'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                                                    : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-900 shadow-sm'
                                                                : 'bg-gray-100/50 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-700'
                                                                }`}
                                                        >
                                                            {participant && participant.status !== 'waiting' ? (
                                                                <>
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${participant.status === 'finished' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                                                        }`}>
                                                                        <UserIcon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="text-[9px] font-black text-center text-gray-800 dark:text-gray-200 line-clamp-2">
                                                                        {participant.user?.name}
                                                                    </div>
                                                                    <div className={`mt-1 h-1.5 w-1.5 rounded-full ${participant.status === 'finished' ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'
                                                                        }`}></div>
                                                                </>
                                                            ) : (
                                                                <div className="text-[8px] font-bold text-gray-300 uppercase">
                                                                    KOSONG
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-white border border-indigo-200 rounded-sm"></div> Mengerjakan
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded-sm"></div> Selesai
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-gray-100 border border-dashed border-gray-200 rounded-sm"></div> Belum Login
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
