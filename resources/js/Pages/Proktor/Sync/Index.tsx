import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Download, Upload, Cloud, Monitor, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    subjects: number;
    classrooms: number;
    question_banks: number;
    exam_sessions: number;
    answers: number;
}

export default function Index({ appMode, stats }: { appMode: string, stats: Stats }) {
    const [importing, setImporting] = useState(false);
    const isOnline = appMode === 'online';

    const handleImport = (type: 'exam' | 'results') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            setImporting(true);
            router.post(route(type === 'exam' ? 'proktor.sync.import-exam' : 'proktor.sync.import-results'), formData, {
                onFinish: () => setImporting(false),
            });
        };
        input.click();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase">
                        Sinkronisasi Data
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Transfer data antara server Online (Hosting) dan Offline (Local).
                    </p>
                </div>
            }
        >
            <Head title="Sinkronisasi Data" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-8">
                    {/* Status Card */}
                    <div className={`p-1 rounded-[2.5rem] bg-gradient-to-r ${isOnline ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'} shadow-xl`}>
                        <div className="bg-white dark:bg-gray-900 rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 ${isOnline ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>
                                {isOnline ? <Cloud className="w-10 h-10" /> : <Monitor className="w-10 h-10" />}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        Mode {isOnline ? 'Online (Hosting)' : 'Offline (Local Server)'}
                                    </h3>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isOnline ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        Active
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
                                    {isOnline 
                                        ? 'Gunakan mode ini di CPANEL/Hosting untuk menyiapkan bank soal dan sesi ujian. Unduh paket ujian untuk dipindahkan ke server lokal.'
                                        : 'Gunakan mode ini di Localhost sekolah untuk pelaksanaan ujian tanpa internet. Unggah paket ujian dari server online sebelum memulai.'
                                    }
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl grid grid-cols-2 gap-x-8 gap-y-2 border border-gray-100 dark:border-gray-800">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-gray-400">Bank Soal</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{stats.question_banks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-gray-400">Jawaban</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{stats.answers}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Step 1: Export/Import Exam Package */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-lg">1</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Paket Data Ujian</h4>
                                    <p className="text-xs text-gray-500 uppercase font-black">Transfer Soal & Siswa</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 flex-1">
                                Paket ini berisi: Pengaturan, Mata Pelajaran, Data Kelas, Data Siswa (Peserta), Bank Soal, dan Sesi Ujian yang telah dibuat.
                            </p>

                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                {isOnline ? (
                                    <a 
                                        href={route('proktor.sync.export-exam')}
                                        className="flex items-center justify-center gap-3 w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-100 dark:shadow-none"
                                    >
                                        <Download className="w-5 h-5" /> Download Paket Ujian
                                    </a>
                                ) : (
                                    <button 
                                        onClick={() => handleImport('exam')}
                                        disabled={importing}
                                        className="flex items-center justify-center gap-3 w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition disabled:opacity-50"
                                    >
                                        <Upload className="w-5 h-5" /> {importing ? 'Mengimpor...' : 'Upload Paket Ujian'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Export/Import Results */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-black text-lg">2</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Hasil & Jawaban</h4>
                                    <p className="text-xs text-gray-500 uppercase font-black">Transfer Nilai Siswa</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 flex-1">
                                Paket ini berisi: Jawaban seluruh siswa, waktu pengerjaan, dan status pengerjaan yang tersimpan di server lokal.
                            </p>

                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                {!isOnline ? (
                                    <a 
                                        href={route('proktor.sync.export-results')}
                                        className="flex items-center justify-center gap-3 w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition shadow-lg shadow-orange-100 dark:shadow-none"
                                    >
                                        <Download className="w-5 h-5" /> Download Paket Hasil
                                    </a>
                                ) : (
                                    <button 
                                        onClick={() => handleImport('results')}
                                        disabled={importing}
                                        className="flex items-center justify-center gap-3 w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition disabled:opacity-50"
                                    >
                                        <Upload className="w-5 h-5" /> {importing ? 'Mengimpor...' : 'Upload Paket Hasil'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] p-8 border border-blue-100 dark:border-blue-900/30">
                        <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-4">
                            <AlertCircle className="w-5 h-5" /> Panduan Sinkronisasi:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            <ul className="space-y-3 text-blue-800/70 dark:text-blue-400/70">
                                <li className="flex gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span>Lakukan <strong>Download Paket Ujian</strong> dari server hosting Anda (Mode Online).</span>
                                </li>
                                <li className="flex gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span>Pindah ke localhost (Server Lokal) dan <strong>Upload Paket Ujian</strong> tersebut.</span>
                                </li>
                            </ul>
                            <ul className="space-y-3 text-blue-800/70 dark:text-blue-400/70">
                                <li className="flex gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span>Setelah ujian selesai, <strong>Download Paket Hasil</strong> dari server lokal.</span>
                                </li>
                                <li className="flex gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span>Kembali ke hosting (Online) dan <strong>Upload Paket Hasil</strong> untuk finalisasi nilai.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
