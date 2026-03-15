import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Index({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        school_name: settings.school_name || '',
        school_address: settings.school_address || '',
        passing_grade: settings.passing_grade || '70',
        max_cheat_warnings: settings.max_cheat_warnings || '3',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('proktor.settings.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Pengaturan Aplikasi
                </h2>
            }
        >
            <Head title="Pengaturan Aplikasi" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 border-b pb-2">
                                Profil Institusi
                            </h3>

                            <div>
                                <InputLabel htmlFor="school_name" value="Nama Sekolah/Institusi" />
                                <TextInput
                                    id="school_name"
                                    value={data.school_name}
                                    onChange={(e) => setData('school_name', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: SMA Negeri 1 Maju Bersama"
                                    required
                                />
                                <InputError message={errors.school_name} className="mt-2" />
                            </div>

                            <div className="mt-6">
                                <InputLabel htmlFor="school_address" value="Alamat Lengkap" />
                                <textarea
                                    id="school_address"
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm mt-1 block w-full resize-none"
                                    rows={4}
                                    value={data.school_address}
                                    onChange={(e) => setData('school_address', e.target.value)}
                                    placeholder="Jl. Pendidikan No. 1..."
                                    required
                                ></textarea>
                                <InputError message={errors.school_address} className="mt-2" />
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-8 mb-6 border-b pb-2">
                                Pengaturan Ujian
                            </h3>

                            <div>
                                <InputLabel htmlFor="passing_grade" value="KKM (Kriteria Ketuntasan Minimal)" />
                                <TextInput
                                    id="passing_grade"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.passing_grade}
                                    onChange={(e) => setData('passing_grade', e.target.value)}
                                    className="mt-1 block w-32"
                                    placeholder="70"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">Batas nilai kelulusan (0-100). Default: 70</p>
                                <InputError message={errors.passing_grade} className="mt-2" />
                            </div>

                            <div className="mt-6">
                                <InputLabel htmlFor="max_cheat_warnings" value="Batas Peringatan Kecurangan" />
                                <TextInput
                                    id="max_cheat_warnings"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={data.max_cheat_warnings}
                                    onChange={(e) => setData('max_cheat_warnings', e.target.value)}
                                    className="mt-1 block w-32"
                                    placeholder="3"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">Jumlah maksimal peringatan sebelum siswa didiskualifikasi otomatis. Default: 3</p>
                                <InputError message={errors.max_cheat_warnings} className="mt-2" />
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <PrimaryButton disabled={processing}>
                                    Simpan Pengaturan
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
