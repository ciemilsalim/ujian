import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Grid, Plus, Minus, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { User, Classroom } from '@/types';

export default function SeatingPlan({ classroom, students }: { classroom: Classroom, students: User[] }) {
    const [rows, setRows] = useState(classroom.seating_grid?.rows || 5);
    const [cols, setCols] = useState(classroom.seating_grid?.cols || 4);
    const [plan, setPlan] = useState<Record<string, number>>(classroom.seating_plan || {});
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

    const { processing } = useForm({
        seating_plan: plan,
        seating_grid: { rows, cols }
    });

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
        router.post(route('proktor.classrooms.update-seating', classroom.id), {
            seating_plan: plan,
            seating_grid: { rows, cols }
        }, {
            onSuccess: () => toast.success('Tata letak kursi berhasil disimpan!'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('proktor.classrooms.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Tata Letak Kursi: {classroom.name}
                        </h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            }
        >
            <Head title={`Seating Plan - ${classroom.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Sidebar: Grid Controls & Students List */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Grid className="w-4 h-4 text-indigo-500" />
                                    Grid Size
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Baris (Rows)</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setRows(Math.max(1, rows - 1))} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Minus className="w-3 h-3" /></button>
                                            <span className="font-bold w-8 text-center">{rows}</span>
                                            <button onClick={() => setRows(rows + 1)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Kolom (Cols)</label>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setCols(Math.max(1, cols - 1))} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Minus className="w-3 h-3" /></button>
                                            <span className="font-bold w-8 text-center">{cols}</span>
                                            <button onClick={() => setCols(cols + 1)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-indigo-500" />
                                    Daftar Siswa
                                </h3>
                                <div className="overflow-y-auto space-y-2 flex-1 pr-2">
                                    {students.map(student => {
                                        const isSeated = Object.values(plan).includes(student.id);
                                        return (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                                                className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${selectedStudent === student.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                                                    : isSeated
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 opacity-60'
                                                        : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="font-bold truncate">{student.name}</div>
                                                <div className="text-[10px] uppercase font-black opacity-60">
                                                    {isSeated ? 'Telah duduk' : 'Belum diatur'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Main Canvas: Selection Grid */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px] flex flex-col">
                                <div className="mb-8 text-center">
                                    <div className="inline-block bg-gray-200 dark:bg-gray-700 px-12 py-3 rounded-t-lg font-bold text-gray-500 text-xs uppercase tracking-[0.2em]">
                                        DEPAN / PAPAN TULIS
                                    </div>
                                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-1/2"></div>
                                </div>

                                <div className="flex-1 flex items-center justify-center">
                                    <div
                                        className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl"
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
                                                        className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all border-2 ${student
                                                            ? 'bg-white dark:bg-gray-800 shadow-md border-indigo-200 dark:border-indigo-900 scale-100 hover:scale-105'
                                                            : 'bg-gray-100/50 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-300'
                                                            }`}
                                                    >
                                                        {student ? (
                                                            <>
                                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
                                                                    <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                                <div className="text-[10px] font-black text-center text-gray-800 dark:text-gray-200 line-clamp-2">
                                                                    {student.name}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                Row {r + 1}, Col {c + 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 text-center text-xs text-gray-500 italic">
                                    * Klik nama siswa di sidebar, lalu klik kotak kursi untuk menempatkan. Klik kursi yang sudah terisi untuk mengosongkan.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
