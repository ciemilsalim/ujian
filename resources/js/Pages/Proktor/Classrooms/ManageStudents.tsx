import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, UserPlus, Trash2, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { toast } from 'sonner';

interface Student {
    id: number;
    name: string;
    username: string;
}

interface Classroom {
    id: number;
    name: string;
}

export default function ManageStudents({ classroom, currentStudents, availableStudents }: { classroom: Classroom, currentStudents: Student[], availableStudents: Student[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const filteredAvailable = availableStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStudentSelection = (id: number) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const addSelectedStudents = () => {
        if (selectedStudents.length === 0) return;
        
        router.post(route('proktor.classrooms.add-students', classroom.id), {
            student_ids: selectedStudents
        }, {
            onSuccess: () => {
                setSelectedStudents([]);
                setShowAddModal(false);
            }
        });
    };

    const removeStudent = (studentId: number) => {
        if (confirm('Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas?')) {
            router.delete(route('proktor.classrooms.remove-student', [classroom.id, studentId]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                                <Users className="w-6 h-6 text-indigo-600" />
                                Kelola Siswa - {classroom.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Tambahkan atau keluarkan siswa dari kelas ini secara manual.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" /> Tambah Siswa
                    </button>
                </div>
            }
        >
            <Head title={`Kelola Siswa - ${classroom.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Daftar Siswa ({currentStudents.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800">
                                        <th className="px-6 py-4">Nama Siswa</th>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {currentStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{student.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-500">{student.username}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => removeStudent(student.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Keluarkan dari kelas"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                                Belum ada siswa di kelas ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tambah Siswa ke {classroom.name}</h3>
                            <p className="text-sm text-gray-500 font-medium italic">Hanya menampilkan siswa yang belum memiliki kelas.</p>
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
                        <div className="grid grid-cols-1 gap-2">
                            {filteredAvailable.map(student => (
                                <div 
                                    key={student.id} 
                                    onClick={() => toggleStudentSelection(student.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                                        selectedStudents.includes(student.id) 
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                            : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:border-indigo-200'
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{student.username}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        selectedStudents.includes(student.id)
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'border-gray-200 group-hover:border-indigo-300'
                                    }`}>
                                        {selectedStudents.includes(student.id) && <CheckCircle className="w-4 h-4" />}
                                    </div>
                                </div>
                            ))}
                            {filteredAvailable.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-sm italic">
                                    Tidak ada siswa tersedia untuk ditambahkan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
                        <SecondaryButton onClick={() => setShowAddModal(false)}>Batal</SecondaryButton>
                        <button 
                            onClick={addSelectedStudents}
                            disabled={selectedStudents.length === 0}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Tambah {selectedStudents.length > 0 ? `${selectedStudents.length} Siswa` : 'Siswa'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
