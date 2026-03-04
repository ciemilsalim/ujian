import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function Index({ exams, questionBanks }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        question_bank_id: '',
        duration: '',
        random_question: false,
        random_option: false,
        show_result: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('proktor.exams.store'), {
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
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Judul Ujian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bank Soal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Pelajaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durasi (Menit)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pengaturan</th>
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
                                        </tr>
                                    ))}
                                    {exams.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada ujian yang dibuat.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Buat Ujian Baru
                    </h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="title" value="Judul Ujian (Cth: Ujian Tengah Semester Genap)" />
                        <TextInput
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question_bank_id" value="Pilih Bank Soal" />
                        <select
                            id="question_bank_id"
                            value={data.question_bank_id}
                            onChange={(e) => setData('question_bank_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            required
                        >
                            <option value="">-- Pilih Bank Soal --</option>
                            {questionBanks.map((qb) => (
                                <option key={qb.id} value={qb.id}>{qb.subject?.name} - {qb.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.question_bank_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="duration" value="Durasi (Menit)" />
                        <TextInput
                            id="duration"
                            type="number"
                            min="1"
                            value={data.duration}
                            onChange={(e) => setData('duration', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.duration} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-2">
                        <InputLabel value="Pengaturan Ujian" />
                        <label className="flex items-center">
                            <Checkbox
                                name="random_question"
                                checked={data.random_question}
                                onChange={(e) => setData('random_question', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Acak Urutan Soal</span>
                        </label>
                        <label className="flex items-center">
                            <Checkbox
                                name="random_option"
                                checked={data.random_option}
                                onChange={(e) => setData('random_option', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Acak Pilihan Ganda</span>
                        </label>
                        <label className="flex items-center">
                            <Checkbox
                                name="show_result"
                                checked={data.show_result}
                                onChange={(e) => setData('show_result', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Tampilkan Nilai ke Siswa Setelah Selesai</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan Ujian</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
