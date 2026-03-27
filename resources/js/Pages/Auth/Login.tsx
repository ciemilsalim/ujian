import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Portal Staff — Masuk" />

            {/* Role Badge */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Akses Staff / Admin</span>
                </div>
            </div>

            {status && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="username" value="Nama Pengguna" className="text-gray-700 dark:text-gray-300 font-bold mb-1" />

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl pl-12 h-14 w-full transition-all"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="username Anda"
                        />
                    </div>

                    <InputError message={errors.username} className="mt-2 text-xs font-bold" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <InputLabel htmlFor="password" value="Kata Sandi" className="text-gray-700 dark:text-gray-300 font-bold" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl pl-12 h-14 w-full transition-all"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2 text-xs font-bold" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center group cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                            className="rounded border-gray-300 dark:border-gray-700 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <span className="ms-3 text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 transition">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full h-14 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                        disabled={processing}
                    >
                        Masuk
                        <ArrowRight className="w-5 h-5" />
                    </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                        Saya Siswa?{' '}
                        <Link href={route('login.siswa')} className="text-emerald-600 hover:text-emerald-500 font-black transition">
                            Portal Siswa →
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
