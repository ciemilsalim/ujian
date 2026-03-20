import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Grid, Plus, Minus, User as UserIcon, Home, Printer, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
    id: number;
    name: string;
    classroom?: { name: string };
}

interface Room {
    id: number;
    name: string;
    seating_grid?: { rows: number, cols: number };
    seating_plan?: Record<string, number>;
}

export default function RoomSeatingPlan({ room, students }: { room: Room, students: Student[] }) {
    const [rows, setRows] = useState(room.seating_grid?.rows || 5);
    const [cols, setCols] = useState(room.seating_grid?.cols || 4);
    const [plan, setPlan] = useState<Record<string, number>>(room.seating_plan || {});
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

    const [isSaving, setIsSaving] = useState(false);

    const handleCellClick = (r: number, c: number) => {
        const key = `${r}-${c}`;
        if (selectedStudent) {
            // Check if student already seated elsewhere
            const existingSeat = Object.keys(plan).find(k => plan[k] === selectedStudent);
            const newPlan = { ...plan };
            if (existingSeat) delete newPlan[existingSeat];

            newPlan[key] = selectedStudent;
            setPlan(newPlan);
            setSelectedStudent(null);
        } else if (plan[key]) {
            // Unseat student
            const newPlan = { ...plan };
            delete newPlan[key];
            setPlan(newPlan);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        router.post(route('proktor.rooms.update-seating', room.id), {
            seating_plan: plan,
            seating_grid: { rows, cols }
        }, {
            onSuccess: () => {
                toast.success(`Tata letak kursi ruang ${room.name} berhasil disimpan!`);
                setIsSaving(false);
            },
            onError: () => setIsSaving(false),
            onFinish: () => setIsSaving(false)
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex flex-col gap-1">
                        <Link href={route('proktor.rooms.global-assignment')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-1">
                            <ArrowLeft className="w-3 h-3" /> Kembali ke Pengaturan Ruang
                        </Link>
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-2">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Tata Letak: {room.name}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Atur posisi duduk siswa secara permanen untuk ruang ini.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <a
                            href={route('proktor.rooms.pdf', room.id)}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 dark:shadow-none"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Cetak PDF
                        </a>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                        >
                            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Tata Letak - ${room.name}`} />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:m-0 { margin: 0 !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:shadow-none { shadow: none !important; box-shadow: none !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:w-full { width: 100% !important; max-width: 100% !important; }
                    .print\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
                }
            `}} />

            <div className="py-8 print:p-0">
                <div className="mx-auto max-w-[90rem] sm:px-6 lg:px-8 print:max-w-full print:px-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
                        {/* Sidebar: Grid Controls & Students List */}
                        <div className="space-y-6 print:hidden">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                                    <Grid className="w-4 h-4" /> Grid Size
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-600 mb-2 block uppercase">Baris (Rows)</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setRows(Math.max(1, rows - 1))} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-indigo-50 transition"><Minus className="w-3 h-3" /></button>
                                            <span className="font-black text-lg w-8 text-center">{rows}</span>
                                            <button onClick={() => setRows(rows + 1)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-indigo-50 transition"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-600 mb-2 block uppercase">Kolom (Cols)</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setCols(Math.max(1, cols - 1))} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-indigo-50 transition"><Minus className="w-3 h-3" /></button>
                                            <span className="font-black text-lg w-8 text-center">{cols}</span>
                                            <button onClick={() => setCols(cols + 1)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-indigo-50 transition"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" /> Daftar Siswa ({students.length})
                                </h3>
                                <div className="overflow-y-auto custom-scrollbar space-y-1 flex-1 pr-1">
                                    {students.map(student => {
                                        const isSeated = Object.values(plan).includes(student.id);
                                        return (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                                                className={`w-full text-left p-3 rounded-2xl transition-all border ${selectedStudent === student.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-[1.02]'
                                                    : isSeated
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 opacity-60'
                                                        : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className="text-[10px] font-black uppercase truncate">{student.name}</div>
                                                <div className="text-[8px] font-bold opacity-60 italic">
                                                    {isSeated ? 'Telah Duduk' : (student.classroom?.name || 'Belum Diatur')}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {students.length === 0 && (
                                        <div className="text-center py-8 text-[10px] font-bold text-gray-400 italic bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                            Belum ada siswa di ruang ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Canvas: Selection Grid */}
                        <div className="lg:col-span-3 print:col-span-4 print:w-full">
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm min-h-[600px] flex flex-col items-center print:border-none print:shadow-none print:p-0">
                                <div className="mb-12 text-center w-full max-w-2xl print:mb-8">
                                    <div className="hidden print:block mb-6">
                                        <h1 className="text-2xl font-black uppercase tracking-[0.2em] mb-1">{room.name}</h1>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">DENAH TEMPAT DUDUK SISWA</p>
                                    </div>

                                    <div className="inline-block bg-gray-100 dark:bg-gray-800 px-16 py-4 rounded-t-3xl font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">
                                        DEPAN / PAPAN TULIS
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto w-full mb-6"></div>

                                    <div className="flex justify-center gap-4 mb-4">
                                        <div className="bg-gray-800 dark:bg-gray-700 px-8 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                                            MEJA PENGAWAS
                                        </div>
                                        <div className="bg-indigo-600 px-8 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                                            MEJA PROKTOR
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full flex items-center justify-center overflow-auto custom-scrollbar p-4">
                                    <div
                                        className="grid gap-6 p-8 bg-gray-50/50 dark:bg-gray-800/20 rounded-[3rem] border border-gray-100 dark:border-gray-800/50"
                                        style={{
                                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                            width: 'fit-content'
                                        }}
                                    >
                                        {Array.from({ length: rows }).map((_, r) => (
                                            Array.from({ length: cols }).map((_, c) => {
                                                const key = `${r}-${c}`;
                                                const studentId = plan[key];
                                                const student = students.find(s => s.id === studentId);

                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => handleCellClick(r, c)}
                                                        className={`w-36 h-36 rounded-[2.5rem] flex flex-col items-center justify-center p-4 cursor-pointer transition-all border-2 ${student
                                                            ? 'bg-white dark:bg-gray-900 shadow-xl shadow-indigo-100/50 dark:shadow-none border-indigo-100 dark:border-indigo-900 scale-100 hover:scale-[1.05]'
                                                            : 'bg-white/50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                            }`}
                                                    >
                                                        {student ? (
                                                            <>
                                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                                                    <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                                <div className="text-[10px] font-black text-center text-gray-900 dark:text-white uppercase leading-tight line-clamp-2">
                                                                    {student.name}
                                                                </div>
                                                                <div className="text-[8px] font-bold text-gray-400 italic mt-1 uppercase">
                                                                    {student.classroom?.name}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center opacity-30">
                                                                <div className="w-8 h-8 rounded-xl border border-gray-300 border-dashed flex items-center justify-center mb-2">
                                                                    <Plus className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">
                                                                    R{r + 1} C{c + 1}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-12 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold italic text-center max-w-xl">
                                    * Klik nama siswa di sidebar sebelah kiri, lalu klik kotak kursi di area grid untuk menentukan posisi duduk. <br/>
                                    * Klik kotak kursi yang sudah terisi untuk mengosongkan kembali posisi tersebut.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
