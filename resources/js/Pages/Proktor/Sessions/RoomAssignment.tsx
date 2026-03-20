import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, Home, ShieldCheck, ChevronRight, Save, UserPlus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';

interface Student {
    id: number;
    name: string;
    classroom?: { name: string };
    exam_room_id: number | null;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
}

interface Proctor {
    id: number;
    name: string;
}

export default function RoomAssignment({ session, students, rooms, proctors, currentProctors }: { session: any, students: Student[], rooms: Room[], proctors: Proctor[], currentProctors: any[] }) {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(rooms.length > 0 ? rooms[0].id : null);
    
    // Group students by room
    const [roomAssignments, setRoomAssignments] = useState<Record<number, number[]>>({});
    const [unassignedStudents, setUnassignedStudents] = useState<number[]>([]);
    
    // Group proctors by room
    const [roomProctors, setRoomProctors] = useState<Record<number, number[]>>({});

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

        const initialProctors: Record<number, number[]> = {};
        rooms.forEach(r => initialProctors[r.id] = []);
        currentProctors.forEach(cp => {
            if (initialProctors[cp.exam_room_id]) {
                initialProctors[cp.exam_room_id].push(cp.proctor_id);
            }
        });
        setRoomProctors(initialProctors);

    }, [students, rooms, currentProctors]);

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

    const handleReset = () => {
        const allStudentIds = students.map(s => s.id);
        setUnassignedStudents(allStudentIds);
        const resetAssignments: Record<number, number[]> = {};
        rooms.forEach(r => resetAssignments[r.id] = []);
        setRoomAssignments(resetAssignments);
    };

    const saveAssignments = () => {
        const payload = Object.entries(roomAssignments).map(([roomId, studentIds]) => ({
            room_id: parseInt(roomId),
            student_ids: studentIds
        }));

        router.post(route('proktor.sessions.assign-rooms', session.id), {
            assignments: payload
        }, {
            onSuccess: () => toast.success('Pembagian ruang berhasil disimpan')
        });
    };

    const toggleProctor = (roomId: number, proctorId: number) => {
        let current = [...(roomProctors[roomId] || [])];
        if (current.includes(proctorId)) {
            current = current.filter(id => id !== proctorId);
        } else {
            if (current.length >= 2) {
                toast.error('Maksimal 2 pengawas per ruang');
                return;
            }
            current.push(proctorId);
        }
        setRoomProctors({ ...roomProctors, [roomId]: current });
    };

    const saveProctor = (roomId: number) => {
        router.post(route('proktor.sessions.assign-proctors', session.id), {
            room_id: roomId,
            proctor_ids: roomProctors[roomId]
        }, {
            onSuccess: () => toast.success('Pengawas berhasil disimpan')
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Pembagian Ruang - {session.name}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Atur distribusi siswa dan pengawas per ruang.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handleReset}>Reset Semua</SecondaryButton>
                        <PrimaryButton onClick={saveAssignments} className="bg-indigo-600 hover:bg-indigo-700">
                            <Save className="w-4 h-4 mr-2" /> Simpan Pembagian
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Pembagian Ruang" />

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
                                <p className="text-xs text-gray-500 font-medium">Siswa belum memiliki ruang.</p>

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
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] p-6 border border-blue-100 dark:border-blue-900/30">
                                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-4 h-4" /> Info
                                </h4>
                                <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed italic">
                                    Daftar hadir siswa akan otomatis dikelompokkan berdasarkan pembagian ruang di halaman ini.
                                </p>
                            </div>
                        </div>

                        {/* Room Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                                                {room.name.charAt(0)}
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{room.name}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kapasitas</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{roomAssignments[room.id]?.length || 0} / {room.capacity}</p>
                                        </div>
                                    </div>

                                    {/* Proctors per Room */}
                                    <div className="mb-6 p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pengawas (Max 2)</h5>
                                            <button onClick={() => saveProctor(room.id)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">Update</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {proctors.map(p => (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => toggleProctor(room.id, p.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${
                                                        roomProctors[room.id]?.includes(p.id)
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Student List Preview? */}
                                    <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar mb-4">
                                        <div className="space-y-1">
                                            {roomAssignments[room.id]?.map(studentId => {
                                                const student = students.find(s => s.id === studentId);
                                                return (
                                                    <div key={studentId} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs transition group">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{student?.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-mono">{student?.classroom?.name}</span>
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
