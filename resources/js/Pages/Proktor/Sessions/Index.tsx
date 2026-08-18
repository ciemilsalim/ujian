import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Play, Pause, Trash2, Monitor, Edit, Calendar, BookOpen, Users, UserPlus, Clock, Search, Filter, MoreVertical, CheckCircle, XCircle, AlertTriangle, Home } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ExamSession, Exam, Classroom, AcademicYear, PaginationData } from '@/types';

interface IndexProps {
    sessions: PaginationData<ExamSession>;
    exams: Exam[];
    classrooms: Classroom[];
    academicYears: AcademicYear[];
    selectedAcademicYearId: string;
}

export default function Index({ sessions, exams, classrooms, academicYears, selectedAcademicYearId }: IndexProps) {
    const [search, setSearch] = useState('');
    const { delete: destroy, post } = useForm();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<ExamSession | null>(null);

    const createForm = useForm({
        exam_id: '',
        classroom_ids: [] as number[],
        name: '',
        start_time: '',
        end_time: '',
    });

    const editForm = useForm({
        exam_id: '',
        classroom_ids: [] as number[],
        name: '',
        start_time: '',
        end_time: '',
    });

    const handleDelete = (session: ExamSession) => {
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!sessionToDelete) return;
        destroy(route('proktor.sessions.destroy', sessionToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSessionToDelete(null);
                toast.success('Sesi ujian berhasil dihapus');
            }
        });
    };

    const toggleSessionStatus = (session: ExamSession) => {
        post(route('proktor.sessions.toggle-status', session.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Sesi ujian berhasil ${session.is_active ? 'dihentikan' : 'diaktifkan'}`);
            }
        });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('proktor.sessions.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                toast.success('Sesi ujian berhasil dibuat');
            }
        });
    };

    const openEditModal = (session: ExamSession) => {
        setSelectedSession(session);
        editForm.setData({
            exam_id: session.exam_id ? String(session.exam_id) : '',
            classroom_ids: session.classroom ? [session.classroom.id] : [],
            name: session.name,
            start_time: session.start_time.replace(' ', 'T').slice(0, 16),
            end_time: session.end_time.replace(' ', 'T').slice(0, 16),
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;
        editForm.put(route('proktor.sessions.update', selectedSession.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedSession(null);
                toast.success('Sesi ujian berhasil diperbarui');
            }
        });
    };

    const filteredSessions = sessions.data.filter((s: ExamSession) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.exam?.title.toLowerCase().includes(search.toLowerCase())
    );

    const renderForm = (form: any, onSubmit: (e: React.FormEvent) => void, title: string, onClose: () => void) => (
        <form onSubmit={onSubmit} className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {title}
            </h2>

            <div className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Sesi (Contoh: Sesi 1 - Pagi)" />
                    <TextInput
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Masukkan nama sesi..."
                        required
                    />
                    <InputError message={form.errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="exam_id" value="Pilih Ujian" />
                    <select
                        id="exam_id"
                        value={form.data.exam_id}
                        onChange={(e) => form.setData('exam_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        required
                    >
                        <option value="">-- Pilih Ujian --</option>
                        {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>{exam.title}</option>
                        ))}
                    </select>
                    <InputError message={form.errors.exam_id} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="Pilih Kelas (Bisa Pilih Banyak)" />
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        {classrooms.map((c) => (
                            <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    checked={form.data.classroom_ids.includes(c.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            form.setData('classroom_ids', [...form.data.classroom_ids, c.id]);
                                        } else {
                                            form.setData('classroom_ids', form.data.classroom_ids.filter((id: number) => id !== c.id));
                                        }
                                    }}
                                />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 uppercase tracking-tight">{c.name}</span>
                            </label>
                        ))}
                    </div>
                    <InputError message={form.errors.classroom_ids} className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="start_time" value="Waktu Mulai" />
                        <TextInput
                            id="start_time"
                            type="datetime-local"
                            value={form.data.start_time}
                            onChange={(e) => form.setData('start_time', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={form.errors.start_time} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="end_time" value="Waktu Selesai" />
                        <TextInput
                            id="end_time"
                            type="datetime-local"
                            value={form.data.end_time}
                            onChange={(e) => form.setData('end_time', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={form.errors.end_time} className="mt-2" />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton disabled={form.processing}>
                    {form.processing ? 'Menyimpan...' : 'Simpan Sesi'}
                </PrimaryButton>
            </div>
        </form>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight uppercase flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            Manajemen Sesi Ujian
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Atur jadwal, aktivasi token, dan pantau jalannya ujian.</p>
                    </div>
                    <button
                        onClick={() => { createForm.reset(); setShowCreateModal(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Buat Sesi Baru
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Sesi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Academic Year Filter Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Filter Tahun Ajaran & Semester:</span>
                        </div>
                        <div className="w-full sm:w-auto flex items-center gap-3">
                            <select
                                value={selectedAcademicYearId}
                                onChange={(e) => {
                                    router.get(route('proktor.sessions.index'), { academic_year_id: e.target.value }, { preserveState: true, replace: true });
                                }}
                                className="w-full sm:w-64 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm focus:ring-indigo-500 font-medium"
                            >
                                <option value="all">Semua Tahun Ajaran</option>
                                {(academicYears || []).map((ay) => (
                                    <option key={ay.id} value={ay.id}>
                                        {ay.name} - {ay.semester} {ay.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Sesi</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{sessions.total || sessions.data.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                                <Play className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sesi Aktif</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                    {sessions.data.filter((s: ExamSession) => s.is_active).length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Peserta</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                    {sessions.data.reduce((acc: number, s: ExamSession) => acc + (s.participants_count || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-700">
                        {/* Filter Bar */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama sesi atau ujian..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                    <Filter className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30">
                                        <th className="px-6 py-4">Informasi Sesi</th>
                                        <th className="px-6 py-4">Mata Pelajaran & Ujian</th>
                                        <th className="px-6 py-4">Waktu Pelaksanaan</th>
                                        <th className="px-6 py-4">Token & Peserta</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredSessions.map((session: ExamSession) => (
                                        <tr key={session.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{session.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{session.classroom?.name || (session.participants_count > 0 ? 'Multi-Kelas' : 'Tanpa Kelas')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.exam?.title}</div>
                                                <div className="text-[10px] text-indigo-500 font-black uppercase">{session.exam?.subject?.name}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(session.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs font-black text-gray-700 dark:text-gray-300">
                                                        {session.token}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                    <Users className="w-3 h-3" />
                                                    {session.participants_count || 0} Terdaftar
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => toggleSessionStatus(session)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${session.is_active
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                                                        }`}
                                                >
                                                    {session.is_active ? (
                                                        <><CheckCircle className="w-3 h-3" /> Aktif</>
                                                    ) : (
                                                        <><XCircle className="w-3 h-3" /> Nonaktif</>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Sinkronkan seluruh siswa di kelas ke sesi ini?')) {
                                                                router.post(route('proktor.sessions.sync', session.id));
                                                            }
                                                        }}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                        title="Sync Peserta Dari Kelas"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={route('proktor.sessions.participants', session.id)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                        title="Kelola Peserta Sesi"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('proktor.sessions.room-assignment', session.id)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                        title="Bagi Ruang"
                                                    >
                                                        <Home className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('proktor.sessions.monitor', session.id)}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                        title="Pantau Live"
                                                    >
                                                        <Monitor className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEditModal(session)}
                                                        className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
                                                        title="Edit Sesi"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                        title="Hapus Sesi"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-200 dark:text-gray-700">
                                                        <Calendar className="w-8 h-8" />
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Belum ada sesi ditemukan</div>
                                                    <button onClick={() => { createForm.reset(); setShowCreateModal(true); }} className="text-indigo-600 font-bold hover:underline text-sm">Buat sesi pertama Anda →</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                {renderForm(createForm, submitCreate, 'Buat Sesi Ujian Baru', () => setShowCreateModal(false))}
            </Modal>

            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                {renderForm(editForm, submitEdit, 'Edit Sesi Ujian', () => setShowEditModal(false))}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Konfirmasi Hapus Sesi
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tindakan ini tidak dapat dibatalkan. Seluruh data terkait pendaftaran siswa dan jawaban pada sesi ini akan ikut terhapus.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sesi yang akan dihapus:</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{sessionToDelete?.name}</div>
                        <div className="text-[10px] text-indigo-500 font-black uppercase mt-1">{sessionToDelete?.exam?.title}</div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Batal
                        </SecondaryButton>
                        <button
                            onClick={confirmDelete}
                            disabled={createForm.processing}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
                        >
                            Hapus Sesi
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
