import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Classroom, PaginationData } from '@/types';
import { 
    GraduationCap, 
    Plus, 
    Pencil, 
    Trash2, 
    Users, 
    Search, 
    X, 
    AlertCircle, 
    CheckCircle2, 
    SearchX, 
    AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

interface IndexProps {
    classrooms: PaginationData<Classroom>;
    filters?: {
        search?: string;
    };
    stats?: {
        totalClasses: number;
        totalStudentsInClass: number;
        emptyClasses: number;
    };
}

export default function Index({ classrooms, filters, stats }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
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
        if (editingClassroom) {
            put(route('proktor.classrooms.update', editingClassroom.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toast.success('Data kelas berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui kelas. Periksa kembali form isian.');
                }
            });
        } else {
            post(route('proktor.classrooms.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toast.success('Kelas baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan kelas. Periksa kembali form isian.');
                }
            });
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('proktor.classrooms.index'), { search: searchQuery }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('proktor.classrooms.index'));
    };

    const confirmDelete = (classroom: Classroom) => {
        setDeletingClassroom(classroom);
    };

    const executeDelete = () => {
        if (!deletingClassroom) return;
        router.delete(route('proktor.classrooms.destroy', deletingClassroom.id), {
            onSuccess: () => {
                setDeletingClassroom(null);
                toast.success('Kelas berhasil dihapus.');
            },
            onError: (err: any) => {
                setDeletingClassroom(null);
                const message = err?.message || 'Kelas gagal dihapus karena masih digunakan.';
                toast.error(message);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                Data Kelas
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                                Kelola data kelas, rombongan belajar, dan penetapan siswa peserta ujian.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kelas</span>
                    </button>
                </div>
            }
        >
            <Head title="Data Kelas" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* KPI Summary Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Kelas</p>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                        {stats.totalClasses}
                                    </h3>
                                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Rombongan belajar terdaftar</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Siswa di Kelas</p>
                                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                        {stats.totalStudentsInClass}
                                    </h3>
                                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Siswa telah memiliki kelas</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Kelas Kosong</p>
                                    <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                        {stats.emptyClasses}
                                    </h3>
                                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Belum dialokasikan siswa</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter & Search Bar */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama kelas atau deskripsi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-transparent focus:border-indigo-500 rounded-2xl text-sm focus:ring-0 transition text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Cari</span>
                                </button>
                                {filters?.search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="w-full sm:w-auto px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] font-black uppercase tracking-wider text-gray-400">
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Nama Kelas</th>
                                        <th className="px-6 py-4">Deskripsi</th>
                                        <th className="px-6 py-4">Jumlah Siswa</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                                    {classrooms.data.map((classroom, index) => {
                                        const studentCount = classroom.students_count ?? 0;
                                        const rowNumber = (classrooms.from || 1) + index;

                                        return (
                                            <tr 
                                                key={classroom.id}
                                                className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                                    {rowNumber}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                            {classroom.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {classroom.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {classroom.description ? (
                                                        <span>{classroom.description}</span>
                                                    ) : (
                                                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">Tidak ada deskripsi</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {studentCount > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                                                            <Users className="w-3 h-3 text-emerald-500" />
                                                            {studentCount} Siswa
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                            <AlertCircle className="w-3 h-3 text-amber-500" />
                                                            Kosong (0 Siswa)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('proktor.classrooms.manage-students', classroom.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-xs font-bold transition"
                                                            title="Kelola Siswa Kelas"
                                                        >
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>Kelola Siswa</span>
                                                        </Link>

                                                        <button
                                                            onClick={() => openEditModal(classroom)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                                                            title="Edit Kelas"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => confirmDelete(classroom)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                            title="Hapus Kelas"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {classrooms.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl mb-3">
                                                        {filters?.search ? (
                                                            <SearchX className="w-8 h-8" />
                                                        ) : (
                                                            <GraduationCap className="w-8 h-8" />
                                                        )}
                                                    </div>
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                                        {filters?.search ? 'Kelas Tidak Ditemukan' : 'Belum Ada Data Kelas'}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 mt-1 mb-4 leading-relaxed">
                                                        {filters?.search 
                                                            ? `Tidak ada kelas yang cocok dengan kata kunci "${filters.search}". Coba kata kunci lain atau bersihkan filter.` 
                                                            : 'Mulai dengan menambahkan kelas baru untuk mengorganisasi peserta ujian.'}
                                                    </p>
                                                    {filters?.search ? (
                                                        <button
                                                            onClick={handleClearSearch}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                                                        >
                                                            Reset Pencarian
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={openCreateModal}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md transition"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Tambah Kelas Pertama
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {classrooms.links && classrooms.links.length > 3 && (
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Menampilkan <span className="font-bold text-gray-700 dark:text-gray-300">{classrooms.from || 0}</span> - <span className="font-bold text-gray-700 dark:text-gray-300">{classrooms.to || 0}</span> dari <span className="font-bold text-gray-700 dark:text-gray-300">{classrooms.total}</span> kelas
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {classrooms.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : link.url
                                                        ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                        : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah / Edit Kelas */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingClassroom ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {editingClassroom 
                                    ? 'Perbarui informasi nama dan deskripsi rombel.' 
                                    : 'Daftarkan nama kelas atau rombel baru ke dalam sistem.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name">
                                Nama Kelas <span className="text-red-500">*</span>
                            </InputLabel>
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full text-sm"
                                placeholder="Contoh: VII-A, X MIPA 1, XII IPS 2"
                                required
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Nama kelas harus unik dan mudah diidentifikasi.</p>
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi / Keterangan (Opsional)" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Contoh: Rombongan Belajar Kelas 10 Peminatan Matematika & IPA"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                        <SecondaryButton 
                            type="button" 
                            onClick={() => setShowModal(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton 
                            type="submit" 
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Kelas */}
            <Modal show={deletingClassroom !== null} onClose={() => setDeletingClassroom(null)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Konfirmasi Hapus Kelas
                            </h3>
                            <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Apakah Anda yakin ingin menghapus kelas <strong className="text-gray-900 dark:text-white font-bold">{deletingClassroom?.name}</strong>?
                    </p>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-6 text-xs text-amber-800 dark:text-amber-300">
                        Pastikan kelas ini tidak memiliki siswa yang terdaftar dan tidak terhubung ke jadwal/sesi ujian yang sedang berjalan.
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeletingClassroom(null)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={executeDelete}>
                            Ya, Hapus Kelas
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
