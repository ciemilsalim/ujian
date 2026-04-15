import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ShieldCheck, UserCheck, Search, AlertCircle, QrCode, Printer } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface Proctor {
    id: number;
    name: string;
    nip: string | null;
    pin: string;
}

export default function Index({ proctors }: { proctors: Proctor[] }) {
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedProctor, setSelectedProctor] = useState<Proctor | null>(null);
    const [selectedProctorQr, setSelectedProctorQr] = useState<Proctor | null>(null);

    const createForm = useForm({
        name: '',
        nip: '',
    });

    const editForm = useForm({
        name: '',
        nip: '',
    });

    const filteredProctors = proctors.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.nip && p.nip.toLowerCase().includes(search.toLowerCase())) ||
        (p.pin && p.pin.includes(search))
    );

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('proktor.proctors.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            }
        });
    };

    const openEditModal = (proctor: Proctor) => {
        setSelectedProctor(proctor);
        editForm.setData({
            name: proctor.name,
            nip: proctor.nip || '',
        });
        setShowEditModal(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProctor) return;
        editForm.put(route('proktor.proctors.update', selectedProctor.id), {
            onSuccess: () => {
                setShowEditModal(false);
            }
        });
    };

    const confirmDelete = (proctor: Proctor) => {
        setSelectedProctor(proctor);
        setShowDeleteModal(true);
    };

    const submitDelete = () => {
        if (!selectedProctor) return;
        router.delete(route('proktor.proctors.destroy', selectedProctor.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
            }
        });
    };

    const openQrModal = (proctor: Proctor) => {
        setSelectedProctorQr(proctor);
        setShowQrModal(true);
    };

    const handlePrintQr = () => {
        if (!selectedProctorQr) return;
        const printWindow = window.open('', '', 'width=900,height=600');
        if (!printWindow) return;
        
        const qrContainer = document.getElementById('qr-print-area')?.innerHTML || '';
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - ${selectedProctorQr.name}</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; padding: 20px; background: white; color: #1e293b; }
                        h2 { text-transform: uppercase; font-size: 1.5rem; font-weight: 900; margin-bottom: 2rem; color: #4f46e5; text-align: center; }
                        .grid-layout { display: flex; gap: 2rem; justify-content: center; align-items: stretch; margin-bottom: 2rem; flex-wrap: wrap; }
                        .qr-card { border: 2px dashed #cbd5e1; padding: 2rem; border-radius: 16px; text-align: center; width: 340px; box-sizing: border-box; break-inside: avoid; }
                        h3 { font-size: 1.1rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
                        h3.online { color: #4f46e5; }
                        h3.offline { color: #059669; }
                        p.subtitle { font-size: 0.75rem; color: #64748b; font-weight: 600; margin-bottom: 1.5rem; }
                        .qr-wrapper { background: white; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; margin-bottom: 1.5rem; }
                        .pin-section { background: #f8fafc; border-radius: 12px; padding: 1rem; border: 1px solid #e2e8f0; }
                        .pin-label { font-size: 0.65rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
                        .pin-value { font-size: 2.2rem; font-weight: 900; letter-spacing: 0.2em; color: #0f172a; line-height: 1; }
                        @media print {
                            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    </style>
                </head>
                <body>
                    <h2>Akses Ujian - ${selectedProctorQr.name}</h2>
                    <div class="grid-layout">
                        ${qrContainer}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            Manajemen Pengawas
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono italic">
                            Input list nama pengawas untuk dijadwalkan ke ruang ujian.
                        </p>
                    </div>
                    <PrimaryButton 
                        onClick={() => setShowCreateModal(true)}
                        className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Tambah Pengawas
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Manajemen Pengawas" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, NIP, atau PIN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">No</th>
                                        <th className="px-6 py-4">Nama Pengawas</th>
                                        <th className="px-6 py-4">NIP/NIK</th>
                                        <th className="px-6 py-4">PIN Login</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredProctors.map((proctor, index) => (
                                        <tr key={proctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-400 font-mono">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                        {proctor.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{proctor.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{proctor.nip || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-black text-indigo-600 tracking-widest bg-indigo-50/30 dark:bg-indigo-900/10"><span className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700">{proctor.pin}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openQrModal(proctor)} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 rounded-lg transition" title="Lihat QR Code">
                                                        <QrCode className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditModal(proctor)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-lg transition" title="Edit Data">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => confirmDelete(proctor)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition" title="Hapus">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProctors.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Data pengawas tidak ditemukan</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <form onSubmit={submitCreate} className="p-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-indigo-600" />
                        Tambah Pengawas Baru
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" className="font-bold text-gray-600" />
                            <TextInput
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                placeholder="Contoh: Budi Santoso, S.Pd"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nip" value="NIP / NIK (Opsional)" className="font-bold text-gray-600" />
                            <TextInput
                                id="nip"
                                value={createForm.data.nip}
                                onChange={(e) => createForm.setData('nip', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                placeholder="Masukkan NIP atau NIK"
                            />
                            <InputError message={createForm.errors.nip} className="mt-2" />
                        </div>
                        
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                            <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">Sistem secara otomatis akan membuatkan PIN Login unik sejumlah 6-digit untuk pengawas ini.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton className="h-12 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-700" disabled={createForm.processing}>
                            Simpan Pengawas
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <form onSubmit={submitEdit} className="p-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                        <Edit className="w-6 h-6 text-indigo-600" />
                        Edit Data Pengawas
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Lengkap" className="font-bold text-gray-600" />
                            <TextInput
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_nip" value="NIP / NIK (Opsional)" className="font-bold text-gray-600" />
                            <TextInput
                                id="edit_nip"
                                value={editForm.data.nip}
                                onChange={(e) => editForm.setData('nip', e.target.value)}
                                className="mt-1 block w-full h-12 rounded-2xl"
                            />
                            <InputError message={editForm.errors.nip} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowEditModal(false)} className="h-12 rounded-2xl px-6">Batal</SecondaryButton>
                        <PrimaryButton className="h-12 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-700" disabled={editForm.processing}>
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-2">Hapus Pengawas?</h2>
                    <p className="text-sm text-gray-500 mb-8">Data pengawas <strong>{selectedProctor?.name}</strong> akan dihapus selamanya.</p>
                    
                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="h-12 rounded-2xl px-6 font-bold">Batal</SecondaryButton>
                        <PrimaryButton onClick={submitDelete} className="h-12 rounded-2xl px-8 bg-red-600 hover:bg-red-700">
                            Ya, Hapus
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* QR Modal (Printable) */}
            <Modal show={showQrModal} onClose={() => setShowQrModal(false)} maxWidth="2xl">
                <div className="p-8 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-3">
                                <QrCode className="w-6 h-6 text-indigo-600" />
                                Akses QR Siswa
                            </h2>
                            <p className="text-sm text-gray-500 font-bold mt-1">Pengawas: <span className="text-gray-900 dark:text-white">{selectedProctorQr?.name}</span></p>
                        </div>
                        <button onClick={handlePrintQr} className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition text-sm shadow-md shadow-indigo-100 dark:shadow-none">
                            <Printer className="w-4 h-4" /> Cetak (Print) Barcode
                        </button>
                    </div>

                    {/* This specific ID area will be cloned into the print window */}
                    <div id="qr-print-area" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-3xl">
                        
                        {/* Target: Online */}
                        <div className="qr-card flex flex-col items-center bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 shadow-sm rounded-[2rem] p-8 text-center transition hover:shadow-md">
                            <h3 className="online text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm mb-1">Server Online</h3>
                            <p className="subtitle text-xs text-gray-400 font-bold mb-6">via Internet Publik</p>
                            
                            <div className="qr-wrapper bg-white p-3 rounded-2xl border-2 border-dashed border-indigo-100 mb-6 mx-auto hover:scale-105 transition duration-300">
                                {selectedProctorQr && (
                                    <QRCodeSVG 
                                        value={`https://demo-zexam.zahradev.online/login/siswa*${selectedProctorQr.pin}`}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: '/favicon.ico',
                                            height: 36,
                                            width: 36,
                                            excavate: true,
                                        }}
                                    />
                                )}
                            </div>
                            
                            <div className="pin-section w-full bg-indigo-50/50 dark:bg-indigo-900/20 py-4 rounded-xl border border-indigo-50 dark:border-indigo-900/30">
                                <span className="pin-label text-[10px] text-indigo-400 dark:text-indigo-300 font-black uppercase tracking-widest block mb-1">PIN Login Manual</span>
                                <span className="pin-value text-2xl font-black text-gray-900 dark:text-white tracking-[0.2em]">{selectedProctorQr?.pin}</span>
                            </div>
                        </div>

                        {/* Target: Offline */}
                        <div className="qr-card flex flex-col items-center bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 shadow-sm rounded-[2rem] p-8 text-center transition hover:shadow-md">
                            <h3 className="offline text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-sm mb-1">Server Offline</h3>
                            <p className="subtitle text-xs text-gray-400 font-bold mb-6">via Intranet Sekolah / Lokal</p>
                            
                            <div className="qr-wrapper bg-white p-3 rounded-2xl border-2 border-dashed border-emerald-100 mb-6 mx-auto hover:scale-105 transition duration-300">
                                {selectedProctorQr && (
                                    <QRCodeSVG 
                                        value={`http://192.168.100.1:3000/login/siswa*${selectedProctorQr.pin}`}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: '/favicon.ico',
                                            height: 36,
                                            width: 36,
                                            excavate: true,
                                        }}
                                    />
                                )}
                            </div>
                            
                            <div className="pin-section w-full bg-emerald-50/50 dark:bg-emerald-900/20 py-4 rounded-xl border border-emerald-50 dark:border-emerald-900/30">
                                <span className="pin-label text-[10px] text-emerald-500 dark:text-emerald-300 font-black uppercase tracking-widest block mb-1">PIN Login Manual</span>
                                <span className="pin-value text-2xl font-black text-gray-900 dark:text-white tracking-[0.2em]">{selectedProctorQr?.pin}</span>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setShowQrModal(false)} className="h-12 rounded-2xl px-8 font-black">Tutup</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
