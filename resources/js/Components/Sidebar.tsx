import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Monitor,
    Users,
    BookOpen,
    GraduationCap,
    ClipboardList,
    CreditCard,
    Settings,
    LogOut,
    PlayCircle,
    Home,
    Sun,
    Moon,
    Database,
    FileText,
    Briefcase,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    ShieldCheck,
    Calendar,
    TrendingUp
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ReactNode, useState, useEffect } from 'react';

interface SidebarItemProps {
    href: string;
    icon: any;
    label: string;
    active: boolean;
    badge?: string;
    isLive?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active, badge, isLive }: SidebarItemProps) => (
    <Link
        href={href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none font-semibold'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {isLive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                )}
            </div>
            <span className="text-sm">{label}</span>
        </div>
        {badge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>
                {badge}
            </span>
        )}
    </Link>
);

const CollapsibleSection = ({ label, icon: Icon, children, defaultOpen = false }: { label: string, icon: any, children: ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition group text-sm font-medium"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    <span>{label}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {isOpen && (
                <div className="ml-9 space-y-1 border-l border-gray-100 dark:border-gray-800 pl-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function Sidebar() {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <ApplicationLogo className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition" />
                    <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ZEXAM<span className="text-blue-600">-CBT</span></span>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">

                {/* Dashboard Always Visible */}
                <div className="space-y-1">
                    <SidebarItem
                        href={route('dashboard')}
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={route().current('dashboard')}
                    />
                </div>

                {/* Proktor Menus */}
                {user.role === 'proktor' && (
                    <>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Master Akademik</p>
                            <CollapsibleSection label="Data Master" icon={Database} defaultOpen={route().current('proktor.users.*') || route().current('proktor.academic-years.*') || route().current('proktor.classrooms.*') || route().current('proktor.class-promotions.*') || route().current('proktor.subjects.*')}>
                                <SidebarItem
                                    href={route('proktor.users.index')}
                                    icon={Users}
                                    label="Data Pengguna"
                                    active={route().current('proktor.users.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.academic-years.index')}
                                    icon={Calendar}
                                    label="Tahun Ajaran"
                                    active={route().current('proktor.academic-years.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.classrooms.index')}
                                    icon={GraduationCap}
                                    label="Data Kelas"
                                    active={route().current('proktor.classrooms.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.class-promotions.index')}
                                    icon={TrendingUp}
                                    label="Kenaikan Kelas"
                                    active={route().current('proktor.class-promotions.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.subjects.index')}
                                    icon={BookOpen}
                                    label="Mata Pelajaran"
                                    active={route().current('proktor.subjects.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.rooms.index')}
                                    icon={Home}
                                    label="Ruang Ujian"
                                    active={route().current('proktor.rooms.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.proctors.index')}
                                    icon={ShieldCheck}
                                    label="Manajemen Pengawas"
                                    active={route().current('proktor.proctors.*')}
                                />
                            </CollapsibleSection>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Ujian & Sesi</p>
                            <div className="space-y-1">
                                <SidebarItem
                                    href={route('proktor.exams.index')}
                                    icon={ClipboardList}
                                    label="Manajemen Ujian"
                                    active={route().current('proktor.exams.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.sessions.index')}
                                    icon={PlayCircle}
                                    label="Sesi Aktif"
                                    active={route().current('proktor.sessions.*')}
                                    isLive={true}
                                />
                                <SidebarItem
                                    href={route('proktor.results.index')}
                                    icon={Briefcase}
                                    label="Hasil Ujian"
                                    active={route().current('proktor.results.*')}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Administrasi</p>
                            <div className="space-y-1">
                                <SidebarItem
                                    href={route('proktor.administration.index')}
                                    icon={ShieldCheck}
                                    label="Administrasi Ujian"
                                    active={route().current('proktor.administration.*')}
                                />
                                <SidebarItem
                                    href={route('proktor.sync.index')}
                                    icon={Database}
                                    label="Sinkronisasi Data"
                                    active={route().current('proktor.sync.*')}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Guru Menus */}
                {user.role === 'guru' && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Bank Soal</p>
                        <div className="space-y-1">
                            <SidebarItem
                                href={route('guru.question-banks.index')}
                                icon={FileText}
                                label="Banks Soal"
                                active={route().current('guru.question-banks.*')}
                            />
                            <SidebarItem
                                href={route('guru.results.index')}
                                icon={Briefcase}
                                label="Hasil Ujian"
                                active={route().current('guru.results.*')}
                            />
                        </div>
                    </div>
                )}

                {/* Siswa Menus */}
                {user.role === 'siswa' && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Menu Siswa</p>
                        <div className="space-y-1">
                            <SidebarItem
                                href={route('siswa.history')}
                                icon={ClipboardList}
                                label="Riwayat Ujian"
                                active={route().current('siswa.history')}
                            />
                        </div>
                    </div>
                )}

                {/* Other Menu */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Pengaturan</p>
                    <div className="space-y-1">
                        <SidebarItem
                            href={route('profile.edit')}
                            icon={Users}
                            label="Profil Saya"
                            active={route().current('profile.edit')}
                        />
                        {user.role === 'proktor' && (
                            <SidebarItem
                                href={route('proktor.settings.index')}
                                icon={Settings}
                                label="Pengaturan Sistem"
                                active={route().current('proktor.settings.*')}
                            />
                        )}
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition group text-sm font-medium"
                        >
                            <div className="flex items-center gap-3">
                                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                                <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                            </div>
                        </button>
                        <SidebarItem
                            href={route('help.index')}
                            icon={HelpCircle}
                            label="Pusat Bantuan"
                            active={route().current('help.index')}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-[#F9FAFB]/50 dark:bg-gray-950/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold uppercase border border-blue-100 dark:border-blue-800">
                                {user.role === 'proktor' ? 'Pengawas' : (user.role === 'guru' ? 'Guru' : 'Siswa')}
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition w-full group"
                >
                    <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    <span>Keluar Akun</span>
                </Link>
            </div>
        </aside>
    );
}
