import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show({ session }) {
    // Calculate scores on the fly for display
    const calculateScore = (examUser) => {
        if (!examUser.answers || examUser.answers.length === 0) return 0;
        let correct = 0;
        examUser.answers.forEach(answer => {
            // Simple string matching for correct answer parsing
            // Assuming choices stored in 'answer' field natively
            const q = answer.question;
            if (q.type === 'pilihan_ganda' && answer.answer_text === q.correct_answer) {
                correct++;
            }
        });
        const total = session.exam.question_bank?.questions?.length || 0;
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Analisis: {session.name}</h2>}
        >
            <Head title={`Hasil ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link href={route('guru.results.index')} className="text-indigo-600 hover:underline flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium mb-4">Nilai Peserta</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Nama Peserta</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-center">Nilai (PG)</th>
                                            <th className="px-6 py-3">Waktu Selesai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.exam_users.map((eu) => (
                                            <tr key={eu.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {eu.user?.name}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {eu.status === 'finished' ? (
                                                        <span className="text-green-600">Selesai</span>
                                                    ) : eu.status === 'working' ? (
                                                        <span className="text-blue-600">Mengerjakan</span>
                                                    ) : (
                                                        <span className="text-gray-500">Menunggu</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-lg">
                                                    {eu.status === 'finished' ? calculateScore(eu) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {eu.finished_at ? new Date(eu.finished_at).toLocaleTimeString('id-ID') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {session.exam_users.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                    Belum ada peserta yang mengikuti sesi ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
