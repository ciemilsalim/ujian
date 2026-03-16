import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Terima kasih telah mendaftar! Sebelum memulai, harap verifikasi alamat email Anda dengan mengklik link yang baru saja kami kirimkan. Jika Anda tidak menerima email tersebut, kami akan dengan senang hati mengirimkan yang baru.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                    Link verifikasi baru telah dikirim ke alamat email yang Anda berikan saat pendaftaran.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-col gap-4">
                    <PrimaryButton className="w-full h-14 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50" disabled={processing}>
                        Kirim Ulang Email Verifikasi
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-center text-sm font-bold text-gray-500 hover:text-red-500 transition"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
