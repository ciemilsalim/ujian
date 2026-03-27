import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    HelpCircle, BookOpen, Users, Home, ClipboardList, PlayCircle,
    Briefcase, Settings, Database, ChevronDown, ChevronRight,
    GraduationCap, ShieldCheck, FileText, Search, Monitor,
    CheckCircle, AlertTriangle, Info
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface GuideStep {
    step: string;
    description: string;
}

interface GuideSection {
    id: string;
    title: string;
    icon: any;
    color: string;
    description: string;
    steps: GuideStep[];
    notes?: string[];
}

interface RoleGuide {
    role: string;
    label: string;
    color: string;
    bg: string;
    sections: GuideSection[];
}

// ─── Konten Panduan ──────────────────────────────────────────────────────────

const proktorGuide: RoleGuide = {
    role: 'proktor',
    label: 'Panduan Proktor / Pengawas',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    sections: [
        {
            id: 'proktor-master',
            title: 'Pengelolaan Data Master',
            icon: Database,
            color: 'text-indigo-600',
            description: 'Kelola data dasar yang diperlukan sebelum memulai ujian.',
            steps: [
                { step: 'Data Pengguna', description: 'Buka menu Data Master → Data Pengguna. Tambahkan akun siswa, guru, atau pengawas secara manual atau via import Excel/Word. Pastikan role yang dipilih sesuai.' },
                { step: 'Data Kelas', description: 'Buka Data Master → Data Kelas. Buat kelas baru, lalu gunakan "Kelola Siswa" untuk memasukkan siswa ke dalam kelas tersebut.' },
                { step: 'Mata Pelajaran', description: 'Buka Data Master → Mata Pelajaran. Tambahkan atau edit mata pelajaran yang akan diujikan.' },
                { step: 'Ruang Ujian', description: 'Buka Data Master → Ruang Ujian. Tambahkan ruang ujian beserta kapasitasnya. Nama ruang harus unik. Atur juga tata letak kursi jika diperlukan.' },
                { step: 'Pengaturan Ruang Permanen', description: 'Di halaman Ruang Ujian, klik "Pengaturan Ruang Permanen" untuk menetapkan ruang default tiap siswa. Data ini akan otomatis dipakai saat sesi ujian baru dibuat.' },
            ],
            notes: [
                'Ruang tidak bisa dihapus jika masih ada peserta sesi yang terdaftar di dalamnya.',
                'Kapasitas ruang minimal adalah 1.',
            ]
        },
        {
            id: 'proktor-exam',
            title: 'Membuat & Mengelola Ujian',
            icon: ClipboardList,
            color: 'text-emerald-600',
            description: 'Buat paket ujian lengkap dengan soal-soal yang sudah ada di bank soal.',
            steps: [
                { step: 'Buat Ujian', description: 'Buka Manajemen Ujian → klik "Tambah Ujian". Isi nama ujian, pilih mata pelajaran, durasi, dan jumlah soal yang akan diambil.' },
                { step: 'Pilih Bank Soal', description: 'Saat membuat ujian, pilih bank soal sumber. Soal akan diambil secara acak dari bank soal yang dipilih sesuai jumlah yang ditentukan.' },
                { step: 'Mode Latihan', description: 'Aktifkan opsi "Mode Latihan" jika ujian ini hanya untuk berlatih tanpa mempengaruhi nilai resmi.' },
            ],
        },
        {
            id: 'proktor-session',
            title: 'Membuat & Memantau Sesi Ujian',
            icon: PlayCircle,
            color: 'text-red-600',
            description: 'Sesi ujian menghubungkan ujian dengan kelompok siswa pada waktu tertentu.',
            steps: [
                { step: 'Buat Sesi', description: 'Buka Sesi Aktif → klik "Buat Sesi Ujian". Isi nama sesi, pilih ujian, pilih kelas yang akan mengikuti, dan atur waktu mulai & selesai.' },
                { step: 'Pembagian Ruang', description: 'Setelah sesi dibuat, klik ikon ruang pada sesi tersebut. Kelola pembagian siswa ke ruang dan pengawas yang bertugas.' },
                { step: 'Aktifkan Sesi', description: 'Klik tombol "Aktifkan" pada sesi. Token ujian akan tampil. Bagikan token kepada siswa untuk masuk ke ujian.' },
                { step: 'Monitor Real-time', description: 'Klik "Monitor" untuk melihat status ujian semua siswa secara langsung: belum mulai, sedang ujian, atau selesai.' },
                { step: 'Fitur Kontrol', description: 'Selama sesi aktif, Anda bisa: kirim pesan siaran, tambah waktu, reset login siswa, atau logout paksa peserta yang bermasalah.' },
            ],
            notes: [
                'Pembagian ruang tidak dapat diubah saat sesi sedang aktif. Nonaktifkan sesi terlebih dahulu.',
                'Gunakan "Sinkronkan dari Ruang Default" untuk mengisi pembagian ruang otomatis dari pengaturan permanen.',
            ]
        },
        {
            id: 'proktor-rooms',
            title: 'Pengaturan Ruang & Tata Letak',
            icon: Home,
            color: 'text-orange-600',
            description: 'Atur denah kursi untuk setiap ruang ujian.',
            steps: [
                { step: 'Buka Tata Letak', description: 'Di halaman Ruang Ujian, klik "Atur Tata Letak" pada ruang yang ingin diatur.' },
                { step: 'Atur Grid Kursi', description: 'Tentukan jumlah baris dan kolom. Sistem akan membuat grid kursi. Drag-and-drop nama siswa ke posisi kursi yang diinginkan.' },
                { step: 'Simpan & Cetak', description: 'Klik "Simpan Tata Letak". Gunakan tombol "Cetak PDF" untuk menghasilkan denah ruang yang bisa dicetak.' },
            ],
        },
        {
            id: 'proktor-result',
            title: 'Melihat Hasil Ujian',
            icon: Briefcase,
            color: 'text-purple-600',
            description: 'Pantau dan ekspor hasil ujian semua siswa.',
            steps: [
                { step: 'Daftar Hasil', description: 'Buka menu Hasil Ujian. Pilih sesi untuk melihat nilai seluruh peserta.' },
                { step: 'Detail Siswa', description: 'Klik nama siswa untuk melihat jawaban detail per soal, termasuk soal yang benar, salah, dan kosong.' },
                { step: 'Ekspor Laporan', description: 'Klik "Export PDF" atau "Export Excel" untuk mengunduh laporan nilai. PDF akan memuat kop sekolah dari Pengaturan Sistem.' },
                { step: 'Analisis Soal', description: 'Klik "Analisis Soal" untuk melihat tingkat kesulitan dan daya beda tiap soal berdasarkan jawaban peserta.' },
            ],
        },
        {
            id: 'proktor-settings',
            title: 'Pengaturan Sistem',
            icon: Settings,
            color: 'text-gray-600',
            description: 'Konfigurasi identitas sekolah dan pengaturan aplikasi.',
            steps: [
                { step: 'Informasi Sekolah', description: 'Buka Pengaturan Sistem. Isi nama sekolah, logo, alamat, dan informasi lainnya yang akan tampil di laporan PDF resmi.' },
                { step: 'Reset Data', description: 'Gunakan fitur "Hapus Data" dengan sangat hati-hati. Aksi ini tidak dapat dibatalkan dan akan menghapus seluruh data ujian.' },
            ],
            notes: ['Data yang dihapus di Pengaturan tidak dapat dipulihkan.']
        },
    ]
};

