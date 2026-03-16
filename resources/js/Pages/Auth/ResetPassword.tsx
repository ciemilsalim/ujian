import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <form onSubmit={submit} className="space-y-4">
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
                        placeholder="email@contoh.com"
                    />

                    <InputError message={errors.email} className="mt-2 text-xs font-bold" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" className="dark:text-gray-300" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 text-xs font-bold" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                        className="dark:text-gray-300"
                    />

                    <TextInput
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 text-xs font-bold"
                    />
                </div>

                <div className="pt-4 flex items-center justify-end">
                    <PrimaryButton className="w-full h-14 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50" disabled={processing}>
                        Atur Ulang Kata Sandi
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
