import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
    BarChart2,
    TrendingUp,
    AlertCircle,
    Shield,
    Trophy,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    BadgeCheck
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { startOfWeek, isBefore, startOfDay } from 'date-fns';

export const PerformancePage = () => {
    const navigate = useNavigate();
    const { currentUser, tasks } = useStore();
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Role Guard
    useEffect(() => {
        if (currentUser && currentUser.role !== 'engenheiro') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    // Auto-refresh logic (Simulated for MVP by updating a timestamp)
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 5 * 60 * 1000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    // KPIs Logic
    const stats = useMemo(() => {
        const today = startOfDay(new Date());

        // Step A: Strict Monday to Saturday range for visual PPC
        const mon = startOfWeek(today, { weekStartsOn: 1 });
        const sat = new Date(mon);
        sat.setDate(mon.getDate() + 5); // Saturday
        sat.setHours(23, 59, 59, 999);

        // Step B: Filter published tasks ONLY in this range
        const weekTasks = tasks.filter(t =>
            t.is_published &&
            t.scheduled_start_date &&
            new Date(t.scheduled_start_date) >= mon &&
            new Date(t.scheduled_start_date) <= sat
        );

        const totalTasks = weekTasks.length;

        // Step C: Calculate completed strictly from this week's subset
        // 'ready_for_review' is Done by Foreman, 'approved' is verified by Engineer
        const completedCount = weekTasks.filter(t =>
            ['ready_for_review', 'approved'].includes(t.status)
        ).length;

        // Step D: Safe Division
        const ppc = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

        // Step E: Trend Logic (Compare with S-1: 82%)
        const previousWeekPPC = 82;
        const ppcDiff = ppc - previousWeekPPC;

        // Debug Logs
        console.log("--- PPC Production Audit ---");
        console.log("Week Range (Mon-Sat):", mon.toLocaleDateString(), "to", sat.toLocaleDateString());
        console.log("Total Week Tasks (Denominator):", totalTasks);
        console.log("Done Week Tasks (Numerator):", completedCount);
        console.log("Real-time PPC:", ppc + "%");
        console.log("----------------------------");

        const delayedTasks = tasks.filter(t =>
            t.is_published &&
            t.status !== 'approved' &&
            t.scheduled_start_date &&
            isBefore(startOfDay(new Date(t.scheduled_start_date)), today)
        ).length;

        return { ppc, totalTasks, completedTasks: completedCount, delayedTasks, ppcDiff };
    }, [tasks, lastUpdated]);

    // Chart Data
    const evolutionData = [
        { week: 'S-3', ppc: 68 },
        { week: 'S-2', ppc: 74 },
        { week: 'S-1', ppc: 82 },
        { week: 'Atual', ppc: stats.ppc },
    ];

    const cncData = [
        { name: 'Mão de Obra', value: 40, color: '#3b82f6' },
        { name: 'Material', value: 30, color: '#f59e0b' },
        { name: 'Clima', value: 20, color: '#10b981' },
        { name: 'Planejamento', value: 10, color: '#ef4444' },
    ];

    const getPpcColor = (ppc: number) => {
        if (ppc >= 80) return 'text-green-500';
        if (ppc >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    if (!currentUser || currentUser.role !== 'engenheiro') return null;

    return (
        <div className="flex flex-col gap-10 p-10 bg-gray-50 min-h-screen">
            {/* TV Header */}
            <header className="flex justify-between items-center border-b-4 border-blue-900 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Painel de Controle Global
                    </h1>
                    <p className="text-xl text-gray-500 font-bold mt-2 flex items-center gap-3">
                        <Clock className="text-blue-600" />
                        Atualizado em: {lastUpdated.toLocaleTimeString('pt-BR')}
                        <span className="text-gray-300 mx-2">|</span>
                        <span className="text-blue-900 uppercase">Live BI Mode</span>
                    </p>
                </div>
                <div className="bg-blue-900 text-white px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                    <BarChart2 size={48} className="text-blue-300" />
                    <div>
                        <div className="text-sm font-black text-blue-300 uppercase tracking-widest leading-none">Status da Obra</div>
                        <div className="text-3xl font-black">OPERAÇÃO NORMAL</div>
                    </div>
                </div>
            </header>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* PPC Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[12px] border-gray-100 flex flex-col justify-between h-[320px] hover:scale-105 transition-transform duration-500 flex-1">
                    <div className="flex justify-between items-start">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                            <TrendingUp size={48} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Semana Atual</span>
                            <div className={`flex items-center gap-2 font-black ${stats.ppcDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.ppcDiff >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                <span className="text-lg">
                                    {stats.ppcDiff >= 0 ? '▲' : '▼'} {Math.abs(stats.ppcDiff)}% vs S-1
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tight">PPC Acumulado</h3>
                        <div className={`text-9xl font-black leading-none mt-2 ${getPpcColor(stats.ppc)}`}>
                            {stats.ppc}%
                        </div>
                    </div>
                </div>

                {/* Delays Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[12px] border-gray-100 flex flex-col justify-between h-[320px] hover:scale-105 transition-transform duration-500 flex-1">
                    <div className="flex justify-between items-start">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                            <AlertCircle size={48} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Alerta Crítico</span>
                            <div className="flex items-center gap-2 text-red-500 font-black">
                                <ArrowDownRight size={24} />
                                <span className="text-lg">Crítico</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tight">Atividades em Atraso</h3>
                        <div className={`text-9xl font-black leading-none mt-2 ${stats.delayedTasks > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                            {stats.delayedTasks}
                        </div>
                    </div>
                </div>

                {/* Safety Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[12px] border-emerald-100 flex flex-col justify-between h-[320px] hover:scale-105 transition-transform duration-500 flex-1">
                    <div className="flex justify-between items-start">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                            <Shield size={48} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Segurança</span>
                            <div className="flex items-center gap-2 text-emerald-500 font-black">
                                <BadgeCheck size={24} />
                                <span className="text-lg">Meta: 365</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tight">Dias Sem Acidentes</h3>
                        <div className="text-9xl font-black leading-none mt-2 text-emerald-600">
                            45
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* PPC Evolution */}
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 min-h-[500px] flex flex-col">
                    <h3 className="text-3xl font-black text-gray-900 mb-8 uppercase italic border-l-8 border-blue-600 pl-6">
                        Evolução do PPC (Últimas 4 Semanas)
                    </h3>
                    <div className="grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolutionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="week"
                                    stroke="#9ca3af"
                                    fontSize={16}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={16}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    itemStyle={{ fontWeight: '900', fontSize: '18px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ppc"
                                    stroke="#2563eb"
                                    strokeWidth={8}
                                    dot={{ r: 12, fill: '#2563eb', strokeWidth: 4, stroke: '#fff' }}
                                    activeDot={{ r: 16, fill: '#2563eb', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CNC Chart & Leaderboard */}
                <div className="flex flex-col gap-10">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="relative h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cncData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {cncData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Causas</span>
                                <span className="text-4xl font-black text-gray-900 leading-none">CNC</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-2xl font-black text-gray-900 uppercase italic">Não Cumprimento (CNC)</h3>
                            <div className="space-y-3">
                                {cncData.map(item => (
                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-bold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="font-black text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900 p-8 rounded-[3rem] shadow-2xl text-white">
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-4 italic">
                            <Trophy className="text-yellow-400" /> Ranking de Equipes (Leading PPC)
                        </h3>
                        <div className="space-y-4">
                            {[
                                { rank: '🥇', team: 'Equipe Torre 1 (Alvenaria)', ppc: '92%' },
                                { rank: '🥈', team: 'Equipe Torre 2 (Acabamentos)', ppc: '88%' },
                                { rank: '🥉', team: 'Equipe Áreas Comuns', ppc: '75%' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                                    <div className="flex items-center gap-6">
                                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{item.rank}</span>
                                        <span className="font-black text-lg tracking-tight">{item.team}</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-300">{item.ppc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
