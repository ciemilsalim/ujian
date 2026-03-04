import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Search,
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    PlayCircle,
    CreditCard,
    Settings,
    LogOut,
    Moon,
    Sun,
    Command,
    ChevronDown,
    ChevronRight,
    ChevronUp
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    icon: any;
    action: () => void;
    category: string;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { auth } = usePage().props as any;
    const user = auth.user;
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleDarkMode = useCallback(() => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsOpen(false);
    }, []);

    const commands: CommandItem[] = [
        { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => router.get(route('dashboard')) },
        ...(user.role === 'proktor' ? [
            { id: 'users', label: 'Manage Users', icon: Users, category: 'Navigation', action: () => router.get(route('proktor.users.index')) },
            { id: 'class', label: 'Manage Classes', icon: GraduationCap, category: 'Navigation', action: () => router.get(route('proktor.classrooms.index')) },
            { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, category: 'Navigation', action: () => router.get(route('proktor.subjects.index')) },
            { id: 'exams', label: 'Manage Exams', icon: ClipboardList, category: 'Navigation', action: () => router.get(route('proktor.exams.index')) },
            { id: 'sessions', label: 'Active Sessions', icon: PlayCircle, category: 'Navigation', action: () => router.get(route('proktor.sessions.index')) },
            { id: 'cards', label: 'Exam Cards', icon: CreditCard, category: 'Navigation', action: () => router.get(route('proktor.exam-cards.index')) },
        ] : []),
        ...(user.role === 'guru' ? [
            { id: 'qbank', label: 'Question Banks', icon: ClipboardList, category: 'Navigation', action: () => router.get(route('guru.question-banks.index')) },
            { id: 'results', label: 'Exam Results', icon: ClipboardList, category: 'Navigation', action: () => router.get(route('guru.results.index')) },
        ] : []),
        { id: 'settings', label: 'System Settings', icon: Settings, category: 'Other', action: () => router.get(route('proktor.settings.index')) },
        { id: 'theme', label: 'Toggle Dark Mode', icon: Moon, category: 'Other', action: toggleDarkMode },
        { id: 'logout', label: 'Log Out', icon: LogOut, category: 'Other', action: () => router.post(route('logout')) },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                setIsOpen(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsOpen(false)}></div>

            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative animate-in fade-in zoom-in duration-200">
                {/* Search Input */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white text-lg"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-400">ESC</span>
                    </div>
                </div>

                {/* Command List */}
                <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-4 py-2">
                            {/* Grouping by category */}
                            {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => (
                                <div key={category}>
                                    <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{category}</p>
                                    <div className="space-y-1">
                                        {filteredCommands
                                            .filter(c => c.category === category)
                                            .map((cmd) => {
                                                const globalIdx = filteredCommands.indexOf(cmd);
                                                const Icon = cmd.icon;
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => { cmd.action(); setIsOpen(false); }}
                                                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-150 ${selectedIndex === globalIdx
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none font-medium'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon className={`w-5 h-5 ${selectedIndex === globalIdx ? 'text-white' : 'text-gray-400'}`} />
                                                            <span className="text-sm">{cmd.label}</span>
                                                        </div>
                                                        {selectedIndex === globalIdx && (
                                                            <div className="flex items-center gap-1 bg-blue-500 rounded px-1.5 py-0.5">
                                                                <span className="text-[10px] font-bold">ENTER</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            <Command className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No commands found for "{search}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Tips */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <div className="p-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <ChevronDown className="w-3 h-3" />
                            </div>
                            <div className="p-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 -ml-1">
                                <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                            </div>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <div className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                ↵
                            </div>
                            <span>Select</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400">
                        exxam.io <span className="opacity-50">Quick Console</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