const guruGuide: RoleGuide = {
    role: 'guru',
    label: 'Panduan Guru',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    sections: [
        {
            id: 'guru-bank',
            title: 'Mengelola Bank Soal',
            icon: FileText,
            color: 'text-emerald-600',
            description: 'Buat dan kelola kumpulan soal yang akan digunakan dalam ujian.',
            steps: [
                { step: 'Buat Bank Soal', description: 'Buka Bank Soal → klik "Tambah Bank Soal". Beri nama dan deskripsi bank soal yang mencerminkan topik atau bab.' },
                { step: 'Tambah Soal Manual', description: 'Masuk ke bank soal → klik "Tambah Soal". Pilih tipe soal (pilihan ganda atau esai), isi pertanyaan, opsi jawaban, dan tandai jawaban yang benar.' },
                { step: 'Import dari Excel', description: 'Klik "Import Excel" untuk mengunggah soal dalam jumlah banyak sekaligus. Unduh template Excel terlebih dahulu sebagai panduan format.' },
                { step: 'Import dari Word', description: 'Klik "Import Word" untuk mengunggah soal dari file .docx. Pastikan format file sesuai dengan template yang disediakan.' },
                { step: 'Edit Soal', description: 'Klik ikon Edit pada soal yang ingin diubah. Perubahan akan langsung berlaku pada soal tersebut.' },
            ],
            notes: [
                'Soal pilihan ganda harus memiliki minimal 2 opsi dan tepat 1 jawaban benar.',
                'Soal esai memerlukan penilaian manual oleh guru setelah ujian selesai.',
            ]
        },
        {
            id: 'guru-result',
            title: 'Melihat & Menilai Hasil Ujian',
            icon: Briefcase,
            color: 'text-purple-600',
            description: 'Lihat hasil ujian siswa dan beri nilai pada soal esai.',
            steps: [
                { step: 'Buka Hasil Ujian', description: 'Buka menu Hasil Ujian. Pilih sesi untuk melihat daftar nilai peserta.' },
                { step: 'Penilaian Esai', description: 'Klik nama siswa yang memiliki soal esai. Temukan soal bertipe esai, lalu klik "Nilai Esai" untuk memberikan skor dan komentar.' },
                { step: 'Analisis Soal', description: 'Di halaman hasil ujian, klik "Analisis Soal" untuk melihat statistik tingkat kesulitan tiap soal berdasarkan jawaban peserta.' },
            ],
        },
    ]
};

