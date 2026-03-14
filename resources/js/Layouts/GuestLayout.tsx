import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Zap } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-blue-500 selection:text-white p-6">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="group transition-transform hover:scale-110 active:scale-95">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none">
                            <Zap className="text-white w-10 h-10 fill-current" />
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                        Selamat Datang
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Masuk ke akun zexam.io Anda</p>
                </div>

                <div className="glass dark:glass-dark rounded-[32px] p-8 shadow-2xl border border-white/20 dark:border-gray-800/50">
                    {children}
                </div>

                <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} zexam.io. Aman & Elegan.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
            `}} />
        </div>
    );
}
