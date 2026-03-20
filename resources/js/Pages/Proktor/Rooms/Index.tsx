import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, Home, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';

interface Room {
    id: number;
    name: string;
    capacity: number;
    session_participants_count?: number;
}

export default function Index({ rooms }: { rooms: Room[] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const createForm = useForm({
        name: '',
        capacity: 0,
    });

    const editForm = useForm({
        name: '',
        capacity: 0,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('proktor.rooms.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                toast.success('Ruang berhasil dibuat');
            }
        });
    };

    const openEditModal = (room: Room) => {
        setSelectedRoom(room);
        editForm.setData({
            name: room.name,
            capacity: room.capacity,
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom) return;
        editForm.put(route('proktor.rooms.update', selectedRoom.id), {
            onSuccess: () => {
                setShowEditModal(false);
                toast.success('Ruang berhasil diperbarui');
            }
        });
    };

    const confirmDelete = (room: Room) => {
        setSelectedRoom(room);
        setShowDeleteModal(true);
    };

    const submitDelete = () => {
        if (!selectedRoom) return;
        router.delete(route('proktor.rooms.destroy', selectedRoom.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                toast.success('Ruang berhasil dihapus');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Manajemen Ruang Ujian
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono italic">
                            Kelola ruang dan kapasitas kursi ujian.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('proktor.rooms.global-assignment')}>
                            <SecondaryButton className="h-12 px-6 rounded-2xl flex items-center gap-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                                <Users className="w-5 h-5" /> Atur Ruang Siswa (Permanen)
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton 
                            onClick={() => setShowCreateModal(true)}
                            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <Plus className="w-5 h-5" /> Tambah Ruang
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Ruang" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Home className="w-24 h-24 text-indigo-600" />
                                </div>

                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                                            {room.name.charAt(0)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(room)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => confirmDelete(room)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{room.name}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kapasitas</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-indigo-500" />
                                                <span className="font-bold text-gray-900 dark:text-white">{room.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Terisi</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${room.capacity > 0 ? 'bg-emerald-500' : 'bg-gray-300 animate-pulse'}`}></div>
                                                <span className="font-bold text-gray-900 dark:text-white">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {rooms.length === 0 && (
                            <div className="col-span-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Belum Ada Ruang</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">Mulai dengan menambahkan ruang ujian baru untuk mendistribusikan siswa.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-indigo-600" />
                        Tambah Ruang Baru
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Ruang" className="font-bold text-gray-600" />
                            <TextInput
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                placeholder="Contoh: Ruang 01"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="capacity" value="Kapasitas (Kursi)" className="font-bold text-gray-600" />
                            <TextInput
                                id="capacity"
                                type="number"
                                value={createForm.data.capacity}
                                onChange={(e) => createForm.setData('capacity', parseInt(e.target.value))}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                required
                            />
                            <InputError message={createForm.errors.capacity} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton className="h-12 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-700" disabled={createForm.processing}>
                            Simpan Ruang
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Edit className="w-6 h-6 text-indigo-600" />
                        Edit Ruang
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Ruang" className="font-bold text-gray-600" />
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
                            <InputLabel htmlFor="edit_capacity" value="Kapasitas (Kursi)" className="font-bold text-gray-600" />
                            <TextInput
                                id="edit_capacity"
                                type="number"
                                value={editForm.data.capacity}
                                onChange={(e) => editForm.setData('capacity', parseInt(e.target.value))}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                required
                            />
                            <InputError message={editForm.errors.capacity} className="mt-2" />
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
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-2">Hapus Ruang?</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Tindakan ini akan menghapus data ruang <strong>{selectedRoom?.name}</strong> secara permanen.</p>
                    
                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton onClick={submitDelete} className="h-12 rounded-2xl px-8 bg-red-600 hover:bg-red-700">
                            Ya, Hapus
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
