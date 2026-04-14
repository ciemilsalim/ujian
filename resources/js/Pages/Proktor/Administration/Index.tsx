import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Users, CreditCard, Download, ShieldCheck, ClipboardCheck, LayoutGrid, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Session {
    id: number;
    name: string;
    exam: { title: string };
    classroom: { name: string } | null;
    start_time: string;
}

interface Classroom {
    id: number;
    name: string;
    users_count: number;
}

interface Room {
    id: number;
    name: string;
}

interface Proctor {
    id: number;
    name: string;
    nip: string | null;
}

export default function Index({ sessions, classrooms, rooms, proctors }: { sessions: Session[], classrooms: Classroom[], rooms: Room[], proctors: Proctor[] }) {
    const [activeTab, setActiveTab] = useState<'sessions' | 'classrooms' | 'rules'>('sessions');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isBAModalOpen, setIsBAModalOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        proctor_id: '',
    });

    const filteredSessions = sessions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.exam?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClassrooms = classrooms.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenerateBA = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;
        
        // Manual form submit for PDF stream
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('proktor.administration.official-report', selectedSession.id);
        form.target = '_blank';

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'proctor_id';
        idInput.value = data.proctor_id;
        form.appendChild(idInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setIsBAModalOpen(false);
        reset();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase inline-flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                        Administrasi Ujian
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kelola dokumen resmi, berita acara, daftar hadir, dan kartu peserta.
                    </p>
                </div>
            }
        >
            <Head title="Administrasi Ujian" />

            <div className="py-6">
                {/* Tabs Navigation */}
                <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8 w-fit">
                    <button
                        onClick={() => { setActiveTab('sessions'); setSearchQuery(''); }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'sessions' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Dokumen Sesi
                    </button>
                    <button
                        onClick={() => { setActiveTab('classrooms'); setSearchQuery(''); }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'classrooms' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kartu Peserta
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'rules' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Tata Tertib
                    </button>
                </div>

                {activeTab !== 'rules' && (
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Cari ${activeTab === 'sessions' ? 'sesi atau mata pelajaran' : 'kelas'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-blue-500 font-medium text-sm transition"
                        />
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSessions.map(session => (
                            <div key={session.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{session.exam?.title || 'Ujian Tidak Diketahui'}</h3>
                                        <p className="text-sm text-gray-500 font-bold">{session.name} • {session.classroom?.name || 'Semua Kelas'}</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl">
                                        <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <select 
                                            id={`room_select_${session.id}`}
                                            className="h-10 text-xs font-bold rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex-1"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const btn = document.getElementById(`btn_attendance_${session.id}`) as HTMLAnchorElement;
                                                if (btn) {
                                                    btn.href = route('proktor.attendance.generate', session.id) + (val ? `?room_id=${val}` : '');
                                                }
                                            }}
                                        >
                                            <option value="">-- Semua Ruang --</option>
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                        <a 
                                            id={`btn_attendance_${session.id}`}
                                            href={route('proktor.attendance.generate', session.id)} 
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl transition"
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            Hadir Siswa
                                        </a>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => { setSelectedSession(session); setIsBAModalOpen(true); }}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl transition"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Berita Acara
                                        </button>
                                        <a 
                                            href={route('proktor.attendance.proctor', session.id)} 
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase rounded-xl transition"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Hadir Pengawas
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'classrooms' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredClassrooms.map(classroom => (
                            <div key={classroom.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                    <LayoutGrid className="w-8 h-8" />
                                </div>
                                <h3 className="font-black text-gray-900 dark:text-white text-lg">{classroom.name}</h3>
                                <p className="text-xs text-gray-500 font-bold mb-6">{classroom.users_count} Siswa</p>
                                
                                <form action={route('proktor.exam-cards.generate')} method="POST" target="_blank">
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                    <input type="hidden" name="classroom_id" value={classroom.id} />
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black rounded-xl hover:scale-105 transition">
                                        <CreditCard className="w-4 h-4" />
                                        Cetak Kartu
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                            <div className="relative">
                                <FileText className="w-12 h-12 text-indigo-600 mb-6" />
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Tata Tertib Peserta</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">Dokumen aturan resmi yang harus dipatuhi oleh seluruh siswa selama pelaksanaan ujian.</p>
                                <a 
                                    href={route('proktor.administration.exam-rules')} 
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    <Download className="w-5 h-5" />
                                    Unduh PDF
                                </a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                            <div className="relative">
                                <ShieldCheck className="w-12 h-12 text-amber-600 mb-6" />
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Tata Tertib Pengawas</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">Panduan dan aturan resmi bagi pengawas ruangan untuk menjaga integritas ujian.</p>
                                <a 
                                    href={route('proktor.administration.proctor-rules')} 
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-700 transition shadow-lg shadow-amber-200 dark:shadow-none"
                                >
                                    <Download className="w-5 h-5" />
                                    Unduh PDF
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Berit Acara Proctor Input Modal */}
            <Modal show={isBAModalOpen} onClose={() => setIsBAModalOpen(false)} maxWidth="md">
                <form onSubmit={handleGenerateBA} className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Cetak Berita Acara</h3>
                            <p className="text-xs font-bold text-gray-500">Input data pengawas untuk sesi {selectedSession?.name}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="proctor_id" value="Pilih Pengawas" className="font-bold text-[10px] uppercase tracking-widest text-gray-400" />
                            <select
                                id="proctor_id"
                                value={data.proctor_id}
                                onChange={(e) => setData('proctor_id', e.target.value)}
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl h-12"
                                required
                            >
                                <option value="">-- Silakan Pilih Pengawas --</option>
                                {proctors?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} {p.nip ? `(NIP: ${p.nip})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <SecondaryButton onClick={() => setIsBAModalOpen(false)} className="rounded-xl h-11 px-6 font-bold">Batal</SecondaryButton>
                        <PrimaryButton className="rounded-xl h-11 px-8 bg-indigo-600 font-black uppercase text-xs tracking-widest" disabled={processing}>
                            Cetak Sekarang
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
