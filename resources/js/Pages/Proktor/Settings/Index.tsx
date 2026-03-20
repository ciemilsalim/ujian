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
    principal_name: string;
    principal_nip: string;
    passing_grade: string | number;
    max_cheat_warnings: string | number;
    enable_anti_cheat: boolean | string;
    block_context_menu: boolean | string;
    block_copy_paste: boolean | string;
    detect_tab_switch: boolean | string;
    force_fullscreen: boolean | string;
    app_mode: 'online' | 'offline';
}

export default function Index({ settings }: { settings: Settings }) {
    const { data, setData, post, processing, errors } = useForm({
        school_name: settings.school_name || '',
        school_address: settings.school_address || '',
        principal_name: settings.principal_name || '',
        principal_nip: settings.principal_nip || '',
        passing_grade: settings.passing_grade || '70',
        max_cheat_warnings: settings.max_cheat_warnings || '3',
        enable_anti_cheat: settings.enable_anti_cheat === '1' || settings.enable_anti_cheat === true,
        block_context_menu: settings.block_context_menu === '1' || settings.block_context_menu === true,
        block_copy_paste: settings.block_copy_paste === '1' || settings.block_copy_paste === true,
        detect_tab_switch: settings.detect_tab_switch === '1' || settings.detect_tab_switch === true,
        force_fullscreen: settings.force_fullscreen === '1' || settings.force_fullscreen === true,
        app_mode: settings.app_mode || 'online',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('proktor.settings.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase">
                        Pengaturan Aplikasi
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kelola konfigurasi sistem, institusi, dan aturan ujian.
                    </p>
                </div>
            }
        >
            <Head title="Pengaturan Aplikasi" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
                        <form onSubmit={submit} className="p-8 sm:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left Column: Institution & Basic Exam */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-sm">1</span>
                                            Profil Institusi
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <InputLabel htmlFor="school_name" value="Nama Sekolah/Institusi" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                                <TextInput
                                                    id="school_name"
                                                    value={data.school_name}
                                                    onChange={(e) => setData('school_name', e.target.value)}
                                                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-indigo-500 rounded-2xl h-12"
                                                    placeholder="Contoh: SMA Negeri 1..."
                                                    required
                                                />
                                                <InputError message={errors.school_name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="school_address" value="Alamat Lengkap" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                                <textarea
                                                    id="school_address"
                                                    className="border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-2xl shadow-sm mt-1 block w-full resize-none p-4"
                                                    rows={3}
                                                    value={data.school_address}
                                                    onChange={(e) => setData('school_address', e.target.value)}
                                                    placeholder="Jl. Pendidikan No. 1..."
                                                    required
                                                ></textarea>
                                                <InputError message={errors.school_address} className="mt-2" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <InputLabel htmlFor="principal_name" value="Nama Kepala Sekolah" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                                    <TextInput
                                                        id="principal_name"
                                                        value={data.principal_name}
                                                        onChange={(e) => setData('principal_name', e.target.value)}
                                                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-indigo-500 rounded-2xl h-12"
                                                        placeholder="Santi S.Pd, M.Pd"
                                                    />
                                                    <InputError message={errors.principal_name} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="principal_nip" value="NIP Kepala Sekolah" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                                    <TextInput
                                                        id="principal_nip"
                                                        value={data.principal_nip}
                                                        onChange={(e) => setData('principal_nip', e.target.value)}
                                                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-indigo-500 rounded-2xl h-12"
                                                        placeholder="19800101..."
                                                    />
                                                    <InputError message={errors.principal_nip} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-sm">2</span>
                                            Ambang Batas Nilai
                                        </h3>

                                        <div>
                                            <InputLabel htmlFor="passing_grade" value="KKM (Batas Lulus)" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                            <div className="mt-1 flex items-center gap-4">
                                                <TextInput
                                                    id="passing_grade"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={data.passing_grade}
                                                    onChange={(e) => setData('passing_grade', e.target.value)}
                                                    className="block w-24 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-indigo-500 rounded-2xl h-12 text-center text-lg font-black"
                                                />
                                                <span className="text-sm text-gray-500 font-medium">Skala 0 - 100</span>
                                            </div>
                                            <InputError message={errors.passing_grade} className="mt-2" />
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Anti-Cheat Granular */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-sm">3</span>
                                            Pengaturan Kecurangan
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="p-4 rounded-3xl border-2 border-red-50 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 items-center justify-between flex gap-4">
                                                <div className="flex-1">
                                                    <p className="font-black text-xs uppercase tracking-widest text-red-600 mb-1">Status Sistem</p>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Aktifkan Anti-Kecurangan</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.enable_anti_cheat}
                                                        onChange={(e) => setData('enable_anti_cheat', e.target.checked)}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                                </label>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="max_cheat_warnings" value="Batas Peringatan (Max)" className="font-bold text-xs uppercase tracking-widest text-gray-500" />
                                                <div className="mt-1 flex items-center gap-4">
                                                    <TextInput
                                                        id="max_cheat_warnings"
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        value={data.max_cheat_warnings}
                                                        onChange={(e) => setData('max_cheat_warnings', e.target.value)}
                                                        className="block w-24 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:border-indigo-500 rounded-2xl h-12 text-center text-lg font-black"
                                                    />
                                                    <span className="text-sm text-gray-500 font-medium leading-tight">Pelanggaran sebelum diskualifikasi</span>
                                                </div>
                                                <InputError message={errors.max_cheat_warnings} className="mt-2" />
                                            </div>

                                            {/* Granular Controls */}
                                            <div className="space-y-3 pt-2">
                                                <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-2">Kontrol Detail Fitur</p>
                                                
                                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Blokir Klik Kanan</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.block_context_menu} 
                                                        onChange={(e) => setData('block_context_menu', e.target.checked)}
                                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-600 shadow-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Blokir Copy, Cut, & Paste</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.block_copy_paste} 
                                                        onChange={(e) => setData('block_copy_paste', e.target.checked)}
                                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-600 shadow-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Deteksi Pindah Tab</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.detect_tab_switch} 
                                                        onChange={(e) => setData('detect_tab_switch', e.target.checked)}
                                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-600 shadow-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Wajib Fullscreen</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={data.force_fullscreen} 
                                                        onChange={(e) => setData('force_fullscreen', e.target.checked)}
                                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-600 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-sm">4</span>
                                            Mode Aplikasi
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setData('app_mode', 'online')}
                                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col gap-2 items-center text-center ${
                                                    data.app_mode === 'online'
                                                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-gray-100 dark:border-gray-800 hover:border-green-200'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.app_mode === 'online' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${data.app_mode === 'online' ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>Online</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Hosting / CPANEL</p>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setData('app_mode', 'offline')}
                                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col gap-2 items-center text-center ${
                                                    data.app_mode === 'offline'
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.app_mode === 'offline' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${data.app_mode === 'offline' ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-500'}`}>Offline</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Localhost / Server</p>
                                                </div>
                                            </button>
                                        </div>
                                        <InputError message={errors.app_mode} className="mt-2" />
                                    </section>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="text-sm text-gray-500 font-medium italic">
                                    *Perubahan akan langsung berdampak pada sesi ujian yang sedang berjalan.
                                </div>
                                <PrimaryButton className="h-14 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all" disabled={processing}>
                                    Simpan Perubahan
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
