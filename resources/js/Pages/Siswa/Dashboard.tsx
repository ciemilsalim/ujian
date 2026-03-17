import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, ChevronRight, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { ExamSession } from '@/types';

export default function Dashboard({ sessions }: { sessions: ExamSession[] }) {
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [countdown, setCountdown] = useState(30);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const tick = setInterval(() => {
            setCurrentTime(new Date());
            setCountdown(prev => {
                if (prev <= 1) {
                    router.reload({ only: ['sessions'] });
                    setLastRefresh(new Date());
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const manualRefresh = () => {
        router.reload({ only: ['sessions'] });
        setLastRefresh(new Date());
        setCountdown(30);
    };

    const formatDeadline = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const getSessionStatus = (startStr: string, endStr: string) => {
        const now = currentTime.getTime();
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();

        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'active';
        return 'closed';
    };

    const getTimeRemaining = (targetStr: string) => {
        const total = new Date(targetStr).getTime() - currentTime.getTime();
        if (total <= 0) return '00:00:00';
        
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        let timeStr = '';
        if (days > 0) timeStr += `${days}h `;
        timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        return timeStr;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        Ujian Tersedia
                    </h2>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            Next Refresh: {countdown}s
                        </span>
                        <div className="w-[1px] h-4 bg-gray-100 dark:bg-gray-700 mx-1" />
                        <button
                            onClick={manualRefresh}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-black transition-transform active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" />
                            REFRESH
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Siswa" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {sessions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm p-16 flex flex-col items-center text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl flex items-center justify-center mb-6">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-500 mb-2 uppercase tracking-tighter">
                                Hening Sejenak...
                            </h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                                Belum ada ujian yang dijadwalkan untukmu saat ini. Silakan hubungi Proktor jika seharusnya ada ujian.
                            </p>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> Auto-check active
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {sessions.length} Ujian Ditemukan · <span className="text-indigo-500">Update {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sessions.map((session) => {
                                    const status = getSessionStatus(session.start_time, session.end_time);
                                    const isActive = status === 'active';
                                    const isUpcoming = status === 'upcoming';
                                    const isClosed = status === 'closed';

                                    return (
                                        <div
                                            key={session.id}
                                            className={`group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent ${isActive ? 'hover:border-indigo-100 dark:hover:border-indigo-900/50' : 'opacity-80'} overflow-hidden`}
                                        >
                                            <div className="p-7">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {isUpcoming && (
                                                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest rounded-full border border-amber-100 dark:border-amber-900/50 flex items-center gap-1">
                                                                    <Calendar className="w-2.5 h-2.5" />
                                                                    Mendatang
                                                                </span>
                                                            )}
                                                            {isActive && (
                                                                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                    Sedang Berlangsung
                                                                </span>
                                                            )}
                                                            {isClosed && (
                                                                <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-[9px] font-black text-gray-500 uppercase tracking-widest rounded-full border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                                                    <AlertCircle className="w-2.5 h-2.5" />
                                                                    Waktu Habis
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {session.exam?.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-[10px] font-black text-gray-500 uppercase tracking-widest rounded leading-none">
                                                                {session.name}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                                {session.classroom?.name || 'Semua Kelas'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-50 dark:border-gray-700">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Durasi</p>
                                                        <div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-200">
                                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                            {session.exam?.duration} Menit
                                                        </div>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl border ${isUpcoming ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/20' : 'bg-gray-50/50 border-gray-50 dark:bg-gray-900/30'}`}>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                            {isUpcoming ? 'Mulai Dalam' : 'Sisa Waktu'}
                                                        </p>
                                                        <div className={`flex items-center gap-2 text-sm font-black truncate ${isUpcoming ? 'text-amber-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                            {isUpcoming ? (
                                                                <>
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {getTimeRemaining(session.start_time)}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {getTimeRemaining(session.end_time)}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isActive ? (
                                                    <Link
                                                        href={route('siswa.exams.show', session.id)}
                                                        className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none translate-y-0 active:translate-y-1"
                                                    >
                                                        Mulai Ujian Sekarang
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <div className="w-full py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed">
                                                        {isUpcoming ? (
                                                            <>
                                                                <Clock className="w-4 h-4" />
                                                                Tunggu Waktu Mulai
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-4 h-4" />
                                                                Ujian Sudah Berakhir
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            href={route('siswa.history')}
                            className="inline-flex items-center gap-2 py-3 px-8 bg-white dark:bg-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                        >
                            Riwayat Ujian Saya
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
