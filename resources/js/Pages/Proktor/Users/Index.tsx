import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User, Classroom, PaginationData } from '@/types';

interface IndexProps {
    users: PaginationData<User>;
    classrooms: Classroom[];
}

export default function Index({ users, classrooms }: IndexProps) {
    const [showImportModal, setShowImportModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        classroom_id: '',
    });

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('proktor.users.import'), {
            onSuccess: () => {
                setShowImportModal(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(route('proktor.users.destroy', id), {
                onSuccess: () => {
                    // Success handling
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Manajemen User
                    </h2>
                    <div className="space-x-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            Import Siswa (Excel)
                        </button>
                        <Link
                            href={route('proktor.users.create')}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Tambah User
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen User" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.classroom_id ? classrooms.find(c => c.id === user.classroom_id)?.name : '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('proktor.users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showImportModal} onClose={() => setShowImportModal(false)}>
                <form onSubmit={submitImport} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Import Siswa dari Excel
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="classroom_id_import" value="Pilih Kelas" />
                        <select
                            id="classroom_id_import"
                            value={data.classroom_id}
                            onChange={(e) => setData('classroom_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            required
                        >
                            <option value="">Pilih Kelas</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.classroom_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="file" value="File Excel (.xlsx, .xls)" />
                        <input
                            type="file"
                            id="file"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                            required
                        />
                        <InputError message={errors.file} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowImportModal(false)}>
                            Batal
                        </SecondaryButton>

                        <PrimaryButton className="ml-3" disabled={processing}>
                            Import
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
