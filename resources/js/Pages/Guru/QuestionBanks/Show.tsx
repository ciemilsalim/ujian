import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Show({ questionBank }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        question_bank_id: questionBank.id,
        type: 'pilihan_ganda',
        question_text: '',
        options: { a: '', b: '', c: '', d: '', e: '' },
        answer_key: '',
        score_default: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('guru.questions.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

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
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-bold mb-4">Daftar Soal</h3>
                            {questionBank.questions.length === 0 ? (
                                <p className="text-gray-500 italic">Belum ada soal dalam bank soal ini.</p>
                            ) : (
                                <div className="space-y-6">
                                    {questionBank.questions.map((q, index) => (
                                        <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-indigo-600">Soal #{index + 1} ({q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'})</span>
                                                <div className="space-x-2">
                                                    <button className="text-sm text-indigo-600 hover:underline">Edit</button>
                                                    <button className="text-sm text-red-600 hover:underline">Hapus</button>
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

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Tambah Soal Baru
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="type" value="Tipe Soal" />
                        <select
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
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
                            value={data.question_text}
                            onChange={(e) => setData('question_text', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    {data.type === 'pilihan_ganda' && (
                        <div className="mt-4 space-y-2">
                            <InputLabel value="Opsi Jawaban" />
                            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                    <span className="uppercase font-bold">{opt}</span>
                                    <TextInput
                                        value={data.options[opt]}
                                        onChange={(e) => setData('options', { ...data.options, [opt]: e.target.value })}
                                        className="block w-full"
                                        placeholder={`Opsi ${opt.toUpperCase()}`}
                                        required={data.type === 'pilihan_ganda'}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4">
                        <InputLabel htmlFor="answer_key" value={data.type === 'pilihan_ganda' ? 'Kunci Jawaban (Pilih Huruf)' : 'Kunci Jawaban (Teks)'} />
                        {data.type === 'pilihan_ganda' ? (
                            <select
                                id="answer_key"
                                value={data.answer_key}
                                onChange={(e) => setData('answer_key', e.target.value)}
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
                                value={data.answer_key}
                                onChange={(e) => setData('answer_key', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                        )}
                        <InputError message={errors.answer_key} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
