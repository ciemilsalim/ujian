import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun Baru" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="dark:text-gray-300" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="Nama lengkap Anda"
                    />

                    <InputError message={errors.name} className="mt-2 text-xs font-bold" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="dark:text-gray-300" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        placeholder="email@contoh.com"
                    />

                    <InputError message={errors.email} className="mt-2 text-xs font-bold" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="dark:text-gray-300" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 text-xs font-bold" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                        className="dark:text-gray-300"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 text-xs font-bold"
                    />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <PrimaryButton className="w-full h-14 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50" disabled={processing}>
                        Daftar Akun
                    </PrimaryButton>

                    <Link
                        href={route('login')}
                        className="text-center text-sm font-bold text-gray-500 hover:text-blue-600 transition"
                    >
                        Sudah punya akun? Masuk
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
