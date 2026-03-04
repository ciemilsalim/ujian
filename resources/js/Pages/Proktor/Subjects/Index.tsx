import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Index({ subjects }) {
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        code: '',
    });

    const openCreateModal = () => {
        setEditingSubject(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (subject) => {
        setEditingSubject(subject);
        setData({
            name: subject.name,
            code: subject.code || '',
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const config = {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        };

        if (editingSubject) {
            put(route('proktor.subjects.update', editingSubject.id), config);
        } else {
            post(route('proktor.subjects.store'), config);
        }
    };

    const deleteSubject = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
            destroy(route('proktor.subjects.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Data Mata Pelajaran
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Tambah Mata Pelajaran
                    </button>
                </div>
            }
        >
            <Head title="Mata Pelajaran" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Mata Pelajaran</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {subjects.data.map((subject) => (
                                        <tr key={subject.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">{subject.code || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(subject)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                                <button onClick={() => deleteSubject(subject.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {subjects.data.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Belum ada data mata pelajaran.</td>
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
                        {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                    </h2>

                    <div>
                        <InputLabel htmlFor="code" value="Kode Mata Pelajaran (Opsional)" />
                        <TextInput
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="mt-1 block w-full font-mono uppercase"
                            placeholder="Contoh: MAT, IPA, BING"
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Nama Mata Pelajaran" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
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
