import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { AcademicYear } from '@/types';
import { 
    Calendar, Plus, Pencil, Trash2, CheckCircle2, 
    AlertCircle, Sparkles, BookOpen, ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

interface IndexProps {
    academicYears: AcademicYear[];
}

export default function Index({ academicYears }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        semester: 'Ganjil' as 'Ganjil' | 'Genap',
        is_active: false,
    });

    const openCreateModal = () => {
        setEditingYear(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (year: AcademicYear) => {
        setEditingYear(year);
        setData({
            name: year.name,
            semester: year.semester,
            is_active: year.is_active,
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingYear) {
            put(route('proktor.academic-years.update', editingYear.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toast.success('Tahun Ajaran berhasil diperbarui.');
                },
            });
        } else {
            post(route('proktor.academic-years.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    toast.success('Tahun Ajaran berhasil dibuat.');
                },
            });
        }
    };

    const handleSetActive = (year: AcademicYear) => {
        if (year.is_active) return;
        if (confirm(`Aktifkan Tahun Ajaran "${year.name} - ${year.semester}" sebagai Tahun Ajaran Aktif?`)) {
            router.patch(route('proktor.academic-years.set-active', year.id), {}, {
                onSuccess: () => {
                    toast.success(`Tahun Ajaran ${year.name} ${year.semester} berhasil diaktifkan.`);
                }
            });
        }
    };

    const handleDelete = (year: AcademicYear) => {
        if (year.is_active) {
            toast.error('Tahun Ajaran aktif tidak dapat dihapus.');
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus Tahun Ajaran "${year.name} - ${year.semester}"?`)) {
            router.delete(route('proktor.academic-years.destroy', year.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            Master Tahun Ajaran & Semester
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Kelola periode tahun pelajaran dan tentukan tahun ajaran aktif sistem.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="w-4 h-4" />
                        Tahun Ajaran Baru
                    </button>
                </div>
            }
        >
            <Head title="Master Tahun Ajaran" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Quick Banner Info */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter Otomatis Berdasarkan Status Aktif</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Tahun Ajaran yang ditandai <b>Aktif</b> akan menjadi default filter di seluruh menu Bank Soal, Jadwal Ujian, dan Hasil Ujian.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-6 py-4">Tahun Ajaran</th>
                                        <th className="px-6 py-4">Semester</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Terkait</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {academicYears.length > 0 ? (
                                        academicYears.map((year) => (
                                            <tr
                                                key={year.id}
                                                className={`group transition-colors ${
                                                    year.is_active
                                                        ? 'bg-indigo-50/40 dark:bg-indigo-900/10'
                                                        : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                            year.is_active
                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                        }`}>
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight">
                                                            {year.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                        year.semester === 'Ganjil'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                    }`}>
                                                        {year.semester}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {year.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-sm">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            AKTIF
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSetActive(year)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            title="Klik untuk jadikan Tahun Ajaran Aktif"
                                                        >
                                                            Jadikan Aktif
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1" title="Bank Soal">
                                                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                                            {year.question_banks_count ?? 0}
                                                        </span>
                                                        <span className="flex items-center gap-1" title="Ujian">
                                                            <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                                                            {year.exams_count ?? 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(year)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                            title="Edit Tahun Ajaran"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {year.is_active ? (
                                                            <span
                                                                className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded-lg inline-block"
                                                                title="Tahun Ajaran aktif tidak dapat dihapus"
                                                            >
                                                                <Trash2 className="w-4 h-4 opacity-30" />
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDelete(year)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                title="Hapus Tahun Ajaran"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Belum ada data Tahun Ajaran.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Create / Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        {editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Tahun Ajaran (Contoh: 2025/2026)" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="2025/2026"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="semester" value="Semester" />
                            <select
                                id="semester"
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value as 'Ganjil' | 'Genap')}
                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                            <InputError message={errors.semester} className="mt-1" />
                        </div>

                        {!editingYear && (
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Set langsung sebagai Tahun Ajaran Aktif
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingYear ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
