import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Shield, Zap, Monitor, BarChart3, Clock, ArrowRight,
    CheckCircle2, GraduationCap, ShieldCheck, BookOpen, Users
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState, useEffect } from 'react';

export default function Welcome({ auth }: PageProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Shield className="w-6 h-6 text-blue-500" />,
            title: "Anti-Kecurangan",
            desc: "Pemantauan tab aktif, deteksi perpindahan jendela, dan sistem diskualifikasi otomatis."
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            title: "Monitor Real-time",
            desc: "Proktor memantau status setiap peserta secara langsung — bekerja, selesai, atau keluar."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
            title: "Analisis Hasil",
            desc: "Nilai otomatis untuk pilihan ganda, analisis soal, dan laporan PDF siap cetak."
        },
        {
            icon: <Monitor className="w-6 h-6 text-purple-500" />,
            title: "Antarmuka Modern",
            desc: "Desain bersih dan responsif yang memudahkan siswa fokus mengerjakan soal."
        },
        {
            icon: <Clock className="w-6 h-6 text-rose-500" />,
            title: "Manajemen Sesi",
            desc: "Atur jadwal ujian, perpanjang waktu, kirim pesan siaran, dan kelola ruang ujian."
        },
        {
            icon: <BookOpen className="w-6 h-6 text-cyan-500" />,
            title: "Bank Soal Lengkap",
            desc: "Import soal dari Excel atau Word, dukung soal pilihan ganda, esai, menjodohkan, dan isian."
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden selection:bg-blue-500 selection:text-white bg-[#FAFAFA] dark:bg-gray-950">
            <Head title="ZEXAM-CBT — Sistem Ujian Digital" />

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/8 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ApplicationLogo className="w-9 h-9 object-contain" />
                        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                            ZEXAM<span className="text-blue-600">-CBT</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition active:scale-95 shadow-sm text-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login.siswa')}
                                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-emerald-100 dark:shadow-none flex items-center gap-2"
                                >
                                    <GraduationCap className="w-4 h-4" /> Portal Siswa
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-blue-100 dark:shadow-none flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" /> Portal Staff
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-36 lg:pt-52 pb-24">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                            Sistem Ujian Computer Based Test
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center mb-6">
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight text-gray-900 dark:text-white">
                            Platform Ujian<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                Digital Sekolah.
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            Solusi ujian online lengkap untuk siswa, guru, dan pengawas — aman, terstruktur, dan mudah dikelola.
                        </p>
                    </div>

                    {/* Dual CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-20">
                        {/* Siswa CTA */}
                        <Link
                            href={route('login.siswa')}
                            className="group w-full sm:w-auto flex items-center justify-between gap-6 px-8 py-5 bg-white dark:bg-gray-900 rounded-[1.75rem] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Peserta</p>
                                    <p className="text-base font-black text-gray-900 dark:text-white">Masuk sebagai Siswa</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </Link>

                        {/* Staff CTA */}
                        <Link
                            href={route('login')}
                            className="group w-full sm:w-auto flex items-center justify-between gap-6 px-8 py-5 bg-white dark:bg-gray-900 rounded-[1.75rem] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pengelola</p>
                                    <p className="text-base font-black text-gray-900 dark:text-white">Masuk sebagai Staff</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 sm:gap-16 mt-4 mb-16">
                        {[
                            { label: 'Role Pengguna', value: '3', sub: 'Proktor · Guru · Siswa' },
                            { label: 'Tipe Soal', value: '5+', sub: 'PG, Esai, Isian, dll' },
                            { label: 'Laporan', value: 'PDF', sub: 'Langsung Cetak' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 relative z-10 bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                            Lengkap untuk Semua Kebutuhan
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Dari pembuatan soal hingga laporan nilai — semua tersedia dalam satu platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="group p-7 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-none hover:-translate-y-1">
                                <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl w-fit mb-5 group-hover:bg-white/20 transition-all duration-500">
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-black mb-2 text-gray-900 dark:text-white group-hover:text-white transition-colors">{f.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-50 transition-colors leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Overview Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3">Dirancang untuk Semua Role</h2>
                        <p className="text-gray-500 font-medium">Pengalaman yang disesuaikan untuk setiap pengguna.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <ShieldCheck className="w-7 h-7 text-blue-600" />,
                                role: 'Proktor / Pengawas',
                                color: 'border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10',
                                badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                                items: ['Kelola sesi & jadwal ujian', 'Pembagian ruang peserta', 'Monitor real-time', 'Hasil & laporan PDF']
                            },
                            {
                                icon: <Users className="w-7 h-7 text-purple-600" />,
                                role: 'Guru',
                                color: 'border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10',
                                badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                                items: ['Buat & kelola bank soal', 'Import soal dari Excel/Word', 'Penilaian esai manual', 'Analisis daya beda soal']
                            },
                            {
                                icon: <GraduationCap className="w-7 h-7 text-emerald-600" />,
                                role: 'Siswa',
                                color: 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10',
                                badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                                items: ['Akses ujian dengan token', 'Mode latihan tanpa batas', 'Jawaban tersimpan otomatis', 'Riwayat ujian lengkap']
                            }
                        ].map((r, i) => (
                            <div key={i} className={`rounded-3xl border p-7 ${r.color}`}>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-5 ${r.badge}`}>
                                    {r.icon}
                                    <span className="text-sm font-black">{r.role}</span>
                                </div>
                                <ul className="space-y-3">
                                    {r.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="py-20 relative z-10 bg-gray-900 dark:bg-gray-950">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black text-white mb-3">Siap Mulai Ujian?</h2>
                    <p className="text-gray-400 font-medium mb-10">Pilih portal sesuai peran Anda.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={route('login.siswa')}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
                        >
                            <GraduationCap className="w-5 h-5" /> Portal Siswa
                        </Link>
                        <Link
                            href={route('login')}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
                        >
                            <ShieldCheck className="w-5 h-5" /> Portal Staff / Proktor
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <ApplicationLogo className="w-7 h-7 object-contain" />
                        <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white">ZEXAM-CBT</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium">
                        © {new Date().getFullYear()} ZEXAM-CBT. Dibuat oleh{' '}
                        <a href="https://www.zahradev.online" target="_blank" className="text-blue-600 hover:underline">ZahraDev</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
