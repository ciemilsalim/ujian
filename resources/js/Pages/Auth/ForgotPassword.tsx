import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Lupa kata sandi? Tidak masalah. Cukup beritahu kami alamat email Anda dan kami akan mengirimkan link reset kata sandi yang memungkinkan Anda memilih yang baru.
            </div>

            {status && (
                <div className="mb-4 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 transition-all"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Alamat email Anda"
                />

                <InputError message={errors.email} className="mt-2 text-xs font-bold" />

                <div className="pt-2">
                    <PrimaryButton className="w-full h-14 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50" disabled={processing}>
                        Kirim Link Reset Kata Sandi
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
