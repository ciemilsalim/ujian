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
import { FileUp, Plus, Trash2, Edit, ChevronLeft, ChevronDown, CheckCircle, FileSpreadsheet, FileText, Info, Table, Upload } from 'lucide-react';

const defaultOptions = { a: '', b: '', c: '', d: '', e: '' };

export default function Show({ questionBank }: { questionBank: QuestionBank }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportDropdown, setShowImportDropdown] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const excelInputRef = useRef<HTMLInputElement>(null);
    const wordInputRef = useRef<HTMLInputElement>(null);

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        router.post(route('guru.question-banks.import-excel', questionBank.id), formData, {
            onStart: () => setUploadProgress(0),
            onProgress: (progress) => {
                if (progress?.percentage) setUploadProgress(progress.percentage);
            },
            onSuccess: () => {
                setShowImportDropdown(false);
                if (excelInputRef.current) excelInputRef.current.value = '';
            },
            onFinish: () => setUploadProgress(null),
        });
    };

    const handleImportWord = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        router.post(route('guru.question-banks.import-word', questionBank.id), formData, {
            onStart: () => setUploadProgress(0),
            onProgress: (progress) => {
                if (progress?.percentage) setUploadProgress(progress.percentage);
            },
            onSuccess: () => {
                setShowImportDropdown(false);
                if (wordInputRef.current) wordInputRef.current.value = '';
            },
            onFinish: () => setUploadProgress(null),
        });
    };

    const createForm = useForm({
        question_bank_id: questionBank.id,
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'isian_singkat' | 'menjodohkan' | 'essay',
        question_text: '',
        options: { ...defaultOptions } as Record<string, string>,
        answer_key: '',
        score_default: 1,
    });

    const editForm = useForm({
        type: 'pilihan_ganda' as 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'isian_singkat' | 'menjodohkan' | 'essay',
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
                    onChange={(e) => form.setData('type', e.target.value as 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'isian_singkat' | 'menjodohkan' | 'essay')}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                >
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks</option>
                    <option value="isian_singkat">Isian Singkat</option>
                    <option value="menjodohkan">Menjodohkan</option>
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

            {(form.data.type === 'pilihan_ganda' || form.data.type === 'pilihan_ganda_kompleks') && (
                <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <InputLabel value="Opsi Jawaban" />
                        {form.data.type === 'pilihan_ganda_kompleks' && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded">Klik teks opsi untuk menjadikannya Kunci</span>
                        )}
                    </div>
                    {Object.keys(defaultOptions).map((option) => (
                        <div key={option} className="flex items-center gap-2">
                            <span className={`uppercase font-bold w-6 ${form.data.answer_key.split(',').includes(option) ? 'text-emerald-600' : ''}`}>{option}.</span>
                            <TextInput
                                value={form.data.options[option]}
                                onChange={(e) => {
                                    const newOptions = { ...form.data.options, [option]: e.target.value };
                                    form.setData('options', newOptions);
                                }}
                                className={`flex-1 ${form.data.answer_key.split(',').includes(option) ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                                placeholder={`Opsi ${option.toUpperCase()} ${option === 'e' ? '(Opsional)' : ''}`}
                                required={form.data.type.startsWith('pilihan_ganda') && option !== 'e'}
                            />
                            {form.data.type === 'pilihan_ganda_kompleks' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        let keys = form.data.answer_key ? form.data.answer_key.split(',') : [];
                                        if (keys.includes(option)) {
                                            keys = keys.filter((k: string) => k !== option);
                                        } else {
                                            keys.push(option);
                                        }
                                        form.setData('answer_key', keys.filter((k: string) => k !== '').join(','));
                                    }}
                                    className={`p-2 rounded border ${form.data.answer_key.split(',').includes(option) ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
                                >
                                    {form.data.answer_key.split(',').includes(option) ? 'Kunci' : 'Pilih'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {form.data.type === 'menjodohkan' && (
                <div className="mt-4 space-y-4">
                    <InputLabel value="Pasangan Menjodohkan (Kiri: Pernyataan, Kanan: Jawaban)" />
                    {Object.keys(defaultOptions).map((option) => (
                        <div key={option} className="grid grid-cols-2 gap-2">
                            <TextInput
                                placeholder={`Pernyataan ${option.toUpperCase()}`}
                                value={form.data.options[`left_${option}`] || ''}
                                onChange={(e) => form.setData('options', { ...form.data.options, [`left_${option}`]: e.target.value })}
                            />
                            <TextInput
                                placeholder={`Jawaban ${option.toUpperCase()}`}
                                value={form.data.options[`right_${option}`] || ''}
                                onChange={(e) => form.setData('options', { ...form.data.options, [`right_${option}`]: e.target.value })}
                            />
                        </div>
                    ))}
                    <p className="text-[10px] text-gray-500 italic">* Isikan minimal 2 pasangan. Sistem akan otomatis menilai berdasarkan pasangan horizontal.</p>
                </div>
            )}

            <div className="mt-4">
                <InputLabel 
                    htmlFor="answer_key" 
                    value={
                        form.data.type === 'pilihan_ganda' ? 'Kunci Jawaban (a, b, c, d, atau e)' : 
                        form.data.type === 'pilihan_ganda_kompleks' ? 'Kunci Jawaban (Otomatis terisi saat memilih di atas)' :
                        form.data.type === 'menjodohkan' ? 'Kunci Jawaban (Otomatis: Mengikuti kolom kanan)' :
                        'Kunci Jawaban / Kata Kunci'
                    } 
                />
                <TextInput
                    id="answer_key"
                    value={form.data.answer_key}
                    onChange={(e) => form.setData('answer_key', e.target.value)}
                    className="mt-1 block w-full"
                    required={form.data.type !== 'essay' && form.data.type !== 'menjodohkan' && form.data.type !== 'pilihan_ganda_kompleks'}
                    readOnly={form.data.type === 'pilihan_ganda_kompleks' || form.data.type === 'menjodohkan'}
                    placeholder={form.data.type === 'pilihan_ganda' ? 'a' : form.data.type === 'pilihan_ganda_kompleks' ? 'a,c' : 'Contoh: kemerdekaan'}
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
                                        <button
                                            onClick={() => setShowGuideModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                            <Info className="w-4 h-4 text-gray-500" />
                                            Panduan Import
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

            {uploadProgress !== null && (
                <div className="fixed top-0 left-0 w-full z-[100]">
                    <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden">
                        <div 
                            className="h-full bg-indigo-600 transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <Upload className="w-3 h-3 animate-bounce text-indigo-600" />
                            <span>Sedang mengunggah soal...</span>
                        </div>
                        <span className="text-indigo-600 font-bold">{Math.round(uploadProgress)}%</span>
                    </div>
                </div>
            )}

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
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                                        question.type === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800' : 
                                                        question.type === 'pilihan_ganda_kompleks' ? 'bg-indigo-100 text-indigo-800' :
                                                        question.type === 'isian_singkat' ? 'bg-emerald-100 text-emerald-800' :
                                                        question.type === 'menjodohkan' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {question.type.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">Skor Default: {question.score_default}</span>
                                                </div>
                                                <div 
                                                    className="text-gray-900 dark:text-gray-100 mb-4 prose dark:prose-invert max-w-full"
                                                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                                                />

                                                {(question.type === 'pilihan_ganda' || question.type === 'pilihan_ganda_kompleks') && question.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {Object.entries(question.options as Record<string, string>)
                                                            .filter(([_, value]) => value && value.trim() !== '')
                                                            .map(([key, value]) => (
                                                                <div 
                                                                    key={key} 
                                                                    className={`p-2 rounded border text-sm flex items-center gap-2 ${
                                                                        question.answer_key.split(',').includes(key) 
                                                                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                                                                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600'
                                                                    }`}
                                                                >
                                                                    <span className="font-bold uppercase text-xs w-4">{key}.</span>
                                                                    <span dangerouslySetInnerHTML={{ __html: value }} />
                                                                    {question.answer_key.split(',').includes(key) && (
                                                                        <CheckCircle className="w-3 h-3 text-emerald-600 ml-auto" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}

                                                {question.type === 'menjodohkan' && question.options && (
                                                    <div className="space-y-2">
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-2">Pasangan Menjodohkan:</span>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {['a', 'b', 'c', 'd', 'e'].map(opt => {
                                                                const options = question.options as Record<string, string>;
                                                                const left = options[`left_${opt}`];
                                                                const right = options[`right_${opt}`];
                                                                if (!left) return null;
                                                                return (
                                                                    <div key={opt} className="flex items-stretch gap-2">
                                                                        <div 
                                                                            className="flex-1 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded text-sm text-center"
                                                                            dangerouslySetInnerHTML={{ __html: left }}
                                                                        />
                                                                        <div className="flex items-center text-gray-400">↔</div>
                                                                        <div 
                                                                            className="flex-1 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded text-sm text-center font-bold"
                                                                            dangerouslySetInnerHTML={{ __html: right }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {(question.type === 'essay' || question.type === 'isian_singkat') && (
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-dashed dark:border-gray-700 text-sm">
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                                                            {question.type === 'essay' ? 'Kata Kunci Penilaian:' : 'Jawaban Benar:'}
                                                        </span>
                                                        <div className="font-medium text-indigo-600 dark:text-indigo-400">
                                                            {question.answer_key || '-'}
                                                        </div>
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
            {/* Modal Panduan Import */}
            <Modal show={showGuideModal} onClose={() => setShowGuideModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600" />
                            Panduan Format Import Soal
                        </h2>
                        <button onClick={() => setShowGuideModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 text-sm text-amber-800 dark:text-amber-200">
                            <strong>PENTING:</strong> Sistem akan mulai mengenali soal baru saat mendeteksi angka (misal 1. atau 1)) ATAU teks baru setelah baris "Kunci" soal sebelumnya.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-xl p-4 dark:border-gray-700">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <FileUp className="w-4 h-4" /> Standar Microsoft Word (.docx)
                                </h3>
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs space-y-2">
                                    <p>1. Apa ibukota Indonesia?</p>
                                    <p>A. Jakarta</p>
                                    <p>B. Bandung</p>
                                    <p>Kunci: A</p>
                                    <br />
                                    <p>Manakah pulau di Jawa?</p>
                                    <p>Tipe: PGK</p>
                                    <p>A. Jawa Barat</p>
                                    <p>B. Medan</p>
                                    <p>Kunci: A</p>
                                </div>
                                <ul className="mt-3 text-[10px] text-gray-500 space-y-1">
                                    <li>&bull; Nomor soal opsional.</li>
                                    <li>&bull; Tambahkan <strong>Tipe: [Jenis]</strong> jika bukan PG biasa.</li>
                                    <li>&bull; Menjodohkan gunakan format <strong>A. Kiri|Kanan</strong>.</li>
                                </ul>
                            </div>

                            <div className="border rounded-xl p-4 dark:border-gray-700">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <Table className="w-4 h-4" /> Standar Excel (.xlsx)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="text-[10px] w-full border-collapse border dark:border-gray-700">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-800">
                                                <th className="border p-1">Pertanyaan</th>
                                                <th className="border p-1">Tipe</th>
                                                <th className="border p-1">Opsi A</th>
                                                <th className="border p-1">Kunci</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border p-1">Apa...</td>
                                                <td className="border p-1">pilihan_ganda</td>
                                                <td className="border p-1">Jakarta</td>
                                                <td className="border p-1">a</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <ul className="mt-3 text-[10px] text-gray-500 space-y-1">
                                    <li>&bull; Gunakan template yang disediakan.</li>
                                    <li>&bull; Kolom Tipe diisi: pilihan_ganda, pilihan_ganda_kompleks, isian_singkat, menjodohkan, atau essay.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowGuideModal(false)}>Tutup</SecondaryButton>
                        <PrimaryButton onClick={() => {
                            setShowGuideModal(false);
                            setShowImportDropdown(true);
                        }}>Mulai Import Sekarang</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
