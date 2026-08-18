import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase">
                        Pengaturan Profil
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kelola informasi akun dan keamanan kata sandi Anda.
                    </p>
                </div>
            }
        >
            <Head title="Pengaturan Profil" />

            <div className="py-4">
                <div className="mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {auth.user.role !== 'siswa' && auth.user.username.toLowerCase() !== 'proktor' && (
                        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
