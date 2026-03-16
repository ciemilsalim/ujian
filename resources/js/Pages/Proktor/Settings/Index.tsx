import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Database, AlertTriangle } from 'lucide-react';

interface Settings {
    school_name: string;
    school_address: string;
    passing_grade: string | number;
    max_cheat_warnings: string | number;
}

export default function Index({ settings }: { settings: Settings }) {
    const { data, setData, post, processing, errors } = useForm({
        school_name: settings.school_name || '',
        school_address: settings.school_address || '',
        passing_grade: settings.passing_grade || '70',
        max_cheat_warnings: settings.max_cheat_warnings || '3',
    });

    const submit = (e: React.FormEvent) => {
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

                        <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Area Berbahaya
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Gunakan fungsi ini jika Anda ingin memulai periode ujian baru dan menghapus seluruh data transaksional yang ada. 
                                <strong> Tindakan ini tidak dapat dibatalkan.</strong>
                            </p>

                            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 p-6 rounded-xl">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Bersihkan Seluruh Data Ujian</h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    Menghapus: Jawaban Siswa, Hasil Ujian, dan Sesi Ujian. <br />
                                    Tetap Ada: Bank Soal, Mata Pelajaran, Akun Pengguna, dan Pengaturan.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('APAKAH ANDA SANGAT YAKIN? Seluruh hasil ujian dan jawaban siswa akan DIHAPUS PERMANEN.')) {
                                            const confirmText = prompt('Ketik "BERSIHKAN" untuk mengonfirmasi:');
                                            if (confirmText === 'BERSIHKAN') {
                                                router.post(route('proktor.settings.clear-data'), {
                                                    confirm_wipe: true
                                                }, {
                                                    onSuccess: () => {
                                                        // Toast will be handled by Flash messages if implemented, 
                                                        // otherwise status is enough.
                                                    }
                                                });
                                            }
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition shadow-lg shadow-red-200 dark:shadow-none"
                                >
                                    <Database className="w-4 h-4" /> Bersihkan Data Ujian Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
