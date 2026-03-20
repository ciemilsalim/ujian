import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Users, UserPlus, Trash2, ArrowLeft, Search, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    username: string;
    classroom?: {
        name: string;
    };
}

interface Participant {
    id: number;
    user_id: number;
    user: User;
}

interface Classroom {
    id: number;
    name: string;
    users: User[];
}

interface Session {
    id: number;
    name: string;
    exam: {
        title: string;
    };
}

export default function ManageParticipants({ session, participants, classrooms }: { session: Session, participants: Participant[], classrooms: Classroom[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [expandedClassrooms, setExpandedClassrooms] = useState<number[]>(classrooms.map(c => c.id));

    const toggleClassroom = (id: number) => {
        if (expandedClassrooms.includes(id)) {
            setExpandedClassrooms(expandedClassrooms.filter(cid => cid !== id));
        } else {
            setExpandedClassrooms([...expandedClassrooms, id]);
        }
    };

    const toggleUserSelection = (id: number) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const addSelectedParticipants = () => {
        if (selectedUsers.length === 0) return;
        
        router.post(route('proktor.sessions.add-participants', session.id), {
            user_ids: selectedUsers
        }, {
            onSuccess: () => {
                toast.success('Peserta berhasil ditambahkan');
                setSelectedUsers([]);
                setShowAddModal(false);
            }
        });
    };

    const removeParticipant = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus peserta ini dari sesi?')) {
            router.delete(route('proktor.sessions.remove-participant', [session.id, userId]), {
                onSuccess: () => toast.success('Peserta berhasil dihapus')
            });
        }
    };

    const isParticipant = (userId: number) => participants.some(p => p.user_id === userId);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('proktor.sessions.index')} className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                                <Users className="w-6 h-6 text-indigo-600" />
                                Kelola Peserta - {session.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {session.exam.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" /> Tambah Peserta
                    </button>
                </div>
            }
        >
            <Head title={`Kelola Peserta - ${session.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Daftar Peserta Terdaftar ({participants.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800">
                                        <th className="px-6 py-4">Nama Siswa</th>
                                        <th className="px-6 py-4">Kelas</th>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {participants.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{p.user.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-black uppercase">
                                                    {p.user.classroom?.name || 'Tanpa Kelas'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-500">{p.user.username}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => removeParticipant(p.user_id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Hapus dari sesi"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                                Belum ada peserta di sesi ini. Gunakan tombol Tambah Peserta untuk memasukkan siswa dari kelas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Participant Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="3xl">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tambah Peserta Sesi</h3>
                            <p className="text-sm text-gray-500 font-medium italic">Pilih siswa dari berbagai kelas untuk digabungkan ke sesi ini.</p>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau username..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar mb-8 pr-2">
                        {classrooms.map(classroom => {
                            const filteredUsers = classroom.users.filter(u => 
                                !isParticipant(u.id) && 
                                (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()))
                            );

                            if (filteredUsers.length === 0 && searchTerm) return null;

                            return (
                                <div key={classroom.id} className="mb-4">
                                    <button 
                                        onClick={() => toggleClassroom(classroom.id)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {expandedClassrooms.includes(classroom.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500 italic">{classroom.name} ({filteredUsers.length} Siswa)</span>
                                        </div>
                                    </button>

                                    {expandedClassrooms.includes(classroom.id) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 mt-2">
                                            {filteredUsers.map(user => (
                                                <div 
                                                    key={user.id} 
                                                    onClick={() => toggleUserSelection(user.id)}
                                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${
                                                        selectedUsers.includes(user.id) 
                                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                                            : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:border-indigo-200'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{user.username}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        selectedUsers.includes(user.id)
                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                            : 'border-gray-200 group-hover:border-indigo-300'
                                                    }`}>
                                                        {selectedUsers.includes(user.id) && <CheckCircle className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {classrooms.length === 0 || (searchTerm && classrooms.every(c => c.users.filter(u => !isParticipant(u.id) && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0)) && (
                            <div className="text-center py-12 text-gray-400 text-sm italic">
                                Tidak ada siswa tersedia untuk ditambahkan.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
                        <SecondaryButton onClick={() => setShowAddModal(false)}>Batal</SecondaryButton>
                        <button 
                            onClick={addSelectedParticipants}
                            disabled={selectedUsers.length === 0}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Tambah {selectedUsers.length > 0 ? `${selectedUsers.length} Peserta` : 'Peserta'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
