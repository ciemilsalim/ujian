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
        room_id: '',
    });

    const filteredSessions = sessions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.exam?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClassrooms = classrooms.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePrint = (type: 'ba' | 'student' | 'proctor') => {
        if (!selectedSession) return;
        
        let action = '';
        if (type === 'ba') action = route('proktor.administration.official-report', selectedSession.id);
        else if (type === 'student') action = route('proktor.attendance.generate', selectedSession.id);
        else if (type === 'proctor') action = route('proktor.attendance.proctor', selectedSession.id);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;
        form.target = '_blank';

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const pInput = document.createElement('input');
        pInput.type = 'hidden';
        pInput.name = 'proctor_id';
        pInput.value = data.proctor_id;
        form.appendChild(pInput);

        const rInput = document.createElement('input');
        rInput.type = 'hidden';
        rInput.name = 'room_id';
        rInput.value = data.room_id;
        form.appendChild(rInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
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
                                <div className="mt-8">
                                    <button 
                                        onClick={() => { setSelectedSession(session); setIsBAModalOpen(true); }}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-2xl transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                        <Download className="w-5 h-5" />
                                        Cetak Dokumen Administrasi
                                    </button>
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
            <Modal show={isBAModalOpen} onClose={() => setIsBAModalOpen(false)} maxWidth="lg">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Sentral Dokumen Administrasi</h3>
                            <p className="text-xs font-bold text-gray-500">Sesi: {selectedSession?.name} • {selectedSession?.exam?.title}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <InputLabel htmlFor="room_id" value="Pilih Ruangan" className="font-bold text-[10px] uppercase tracking-widest text-gray-400" />
                            <select
                                id="room_id"
                                value={data.room_id}
                                onChange={(e) => setData('room_id', e.target.value)}
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl h-12 font-bold text-sm"
                            >
                                <option value="">-- Semua Ruang (Global) --</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-[10px] text-gray-400 font-medium italic">* Kosongkan jika ingin mencetak untuk seluruh ruangan.</p>
                        </div>
                        <div>
                            <InputLabel htmlFor="proctor_id" value="Pilih Pengawas" className="font-bold text-[10px] uppercase tracking-widest text-gray-400" />
                            <select
                                id="proctor_id"
                                value={data.proctor_id}
                                onChange={(e) => setData('proctor_id', e.target.value)}
                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl h-12 font-bold text-sm"
                            >
                                <option value="">-- Pengawas Default --</option>
                                {proctors?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} {p.nip ? `(NIP: ${p.nip})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl mb-8 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                                Nama Pengawas dan Ruangan yang Anda pilih di atas akan otomatis disinkronkan ke dalam seluruh dokumen PDF di bawah ini agar laporan Anda tetap konsisten.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => handlePrint('ba')}
                            className="flex flex-col items-center justify-center p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] transition shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <FileText className="w-8 h-8 mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Berita Acara</span>
                        </button>
                        <button 
                            onClick={() => handlePrint('student')}
                            className="flex flex-col items-center justify-center p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] transition shadow-lg shadow-emerald-100 dark:shadow-none"
                        >
                            <Users className="w-8 h-8 mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Kehadiran Siswa</span>
                        </button>
                        <button 
                            onClick={() => handlePrint('proctor')}
                            className="flex flex-col items-center justify-center p-6 bg-amber-600 hover:bg-amber-700 text-white rounded-[2rem] transition shadow-lg shadow-amber-100 dark:shadow-none"
                        >
                            <ShieldCheck className="w-8 h-8 mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Kehadiran Pengawas</span>
                        </button>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button onClick={() => setIsBAModalOpen(false)} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition">Tutup Jendela</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
