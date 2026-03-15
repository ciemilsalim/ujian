import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Calendar, ChevronRight, Award, AlertCircle, Search, BookOpen, ShieldAlert } from 'lucide-react';
import { ExamUser } from '@/types';

export default function History({ examHistory, passingGrade, maxCheatWarnings }: { examHistory: ExamUser[], passingGrade: number, maxCheatWarnings: number }) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-gray-400';
        if (score >= passingGrade) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                        Riwayat Ujian
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none border border-indigo-100/50 dark:border-indigo-800/30">
                        Total {examHistory.length} Sesi
                    </div>
                </div>
            }
        >
            <Head title="Riwayat Ujian" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {examHistory.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm p-16 flex flex-col items-center text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-500 mb-2 uppercase tracking-tighter">
                                Belum Ada Jejak
                            </h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed">
                                Riwayat ujianmu akan muncul di sini setelah kamu menyelesaikan sesi ujian aktif.
                            </p>
                            <Link
                                href={route('siswa.dashboard')}
                                className="inline-flex items-center gap-2 py-3 px-8 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Cari Ujian Aktif
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {examHistory.map((item) => {
                                const session = item.exam_session;
                                const isDisqualified = item.cheat_warnings >= maxCheatWarnings;
                                const isPassed = !isDisqualified && item.score !== null && item.score >= passingGrade;
                                const isPending = item.score === null && !isDisqualified;

                                return (
                                    <div
                                        key={item.id}
                                        className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Score Section */}
                                            <div className={`md:w-48 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-50 dark:border-gray-700 ${isDisqualified ? 'bg-red-50/30 dark:bg-red-900/10' : 'bg-gray-50/30 dark:bg-gray-900/30'}`}>
                                                {isDisqualified ? (
                                                    <div className="text-center">
                                                        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-none">Diskualifikasi</span>
                                                    </div>
                                                ) : isPending ? (
                                                    <div className="text-center">
                                                        <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none">Menunggu Nilai</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <div className={`text-4xl font-black mb-1 ${getScoreColor(item.score)}`}>
                                                            {item.score}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                            SKOR AKHIR
                                                        </div>
                                                        <div className={`mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${isPassed ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'}`}>
                                                            {isPassed ? 'LULUS' : 'TDK LULUS'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info Section */}
                                            <div className="flex-1 p-8">
                                                <div className="flex flex-col h-full">
                                                    <div className="mb-6">
                                                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {session?.exam?.title || 'Ujian Tanpa Judul'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded leading-none">
                                                                {session?.name || 'Sesi Umum'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-auto">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Waktu Selesai</p>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                                {formatDate(item.finished_at || null)}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Peringatan</p>
                                                            <div className={`flex items-center gap-2 text-xs font-bold ${item.cheat_warnings > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                                                                <AlertCircle className={`w-3.5 h-3.5 ${item.cheat_warnings > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                                                                {item.cheat_warnings}x Pelanggaran
                                                            </div>
                                                        </div>
                                                        <div className="hidden lg:flex items-center justify-end">
                                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                                                                <ChevronRight className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            href={route('siswa.dashboard')}
                            className="inline-flex items-center gap-2 py-3 px-8 bg-white dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 active:scale-95"
                        >
                            <span className="rotate-180"><ChevronRight className="w-4 h-4" /></span>
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
