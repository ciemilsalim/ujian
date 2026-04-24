import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Info, CheckCircle2, AlertCircle, HelpCircle, Download } from 'lucide-react';

interface AnalysisItem {
    id: number;
    question_text: string;
    type: string;
    difficulty: {
        index: number;
        label: string;
    };
    discrimination: {
        index: number;
        label: string;
    };
    total_answers: number;
    correct_count: number;
}

interface Props {
    questionBank: {
        id: number;
        name: string;
    };
    analysis: AnalysisItem[];
    session?: any;
}

export default function ItemAnalysis({ questionBank, analysis, session }: Props) {
    const { auth } = usePage().props as any;
    const isGuru = auth.user.role === 'guru';

    const backUrl = session 
        ? route('proktor.results.show', session.id) 
        : (isGuru ? route('guru.question-banks.index') : route('proktor.results.index'));

    const backLabel = session 
        ? 'Hasil Sesi' 
        : (isGuru ? 'Bank Soal' : 'Daftar Hasil');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 uppercase tracking-tight">Analisis Butir Soal: {session ? session.name : questionBank.name}</h2>}
        >
            <Head title="Analisis Butir Soal" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link 
                            href={backUrl} 
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-medium transition-all hover:gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke {backLabel}
                        </Link>
                        <a
                            href={session ? route('proktor.results.item-analysis-export', session.id) : route('guru.question-analysis.export', questionBank.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Download className="w-4 h-4" /> Ekspor DOCX
                        </a>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl dark:bg-indigo-900/30">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tentang Analisis Butir Soal</h3>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    Analisis ini membantu Anda mengevaluasi kualitas soal berdasarkan respon siswa. 
                                    <strong> Tingkat Kesukaran</strong> menunjukkan proporsi siswa yang menjawab benar (0.0 - 1.0). 
                                    <strong> Daya Pembeda</strong> menunjukkan kemampuan soal membedakan siswa kelompok atas dan bawah.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-3xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">No</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Butir Soal</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Kesukaran (P)</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Daya Pembeda (D)</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Total Respon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {analysis.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-400">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div 
                                                    className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 prose-sm dark:prose-invert" 
                                                    dangerouslySetInnerHTML={{ __html: item.question_text }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-gray-900 dark:text-white">{item.difficulty.index}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        item.difficulty.label === 'Mudah' ? 'bg-green-100 text-green-700' :
                                                        item.difficulty.label === 'Sedang' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {item.difficulty.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-gray-900 dark:text-white">{item.discrimination.index}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        item.discrimination.index >= 0.3 ? 'bg-emerald-100 text-emerald-700' :
                                                        item.discrimination.index >= 0.2 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {item.discrimination.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                                                {item.total_answers}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
