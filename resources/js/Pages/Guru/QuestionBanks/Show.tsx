import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { QuestionBank, Question } from '@/types';
import { FileSpreadsheet, FileText, Upload, ChevronDown } from 'lucide-react';

const defaultOptions = { a: '', b: '', c: '', d: '', e: '' };

export default function Show({ questionBank }: { questionBank: QuestionBank }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportDropdown, setShowImportDropdown] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const excelInputRef = useRef<HTMLInputElement>(null);
    const wordInputRef = useRef<HTMLInputElement>(null);

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        router.post(route('guru.question-banks.import-excel', questionBank.id), formData, {
            onSuccess: () => {
                setShowImportDropdown(false);
                if (excelInputRef.current) excelInputRef.current.value = '';
            },
        });
    };

    const handleImportWord = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        router.post(route('guru.question-banks.import-word', questionBank.id), formData, {
            onSuccess: () => {
                setShowImportDropdown(false);
                if (wordInputRef.current) wordInputRef.current.value = '';
            },
        });
    };

    const createForm = useForm({
        question_bank_id: questionBank.id,
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'essay',
        question_text: '',
        options: { ...defaultOptions } as Record<string, string>,
        answer_key: '',
        score_default: 1,
    });

    const editForm = useForm({
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'essay',
        question_text: '',
        options: { ...defaultOptions } as Record<string, string>,
        answer_key: '',
        score_default: 1,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('guru.questions.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                createForm.setData('question_bank_id', questionBank.id);
            },
        });
    };

    const openEditModal = (question: Question) => {
        setSelectedQuestion(question);
        editForm.setData({
            type: question.type || 'pilihan_ganda',
            question_text: question.question_text || '',
            options: (question.options as Record<string, string>) || { ...defaultOptions },
            answer_key: question.answer_key || '',
            score_default: question.score_default || 1,
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuestion) return;
        editForm.put(route('guru.questions.update', selectedQuestion.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedQuestion(null);
            },
        });
    };

    const openDeleteModal = (question: Question) => {
        setSelectedQuestion(question);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedQuestion) return;
        router.delete(route('guru.questions.destroy', selectedQuestion.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedQuestion(null);
            },
        });
    };

    const renderQuestionForm = (form: any, onSubmit: (e: React.FormEvent) => void, title: string, onClose: () => void) => (
        <form onSubmit={onSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h2>

            <div className="mt-4">
                <InputLabel htmlFor="type" value="Tipe Soal" />
                <select
                    id="type"
                    value={form.data.type}
                    onChange={(e) => form.setData('type', e.target.value as 'pilihan_ganda' | 'essay')}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
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
                    rows={4}
                    required
                />
                <InputError message={form.errors.question_text} className="mt-2" />
            </div>

            {form.data.type === 'pilihan_ganda' && (
                <div className="mt-4 space-y-4">
                    <InputLabel value="Opsi Jawaban" />
                    {Object.keys(defaultOptions).map((option) => (
                        <div key={option} className="flex items-center gap-2">
                            <span className="uppercase font-bold w-6">{option}.</span>
                            <TextInput
                                value={form.data.options[option]}
                                onChange={(e) => {
                                    const newOptions = { ...form.data.options, [option]: e.target.value };
                                    form.setData('options', newOptions);
                                }}
                                className="flex-1"
                                placeholder={`Opsi ${option.toUpperCase()}`}
                                required={form.data.type === 'pilihan_ganda'}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <InputLabel htmlFor="answer_key" value={form.data.type === 'pilihan_ganda' ? 'Kunci Jawaban (a, b, c, d, atau e)' : 'Kata Kunci Jawaban (Opsional)'} />
                <TextInput
                    id="answer_key"
                    value={form.data.answer_key}
                    onChange={(e) => form.setData('answer_key', e.target.value)}
                    className="mt-1 block w-full"
                    required={form.data.type === 'pilihan_ganda'}
                    placeholder={form.data.type === 'pilihan_ganda' ? 'a' : 'Contoh: kemerdekaan, proklamasi'}
                />
                <InputError message={form.errors.answer_key} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="score_default" value="Skor Bawaan" />
                <TextInput
                    id="score_default"
                    type="number"
                    value={form.data.score_default}
                    onChange={(e) => form.setData('score_default', parseInt(e.target.value))}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={form.errors.score_default} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton className="ml-3" disabled={form.processing}>Simpan Soal</PrimaryButton>
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
                    <div className="flex gap-2 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowImportDropdown(!showImportDropdown)}
                                className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <Upload className="w-4 h-4" />
                                Import
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            {showImportDropdown && (
                                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        <button
                                            onClick={() => excelInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                            Import Excel
                                        </button>
                                        <button
                                            onClick={() => wordInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            Import Word
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Tambah Soal
                        </button>

                        <input type="file" ref={excelInputRef} onChange={handleImportExcel} className="hidden" accept=".xlsx,.xls" />
                        <input type="file" ref={wordInputRef} onChange={handleImportWord} className="hidden" accept=".docx" />
                    </div>
                </div>
            }
        >
            <Head title={`Bank Soal: ${questionBank.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold">Informasi Bank Soal</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Mata Pelajaran: {questionBank.subject?.name}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Deskripsi: {questionBank.description || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Download Template</p>
                                    <div className="flex gap-2">
                                        <a href={route('guru.question-banks.template-excel')} className="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 text-xs" title="Excel Template">
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" /> XLSX
                                        </a>
                                        <a href={route('guru.question-banks.template-word')} className="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 text-xs" title="Word Template">
                                            <FileText className="w-4 h-4 text-blue-600" /> DOCX
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200 dark:border-gray-700" />

                            <h3 className="text-lg font-bold mb-4">Daftar Pertanyaan ({questionBank.questions.length})</h3>

                            <div className="space-y-6">
                                {questionBank.questions.map((question, index) => (
                                    <div key={question.id} className="p-4 border rounded-lg dark:border-gray-700 relative group">
                                        <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(question)} className="text-indigo-600 hover:text-indigo-900 text-sm font-bold">Edit</button>
                                            <button onClick={() => openDeleteModal(question)} className="text-red-600 hover:text-red-900 text-sm font-bold">Hapus</button>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${question.type === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                        {question.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Skor: {question.score_default}</span>
                                                </div>
                                                <div 
                                                    className="text-gray-900 dark:text-gray-100 mb-4 prose dark:prose-invert max-w-full"
                                                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                                                />

                                                {question.type === 'pilihan_ganda' && question.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {Object.entries(question.options as Record<string, string>).map(([key, value]) => (
                                                            <div key={key} className={`p-2 rounded border text-sm flex gap-2 ${question.answer_key === key ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'dark:border-gray-700'}`}>
                                                                <span className="font-bold uppercase">{key}.</span>
                                                                <span>{value}</span>
                                                                {question.answer_key === key && <span className="ml-auto text-emerald-600 font-bold text-[10px] uppercase">Kunci</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {question.type === 'essay' && (
                                                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700 text-sm">
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Kata Kunci:</span>
                                                        {question.answer_key || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {questionBank.questions.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        Belum ada soal di bank soal ini.
                                    </div>
                                )}
                            </div>
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
                {renderQuestionForm(editForm, submitEdit, 'Edit Pertanyaan', () => setShowEditModal(false))}
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Hapus Pertanyaan</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" onClick={confirmDelete}>Hapus</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
