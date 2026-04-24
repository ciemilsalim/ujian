import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { ArrowLeft, PenLine, CheckCircle, Clock, AlertCircle, X, BookOpen, Eye, Check, X as XIcon, Download } from 'lucide-react';
import { ExamSession, ExamUser, Answer } from '@/types';

export default function Show({ session }: { session: ExamSession }) {
    const [gradingModal, setGradingModal] = useState<{
        examUserId: number;
        studentName: string;
        essays: Answer[];
    } | null>(null);

    const [gradingValues, setGradingValues] = useState<Record<number, { score: string; is_correct: boolean }>>({});
    const [processing, setProcessing] = useState(false);

    const hasUngradedEssays = (eu: ExamUser) =>
        eu.answers.some(a => a.question.type === 'essay' && a.is_correct === null && eu.status === 'finished');

    const openGradingModal = (eu: ExamUser) => {
        const essayAnswers = eu.answers.filter(a => a.question.type === 'essay');
        const initValues: Record<number, { score: string; is_correct: boolean }> = {};
        essayAnswers.forEach(a => {
            initValues[a.id] = {
                score: a.score !== null ? String(a.score) : '',
                is_correct: a.is_correct ?? false,
            };
        });
        setGradingValues(initValues);
        setGradingModal({ examUserId: eu.id, studentName: eu.user?.name ?? '-', essays: essayAnswers });
    };

    const submitGrading = (answerId: number) => {
        const val = gradingValues[answerId];
        if (val === undefined || val.score === '') return;

        setProcessing(true);
        router.post(route('guru.results.grade-essay'), {
            student_answer_id: answerId,
            score: parseInt(val.score),
            is_correct: val.is_correct,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Update local state: tandai sudah dinilai
                setGradingModal(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        essays: prev.essays.map(e =>
                            e.id === answerId
                                ? { ...e, score: parseInt(val.score), is_correct: val.is_correct }
                                : e
                        )
                    };
                });
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const statusBadge = (eu: ExamUser) => {
        if (eu.status === 'finished') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="w-3 h-3" /> Selesai
            </span>
        );
        if (eu.status === 'working') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Clock className="w-3 h-3" /> Mengerjakan
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Menunggu
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Hasil Ujian: {session.name}
                </h2>
            }
        >
            <Head title={`Hasil ${session.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <Link href={route('guru.results.index')} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Hasil
                        </Link>
                        
                        <div className="flex gap-2">
                            <a
                                href={route('guru.results.export-pdf', session.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-200 dark:shadow-none text-sm"
                            >
                                <Download className="w-4 h-4" /> Unduh Laporan PDF
                            </a>
                            <a
                                href={route('guru.results.export-word', session.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-200 dark:shadow-none text-sm"
                            >
                                <Download className="w-4 h-4" /> Unduh DOCX
                            </a>
                        </div>
                    </div>

                    {/* Info Sesi */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-wrap gap-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ujian</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{session.exam?.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sesi</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{session.name}</p>
                        </div>
                        {session.classroom && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kelas</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{session.classroom.name}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Peserta</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{session.exam_users?.length || 0} siswa</p>
                        </div>
                    </div>

                    {/* Tabel Peserta */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nilai Peserta</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Klik "Koreksi Essay" untuk menilai jawaban uraian siswa secara manual.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Nama Siswa</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Nilai</th>
                                        <th className="px-6 py-3 text-center">Peringatan</th>
                                        <th className="px-6 py-3">Waktu Selesai</th>
                                        <th className="px-6 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(!session.exam_users || session.exam_users.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                                Belum ada peserta yang mengikuti sesi ini.
                                            </td>
                                        </tr>
                                    )}
                                    {session.exam_users?.map((eu) => (
                                        <tr key={eu.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                <div>{eu.user?.name ?? '-'}</div>
                                                <div className="text-xs text-gray-400">{eu.user?.username}</div>
                                            </td>
                                            <td className="px-6 py-4">{statusBadge(eu)}</td>
                                            <td className="px-6 py-4 text-center">
                                                {eu.status === 'finished' && eu.score !== null ? (
                                                    <span className={`text-xl font-bold ${eu.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {eu.score}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {eu.cheat_warnings > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-orange-500 font-semibold">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {eu.cheat_warnings}x
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {eu.finished_at
                                                    ? new Date(eu.finished_at).toLocaleString('id-ID')
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('guru.results.detail', eu.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Lihat Jawaban
                                                    </Link>
                                                    {eu.status === 'finished' && eu.answers?.some(a => a.question.type === 'essay') && (
                                                        <button
                                                            onClick={() => openGradingModal(eu)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasUngradedEssays(eu)
                                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            <PenLine className="w-3.5 h-3.5" />
                                                            {hasUngradedEssays(eu) ? 'Koreksi Essay' : 'Koreksi'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Koreksi Essay */}
            {gradingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                    Koreksi Essay — {gradingModal.studentName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">{gradingModal.essays.length} soal essay</p>
                            </div>
                            <button
                                onClick={() => setGradingModal(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-5 space-y-6 flex-1">
                            {gradingModal.essays.length === 0 && (
                                <p className="text-center text-gray-400 py-8">Tidak ada soal essay.</p>
                            )}
                            {gradingModal.essays.map((answer, idx: number) => {
                                const val = gradingValues[answer.id];
                                const isGraded = answer.is_correct !== null;

                                return (
                                    <div key={answer.id} className={`border-2 rounded-xl p-5 ${isGraded ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                                Soal Essay #{idx + 1}
                                            </span>
                                            <span className="text-xs text-gray-400">Skor maks: {answer.question.score_default}</span>
                                        </div>

                                        {/* Pertanyaan */}
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                                            {answer.question.question_text}
                                        </p>

                                        {/* Jawaban Siswa */}
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4 border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Jawaban Siswa</p>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {answer.answer_text || <span className="italic text-gray-400">Tidak ada jawaban</span>}
                                            </div>
                                        </div>

                                        {/* Form Penilaian */}
                                        {isGraded ? (
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Sudah dinilai: {answer.score} / {answer.question.score_default}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setGradingModal(prev => prev ? {
                                                            ...prev,
                                                            essays: prev.essays.map(e => e.id === answer.id ? { ...e, is_correct: null, score: null } : e)
                                                        } : null);
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                                                >
                                                    Ubah nilai
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-end gap-3 flex-wrap">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Nilai (0–{answer.question.score_default})</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={answer.question.score_default}
                                                        className="w-24 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        value={val?.score ?? ''}
                                                        onChange={(e) =>
                                                            setGradingValues(prev => ({
                                                                ...prev,
                                                                [answer.id]: {
                                                                    ...prev[answer.id],
                                                                    score: e.target.value,
                                                                    is_correct: parseInt(e.target.value) > 0,
                                                                }
                                                            }))
                                                        }
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-indigo-600"
                                                            checked={val?.is_correct ?? false}
                                                            onChange={(e) =>
                                                                setGradingValues(prev => ({
                                                                    ...prev,
                                                                    [answer.id]: { ...prev[answer.id], is_correct: e.target.checked }
                                                                }))
                                                            }
                                                        />
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">Jawaban Benar</span>
                                                    </label>
                                                </div>
                                                <button
                                                    onClick={() => submitGrading(answer.id)}
                                                    disabled={processing || !val || val.score === ''}
                                                    className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                >
                                                    Simpan Nilai
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => {
                                    setGradingModal(null);
                                    router.reload();
                                }}
                                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                            >
                                Tutup & Refresh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
