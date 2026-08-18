import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, ChevronRight, Calendar, Users, BookOpen } from 'lucide-react';
import { ExamSession, AcademicYear } from '@/types';

interface IndexProps {
    sessions: ExamSession[];
    academicYears: AcademicYear[];
    selectedAcademicYearId: string;
}

export default function Index({ sessions, academicYears, selectedAcademicYearId }: IndexProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Hasil & Analisis Ujian
                </h2>
            }
        >
            <Head title="Hasil Ujian" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Filter Section */}
                    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Filter Tahun Ajaran & Semester:</span>
                        </div>
                        <div className="w-full sm:w-auto flex items-center gap-3">
                            <select
                                value={selectedAcademicYearId}
                                onChange={(e) => {
                                    router.get(route('guru.results.index'), { academic_year_id: e.target.value }, { preserveState: true, replace: true });
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

                    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Daftar Sesi Ujian</h3>
                            <p className="text-sm text-gray-500">Pilih sesi untuk melihat detail nilai dan analisis jawaban siswa.</p>
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-20 flex flex-col items-center text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-400 font-medium">Belum ada data sesi ujian</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session) => (
                                <Link
                                    key={session.id}
                                    href={route('guru.results.show', session.id)}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(session.start_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </div>

                                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {session.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                                            {session.exam?.title}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Users className="w-3.5 h-3.5" />
                                                Detail Hasil
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
