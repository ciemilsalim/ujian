import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Classroom, PaginationData } from '@/types';

export default function Index({ classrooms }: { classrooms: PaginationData<Classroom> }) {
    const [showModal, setShowModal] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        setEditingClassroom(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (classroom: Classroom) => {
        setEditingClassroom(classroom);
        setData({
            name: classroom.name,
            description: classroom.description || '',
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const config = {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        };

        if (editingClassroom) {
            put(route('proktor.classrooms.update', (editingClassroom as Classroom).id), config);
        } else {
            post(route('proktor.classrooms.store'), config);
        }
    };

    const deleteClassroom = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
            destroy(route('proktor.classrooms.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Data Kelas
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Tambah Kelas
                    </button>
                </div>
            }
        >
            <Head title="Data Kelas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kelas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deskripsi</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {classrooms.data.map((classroom) => (
                                        <tr key={classroom.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{classroom.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{classroom.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('proktor.classrooms.manage-students', classroom.id)} className="text-blue-600 hover:text-blue-900 mr-3">Kelola Siswa</Link>
                                                <button onClick={() => openEditModal(classroom)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                                <button onClick={() => deleteClassroom(classroom.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {classrooms.data.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Belum ada data kelas.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        {editingClassroom ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                    </h2>

                    <div>
                        <InputLabel htmlFor="name" value="Nama Kelas" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Deskripsi" />
                        <TextInput
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
