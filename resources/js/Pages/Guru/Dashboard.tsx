import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, recentSessions }) {
    const user = usePage().props.auth.user;

    const statCards = [
        { label: 'Bank Soal', value: stats.totalQuestionBanks, color: 'bg-indigo-500', icon: '📚' },
        { label: 'Total Soal', value: stats.totalQuestions, color: 'bg-blue-500', icon: '📝' },
        { label: 'Sesi Ujian', value: stats.totalSessions, color: 'bg-green-500', icon: '🗓️' },
        { label: 'Total Peserta', value: stats.totalParticipants, color: 'bg-orange-500', icon: '👥' },
        { label: 'Rata-rata Skor', value: stats.avgScore, color: 'bg-purple-500', icon: '📊' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard Guru
                </h2>
            }
        >
            <Head title="Dashboard Guru" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Selamat datang, <strong>{user.name}</strong>! Berikut ringkasan aktivitas Anda.
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {statCards.map((stat, index) => (
                            <div key={index} className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className={`${stat.color} h-1`}></div>
                                <div className="p-4 text-center">
                                    <div className="text-2xl mb-1">{stat.icon}</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Link
                            href={route('guru.question-banks.index')}
                            className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <span className="text-2xl mr-3">📚</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Kelola Bank Soal</p>
                                <p className="text-sm text-gray-500">Buat, edit, dan hapus bank soal</p>
                            </div>
                        </Link>
                        <Link
                            href={route('guru.results.index')}
                            className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <span className="text-2xl mr-3">📊</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Lihat Hasil Ujian</p>
                                <p className="text-sm text-gray-500">Analisis hasil peserta ujian</p>
                            </div>
                        </Link>
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <span className="text-2xl mr-3">⚙️</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Profil Saya</p>
                                <p className="text-sm text-gray-500">Edit informasi profil</p>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Sessions */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-bold mb-4">Sesi Ujian Terbaru</h3>
                            {recentSessions.length === 0 ? (
                                <p className="text-gray-500 italic">Belum ada sesi ujian yang menggunakan bank soal Anda.</p>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nama Sesi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ujian</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Peserta</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Selesai</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {recentSessions.map((session) => (
                                            <tr key={session.id}>
                                                <td className="px-4 py-3">{session.name}</td>
                                                <td className="px-4 py-3">{session.exam?.title}</td>
                                                <td className="px-4 py-3 text-center">{session.participants_count}</td>
                                                <td className="px-4 py-3 text-center">{session.finished_count}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={route('guru.results.show', session.id)} className="text-indigo-600 hover:underline text-sm">
                                                        Lihat Hasil
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
