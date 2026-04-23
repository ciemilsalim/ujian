<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sesi Berakhir - ZEXAM-CBT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .bg-glow {
            background: radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased min-h-screen flex items-center justify-center p-6 bg-glow">
    <div class="max-w-md w-full text-center">
        <div class="mb-8 relative inline-block">
            <div class="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
            <div class="relative w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto border border-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <h1 class="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight uppercase">Sesi Kedaluwarsa</h1>
        <p class="text-slate-500 mb-10 font-medium leading-relaxed">
            Maaf, halaman ini sudah tidak berlaku atau sesi login Anda telah berakhir. Silakan muat ulang halaman atau kembali ke dashboard.
        </p>

        <div class="flex flex-col gap-3">
            <button onclick="window.location.reload()" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase text-xs tracking-widest">
                Muat Ulang Halaman
            </button>
            <a href="/" class="w-full py-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border border-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest">
                Kembali ke Beranda
            </a>
        </div>

        <div class="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-50">
            ZEXAM-CBT V.1.0 • Error 419
        </div>
    </div>
</body>
</html>
