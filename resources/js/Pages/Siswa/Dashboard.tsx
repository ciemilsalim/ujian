import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ sessions }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Daftar Ujian Tersedia
                </h2>
            }
        >
            <Head title="Dashboard Siswa" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {sessions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-gray-500 text-center">Tidak ada ujian aktif saat ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session) => (
                                <div key={session.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border-t-4 border-indigo-500">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{session.exam?.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{session.name}</p>
                                    <div className="mt-4 text-sm space-y-1">
                                        <p>Durasi: <span className="font-semibold">{session.exam?.duration} Menit</span></p>
                                        <p>Batas: <span className="font-semibold">{new Date(session.end_time).toLocaleTimeString()}</span></p>
                                    </div>
                                    <div className="mt-6">
                                        <Link
                                            href={route('siswa.exams.show', session.id)}
                                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                                        >
                                            Masuk Ujian
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