const siswaGuide: RoleGuide = {
    role: 'siswa',
    label: 'Panduan Siswa',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    sections: [
        {
            id: 'siswa-login',
            title: 'Masuk & Memulai Ujian',
            icon: Monitor,
            color: 'text-amber-600',
            description: 'Cara login dan mengikuti ujian dengan benar.',
            steps: [
                { step: 'Login ke Aplikasi', description: 'Masukkan username dan password yang diberikan oleh pengawas. Klik "Masuk" untuk melanjutkan.' },
                { step: 'Halaman Dashboard', description: 'Setelah login, Anda akan melihat daftar ujian yang tersedia. Ujian hanya muncul jika sesi sedang aktif.' },
                { step: 'Masukkan Token', description: 'Klik ujian yang akan dikerjakan, lalu masukkan token 6 karakter yang diberikan oleh pengawas di ruangan.' },
                { step: 'Mulai Ujian', description: 'Setelah token diterima, baca petunjuk ujian dengan seksama, lalu klik "Mulai Ujian" untuk memulai.' },
                { step: 'Kerjakan Soal', description: 'Jawab setiap soal dengan mengklik opsi pilihan (untuk pilihan ganda) atau ketik jawaban (untuk esai). Jawaban disimpan otomatis setiap kali Anda berpindah soal.' },
                { step: 'Selesaikan Ujian', description: 'Setelah semua soal dikerjakan, klik "Selesai Ujian". Konfirmasi pengiriman jawaban. Ujian tidak dapat dilanjutkan setelah dikirim.' },
            ],
            notes: [
                'Jangan berpindah tab atau keluar dari jendela browser selama ujian berlangsung — sistem akan mencatat dan melaporkan hal ini ke pengawas.',
                'Jika koneksi terputus, segera beritahu pengawas untuk reset sesi login Anda.',
                'Jawaban tersimpan otomatis, Anda tidak perlu khawatir kehilangan jawaban saat berpindah soal.',
            ]
        },
        {
            id: 'siswa-history',
            title: 'Riwayat Ujian',
            icon: ClipboardList,
            color: 'text-indigo-600',
            description: 'Lihat rekap ujian yang sudah Anda ikuti.',
            steps: [
                { step: 'Buka Riwayat', description: 'Klik menu "Riwayat Ujian" di sidebar. Anda akan melihat daftar semua ujian yang pernah dikerjakan.' },
                { step: 'Lihat Detail', description: 'Klik salah satu ujian untuk melihat detail nilai, jumlah benar/salah, dan waktu pengerjaan.' },
            ],
        },
    ]
};

