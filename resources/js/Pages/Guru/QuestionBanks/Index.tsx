import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { QuestionBank, Subject, PaginationData } from '@/types';

export default function Index({ questionBanks, subjects }: { questionBanks: PaginationData<QuestionBank>, subjects: Subject[] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);

    const createForm = useForm({
        subject_id: '',
        name: '',
        description: '',
    });

    const editForm = useForm({
        subject_id: '',
        name: '',
        description: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('guru.question-banks.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (bank: QuestionBank) => {
        setSelectedBank(bank);
        editForm.setData({
            subject_id: bank.subject_id?.toString() || '',
            name: bank.name || '',
            description: bank.description || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank) return;
        editForm.put(route('guru.question-banks.update', selectedBank.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedBank(null);
            },
        });
    };

    const openDeleteModal = (bank: QuestionBank) => {
        setSelectedBank(bank);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedBank) return;
        router.delete(route('guru.question-banks.destroy', selectedBank.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedBank(null);
            },
        });
    };

    const renderBankForm = (form: any, onSubmit: (e: React.FormEvent) => void, title: string, onClose: () => void) => (
        <form onSubmit={onSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h2>

            <div className="mt-4">
                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                <select
                    id="subject_id"
                    value={form.data.subject_id}
                    onChange={(e) => form.setData('subject_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                    required
                >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                </select>
                <InputError message={form.errors.subject_id} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="name" value="Nama Bank Soal" />
                <TextInput
                    id="name"
                    value={form.data.name}
                    onChange={(e: any) => form.setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={form.errors.name} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
                <TextInput
                    id="description"
                    value={form.data.description}
                    onChange={(e: any) => form.setData('description', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={form.errors.description} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton className="ml-3" disabled={form.processing}>Simpan</PrimaryButton>
            </div>
        </form>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Bank Soal
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Tambah Bank Soal
                    </button>
                </div>
            }
        >
            <Head title="Bank Soal" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Bank Soal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Pelajaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dibuat Oleh</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-700 z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {questionBanks.data.map((bank) => (
                                        <tr key={bank.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{bank.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{bank.subject?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{bank.user?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]">
                                                <Link href={route('guru.question-banks.show', bank.id)} className="text-indigo-600 hover:text-indigo-900">Detail & Soal</Link>
                                                <Link href={route('guru.question-analysis.show', bank.id)} className="text-green-600 hover:text-green-900">Analisis</Link>
                                                <button onClick={() => openEditModal(bank)} className="text-yellow-600 hover:Yellow-900">Edit</button>
                                                <button onClick={() => openDeleteModal(bank)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                {renderBankForm(createForm, submitCreate, 'Tambah Bank Soal', () => setShowCreateModal(false))}
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                {renderBankForm(editForm, submitEdit, 'Edit Bank Soal', () => setShowEditModal(false))}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus Bank Soal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus bank soal <strong>{selectedBank?.name}</strong>? Semua soal di dalamnya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={confirmDelete}>Hapus</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
