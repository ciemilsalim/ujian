import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Ini adalah area aman dari aplikasi. Harap konfirmasi kata sandi Anda sebelum melanjutkan.
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="dark:text-gray-300" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 text-xs font-bold" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full h-14 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50" disabled={processing}>
                        Konfirmasi
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