// ─── Komponen ────────────────────────────────────────────────────────────────

function GuideSectionCard({ section }: { section: GuideSection }) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = section.icon;

    return (
        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color} bg-gray-50 dark:bg-gray-800 flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{section.description}</p>
                    </div>
                </div>
                {isOpen
                    ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                }
            </button>

            {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-50 dark:border-gray-800">
                    <ol className="mt-4 space-y-3">
                        {section.steps.map((s, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.step}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {section.notes && section.notes.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5">
                            {section.notes.map((note, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">{note}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function RoleGuidePanel({ guide }: { guide: RoleGuide }) {
    return (
        <div className="space-y-3">
            {guide.sections.map(section => (
                <GuideSectionCard key={section.id} section={section} />
            ))}
        </div>
    );
}

// ─── Halaman Utama ───────────────────────────────────────────────────────────

export default function HelpIndex({ userRole }: { userRole: string }) {
    const isProktor = userRole === 'proktor';
    const isGuru = userRole === 'guru';
    const isSiswa = userRole === 'siswa';

    // Proktor bisa melihat semua tab
    const tabs = isProktor
        ? [
            { id: 'proktor', label: 'Pengawas / Proktor', guide: proktorGuide },
            { id: 'guru', label: 'Guru', guide: guruGuide },
            { id: 'siswa', label: 'Siswa', guide: siswaGuide },
          ]
        : isGuru
        ? [{ id: 'guru', label: 'Panduan Guru', guide: guruGuide }]
        : [{ id: 'siswa', label: 'Panduan Siswa', guide: siswaGuide }];

    const [activeTab, setActiveTab] = useState(tabs[0].id);
    const [search, setSearch] = useState('');

    const currentGuide = tabs.find(t => t.id === activeTab)!.guide;

    const filteredSections = search.trim()
        ? currentGuide.sections.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase()) ||
            s.steps.some(step =>
                step.step.toLowerCase().includes(search.toLowerCase()) ||
                step.description.toLowerCase().includes(search.toLowerCase())
            )
          )
        : currentGuide.sections;

    const tabColors: Record<string, string> = {
        proktor: 'bg-blue-600 text-white',
        guru: 'bg-emerald-600 text-white',
        siswa: 'bg-amber-500 text-white',
    };

    const tabInactiveColors: Record<string, string> = {
        proktor: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
        guru: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        siswa: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-600" />
                        Pusat Bantuan
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Panduan lengkap penggunaan aplikasi ZEXAM-CBT.
                    </p>
                </div>
            }
        >
            <Head title="Pusat Bantuan" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {/* Info Badge Role */}
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${currentGuide.bg}`}>
                        <Info className="w-5 h-5 flex-shrink-0 opacity-70" />
                        <div>
                            <p className={`text-sm font-bold ${currentGuide.color}`}>{currentGuide.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isProktor
                                    ? 'Sebagai Proktor, Anda dapat melihat panduan untuk semua role pengguna.'
                                    : 'Panduan ini disesuaikan dengan role akun Anda saat ini.'}
                            </p>
                        </div>
                    </div>

                    {/* Tabs (hanya tampil jika ada lebih dari 1 tab) */}
                    {tabs.length > 1 && (
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id
                                            ? tabColors[tab.id]
                                            : 'text-gray-500 dark:text-gray-400 ' + tabInactiveColors[tab.id]
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari topik bantuan..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                        />
                    </div>

                    {/* Guide Sections */}
                    {filteredSections.length > 0 ? (
                        <div className="space-y-3">
                            {filteredSections.map(section => (
                                <GuideSectionCard key={section.id} section={section} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-bold text-sm">Topik tidak ditemukan</p>
                            <p className="text-xs mt-1">Coba kata kunci yang berbeda.</p>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-center pt-4 pb-2">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Butuh bantuan lebih lanjut? Hubungi administrator sistem Anda.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
