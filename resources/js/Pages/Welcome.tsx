import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Shield, Zap, Monitor, BarChart3, Clock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
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
            title: "Sistem Anti-Curang",
            desc: "Pemantauan berbasis AI tingkat lanjut dengan teknologi penguncian tab dan pelacakan jendela."
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            title: "Pemantauan Real-time",
            desc: "Proktor dapat melacak kemajuan siswa detik demi detik dengan pembaruan status langsung."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
            title: "Analitik Tingkat Lanjut",
            desc: "Analisis hasil yang komprehensif dengan grafik interaktif dan penilaian otomatis."
        },
        {
            icon: <Monitor className="w-6 h-6 text-purple-500" />,
            title: "Antarmuka Modern",
            desc: "UI 'Glass Hologram' yang indah dan responsif, dirancang untuk kejelasan dan fokus."
        },
        {
            icon: <Clock className="w-6 h-6 text-rose-500" />,
            title: "Penjadwalan Cerdas",
            desc: "Kelola sesi ujian, kelas, dan perpanjangan waktu dengan sangat mudah."
        },
        {
            icon: <Globe className="w-6 h-6 text-cyan-500" />,
            title: "Siap Skala Besar",
            desc: "Arsitektur skalabel yang dirancang untuk menangani ribuan peserta secara bersamaan."
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden selection:bg-blue-500 selection:text-white">
            <Head title="Sistem Ujian Digital Premium" />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-cyan-500/5 blur-[80px] rounded-full"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                            <Zap className="text-white w-6 h-6 fill-current" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            zexam<span className="text-blue-600">.v1</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600 transition"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transition active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
                                >
                                    Mulai Sekarang
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-32 lg:pt-48 pb-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-bounce">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Versi 1.0 Telah Rilis
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-8">
                        Generasi Baru<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
                            Ujian Digital.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-12 font-medium">
                        Kuat, aman, dan memukau. Memberdayakan proktor dan siswa dengan platform ujian digital paling canggih di dunia.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link
                            href={route('login')}
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-black rounded-2xl hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2 group shadow-xl"
                        >
                            Mulai Sekarang Gratis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-950 dark:text-white text-lg font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
                        >
                            Lihat Fitur
                        </a>
                    </div>

                    {/* Dashboard Preview / Asset */}
                    <div className="relative mx-auto max-w-5xl group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-[32px] -z-10 group-hover:bg-blue-500/30 transition-all duration-500"></div>
                        <div className="glass dark:glass-dark rounded-[32px] p-2 sm:p-4 border shadow-2xl overflow-hidden">
                            <img
                                src="/assets/hero-preview.png"
                                alt="Dashboard Preview"
                                className="w-full h-auto rounded-[24px]"
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070";
                                }}
                            />
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute -left-4 sm:-left-12 top-1/4 glass dark:glass-dark px-6 py-4 rounded-2xl shadow-xl animate-float hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold opacity-50 uppercase tracking-wider">Reliabilitas</p>
                                    <p className="text-xl font-black">99.9% Uptime</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-4 sm:-right-12 bottom-1/4 glass dark:glass-dark px-6 py-4 rounded-2xl shadow-xl animate-float hidden md:block" style={{ animationDelay: '1.5s' }}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold opacity-50 uppercase tracking-wider">Pengguna Aktif</p>
                                    <p className="text-xl font-black">10K+ Sesi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-32 relative z-10 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-4">Dirancang untuk Keunggulan.</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Setiap alat yang Anda butuhkan untuk mengadakan ujian profesional dalam skala besar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="group p-8 rounded-[32px] bg-white dark:bg-gray-900 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-500 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-blue-200 dark:hover:shadow-none hover:-translate-y-2">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl w-fit mb-6 group-hover:bg-white group-hover:scale-110 transition-all duration-500">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">{f.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 group-hover:text-blue-50 transition-colors leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                            <Zap className="text-white w-5 h-5 fill-current" />
                        </div>
                        <span className="text-lg font-black tracking-tight">zexam.io</span>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} zexam.io. Created by <a href="https://www.zahradev.online" target="_blank" className="text-blue-600 hover:underline">ZahraDev</a></p>
                        <p className="text-gray-400 text-xs mt-2 font-bold select-all">emilsalimramadhan@gmail.com</p>
                    </div>
                    <div className="flex gap-6 text-gray-400 text-sm font-bold">
                        <a href="#" className="hover:text-blue-600 transition">Twitter</a>
                        <a href="#" className="hover:text-blue-600 transition">Dokumentasi</a>
                        <a href="#" className="hover:text-blue-600 transition">Kebijakan Privasi</a>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes gradient-x {
                    0%, 100% { background-position: left center; }
                    50% { background-position: right center; }
                }
                .animate-gradient-x {
                    animation: gradient-x 15s ease infinite;
                    background-size: 200% 200%;
                }
            `}} />
        </div>
    );
}

function Users({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
