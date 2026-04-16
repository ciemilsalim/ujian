import { FormEventHandler, useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, User, ArrowRight, FlaskConical, BookOpen } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function LoginSiswa({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    useEffect(() => {
        return () => { reset('password'); };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-emerald-500 selection:text-white p-6">
            <Head title="Portal Siswa — Masuk" />

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="group transition-transform hover:scale-110 active:scale-95">
                        <ApplicationLogo className="w-24 h-24 object-contain drop-shadow-2xl" />
                    </Link>
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                            Portal Siswa
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Masukkan akun untuk mengikuti ujian
                        </p>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Akses Peserta Ujian</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/50 dark:border-gray-800/50">
                    {status && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Nama Pengguna / NIS
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username / NIS"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm font-medium outline-none transition-all"
                                />
                            </div>
                            <InputError message={errors.username} className="mt-2 text-xs font-bold" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Kata Sandi
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm font-medium outline-none transition-all"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2 text-xs font-bold" />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-base font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-100 dark:shadow-none disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Masuk ke Ujian <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="text-center mt-6 text-xs font-bold text-gray-400 dark:text-gray-500">
                        Tidak bisa masuk?{' '}
                        <span className="text-emerald-600 dark:text-emerald-400">
                            Hubungi pengawas atau wali kelas Anda.
                        </span>
                    </p>
                </div>

                {/* Link dihapus atas permintaan user */}

                <p className="text-center mt-6 text-xs text-gray-400 font-medium">
                    © {new Date().getFullYear()} ZEXAM-CBT. Aman & Terpercaya.
                </p>
            </div>
        </div>
    );
}
