import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Home, History, Award, AlertCircle } from 'lucide-react';

interface Props {
    session: {
        id: number;
        name: string;
        exam: {
            title: string;
        };
    };
    examUser: {
        score: number;
        finished_at: string;
        cheat_warnings: number;
    };
    maxCheatWarnings: number;
}

export default function Finished({ session, examUser, maxCheatWarnings }: Props) {
    const isDisqualified = examUser.cheat_warnings >= maxCheatWarnings;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 uppercase">
                    Ujian Selesai
                </h2>
            }
        >
            <Head title="Ujian Selesai" />

            <div className="py-20 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                        <div className="flex justify-center mb-8">
                            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl ${isDisqualified ? 'bg-red-500 shadow-red-200' : 'bg-emerald-500 shadow-emerald-200'} dark:shadow-none`}>
                                {isDisqualified ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                            </div>
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                            {isDisqualified ? 'Sesi Terhenti' : 'Terima Kasih!'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 px-4">
                            Anda telah menyelesaikan atau mengakhiri ujian 
                            <span className="font-bold text-indigo-600 block mt-1">{session.exam.title}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nilai Akhir</p>
                                <p className={`text-4xl font-black ${isDisqualified ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                    {isDisqualified ? 'DQ' : (examUser.score ?? 0)}
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Peringatan</p>
                                <p className="text-4xl font-black text-gray-700 dark:text-gray-200">
                                    {examUser.cheat_warnings}x
                                </p>
                            </div>
                        </div>

                        {isDisqualified && (
                            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-start gap-3 text-left">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                                    Anda terdeteksi melakukan pelanggaran di luar batas toleransi ({maxCheatWarnings}x). Silakan hubungi proktor untuk informasi lebih lanjut.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={route('siswa.dashboard')}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link
                                href={route('siswa.history')}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                <History className="w-4 h-4" />
                                Riwayat Ujian
                            </Link>
                        </div>
                    </div>

                    <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        CBT SYSTEM V2.0 • {new Date(examUser.finished_at).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
