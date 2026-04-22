import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Exam, QuestionBank, PaginationData } from '@/types';

interface IndexProps {
    exams: PaginationData<Exam>;
    questionBanks: QuestionBank[];
}

export default function Index({ exams, questionBanks }: IndexProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const createForm = useForm({
        title: '',
        question_bank_id: '' as string | number,
        duration: '' as string | number,
        random_question: false,
        random_option: false,
        show_result: false,
        is_practice: false,
    });

    const editForm = useForm({
        title: '',
        question_bank_id: '' as string | number,
        duration: '' as string | number,
        random_question: false,
        random_option: false,
        show_result: false,
        is_practice: false,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('proktor.exams.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (exam: Exam) => {
        setSelectedExam(exam);
        editForm.setData({
            title: exam.title || '',
            question_bank_id: exam.question_bank_id || '',
            duration: exam.duration || '',
            random_question: exam.random_question || false,
            random_option: exam.random_option || false,
            show_result: exam.show_result || false,
            is_practice: exam.is_practice || false,
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) return;
        editForm.put(route('proktor.exams.update', selectedExam.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedExam(null);
            },
        });
    };

    const openDeleteModal = (exam: Exam) => {
        setSelectedExam(exam);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedExam) return;
        router.delete(route('proktor.exams.destroy', selectedExam.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedExam(null);
            },
        });
    };

    const renderExamForm = (form: any, onSubmit: (e: React.FormEvent) => void, title: string, onClose: () => void) => (
        <form onSubmit={onSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h2>

            <div className="mt-4">
                <InputLabel htmlFor="title" value="Judul Ujian (Cth: Ujian Tengah Semester Genap)" />
                <TextInput
                    id="title"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={form.errors.title} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="question_bank_id" value="Pilih Bank Soal" />
                <select
                    id="question_bank_id"
                    value={form.data.question_bank_id}
                    onChange={(e) => form.setData('question_bank_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                    required
                >
                    <option value="">-- Pilih Bank Soal --</option>
                    {questionBanks.map((qb) => (
                        <option key={qb.id} value={qb.id}>{qb.subject?.name} - {qb.name}</option>
                    ))}
                </select>
                <InputError message={form.errors.question_bank_id} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="duration" value="Durasi (Menit)" />
                <TextInput
                    id="duration"
                    type="number"
                    min="1"
                    value={form.data.duration}
                    onChange={(e) => form.setData('duration', e.target.value)}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={form.errors.duration} className="mt-2" />
            </div>

            <div className="mt-4 space-y-2">
                <InputLabel value="Pengaturan Ujian" />
                <label className="flex items-center">
                    <Checkbox
                        name="random_question"
                        checked={form.data.random_question}
                        onChange={(e) => form.setData('random_question', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Acak Urutan Soal</span>
                </label>
                <label className="flex items-center">
                    <Checkbox
                        name="random_option"
                        checked={form.data.random_option}
                        onChange={(e) => form.setData('random_option', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Acak Pilihan Ganda</span>
                </label>
                <label className="flex items-center">
                    <Checkbox
                        name="show_result"
                        checked={form.data.show_result}
                        onChange={(e) => form.setData('show_result', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Tampilkan Nilai ke Siswa Setelah Selesai</span>
                </label>
                <label className="flex items-center">
                    <Checkbox
                        name="is_practice"
                        checked={form.data.is_practice}
                        onChange={(e) => form.setData('is_practice', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Mode Latihan (Tidak dihitung sebagai ujian resmi)</span>
                </label>
            </div>

            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton className="ml-3" disabled={form.processing}>Simpan Ujian</PrimaryButton>
            </div>
        </form>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Manajemen Ujian
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Buat Ujian Baru
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Ujian" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Judul Ujian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bank Soal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Pelajaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durasi (Menit)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pengaturan</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-700 z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {exams.data.map((exam) => (
                                        <tr key={exam.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{exam.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{exam.question_bank?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{exam.question_bank?.subject?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">{exam.duration}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {exam.random_question && <span className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Acak Soal</span>}
                                                {exam.random_option && <span className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Acak Opsi</span>}
                                                {exam.show_result && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Tampil Nilai</span>}
                                                {!exam.random_question && !exam.random_option && !exam.show_result && <span className="text-gray-500">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]">
                                                <button onClick={() => openEditModal(exam)} className="text-yellow-600 hover:text-yellow-900">Edit</button>
                                                <button onClick={() => openDeleteModal(exam)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {exams.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Belum ada ujian yang dibuat.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                {renderExamForm(createForm, submitCreate, 'Buat Ujian Baru', () => setShowCreateModal(false))}
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                {renderExamForm(editForm, submitEdit, 'Edit Ujian', () => setShowEditModal(false))}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus Ujian
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus ujian <strong>{selectedExam?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
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
