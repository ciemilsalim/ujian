import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { PrinterIcon } from 'lucide-react';

export default function Index({ classrooms }) {
    const { data, setData, post, processing, errors } = useForm({
        classroom_id: '',
    });

    const submit = (e) => {
        // Native form submission will happen since we removed e.preventDefault()
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Cetak Kartu Ujian</h2>}
        >
            <Head title="Cetak Kartu Ujian" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium mb-4">Pilih Kelas untuk Mencetak Kartu</h3>

                            <form method="POST" action={route('proktor.exam-cards.generate')} target="_blank" className="max-w-md">
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                <div>
                                    <InputLabel htmlFor="classroom_id" value="Kelas" />
                                    <select
                                        id="classroom_id"
                                        name="classroom_id"
                                        value={data.classroom_id}
                                        onChange={(e) => setData('classroom_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classrooms.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.classroom_id} className="mt-2" />
                                </div>

                                <div className="mt-6">
                                    <PrimaryButton disabled={processing || !data.classroom_id} className="gap-2">
                                        <PrinterIcon className="w-4 h-4" />
                                        Generate & Download PDF
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
