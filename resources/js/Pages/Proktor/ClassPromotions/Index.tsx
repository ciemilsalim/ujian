import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    GraduationCap,
    ArrowRight,
    TrendingUp,
    Users,
    CheckSquare,
    Square,
    Search,
    AlertCircle,
    CheckCircle2,
    Layers,
    Sparkles,
    RefreshCw,
    UserCheck,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Classroom, User } from '@/types';
import { toast } from 'sonner';

interface ClassPromotionProps {
    classrooms: (Classroom & { students_count: number })[];
    students: User[];
    selectedClassroomId: string | null;
    unassignedStudentsCount: number;
}

export default function Index({
    classrooms,
    students,
    selectedClassroomId,
    unassignedStudentsCount,
}: ClassPromotionProps) {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [targetClassroomId, setTargetClassroomId] = useState<string>('');

    // Modal state for single promotion
    const [showConfirmSingleModal, setShowConfirmSingleModal] = useState(false);

    // Bulk Promotion state
    const [bulkMappings, setBulkMappings] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        classrooms.forEach((c) => {
            initial[c.id] = 'none';
        });
        return initial;
    });
    const [showConfirmBulkModal, setShowConfirmBulkModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.username.toLowerCase().includes(q)
        );
    }, [students, searchQuery]);

    // Handle source classroom change in single mode
    const handleSourceClassChange = (classroomId: string) => {
        setSelectedStudentIds([]);
        setTargetClassroomId('');
        router.get(
            route('proktor.class-promotions.index'),
            { classroom_id: classroomId },
            { preserveState: true, replace: true }
        );
    };

    // Toggle select all students
    const handleToggleSelectAll = () => {
        if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filteredStudents.map((s) => s.id));
        }
    };

    // Toggle individual student
    const handleToggleStudent = (id: number) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Submit single class promotion
    const handleSubmitSinglePromotion = () => {
        if (selectedStudentIds.length === 0 || !targetClassroomId) return;
        setIsSubmitting(true);

        router.post(
            route('proktor.class-promotions.promote'),
            {
                student_ids: selectedStudentIds,
                target_classroom_id: targetClassroomId,
            },
            {
                onSuccess: () => {
                    setShowConfirmSingleModal(false);
                    setSelectedStudentIds([]);
                    setIsSubmitting(false);
                    toast.success('Kenaikan kelas berhasil diproses!');
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast.error('Gagal memproses kenaikan kelas.');
                },
            }
        );
    };

    // Quick Auto-Match heuristic for Bulk Mapping
    const handleAutoMapClasses = () => {
        const newMappings: Record<number, string> = { ...bulkMappings };

        classrooms.forEach((source) => {
            const name = source.name.trim();

            // Extract leading number or grade (e.g. "7A" -> 7, "X IPA" -> X)
            // Match Roman numerals or Arabic digits
            const arabicMatch = name.match(/^(\d+)(.*)$/i);
            const romanMatch = name.match(/^(X|XI|XII|VII|VIII|IX)(.*)$/i);

            if (arabicMatch) {
                const currentGrade = parseInt(arabicMatch[1], 10);
                const suffix = arabicMatch[2].trim();
                const nextGrade = currentGrade + 1;

                // Look for target class with nextGrade + suffix
                const target = classrooms.find((c) => {
                    const cMatch = c.name.trim().match(/^(\d+)(.*)$/i);
                    return cMatch && parseInt(cMatch[1], 10) === nextGrade && cMatch[2].trim().toLowerCase() === suffix.toLowerCase();
                });

                if (target) {
                    newMappings[source.id] = String(target.id);
                } else if (currentGrade === 6 || currentGrade === 9 || currentGrade === 12) {
                    // Highest standard grades -> graduate
                    newMappings[source.id] = 'graduated';
                }
            } else if (romanMatch) {
                const romanMap: Record<string, string> = {
                    VII: 'VIII',
                    VIII: 'IX',
                    IX: 'graduated',
                    X: 'XI',
                    XI: 'XII',
                    XII: 'graduated',
                };
                const currentRoman = romanMatch[1].toUpperCase();
                const suffix = romanMatch[2].trim();
                const nextRoman = romanMap[currentRoman];

                if (nextRoman === 'graduated') {
                    newMappings[source.id] = 'graduated';
                } else if (nextRoman) {
                    const target = classrooms.find((c) => {
                        const cMatch = c.name.trim().match(/^(X|XI|XII|VII|VIII|IX)(.*)$/i);
                        return cMatch && cMatch[1].toUpperCase() === nextRoman && cMatch[2].trim().toLowerCase() === suffix.toLowerCase();
                    });
                    if (target) {
                        newMappings[source.id] = String(target.id);
                    }
                }
            }
        });

        setBulkMappings(newMappings);
        toast.success('Pemetaan otomatis berhasil diterapkan! Silakan periksa kembali sebelum mengeksekusi.');
    };

    // Reset Bulk Mapping
    const handleResetBulkMappings = () => {
        const reset: Record<number, string> = {};
        classrooms.forEach((c) => {
            reset[c.id] = 'none';
        });
        setBulkMappings(reset);
    };

    // Calculate total students impacted by bulk mapping
    const bulkSummary = useMemo(() => {
        let totalStudentsToMove = 0;
        const movements: { source: Classroom; targetName: string; count: number }[] = [];

        classrooms.forEach((c) => {
            const targetId = bulkMappings[c.id];
            if (targetId && targetId !== 'none' && c.students_count > 0) {
                totalStudentsToMove += c.students_count;
                let targetName = 'Luluskan / Tanpa Kelas';
                if (targetId !== 'graduated') {
                    const targetClass = classrooms.find((cls) => String(cls.id) === targetId);
                    if (targetClass) targetName = targetClass.name;
                }
                movements.push({
                    source: c,
                    targetName,
                    count: c.students_count,
                });
            }
        });

        return { totalStudentsToMove, movements };
    }, [bulkMappings, classrooms]);

    // Submit bulk promotion
    const handleSubmitBulkPromotion = () => {
        const mappingsPayload = Object.entries(bulkMappings)
            .filter(([_, targetId]) => targetId && targetId !== 'none')
            .map(([sourceId, targetId]) => ({
                source_classroom_id: Number(sourceId),
                target_classroom_id: targetId,
            }));

        if (mappingsPayload.length === 0) {
            toast.error('Belum ada kelas yang dipetakan untuk dipindahkan.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('proktor.class-promotions.bulk'),
            { mappings: mappingsPayload },
            {
                onSuccess: () => {
                    setShowConfirmBulkModal(false);
                    handleResetBulkMappings();
                    setIsSubmitting(false);
                    toast.success('Kenaikan kelas massal berhasil dijalankan!');
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast.error('Gagal menjalankan kenaikan kelas massal.');
                },
            }
        );
    };

    const currentSelectedClass = classrooms.find(
        (c) => String(c.id) === selectedClassroomId
    );
    const targetSelectedClass = classrooms.find(
        (c) => String(c.id) === targetClassroomId
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight uppercase flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Kenaikan & Pemindahan Kelas
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Kelola kenaikan kelas, mutasi siswa, atau kelulusan untuk Tahun Ajaran baru.
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('single')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                activeTab === 'single'
                                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-none'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Kenaikan Per Kelas
                        </button>
                        <button
                            onClick={() => setActiveTab('bulk')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                activeTab === 'bulk'
                                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-none'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            Pemetaan Massal (Wizard)
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Kenaikan Kelas Siswa" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* ======================= TAB 1: KENAIKAN PER KELAS ======================= */}
                    {activeTab === 'single' && (
                        <div className="space-y-6">
                            {/* Class Selection Flow Bar */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                                    
                                    {/* Source Class */}
                                    <div className="md:col-span-5 space-y-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            1. Pilih Kelas Asal
                                        </label>
                                        <select
                                            value={selectedClassroomId || ''}
                                            onChange={(e) => handleSourceClassChange(e.target.value)}
                                            className="w-full rounded-2xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 text-sm font-bold focus:ring-indigo-500 py-3"
                                        >
                                            <option value="">-- Pilih Kelas Asal Siswa --</option>
                                            {classrooms.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.students_count} Siswa)
                                                </option>
                                            ))}
                                            {unassignedStudentsCount > 0 && (
                                                <option value="unassigned">
                                                    Tanpa Kelas / Belum Ditentukan ({unassignedStudentsCount} Siswa)
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Arrow Divider */}
                                    <div className="md:col-span-1 flex justify-center items-center py-2 md:py-0">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Target Class */}
                                    <div className="md:col-span-5 space-y-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            2. Pilih Kelas Tujuan / Aksi
                                        </label>
                                        <select
                                            value={targetClassroomId}
                                            onChange={(e) => setTargetClassroomId(e.target.value)}
                                            disabled={!selectedClassroomId}
                                            className="w-full rounded-2xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 text-sm font-bold focus:ring-indigo-500 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">-- Pilih Kelas Baru --</option>
                                            {classrooms
                                                .filter((c) => String(c.id) !== selectedClassroomId)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        Naik / Pindah ke: {c.name} (Saat ini: {c.students_count} Siswa)
                                                    </option>
                                                ))}
                                            <option value="graduated" className="text-amber-600 font-bold">
                                                🎓 Luluskan Siswa (Keluarkan dari Kelas)
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Students List Card */}
                            {selectedClassroomId ? (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* Table Toolbar */}
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleToggleSelectAll}
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 transition"
                                            >
                                                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                                                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-gray-400" />
                                                )}
                                                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                                                    ? 'Batal Pilih Semua'
                                                    : 'Pilih Semua Siswa'}
                                            </button>

                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
                                                <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                                                    {selectedStudentIds.length}
                                                </strong>{' '}
                                                dari {filteredStudents.length} siswa dipilih
                                            </span>
                                        </div>

                                        {/* Search & Action Button */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                            <div className="relative w-full sm:w-64">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Cari nama atau NISN..."
                                                    className="w-full pl-9 pr-4 py-2 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-medium focus:ring-indigo-500"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                disabled={selectedStudentIds.length === 0 || !targetClassroomId || isSubmitting}
                                                onClick={() => setShowConfirmSingleModal(true)}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Proses ({selectedStudentIds.length})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Student Table */}
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-16 text-center text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                            <p className="font-bold">Tidak ada siswa yang ditemukan di kelas ini.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider w-12">
                                                            Pilih
                                                        </th>
                                                        <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                                                            Nama Lengkap
                                                        </th>
                                                        <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                                                            Username / NISN
                                                        </th>
                                                        <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                                                            Kelas Saat Ini
                                                        </th>
                                                        <th className="px-6 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">
                                                            Status Kenaikan
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                    {filteredStudents.map((student) => {
                                                        const isSelected = selectedStudentIds.includes(student.id);
                                                        return (
                                                            <tr
                                                                key={student.id}
                                                                onClick={() => handleToggleStudent(student.id)}
                                                                className={`cursor-pointer transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20'
                                                                        : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/50'
                                                                }`}
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => handleToggleStudent(student.id)}
                                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                                    {student.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                                                                    {student.username}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                                        {currentSelectedClass?.name || 'Tanpa Kelas'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                    {isSelected ? (
                                                                        targetClassroomId ? (
                                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                                {targetClassroomId === 'graduated'
                                                                                    ? 'Siap Lulus'
                                                                                    : `➔ ${targetSelectedClass?.name}`}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30">
                                                                                Terpilih (Pilih Kelas Tujuan)
                                                                            </span>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 font-medium italic">
                                                                            Tetap di kelas ini
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                                        <GraduationCap className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                        Pilih Kelas Asal Terlebih Dahulu
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                                        Silakan pilih kelas asal pada dropdown di atas untuk melihat daftar siswa dan mengatur kenaikan kelas mereka.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================= TAB 2: PEMETAAN MASSAL (WIZARD) ======================= */}
                    {activeTab === 'bulk' && (
                        <div className="space-y-6">
                            {/* Fast Actions Bar */}
                            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-black flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                        Wizard Kenaikan Kelas Massal
                                    </h3>
                                    <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                                        Petakan tujuan kenaikan untuk setiap kelas. Semua siswa di kelas asal akan otomatis dipindahkan ke kelas tujuan yang Anda pilih dalam satu kali proses.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleAutoMapClasses}
                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-black shadow-md transition"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Isi Otomatis (7➔8, 8➔9, Lulus)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetBulkMappings}
                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Mapping Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h4 className="text-base font-black text-gray-900 dark:text-gray-100">
                                            Tabel Pemetaan Kelas
                                        </h4>
                                        <p className="text-xs text-gray-500">Tentukan kelas tujuan untuk setiap kelas saat ini.</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
                                            Total <strong className="text-indigo-600 font-black">{bulkSummary.totalStudentsToMove}</strong> siswa akan dipindahkan
                                        </span>

                                        <button
                                            type="button"
                                            disabled={bulkSummary.totalStudentsToMove === 0 || isSubmitting}
                                            onClick={() => setShowConfirmBulkModal(true)}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            Eksekusi Massal
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                                                    Kelas Asal Saat Ini
                                                </th>
                                                <th className="px-6 py-3.5 text-center text-xs font-black text-gray-400 uppercase tracking-wider w-24">
                                                    Jumlah Siswa
                                                </th>
                                                <th className="px-6 py-3.5 text-center text-xs font-black text-gray-400 uppercase tracking-wider w-16">
                                                    Alur
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                                                    Pilih Kelas Tujuan Kenaikan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                            {classrooms.map((sourceClass) => {
                                                const currentTarget = bulkMappings[sourceClass.id] || 'none';
                                                const isAssigned = currentTarget !== 'none';
                                                return (
                                                    <tr key={sourceClass.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                                                {sourceClass.name}
                                                            </div>
                                                            {sourceClass.description && (
                                                                <div className="text-xs text-gray-400">
                                                                    {sourceClass.description}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                                                                sourceClass.students_count > 0
                                                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                                                            }`}>
                                                                {sourceClass.students_count} Siswa
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300 dark:text-gray-600">
                                                            <ChevronRight className="w-5 h-5 mx-auto" />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <select
                                                                value={currentTarget}
                                                                onChange={(e) => {
                                                                    setBulkMappings((prev) => ({
                                                                        ...prev,
                                                                        [sourceClass.id]: e.target.value,
                                                                    }));
                                                                }}
                                                                className={`w-full max-w-md rounded-2xl text-xs font-bold py-2.5 transition-all ${
                                                                    isAssigned
                                                                        ? currentTarget === 'graduated'
                                                                            ? 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200'
                                                                            : 'border-indigo-300 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200'
                                                                        : 'border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                <option value="none">-- Tetap di Kelas Ini (Jangan Ubah) --</option>
                                                                {classrooms
                                                                    .filter((c) => c.id !== sourceClass.id)
                                                                    .map((c) => (
                                                                        <option key={c.id} value={c.id}>
                                                                            Naik / Pindah ke: {c.name}
                                                                        </option>
                                                                    ))}
                                                                <option value="graduated" className="text-amber-600 font-bold">
                                                                    🎓 Luluskan Semua Siswa di Kelas Ini
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= CONFIRMATION MODAL: SINGLE PROMOTION ================= */}
            <Modal show={showConfirmSingleModal} onClose={() => setShowConfirmSingleModal(false)}>
                <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mx-auto">
                        <UserCheck className="w-6 h-6" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                            Konfirmasi Kenaikan / Pemindahan Kelas
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Apakah Anda yakin ingin memproses kenaikan kelas untuk siswa yang dipilih?
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Jumlah Siswa:</span>
                            <strong className="text-indigo-600 font-black">{selectedStudentIds.length} Siswa</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Kelas Asal:</span>
                            <strong className="text-gray-800 dark:text-gray-200">{currentSelectedClass?.name || 'Tanpa Kelas'}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tujuan Kenaikan:</span>
                            <strong className="text-emerald-600 font-black">
                                {targetClassroomId === 'graduated' ? '🎓 Lulus / Tanpa Kelas' : targetSelectedClass?.name}
                            </strong>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton onClick={() => setShowConfirmSingleModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton onClick={handleSubmitSinglePromotion} disabled={isSubmitting}>
                            {isSubmitting ? 'Memproses...' : 'Ya, Proses Kenaikan'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* ================= CONFIRMATION MODAL: BULK PROMOTION ================= */}
            <Modal show={showConfirmBulkModal} onClose={() => setShowConfirmBulkModal(false)}>
                <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                            Konfirmasi Kenaikan Kelas Massal
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Tindakan ini akan memindahkan seluruh siswa sesuai dengan daftar pemetaan berikut:
                        </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 space-y-2 text-xs">
                        {bulkSummary.movements.map((m, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-gray-200/60 dark:border-gray-600 last:border-0">
                                <div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{m.source.name}</span>
                                    <span className="text-gray-400 ml-1">({m.count} siswa)</span>
                                </div>
                                <span className="font-black text-indigo-600 dark:text-indigo-400">➔ {m.targetName}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 font-bold text-center">
                        Total {bulkSummary.totalStudentsToMove} siswa akan dipindahkan.
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton onClick={() => setShowConfirmBulkModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton onClick={handleSubmitBulkPromotion} disabled={isSubmitting}>
                            {isSubmitting ? 'Memproses Massal...' : 'Ya, Jalankan Kenaikan Massal'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
