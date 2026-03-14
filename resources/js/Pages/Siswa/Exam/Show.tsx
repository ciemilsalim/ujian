import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import ExamEngine from './Engine';

export default function Show({
    session,
    examUser,
    serverTimeLeft,
    existingAnswers
}: {
    session: any,
    examUser: any,
    serverTimeLeft: number,
    existingAnswers: Record<number, string>
}) {
    const [isStarted, setIsStarted] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const { data, setData, post, processing } = useForm({
        token: '',
    });

    const startExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (data.token !== session.token) {
            setTokenError('Token yang Anda masukkan salah.');
            return;
        }

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

                            <form onSubmit={startExam} className="pt-4">
                                <InputLabel htmlFor="token" value="Masukkan Token Ujian" />
                                <TextInput
                                    id="token"
                                    type="text"
                                    className="mt-1 block w-full text-center text-2xl font-mono tracking-widest uppercase"
                                    value={data.token}
                                    onChange={(e) => setData('token', e.target.value.toUpperCase())}
                                    placeholder="XXXXXX"
                                    required
                                />
                                {tokenError && <p className="mt-2 text-sm text-red-600">{tokenError}</p>}

                                <div className="mt-8">
                                    <PrimaryButton className="w-full justify-center py-4 text-lg" disabled={processing || examUser.status === 'finished'}>
                                        {examUser.status === 'finished' ? 'Anda Sudah Selesai' : 'Mulai Ujian Sekarang'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
