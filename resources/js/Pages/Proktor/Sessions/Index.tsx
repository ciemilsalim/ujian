import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Activity, Trash2, ShieldCheck, ShieldAlert, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface Exam {
    id: number;
    title: string;
}

interface Classroom {
    id: number;
    name: string;
}

interface Session {
    id: number;
    exam_id: number;
    classroom_id: number | null;
    name: string;
    start_time: string;
    end_time: string;
    token: string;
    is_active: boolean;
    exam?: Exam;
    classroom?: Classroom;
}

interface Props {
    sessions: {
        data: Session[];
    };
    exams: Exam[];
    classrooms: Classroom[];
}

export default function Index({ sessions, exams, classrooms }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === sessions.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sessions.data.map(s => s.id));
        }
    };

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedIds.length === 0) return;

        if (action === 'delete' && !confirm(`Yakin ingin menghapus ${selectedIds.length} sesi terpilih?`)) {
            return;
        }

        const form = {
            ids: selectedIds,
            action: action
        };

        import('@inertiajs/react').then(({ router }) => {
            router.post(route('proktor.sessions.bulk-action'), form, {
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Aksi massal berhasil diterapkan.');
                },
                onError: () => toast.error('Terjadi kesalahan saat menerapkan aksi massal.')
            });
        });
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        exam_id: '' as string | number,
        classroom_id: '' as string | number,
        name: '',
        start_time: '',
        end_time: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedSessionId(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (session: Session) => {
        setIsEditing(true);
        setSelectedSessionId(session.id);

        // Format datetime from database to datetime-local input format
        const formatDateTimeLocal = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        setData({
            exam_id: session.exam_id,
            classroom_id: session.classroom_id || '',
            name: session.name,
            start_time: formatDateTimeLocal(session.start_time),
            end_time: formatDateTimeLocal(session.end_time),
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && selectedSessionId) {
            put(route('proktor.sessions.update', selectedSessionId as any), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post(route('proktor.sessions.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Manajemen Sesi Ujian
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Tambah Sesi
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Sesi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    {selectedIds.length} Terpilih
                                </span>
                                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Aksi Massal:</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl border border-green-100 dark:border-green-900 hover:bg-green-50 transition"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Aktifkan
                                </button>
                                <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-100 dark:border-amber-900 hover:bg-amber-50 transition"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" /> Nonaktifkan
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition shadow-sm shadow-red-200 dark:shadow-none"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <button
                                                onClick={toggleSelectAll}
                                                className="text-gray-400 hover:text-indigo-600 transition"
                                            >
                                                {selectedIds.length === sessions.data.length && sessions.data.length > 0 ? (
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Sesi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mulai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Selesai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Token</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sessions.data.map((session) => (
                                        <tr key={session.id} className={selectedIds.includes(session.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleSelect(session.id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition"
                                                >
                                                    {selectedIds.includes(session.id) ? (
                                                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{session.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{session.exam?.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                                    {session.classroom?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(session.start_time).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(session.end_time).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-indigo-600">{session.token}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {session.is_active ? (
                                                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Aktif</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Non-Aktif</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(session)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                    Edit
                                                </button>
                                                <Link
                                                    href={route('proktor.sessions.monitor', session.id)}
                                                    className="font-medium inline-flex items-center gap-1 text-green-600 dark:text-green-500 hover:underline mr-3"
                                                    title="Live Monitor"
                                                >
                                                    <Activity className="w-4 h-4" /> Monitor
                                                </Link>
                                                <Link
                                                    href={route('proktor.sessions.toggle-active', session.id)}
                                                    method="patch"
                                                    as="button"
                                                    preserveScroll
                                                    className={session.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                                                >
                                                    {session.is_active ? 'Nonaktifkan' : 'Aktivasi'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {sessions.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Belum ada sesi yang dibuat.</td>
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {isEditing ? 'Edit Sesi Ujian' : 'Tambah Sesi Ujian'}
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="exam_id" value="Pilih Ujian" />
                        <select
                            id="exam_id"
                            value={data.exam_id}
                            onChange={(e) => setData('exam_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            required
                        >
                            <option value="">Pilih Ujian</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>{exam.title}</option>
                            ))}
                        </select>
                        <InputError message={errors.exam_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="classroom_id" value="Pilih Kelas (Opsional untuk Seating Plan)" />
                        <select
                            id="classroom_id"
                            value={data.classroom_id}
                            onChange={(e) => setData('classroom_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        >
                            <option value="">Tanpa Tata Letak Kelas</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.classroom_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Nama Sesi" />
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
                        <InputLabel htmlFor="start_time" value="Waktu Mulai" />
                        <TextInput
                            id="start_time"
                            type="datetime-local"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.start_time} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="end_time" value="Waktu Selesai" />
                        <TextInput
                            id="end_time"
                            type="datetime-local"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.end_time} className="mt-2" />
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
