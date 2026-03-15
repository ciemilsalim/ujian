import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, ChevronRight, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { ExamSession } from '@/types';

export default function Dashboard({ sessions }: { sessions: ExamSession[] }) {
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const tick = setInterval(() => {
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

    const isExpiringSoon = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return diff > 0 && diff < 10 * 60 * 1000;
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
                                    {sessions.length} Sesi Aktif · <span className="text-indigo-500">Update {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 overflow-hidden"
                                    >
                                        <div className="p-7">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex-1 min-w-0">
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
                                                
                                                {isExpiringSoon(session.end_time) && (
                                                    <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl animate-pulse">
                                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-50 dark:border-gray-700">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Durasi</p>
                                                    <div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-200">
                                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                        {session.exam?.duration} Menit
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-2xl border ${isExpiringSoon(session.end_time) ? 'bg-red-50/50 border-red-100 dark:bg-red-900/20 dark:border-red-950' : 'bg-gray-50/50 border-gray-50 dark:bg-gray-900/30 dark:border-gray-700'}`}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Batas Waktu</p>
                                                    <div className={`flex items-center gap-2 text-sm font-black truncate ${isExpiringSoon(session.end_time) ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                        {formatDeadline(session.end_time).split(',')[1]}
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                href={route('siswa.exams.show', session.id)}
                                                className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-hover:translate-y-[-2px] ${isExpiringSoon(session.end_time) ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white shadow-lg ${isExpiringSoon(session.end_time) ? 'shadow-red-100 dark:shadow-none' : 'shadow-indigo-100 dark:shadow-none'}`}
                                            >
                                                Mulai Ujian Sekarang
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
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
