import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Props {
    session: {
        id: number;
        name: string;
        exam: {
            title: string;
        };
    };
}

export default function EnterToken({ session }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token: '',
        exam_session_id: session.id
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.token.length < 6) {
            toast.error('Token tidak valid', {
                description: 'Token ujian biasanya terdiri dari 6 karakter.'
            });
            return;
        }

        post(route('siswa.exams.verify-token'), {
            onSuccess: () => {
                // Success handled by controller redirect
            },
            onError: (err) => {
                if (err.token) {
                    toast.error('Token Salah', {
                        description: err.token
                    });
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 font-sans">
            <Head title={`Token Ujian: ${session.name}`} />
            <Toaster position="top-center" richColors />

            <div className="w-full max-w-md">
                {/* Logo / Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-none rotate-3">
                        <KeyRound className="w-10 h-10" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Token Diperlukan</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Silakan masukkan token untuk memulai <br />
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{session.name}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={data.token}
                                    onChange={(e) => setData('token', e.target.value.toUpperCase())}
                                    placeholder="MASUKKAN TOKEN"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:tracking-normal transition-all outline-none uppercase"
                                    autoFocus
                                    disabled={processing}
                                />
                                <div className="absolute inset-0 rounded-2xl border border-gray-100 dark:border-gray-700 pointer-events-none group-focus-within:border-transparent transition-colors" />
                            </div>
                            {errors.token && (
                                <div className="mt-3 flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.token}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.token.length < 1}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95 group"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    MULAI UJIAN SEKARANG
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                        <div className="flex items-start gap-3 text-xs text-gray-400">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="leading-relaxed">
                                Token diberikan oleh Proktor di dalam ruangan ujian. Token dapat berubah sewaktu-waktu demi keamanan.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    ZEXAM-CBT Versi 1.0
                </p>
            </div>
        </div>
    );
}
