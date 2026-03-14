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

const defaultOptions = { a: '', b: '', c: '', d: '', e: '' };

export default function Show({ questionBank }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const createForm = useForm({
        question_bank_id: questionBank.id,
        type: 'pilihan_ganda',
        question_text: '',
        options: { ...defaultOptions },
        answer_key: '',
        score_default: 1,
    });

    const editForm = useForm({
        type: 'pilihan_ganda',
        question_text: '',
        options: { ...defaultOptions },
        answer_key: '',
        score_default: 1,
    });

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('guru.questions.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                createForm.setData('question_bank_id', questionBank.id);
            },
        });
    };

    const openEditModal = (question) => {
        setSelectedQuestion(question);
        editForm.setData({
            type: question.type || 'pilihan_ganda',
            question_text: question.question_text || '',
            options: question.options || { ...defaultOptions },
            answer_key: question.answer_key || '',
            score_default: question.score_default || 1,
        });
        setShowEditModal(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('guru.questions.update', selectedQuestion.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedQuestion(null);
            },
        });
    };

    const openDeleteModal = (question) => {
        setSelectedQuestion(question);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('guru.questions.destroy', selectedQuestion.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedQuestion(null);
            },
        });
    };

    const renderQuestionForm = (form, onSubmit, title, onClose) => (
        <form onSubmit={onSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h2>

            <div className="mt-4">
                <InputLabel htmlFor="type" value="Tipe Soal" />
                <select
                    id="type"
                    value={form.data.type}
                    onChange={(e) => form.setData('type', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                    required
                >
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="essay">Essay</option>
                </select>
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="question_text" value="Pertanyaan" />
                <textarea
                    id="question_text"
                    value={form.data.question_text}
                    onChange={(e) => form.setData('question_text', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                    rows="4"
                    required
                ></textarea>
            </div>

            {form.data.type === 'pilihan_ganda' && (
                <div className="mt-4 space-y-2">
                    <InputLabel value="Opsi Jawaban" />
                    {['a', 'b', 'c', 'd', 'e'].map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                            <span className="uppercase font-bold w-6">{opt}</span>
                            <TextInput
                                value={form.data.options[opt] || ''}
                                onChange={(e) => form.setData('options', { ...form.data.options, [opt]: e.target.value })}
                                className="block w-full"
                                placeholder={`Opsi ${opt.toUpperCase()}`}
                                required={form.data.type === 'pilihan_ganda'}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <InputLabel htmlFor="answer_key" value={form.data.type === 'pilihan_ganda' ? 'Kunci Jawaban (Pilih Huruf)' : 'Kunci Jawaban (Teks)'} />
                {form.data.type === 'pilihan_ganda' ? (
                    <select
                        id="answer_key"
                        value={form.data.answer_key}
                        onChange={(e) => form.setData('answer_key', e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        required
                    >
                        <option value="">Pilih Kunci</option>
                        {['a', 'b', 'c', 'd', 'e'].map((opt) => (
                            <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                        ))}
                    </select>
                ) : (
                    <TextInput
                        id="answer_key"
                        value={form.data.answer_key}
                        onChange={(e) => form.setData('answer_key', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                )}
                <InputError message={form.errors.answer_key} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="score_default" value="Skor Default" />
                <TextInput
                    id="score_default"
                    type="number"
                    min="0"
                    value={form.data.score_default}
                    onChange={(e) => form.setData('score_default', parseInt(e.target.value) || 0)}
                    className="mt-1 block w-32"
                    required
                />
                <InputError message={form.errors.score_default} className="mt-2" />
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
                        Detail Bank Soal: {questionBank.name}
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Tambah Soal
                    </button>
                </div>
            }
        >
            <Head title={`Detail Bank Soal - ${questionBank.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Bank Soal Info */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-500">Mata Pelajaran:</span>
                                    <p>{questionBank.subject?.name}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-500">Total Soal:</span>
                                    <p>{questionBank.questions.length} soal</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-500">Deskripsi:</span>
                                    <p>{questionBank.description || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-bold mb-4">Daftar Soal</h3>
                            {questionBank.questions.length === 0 ? (
                                <p className="text-gray-500 italic">Belum ada soal dalam bank soal ini.</p>
                            ) : (
                                <div className="space-y-6">
                                    {questionBank.questions.map((q, index) => (
                                        <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-indigo-600">
                                                    Soal #{index + 1} ({q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}) — Skor: {q.score_default}
                                                </span>
                                                <div className="space-x-2 flex-shrink-0">
                                                    <button onClick={() => openEditModal(q)} className="text-sm text-yellow-600 hover:underline">Edit</button>
                                                    <button onClick={() => openDeleteModal(q)} className="text-sm text-red-600 hover:underline">Hapus</button>
                                                </div>
                                            </div>
                                            <div className="mt-2 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                                            {q.type === 'pilihan_ganda' && q.options && (
                                                <ul className="mt-3 space-y-1 ml-4 list-disc">
                                                    {Object.entries(q.options).map(([key, val]) => (
                                                        <li key={key} className={q.answer_key === key ? 'font-bold text-green-600' : ''}>
                                                            {key.toUpperCase()}. {val}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {q.type === 'essay' && (
                                                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                    <span className="text-sm font-semibold">Kunci Jawaban:</span>
                                                    <p className="mt-1 text-sm">{q.answer_key}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                {renderQuestionForm(createForm, submitCreate, 'Tambah Soal Baru', () => setShowCreateModal(false))}
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                {renderQuestionForm(editForm, submitEdit, 'Edit Soal', () => setShowEditModal(false))}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Hapus Soal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.
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
