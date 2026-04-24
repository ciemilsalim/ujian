import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, User, BookOpen, Clock, Award } from 'lucide-react';
import { ExamUser } from '@/types';

interface Props {
    examSessionUser: ExamUser;
}

export default function Detail({ examSessionUser }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Detail Jawaban: {examSessionUser.user?.name}
                </h2>
            }
        >
            <Head title={`Detail Jawaban - ${examSessionUser.user?.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link 
                            href={route('guru.results.show', examSessionUser.exam_session_id)} 
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Hasil Sesi
                        </Link>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative flex flex-wrap gap-8 items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl dark:bg-indigo-900/30">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{examSessionUser.user?.name}</h3>
                                    <p className="text-sm text-gray-500">{examSessionUser.user?.username}</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-wrap gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Skor Akhir</p>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{examSessionUser.score ?? 0}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-500" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{examSessionUser.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Waktu Selesai</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {examSessionUser.finished_at ? new Date(examSessionUser.finished_at).toLocaleString('id-ID') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answers List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" /> Daftar Jawaban
                        </h3>
                        
                        {examSessionUser.answers?.map((answer, index) => (
                            <div 
                                key={answer.id} 
                                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6 transition-all ${
                                    answer.is_correct 
                                        ? 'border-green-100 dark:border-green-900/30' 
                                        : (answer.is_correct === false ? 'border-red-100 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-700')
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-black text-gray-500">
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-tighter">
                                            {answer.question.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {answer.is_correct === true && <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg"><CheckCircle2 className="w-4 h-4" /> Benar</span>}
                                        {answer.is_correct === false && <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg"><XCircle className="w-4 h-4" /> Salah</span>}
                                        {answer.is_correct === null && <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg"><HelpCircle className="w-4 h-4" /> Belum Dinilai</span>}
                                        <span className="text-xs font-black text-gray-400 ml-2">Skor: {answer.score ?? 0} / {answer.question.score_default}</span>
                                    </div>
                                </div>

                                <div 
                                    className="text-gray-800 dark:text-gray-200 mb-6 prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: answer.question.question_text }}
                                />

                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">Jawaban Siswa:</p>
                                    {answer.question.type === 'pilihan_ganda' ? (
                                        <div className="flex flex-col gap-2">
                                            {['a', 'b', 'c', 'd', 'e'].map(opt => {
                                                const options = typeof answer.question.options === 'string' 
                                                    ? JSON.parse(answer.question.options) 
                                                    : answer.question.options;
                                                
                                                const optText = options?.[opt];
                                                if (!optText) return null;
                                                
                                                const isStudentChoice = answer.answer_text === opt;
                                                const isCorrectAnswer = answer.question.answer_key === opt;

                                                return (
                                                    <div 
                                                        key={opt}
                                                        className={`flex items-center gap-3 p-2 rounded-lg border text-sm ${
                                                            isStudentChoice 
                                                                ? (isCorrectAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20')
                                                                : (isCorrectAnswer ? 'border-green-200 bg-green-50/30 dark:bg-green-900/10' : 'border-transparent')
                                                        }`}
                                                    >
                                                        <span className={`w-6 h-6 flex items-center justify-center rounded-md font-bold uppercase ${
                                                            isStudentChoice ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                                        }`}>
                                                            {opt}
                                                        </span>
                                                        <span className={`${isStudentChoice ? 'font-bold' : ''} prose-sm dark:prose-invert`} dangerouslySetInnerHTML={{ __html: optText }} />
                                                        {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {answer.answer_text || <span className="italic text-gray-400">Tidak ada jawaban</span>}
                                        </div>
                                    )}
                                </div>

                                {answer.question.type === 'pilihan_ganda' && answer.answer_text && answer.answer_text !== answer.question.answer_key && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
                                        <XCircle className="w-4 h-4" /> Jawaban benar seharusnya adalah <strong>Pilihan {answer.question.answer_key?.toUpperCase()}</strong>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!examSessionUser.answers || examSessionUser.answers.length === 0) && (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Siswa ini belum menjawab soal apa pun.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
