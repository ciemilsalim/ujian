import Sidebar from '@/Components/Sidebar';
import CommandPalette from '@/Components/CommandPalette';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { Search, Bell, Plus, Menu, X, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Toaster, toast } from 'sonner';

declare global {
    interface Window {
        Echo: any;
    }
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (user.role === 'proktor' && window.Echo) {
            const channel = window.Echo.private('proktor.notifications');

            channel.listen('.student.updated', (e: any) => {
                if (e.status === 'finished') {
                    toast.success(`Ujian Selesai!`, {
                        description: `${e.name} baru saja menyelesaikan ujian.`,
                        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
                        duration: 5000,
                    });
                }
            });

            channel.listen('.student.cheat', (e: any) => {
                toast.error(`Peringatan Keamanan!`, {
                    description: `${e.name} terdeteksi: ${e.type === 'tab_switch' ? 'Pindah Tab' : 'Keluar Jendela'}.`,
                    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                    duration: 8000,
                });
            });

            return () => {
                window.Echo.leave('proktor.notifications');
            };
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 font-sans antialiased text-gray-900">
            {/* Real-time Notifications */}
            <Toaster position="top-right" richColors closeButton />
            {/* Global Command Palette */}
            <CommandPalette />

            {/* Sidebar Desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Sidebar Mobile */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
                <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute right-[-40px] top-4 text-white p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search Bar (Triggers Command Palette) */}
                        <div className="hidden sm:flex items-center max-w-md w-full relative group">
                            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition" />
                            <input
                                type="text"
                                placeholder="Tekan Ctrl + K untuk mencari..."
                                readOnly
                                onClick={() => {
                                    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }));
                                }}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                            />
                            <div className="absolute right-3 flex items-center gap-1 opacity-50">
                                <span className="text-[10px] font-bold border border-gray-300 dark:border-gray-600 px-1 rounded">CTRL</span>
                                <span className="text-[10px] font-bold border border-gray-300 dark:border-gray-600 px-1 rounded">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-xl transition relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                        </button>

                        {user.role === 'proktor' && (
                            <Link
                                href={route('proktor.sessions.index')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 dark:shadow-none transition"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Ujian
                            </Link>
                        )}

                        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-1 hidden sm:block"></div>

                        {/* Top Profile/User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs ring-2 ring-white dark:ring-gray-900">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user.name}</p>
                                    </div>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Header (Breadcrumbs/Status) */}
                {header && (
                    <div className="px-4 pt-8 sm:px-8">
                        {header}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="px-4 py-6 sm:px-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm">
                            <Zap className="w-4 h-4 text-blue-600 fill-current" />
                            <span>ZEXAM-CBT V1.0</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            &copy; {new Date().getFullYear()} ZEXAM-CBT. Created by <a href="https://www.zahradev.online" target="_blank" className="text-blue-600 hover:underline">ZahraDev</a>
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 select-all">emilsalimramadhan@gmail.com</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
