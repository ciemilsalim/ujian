import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ShieldCheck, UserCheck, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';

interface Proctor {
    id: number;
    name: string;
    nip: string | null;
}

export default function Index({ proctors }: { proctors: Proctor[] }) {
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProctor, setSelectedProctor] = useState<Proctor | null>(null);

    const createForm = useForm({
        name: '',
        nip: '',
    });

    const editForm = useForm({
        name: '',
        nip: '',
    });

    const filteredProctors = proctors.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.nip && p.nip.toLowerCase().includes(search.toLowerCase()))
    );

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('proktor.proctors.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                toast.success('Pengawas berhasil ditambahkan');
            }
        });
    };

    const openEditModal = (proctor: Proctor) => {
        setSelectedProctor(proctor);
        editForm.setData({
            name: proctor.name,
            nip: proctor.nip || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProctor) return;
        editForm.put(route('proktor.proctors.update', selectedProctor.id), {
            onSuccess: () => {
                setShowEditModal(false);
                toast.success('Data pengawas diperbarui');
            }
        });
    };

    const confirmDelete = (proctor: Proctor) => {
        setSelectedProctor(proctor);
        setShowDeleteModal(true);
    };

    const submitDelete = () => {
        if (!selectedProctor) return;
        router.delete(route('proktor.proctors.destroy', selectedProctor.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                toast.success('Pengawas berhasil dihapus');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            Manajemen Pengawas
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono italic">
                            Input list nama pengawas untuk dijadwalkan ke ruang ujian.
                        </p>
                    </div>
                    <PrimaryButton 
                        onClick={() => setShowCreateModal(true)}
                        className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Tambah Pengawas
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Manajemen Pengawas" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau NIP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">No</th>
                                        <th className="px-6 py-4">Nama Pengawas</th>
                                        <th className="px-6 py-4">NIP/NIK</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredProctors.map((proctor, index) => (
                                        <tr key={proctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-400 font-mono">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                        {proctor.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{proctor.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{proctor.nip || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(proctor)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-lg transition">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => confirmDelete(proctor)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProctors.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Data pengawas tidak ditemukan</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-indigo-600" />
                        Tambah Pengawas Baru
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" className="font-bold text-gray-600" />
                            <TextInput
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                placeholder="Contoh: Budi Santoso, S.Pd"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nip" value="NIP / NIK (Opsional)" className="font-bold text-gray-600" />
                            <TextInput
                                id="nip"
                                value={createForm.data.nip}
                                onChange={(e) => createForm.setData('nip', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                placeholder="Masukkan NIP atau NIK"
                            />
                            <InputError message={createForm.errors.nip} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton className="h-12 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-700" disabled={createForm.processing}>
                            Simpan Pengawas
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Edit className="w-6 h-6 text-indigo-600" />
                        Edit Data Pengawas
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap" className="font-bold text-gray-600" />
                            <TextInput
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_nip" value="NIP / NIK (Opsional)" className="font-bold text-gray-600" />
                            <TextInput
                                id="edit_nip"
                                value={editForm.data.nip}
                                onChange={(e) => editForm.setData('nip', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                            />
                            <InputError message={editForm.errors.nip} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowEditModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton className="h-12 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-700" disabled={editForm.processing}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Hapus Pengawas?</h2>
                    <p className="text-sm text-gray-500 mb-8">Data pengawas <strong>{selectedProctor?.name}</strong> akan dihapus selamanya.</p>
                    
                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="h-12 rounded-2xl px-6 font-bold">Batal</SecondaryButton>
                        <PrimaryButton onClick={submitDelete} className="h-12 rounded-2xl px-8 bg-red-600 hover:bg-red-700">
                            Ya, Hapus
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
