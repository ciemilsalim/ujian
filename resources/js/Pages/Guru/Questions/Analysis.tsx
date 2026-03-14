import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Analysis({ questionBank, analysis }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Analisis Butir Soal: {questionBank.name}
                </h2>
            }
        >
            <Head title={`Analisis Soal - ${questionBank.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {analysis.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-500 italic text-center">
                            Belum ada data jawaban untuk dianalisis.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {analysis.map((item, index) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 text-gray-900 dark:text-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-indigo-600">
                                                Soal #{index + 1} ({item.type === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'})
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {item.total_answers} jawaban
                                            </span>
                                        </div>
                                        <div className="prose dark:prose-invert text-sm mb-4" dangerouslySetInnerHTML={{ __html: item.question_text }} />

                                        {item.type === 'pilihan_ganda' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Difficulty */}
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">Tingkat Kesulitan</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-2xl font-bold">{item.difficulty_level}%</span>
                                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${item.difficulty_label === 'Mudah' ? 'bg-green-100 text-green-800' :
                                                                item.difficulty_label === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {item.difficulty_label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.correct_count}/{item.total_answers} menjawab benar
                                                    </p>
                                                </div>

                                                {/* Option Distribution */}
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-2">Distribusi Jawaban</p>
                                                    {item.option_distribution && Object.entries(item.option_distribution).map(([key, count]) => {
                                                        const pct = item.total_answers > 0 ? Math.round((count / item.total_answers) * 100) : 0;
                                                        const isCorrect = key === item.answer_key;
                                                        return (
                                                            <div key={key} className="flex items-center space-x-2 mb-1">
                                                                <span className={`w-6 text-center font-bold text-sm ${isCorrect ? 'text-green-600' : ''}`}>
                                                                    {key.toUpperCase()}
                                                                </span>
                                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                                                    <div
                                                                        className={`h-4 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-gray-400'}`}
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs w-12 text-right">{count} ({pct}%)</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Jawaban</p>
                                                        <p className="text-xl font-bold">{item.total_answers}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Sudah Dinilai</p>
                                                        <p className="text-xl font-bold">{item.scored_count || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Rata-rata Skor</p>
                                                        <p className="text-xl font-bold">{item.avg_score || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
