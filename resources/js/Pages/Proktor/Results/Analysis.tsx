import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, TrendingUp, Star, Award, AlertCircle, FileBarChart, CheckCircle, RotateCcw, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ExamSession, ExamUser } from '@/types';

interface AnalysisStats {
    average: number;
    max: number;
    min: number;
    median: number;
    pass_count: number;
    fail_count: number;
    max_cheat_warnings: number;
}

interface IndexProps {
    session: ExamSession & { exam_users: ExamUser[] };
    stats: AnalysisStats;
    distribution: Record<string, number>;
}

export default function Analysis({ session, stats, distribution }: IndexProps) {
    const barData = Object.entries(distribution).map(([range, count]) => ({
        range,
        count
    }));

    const pieData = [
        { name: 'Lulus (>= 70)', value: stats.pass_count, color: '#10b981' },
        { name: 'Tidak Lulus', value: stats.fail_count, color: '#ef4444' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Analisis Hasil: {session.name}</h2>}
        >
            <Head title={`Analisis ${session.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link href={route('proktor.results.index')} className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Hasil
                        </Link>
                        <a
                            href={route('proktor.results.export-pdf', session.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            <Download className="w-4 h-4" /> Unduh Laporan PDF
                        </a>
                        <Link
                            href={route('proktor.results.item-analysis', session.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <BarChart3 className="w-4 h-4" /> Analisis Butir Soal
                        </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Rata-rata Nilai</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.average}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
                                    <Star className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Nilai Tertinggi</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.max}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
                                    <Award className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Nilai Tengah (Median)</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.median}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Nilai Terendah</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.min}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Distribution Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FileBarChart className="w-5 h-5 text-indigo-600" /> Sebaran Nilai Siswa
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {barData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pass/Fail Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" /> Persentase Kelulusan
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4 mt-4">
                                {pieData.map(item => (
                                    <div key={item.name} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{item.value} Siswa</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Student Detail Table */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Detail Nilai Per Siswa</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Siswa</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai Akhir</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelola</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {session.exam_users.map((eu) => (
                                            <tr key={eu.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {eu.user?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {eu.status === 'finished' ? (
                                                        <span className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full uppercase">Selesai</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full uppercase">Mengerjakan</span>
                                                    )}
                                                </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-black">
                                                     {eu.cheat_warnings >= stats.max_cheat_warnings ? (
                                                         <span className="text-red-500 text-xs font-black uppercase tracking-widest">Diskualifikasi</span>
                                                     ) : (
                                                         <span className="text-indigo-600 dark:text-indigo-400">{eu.score || 0}</span>
                                                     )}
                                                 </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Reset hasil ujian ${eu.user?.name}? Semua jawaban akan dihapus.`)) {
                                                                router.post(route('proktor.results.reset-user', eu.id));
                                                            }
                                                        }}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                        title="Reset Hasil"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Hapus data ujian ${eu.user?.name} dari sesi ini?`)) {
                                                                router.delete(route('proktor.results.delete-user', eu.id));
                                                            }
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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
