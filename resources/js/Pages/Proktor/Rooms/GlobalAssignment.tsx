import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, Home, ShieldCheck, ChevronRight, Save, UserPlus, Trash2, ArrowLeft, Grid } from 'lucide-react';
import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    name: string;
    classroom?: { id: number, name: string };
    classroom_id?: number | null;
    exam_room_id: number | null;
}

interface Classroom {
    id: number;
    name: string;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
}

export default function GlobalAssignment({ students, rooms, classrooms }: { students: Student[], rooms: Room[], classrooms: Classroom[] }) {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(rooms.length > 0 ? rooms[0].id : null);
    
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | string>('all');
    
    // Group students by room
    const [roomAssignments, setRoomAssignments] = useState<Record<number, number[]>>({});
    const [unassignedStudents, setUnassignedStudents] = useState<number[]>([]);
    
    const [unassignedSearch, setUnassignedSearch] = useState('');
    const [selectedUnassigned, setSelectedUnassigned] = useState<number[]>([]);

    useEffect(() => {
        const initialAssignments: Record<number, number[]> = {};
        const initialUnassigned: number[] = [];
        
        rooms.forEach(r => initialAssignments[r.id] = []);
        
        students.forEach(s => {
            if (s.exam_room_id && initialAssignments[s.exam_room_id]) {
                initialAssignments[s.exam_room_id].push(s.id);
            } else {
                initialUnassigned.push(s.id);
            }
        });
        
        setRoomAssignments(initialAssignments);
        setUnassignedStudents(initialUnassigned);
    }, [students, rooms]);

    const handleAssign = (count: number) => {
        if (!selectedRoomId) return;
        
        const room = rooms.find(r => r.id === selectedRoomId);
        if (!room) return;

        const currentInRoom = roomAssignments[selectedRoomId].length;
        const availableSpace = room.capacity - currentInRoom;
        const toMoveCount = Math.min(count, availableSpace, unassignedStudents.length);

        if (toMoveCount <= 0) {
            toast.error('Ruang sudah penuh atau tidak ada siswa tersisa');
            return;
        }

        const moving = unassignedStudents.slice(0, toMoveCount);
        const remaining = unassignedStudents.slice(toMoveCount);

        setUnassignedStudents(remaining);
        setRoomAssignments({
            ...roomAssignments,
            [selectedRoomId]: [...roomAssignments[selectedRoomId], ...moving]
        });
    };

    const handleAssignSelected = () => {
        if (!selectedRoomId || selectedUnassigned.length === 0) return;
        
        const room = rooms.find(r => r.id === selectedRoomId);
        if (!room) return;

        const currentInRoom = roomAssignments[selectedRoomId].length;
        const availableSpace = room.capacity - currentInRoom;
        
        if (selectedUnassigned.length > availableSpace) {
            toast.error(`Ruang hanya tersisa ${availableSpace} slot`);
            return;
        }

        const moving = [...selectedUnassigned];
        const remaining = unassignedStudents.filter(id => !moving.includes(id));

        setUnassignedStudents(remaining);
        setRoomAssignments({
            ...roomAssignments,
            [selectedRoomId]: [...roomAssignments[selectedRoomId], ...moving]
        });
        setSelectedUnassigned([]);
        toast.success(`${moving.length} siswa dipindahkan ke ${room.name}`);
    };

    const unassignStudent = (roomId: number, studentId: number) => {
        const currentInRoom = roomAssignments[roomId] || [];
        setRoomAssignments({
            ...roomAssignments,
            [roomId]: currentInRoom.filter(id => id !== studentId)
        });
        setUnassignedStudents([...unassignedStudents, studentId]);
    };

    const toggleSelectUnassigned = (id: number) => {
        if (selectedUnassigned.includes(id)) {
            setSelectedUnassigned(selectedUnassigned.filter(uid => uid !== id));
        } else {
            setSelectedUnassigned([...selectedUnassigned, id]);
        }
    };

    const getFilteredUnassigned = () => {
        return students.filter(s => 
            unassignedStudents.includes(s.id) && 
            (selectedClassroomId === 'all' || s.classroom_id === Number(selectedClassroomId)) &&
            s.name.toLowerCase().includes(unassignedSearch.toLowerCase())
        );
    };

    const toggleSelectAllFiltered = () => {
        const filtered = getFilteredUnassigned();
        const filteredIds = filtered.map(s => s.id);
        
        const allSelected = filteredIds.every(id => selectedUnassigned.includes(id));
        
        if (allSelected) {
            setSelectedUnassigned(selectedUnassigned.filter(id => !filteredIds.includes(id)));
        } else {
            const newSelected = Array.from(new Set([...selectedUnassigned, ...filteredIds]));
            setSelectedUnassigned(newSelected);
        }
    };

    const handleReset = () => {
        const allStudentIds = students.map(s => s.id);
        setUnassignedStudents(allStudentIds);
        const resetAssignments: Record<number, number[]> = {};
        rooms.forEach(r => resetAssignments[r.id] = []);
        setRoomAssignments(resetAssignments);
    };

    const [isSaving, setIsSaving] = useState(false);

    const saveAssignments = () => {
        setIsSaving(true);
        const payload = Object.entries(roomAssignments).map(([roomId, studentIds]) => ({
            room_id: parseInt(roomId),
            student_ids: studentIds
        }));

        router.post(route('proktor.rooms.global-assignment.save'), {
            assignments: payload
        }, {
            onSuccess: () => {
                toast.success('Pengaturan ruang permanen berhasil disimpan');
                setIsSaving(false);
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors).flat().join(', ');
                toast.error('Gagal menyimpan: ' + (errorMsg || 'Terjadi kesalahan validasi'));
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <Link href={route('proktor.rooms.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-1">
                            <ArrowLeft className="w-3 h-3" /> Kembali ke Daftar Ruang
                        </Link>
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Pengaturan Ruang Permanen
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Atur ruang default untuk setiap siswa. Data ini akan otomatis digunakan saat membuat sesi ujian baru.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handleReset}>Reset Semua</SecondaryButton>
                        <PrimaryButton onClick={saveAssignments} className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
                            <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} /> 
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Ruang Permanen" />

            <div className="py-8">
                <div className="mx-auto max-w-[90rem] sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Summary & Control */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-sm font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Belum Terbagi
                                </h3>
                                <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{unassignedStudents.length}</div>
                                <p className="text-xs text-gray-500 font-medium">Siswa belum memiliki ruang default.</p>

                                <div className="mt-8 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Pilih Ruang Tujuan:</label>
                                        <select 
                                            value={selectedRoomId || ''} 
                                            onChange={(e) => setSelectedRoomId(parseInt(e.target.value))}
                                            className="w-full rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 text-sm font-bold"
                                        >
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.name} (Sisa: {r.capacity - (roomAssignments[r.id]?.length || 0)})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleAssign(15)} className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-bold transition">
                                            Masukan 15
                                        </button>
                                        <button onClick={() => handleAssign(unassignedStudents.length)} className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-bold transition">
                                            Masukan Semua
                                        </button>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-600 mb-1 block uppercase tracking-widest">Filter Kelas:</label>
                                            <select 
                                                value={selectedClassroomId} 
                                                onChange={(e) => {
                                                    setSelectedClassroomId(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                                    setSelectedUnassigned([]); // Clear selection when filter changes to avoid confusion
                                                }}
                                                className="w-full rounded-xl border-gray-100 dark:border-gray-800 dark:bg-gray-800 text-[10px] font-bold"
                                            >
                                                <option value="all">Semua Kelas</option>
                                                {classrooms.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Cari siswa..." 
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] focus:ring-1 focus:ring-indigo-500"
                                                value={unassignedSearch}
                                                onChange={(e) => {
                                                    setUnassignedSearch(e.target.value);
                                                    setSelectedUnassigned([]);
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    checked={getFilteredUnassigned().length > 0 && getFilteredUnassigned().every(s => selectedUnassigned.includes(s.id))}
                                                    onChange={toggleSelectAllFiltered}
                                                />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pilih Semua Filter</span>
                                            </label>
                                            <span className="text-[10px] font-bold text-indigo-600">{getFilteredUnassigned().length} Siswa</span>
                                        </div>
                                        
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                                            {getFilteredUnassigned().map(s => (
                                                    <label key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="checkbox" 
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                                checked={selectedUnassigned.includes(s.id)}
                                                                onChange={() => toggleSelectUnassigned(s.id)}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase truncate max-w-[100px]">{s.name}</span>
                                                                <span className="text-[8px] text-gray-400 italic">{s.classroom?.name}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                        
                                        {selectedUnassigned.length > 0 && (
                                            <button 
                                                onClick={handleAssignSelected}
                                                className="w-full mt-4 p-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition"
                                            >
                                                Assign {selectedUnassigned.length} Siswa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col min-h-[400px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                                                {room.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{room.name}</h4>
                                                <Link 
                                                    href={route('proktor.rooms.seating', room.id)}
                                                    className="text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                                >
                                                    <Grid className="w-2.5 h-2.5" />
                                                    Atur Tata Letak
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kapasitas</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{roomAssignments[room.id]?.length || 0} / {room.capacity}</p>
                                        </div>
                                    </div>

                                    {/* Student List Preview */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-1">
                                        <div className="space-y-1">
                                            {roomAssignments[room.id]?.map(studentId => {
                                                const student = students.find(s => s.id === studentId);
                                                return (
                                                    <div key={studentId} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs transition group">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-[10px]">{student?.name}</span>
                                                            <span className="text-[8px] text-gray-400 font-mono italic">{student?.classroom?.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => unassignStudent(room.id, studentId)}
                                                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition opacity-0 group-hover:opacity-100"
                                                            title="Keluarkan dari ruang"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {(!roomAssignments[room.id] || roomAssignments[room.id].length === 0) && (
                                                <p className="text-center text-[10px] text-gray-400 py-4 italic">Belum ada siswa di ruang ini.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
