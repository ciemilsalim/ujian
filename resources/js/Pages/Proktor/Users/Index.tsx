import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User, Classroom, PaginationData } from '@/types';
import { FileSpreadsheet, FileText, Upload, Download } from 'lucide-react';

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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            <Upload className="w-4 h-4" />
                            Import Siswa
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
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Import Siswa Massal
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Mendukung file Excel (.xlsx) dan Word (.docx)
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase text-right">Template</span>
                            <div className="flex gap-2">
                                <a href={route('proktor.users.template-excel')} className="flex items-center gap-1 p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-xs" title="Excel Template">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> XLSX
                                </a>
                                <a href={route('proktor.users.template-word')} className="flex items-center gap-1 p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-xs" title="Word Template">
                                    <FileText className="w-4 h-4 text-blue-600" /> DOCX
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2">Panduan Import:</h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc ml-4">
                            <li>Gunakan kolom: <b>Nama, NIS, Kelas, Email, Password</b>.</li>
                            <li><b>NIS</b> akan digunakan sebagai username login unik.</li>
                            <li>Jika kolom <b>Kelas</b> kosong, silakan pilih kelas di bawah ini.</li>
                            <li>Jika mengunggah <b>Word</b>, pastikan data berada di dalam tabel.</li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="classroom_id_import" value="Tentukan Kelas (Jika di file tidak ada)" />
                        <select
                            id="classroom_id_import"
                            value={data.classroom_id}
                            onChange={(e) => setData('classroom_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        >
                            <option value="">Deteksi dari File (Otomatis)</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.classroom_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="file" value="Pilih File (.xlsx, .xls, .docx)" />
                        <input
                            type="file"
                            id="file"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                            required
                            accept=".xlsx,.xls,.docx"
                        />
                        <InputError message={errors.file} className="mt-2" />
                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setShowImportModal(false)}>
                            Batal
                        </SecondaryButton>

                        <PrimaryButton className="ml-3" disabled={processing}>
                            <Upload className="w-4 h-4 mr-2" />
                            Mulai Import
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
