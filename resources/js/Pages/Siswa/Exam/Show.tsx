import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, ChevronRight, History } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import ExamEngine from './Engine';

export default function Show({
    session,
    examUser,
    serverTimeLeft,
    existingAnswers,
    settings
}: {
    session: any,
    examUser: any,
    serverTimeLeft: number,
    existingAnswers: Record<number, string>,
    settings: any
}) {
    const [isStarted, setIsStarted] = useState(false);
    const startExam = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.log("Error attempting to enable fullscreen:", err);
        }

        setIsStarted(true);
    };

    if (isStarted) {
        return <ExamEngine
            session={session}
            questions={session.exam.question_bank.questions}
            examUser={examUser}
            serverTimeLeft={serverTimeLeft}
            existingAnswers={existingAnswers}
            settings={settings}
        />;
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Konfirmasi Ujian: {session.exam?.title}
                </h2>
            }
        >
            <Head title="Konfirmasi Ujian" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-bold">Informasi Peserta</h3>
                                <p className="text-gray-600 dark:text-gray-400">Nama: {examUser.user?.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">Status: <span className="capitalize font-semibold">{examUser.status}</span></p>
                            </div>

                            <div className="border-b pb-4">
                                <h3 className="text-lg font-bold">Informasi Ujian</h3>
                                <p>Sesi: {session.name}</p>
                                <p>Durasi: {session.exam?.duration} Menit</p>
                                <p>Total Soal: {session.exam?.question_bank?.questions?.length || 0} Butir</p>
                            </div>

                            <div className="pt-8 text-center bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/30">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                                        <History className="w-8 h-8 md:hidden" />
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">Sudah Siap?</h4>
                                <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                                    Pastikan koneksi internet stabil dan baterai perangkat mencukupi sebelum memulai.
                                </p>

                                <button 
                                    onClick={startExam}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3 text-lg tracking-tight"
                                >
                                    MULAI KERJAKAN SOAL
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
