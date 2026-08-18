import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileBarChart, Download, Users, Calendar } from 'lucide-react';
import { ExamSession, AcademicYear, PaginationData } from '@/types';

interface IndexProps {
    sessions: PaginationData<ExamSession>;
    academicYears: AcademicYear[];
    selectedAcademicYearId: string;
}

export default function Index({ sessions, academicYears, selectedAcademicYearId }: IndexProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Hasil Ujian & Analitik</h2>}
        >
            <Head title="Hasil Ujian" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Academic Year Filter Bar */}
                    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Filter Tahun Ajaran & Semester:</span>
                        </div>
                        <div className="w-full sm:w-auto flex items-center gap-3">
                            <select
                                value={selectedAcademicYearId}
                                onChange={(e) => {
                                    router.get(route('proktor.results.index'), { academic_year_id: e.target.value }, { preserveState: true, replace: true });
                                }}
                                className="w-full sm:w-64 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm focus:ring-indigo-500 font-medium"
                            >
                                <option value="all">Semua Tahun Ajaran</option>
                                {academicYears.map((ay) => (
                                    <option key={ay.id} value={ay.id}>
                                        {ay.name} - {ay.semester} {ay.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Sesi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian / Kelas</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Partisipasi</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mulai</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {sessions.data.map((session) => (
                                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{session.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.exam?.title}</div>
                                                    <div className="text-xs text-gray-500">{session.classroom?.name || 'Semua Kelas'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {session.finished_count || 0} / {session.participants_count}
                                                        </div>
                                                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
                                                            <div
                                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                                style={{ width: `${((session.finished_count || 0) / (session.participants_count || 1)) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-500">
                                                    {new Date(session.start_time).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right space-y-2 lg:space-y-0 lg:space-x-2">
                                                    <Link
                                                        href={route('proktor.results.show', session.id)}
                                                        className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        Analisis <FileBarChart className="w-4 h-4" />
                                                    </Link>
                                                    <a
                                                        href={route('proktor.results.export-pdf', session.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ml-4"
                                                    >
                                                        PDF <Download className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={route('proktor.results.export-excel', session.id)}
                                                        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-4"
                                                    >
                                                        Excel <Download className="w-4 h-4" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
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
