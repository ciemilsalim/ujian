import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Eye } from 'lucide-react';

export default function Index({ sessions }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Analisis Hasil Ujian</h2>}
        >
            <Head title="Hasil Ujian" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Daftar Sesi Ujian</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Nama Sesi</th>
                                            <th className="px-6 py-3">Ujian</th>
                                            <th className="px-6 py-3">Waktu Mulai</th>
                                            <th className="px-6 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {session.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {session.exam?.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(session.start_time).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <Link
                                                        href={route('guru.results.show', session.id)}
                                                        className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline flex items-center gap-1"
                                                    >
                                                        <BarChart3 className="w-4 h-4" /> Analisis
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {sessions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                    Belum ada jadwal sesi ujian.
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
