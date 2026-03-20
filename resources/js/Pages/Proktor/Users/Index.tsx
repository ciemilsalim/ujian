import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { User, Classroom, PaginationData } from '@/types';
import { 
    FileSpreadsheet, FileText, Upload, Plus, Search, 
    Filter, Trash2, CheckSquare, Square, MoreVertical, 
    UserPlus, ShieldCheck, Users, GraduationCap, Key, Eye, EyeOff,
    Copy, CheckCircle2, MoreHorizontal, Mail, UserCircle, Pencil
} from 'lucide-react';
import { toast } from 'sonner';

interface IndexProps {
    users: PaginationData<User>;
    classrooms: Classroom[];
    filters: {
        search?: string;
        role?: string;
        classroom_id?: string;
    };
}

export default function Index({ users, classrooms, filters }: IndexProps) {
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

    const { data: filterData, setData: setFilterData, get: getFilter } = useForm({
        search: filters.search || '',
        role: filters.role || '',
        classroom_id: filters.classroom_id || '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        classroom_id: '',
    });

    const togglePassword = (id: number) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} berhasil disalin ke clipboard`);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        getFilter(route('proktor.users.index'), {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        router.get(route('proktor.users.index'));
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('proktor.users.import'), {
            onSuccess: () => {
                setShowImportModal(false);
                reset();
                toast.success('Siswa berhasil diimport.');
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(route('proktor.users.destroy', id), {
                onSuccess: () => toast.success('User berhasil dihapus.')
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === users.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.data.map(u => u.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} user yang dipilih?`)) {
            router.delete(route('proktor.users.bulk-destroy'), {
                data: { ids: selectedIds },
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('User massal berhasil dihapus.');
                }
            });
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            proktor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
            guru: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
            siswa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
        };
        const icons = {
            proktor: <ShieldCheck className="w-3 h-3 mr-1" />,
            guru: <Users className="w-3 h-3 mr-1" />,
            siswa: <GraduationCap className="w-3 h-3 mr-1" />,
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
                {icons[role as keyof typeof icons]}
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Manajemen Akun
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola data proktor, guru, dan siswa dalam satu tempat.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                            <Upload className="w-4 h-4" />
                            Import Siswa
                        </button>
                        <Link
                            href={route('proktor.users.create')}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <Plus className="w-4 h-4" />
                            User Baru
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen User" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Filter Section */}
                    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <TextInput
                                    className="pl-10 w-full"
                                    placeholder="Cari Nama atau Username..."
                                    value={filterData.search}
                                    onChange={(e) => setFilterData('search', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <select
                                    className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm focus:ring-indigo-500"
                                    value={filterData.role}
                                    onChange={(e) => setFilterData('role', e.target.value)}
                                >
                                    <option value="">Semua Role</option>
                                    <option value="proktor">Proktor</option>
                                    <option value="guru">Guru</option>
                                    <option value="siswa">Siswa</option>
                                </select>
                                <select
                                    className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm focus:ring-indigo-500"
                                    value={filterData.classroom_id}
                                    onChange={(e) => setFilterData('classroom_id', e.target.value)}
                                >
                                    <option value="">Semua Kelas</option>
                                    {classrooms.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <PrimaryButton type="submit">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </PrimaryButton>
                                {(filters.search || filters.role || filters.classroom_id) && (
                                    <SecondaryButton onClick={clearFilters} type="button">
                                        Reset
                                    </SecondaryButton>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="mb-4 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                    {selectedIds.length} item terpilih
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Hapus Terpilih
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-6 py-4 w-10">
                                            <button 
                                                onClick={toggleSelectAll}
                                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {selectedIds.length === users.data.length && users.data.length > 0 
                                                    ? <CheckSquare className="w-5 h-5 text-indigo-600" /> 
                                                    : <Square className="w-5 h-5" />
                                                }
                                            </button>
                                        </th>
                                        <th className="px-6 py-4">Data Pengguna</th>
                                        <th className="px-6 py-4">Informasi Login</th>
                                        <th className="px-6 py-4">Role & Kelas</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {users.data.length > 0 ? users.data.map((user) => (
                                        <tr 
                                            key={user.id} 
                                            className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30 ${selectedIds.includes(user.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleSelect(user.id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    {selectedIds.includes(user.id) 
                                                        ? <CheckSquare className="w-5 h-5 text-indigo-600" /> 
                                                        : <Square className="w-5 h-5" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 ${
                                                        user.role === 'proktor' ? 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-200 dark:border-rose-900/50' :
                                                        user.role === 'guru' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-200 dark:border-indigo-900/50' :
                                                        'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-200 dark:border-emerald-900/50'
                                                    }`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
                                                            {user.role === 'proktor' ? <ShieldCheck className="w-3 h-3 text-rose-500" /> :
                                                             user.role === 'guru' ? <Users className="w-3 h-3 text-blue-500" /> :
                                                             <GraduationCap className="w-3 h-3 text-emerald-500" />}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-extrabold text-gray-900 dark:text-white capitalize tracking-tight group-hover:text-indigo-600 transition-colors">
                                                            {user.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                                            <Mail className="w-3 h-3" />
                                                            {user.email || 'tanpa email'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 max-w-[200px]">
                                                    <div className="flex items-center justify-between group/item">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Username</span>
                                                            <code className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                                                                {user.username}
                                                            </code>
                                                        </div>
                                                        <button 
                                                            onClick={() => copyToClipboard(user.username, 'Username')}
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all opacity-0 group-hover/item:opacity-100 shadow-sm"
                                                            title="Salin Username"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {user.role === 'siswa' && (
                                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between group/item">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-rose-400 dark:text-rose-500 uppercase tracking-widest leading-none mb-1">Password</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <code className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono tracking-tighter">
                                                                        {showPasswords[user.id] ? (user.password_plain || '********') : '••••••••'}
                                                                    </code>
                                                                    <button 
                                                                        onClick={() => togglePassword(user.id)}
                                                                        className="text-gray-400 hover:text-rose-500 transition-colors"
                                                                    >
                                                                        {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => copyToClipboard(user.password_plain || '', 'Password')}
                                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all opacity-0 group-hover/item:opacity-100 shadow-sm"
                                                                title="Salin Password"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div>{getRoleBadge(user.role)}</div>
                                                    {user.classroom_id ? (
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 uppercase tracking-tighter">
                                                            <GraduationCap className="w-3 h-3 mr-1 text-indigo-500" />
                                                            {classrooms.find(c => c.id === user.classroom_id)?.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest opacity-50">Tanpa Kelas</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                        href={route('proktor.users.edit', user.id)} 
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Hapus User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Square className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                                                    <p className="text-sm font-medium">Tidak ada data pengguna yang ditemukan.</p>
                                                    <button 
                                                        onClick={clearFilters}
                                                        className="text-indigo-600 hover:underline text-xs"
                                                    >
                                                        Bersihkan filter
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Area */}
                        {users.links.length > 3 && (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Menampilkan <span className="font-bold text-gray-700 dark:text-gray-300">{users.from}</span> - <span className="font-bold text-gray-700 dark:text-gray-300">{users.to}</span> dari <span className="font-bold text-gray-700 dark:text-gray-300">{users.total}</span> data
                                </div>
                                <div className="flex gap-1">
                                    {users.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                                link.active 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : link.url 
                                                    ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700' 
                                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showImportModal} onClose={() => setShowImportModal(false)}>
                <form onSubmit={submitImport} className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Import Siswa Massal
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Mendukung file Excel (.xlsx) dan Word (.docx)
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase text-right tracking-widest">Template</span>
                            <div className="flex gap-2">
                                <a href={route('proktor.users.template-excel')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-all text-xs font-bold">
                                    <FileSpreadsheet className="w-4 h-4" /> XLSX
                                </a>
                                <a href={route('proktor.users.template-word')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-xs font-bold">
                                    <FileText className="w-4 h-4" /> DOCX
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-3 flex items-center">
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Panduan Import:
                        </h4>
                        <ul className="text-xs text-indigo-700 dark:text-indigo-400 space-y-2 list-none">
                            <li className="flex gap-2">
                                <span className="w-4 h-4 rounded px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-800 text-[10px] font-bold shrink-0">1</span>
                                <div>Gunakan kolom: <b>Nama, NIS, Kelas, Email, Password</b>.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-4 h-4 rounded px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-800 text-[10px] font-bold shrink-0">2</span>
                                <div><b>NIS</b> akan digunakan sebagai username login unik.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-4 h-4 rounded px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-800 text-[10px] font-bold shrink-0">3</span>
                                <div>Jika kolom <b>Kelas</b> kosong, silakan pilih kelas di bawah ini.</div>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="classroom_id_import" value="Tentukan Kelas (Opsional)" />
                        <select
                            id="classroom_id_import"
                            value={data.classroom_id}
                            onChange={(e) => setData('classroom_id', e.target.value)}
                            className="mt-2 block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-all"
                        >
                            <option value="">Deteksi Otomatis dari File</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.classroom_id} className="mt-2" />
                    </div>

                    <div className="mt-6 p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-gray-50/50 dark:bg-transparent text-center">
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                            required
                            accept=".xlsx,.xls,.docx"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center mx-auto mb-3 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {data.file ? data.file.name : 'Pilih file atau seret ke sini'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 italic">Mendukung .xlsx, .xls, .docx</div>
                        </label>
                        <InputError message={errors.file} className="mt-2" />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton 
                            className="rounded-xl px-6" 
                            onClick={() => setShowImportModal(false)}
                            title="Batal"
                        >
                            Batal
                        </SecondaryButton>

                        <PrimaryButton 
                            className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-500" 
                            disabled={processing}
                            title="Mulai Proses"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Mulai Import
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
