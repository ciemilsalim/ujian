import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Users, Flag, PlayCircle, CheckCircle, Sparkles, BarChart2, MoreHorizontal, TrendingUp, PieChart as PieIcon, Zap, RefreshCw, History, User, Copy, Megaphone, Send, Server, Cpu, Activity, Database, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

interface DashboardProps {
    metrics: any;
    recentSessions: any[];
    activeSessions: any[];
    activityFeed: any[];
    charts: {
        participation: any[];
        status: any[];
        scores: any[];
    };
}

export default function Dashboard({ metrics, recentSessions, activeSessions, activityFeed, charts }: DashboardProps) {
    const user = usePage().props.auth.user;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Token disalin ke clipboard!');
    };

    const handleRefreshToken = (sessionId: number) => {
        router.post(route('proktor.sessions.refresh-token', sessionId), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Token berhasil diperbarui!')
        });
    };

    const [globalMessage, setGlobalMessage] = useState('');
    const [isGlobalSending, setIsGlobalSending] = useState(false);

    const handleGlobalBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!globalMessage.trim()) return;

        setIsGlobalSending(true);
        try {
            await router.post(route('proktor.sessions.broadcast-global'), {
                message: globalMessage
            }, {
                onSuccess: () => {
                    toast.success('Pengumuman global berhasil dikirim!');
                    setGlobalMessage('');
                },
                onError: () => toast.error('Gagal mengirim pengumuman.'),
                onFinish: () => setIsGlobalSending(false),
            });
        } catch (error) {
            toast.error('Gagal mengirim pengumuman.');
            setIsGlobalSending(false);
        }
    };

    // System Health & Connection State
    const [health, setHealth] = useState<any>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await axios.get(route('proktor.dashboard.health'));
                setHealth(response.data.data);
            } catch (err) {
                console.error('Failed to fetch health', err);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Poll every 30s

        // Echo Connection Listeners
        const handleConnected = () => {
            if (connectionStatus !== 'connected') {
                setConnectionStatus('connected');
                toast.success('Koneksi real-time terhubung kembali.', { icon: <Wifi className="w-4 h-4 text-green-500" /> });
            }
        };

        const handleDisconnected = () => {
            setConnectionStatus('disconnected');
            toast.error('Koneksi real-time terputus!', { icon: <WifiOff className="w-4 h-4 text-red-500" />, duration: 0 });
        };

        const handleReconnecting = () => {
            setConnectionStatus('reconnecting');
        };

        window.Echo.connector.pusher.connection.bind('connected', handleConnected);
        window.Echo.connector.pusher.connection.bind('disconnected', handleDisconnected);
        window.Echo.connector.pusher.connection.bind('connecting', handleReconnecting);

        return () => {
            clearInterval(interval);
            if (window.Echo.connector.pusher.connection) {
                window.Echo.connector.pusher.connection.unbind('connected', handleConnected);
                window.Echo.connector.pusher.connection.unbind('disconnected', handleDisconnected);
                window.Echo.connector.pusher.connection.unbind('connecting', handleReconnecting);
            }
        };
    }, [connectionStatus]);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                        Hello, {user.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back to Aplikasi Ujian!</p>
                </div>
            }
        >
            <Head title="Proktor Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* Quick Token Widget */}
                    {activeSessions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeSessions.map((session) => (
                                <div key={session.id} className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Zap className="w-24 h-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Active Token</p>
                                                <h4 className="font-bold truncate pr-8">{session.name}</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRefreshToken(session.id)}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                    title="Refresh Token"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 font-mono text-2xl font-black flex justify-between items-center border border-white/20">
                                                {session.token}
                                                <button
                                                    onClick={() => copyToClipboard(session.token)}
                                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-xs text-indigo-100 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                            Ujian sedang berlangsung
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Metrics Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Dashboard</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Overview of your exam, students and other resources</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Students at exams</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.studentsAtExams}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                    <Flag className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Finishes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.examFinishes}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                    <PlayCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Running Exam</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.runningExams}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl p-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.completedRate}%</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Visual Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Participation Trend */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">Participation Trend</h4>
                                </div>
                                <div className="text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md">Last 7 Days</div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.participation}>
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="students"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorStudents)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-6">
                                <PieIcon className="w-5 h-5 text-indigo-500" />
                                <h4 className="font-bold text-gray-900 dark:text-white">Status Overview</h4>
                            </div>
                            <div className="h-[240px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.status}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {charts.status.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={['#cbd5e1', '#3b82f6', '#10b981'][index % 3]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.studentsAtExams + metrics.examFinishes}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Total Active</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {charts.status.map((item: any, index: number) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#cbd5e1', '#3b82f6', '#10b981'][index] }}></div>
                                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Score Distribution */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart2 className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-bold text-gray-900 dark:text-white">Score Distribution</h4>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.scores}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>


                    {/* Exam History Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exam History</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Explore our tools that you can use to generate reports, analyze results and more</p>
                            </div>
                            <Link href={route('proktor.sessions.index')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                See All ↗
                            </Link>
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Class</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Code</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Participants</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Submit</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Schedule</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentSessions.map((session) => {
                                        const progressPercent = session.participants_count > 0 ? (session.submitted_count / session.participants_count) * 100 : 0;
                                        return (
                                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {session.name}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    All Classes
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 font-mono">
                                                    {session.token}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-purple-600 dark:text-purple-400">
                                                    {session.participants_count}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5 w-32">
                                                        <div className="flex justify-start text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                            {session.submitted_count}/{session.participants_count}
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                                                            <div className="bg-blue-500 h-2 rounded-full dark:bg-blue-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{new Date(session.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        <span>{new Date(session.end_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    {session.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            Running
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            Finished
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded-md transition">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {recentSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Flag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                                    <p>No recent exam history available.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    {/* Student Activity Feed & Status Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Live Activity Feed */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-amber-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">Recent Activity Feed</h4>
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                    Live
                                </span>
                            </div>

                            <div className="space-y-4">
                                {activityFeed.length > 0 ? activityFeed.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${activity.status === 'finished' ? 'bg-emerald-500' : 'bg-blue-500'
                                                }`}>
                                                {activity.status === 'finished' ? (
                                                    <CheckCircle className="w-2 h-2 text-white" />
                                                ) : (
                                                    <PlayCircle className="w-2 h-2 text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {activity.user.name}
                                                </h5>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(activity.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {activity.status === 'finished' ? 'Telah menyelesaikan' : 'Sedang mengerjakan'} {activity.exam_session.exam.title}
                                            </p>
                                        </div>
                                        {activity.score !== null && (
                                            <div className="text-right">
                                                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{activity.score}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">Score</div>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <History className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas terbaca.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar: Global Broadcast & Running Sessions */}
                        <div className="space-y-6">
                            {/* Connection Monitor Widget */}
                            <div className={`bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border-l-4 ${connectionStatus === 'connected' ? 'border-l-emerald-500' :
                                connectionStatus === 'reconnecting' ? 'border-l-amber-500' : 'border-l-red-500'
                                } border border-gray-100 dark:border-gray-700`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className={`w-5 h-5 ${connectionStatus === 'connected' ? 'text-emerald-500 animate-pulse' :
                                            connectionStatus === 'reconnecting' ? 'text-amber-500 animate-spin' : 'text-red-500'
                                            }`} />
                                        <h4 className="font-bold text-gray-900 dark:text-white">Real-time System</h4>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                                        connectionStatus === 'reconnecting' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {connectionStatus}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Database Status</span>
                                        <span className={`font-bold ${health?.database ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {health?.database ? 'Healthy' : 'Error'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">WebSocket</span>
                                        <span className="text-emerald-600 font-bold">Stable</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 dark:border-gray-700 mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">CPU Load</p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-lg font-black text-gray-700 dark:text-gray-300">
                                                    {health ? (health.cpu === -1 ? 'N/A' : health.cpu + '%') : '--'}
                                                </span>
                                                <Cpu className="w-3 h-3 text-indigo-500 mb-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">RAM Used</p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-lg font-black text-gray-700 dark:text-gray-300">
                                                    {health ? health.memory.percentage + '%' : '--'}
                                                </span>
                                                <Server className="w-3 h-3 text-violet-500 mb-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Global Broadcast Widget */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Megaphone className="w-5 h-5 text-indigo-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">Global Announcement</h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Kirim pesan ke seluruh siswa di semua sesi aktif sekaligus.
                                </p>
                                <form onSubmit={handleGlobalBroadcast} className="space-y-3">
                                    <textarea
                                        value={globalMessage}
                                        onChange={(e) => setGlobalMessage(e.target.value)}
                                        placeholder="Tulis pengumuman global..."
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={isGlobalSending || !globalMessage.trim()}
                                        className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isGlobalSending ? 'Mengirim...' : 'Broadcast ke Semua'}
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            {/* Quick Active Sessions List */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-6">
                                    <PlayCircle className="w-5 h-5 text-indigo-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">Running Sessions</h4>
                                </div>
                                <div className="space-y-3">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">{session.name}</h5>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-3">{session.exam.title}</p>
                                            <Link
                                                href={route('proktor.sessions.monitor', session.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                            >
                                                Monitor Live
                                                <TrendingUp className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ))}
                                    {activeSessions.length === 0 && (
                                        <div className="py-8 text-center text-gray-400">
                                            <p className="text-xs italic">Tidak ada sesi aktif saat ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
