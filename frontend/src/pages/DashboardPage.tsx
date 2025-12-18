import { useStore } from '../store/useStore';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']; // Red, Amber, Blue, Green

export const DashboardPage = () => {
    const { tasks, zones } = useStore();

    // --- METRIC 1: PPC HISTORY (Mocked with Logic) ---
    // In a real app, this would query backend history.
    // We simulate a trend: 60 -> 72 -> 85 -> Current
    const approvedCount = tasks.filter(t => t.status === 'approved').length;
    const totalCount = tasks.length;
    // Current PPC calculation (Simulated Plan = 50% of Total)
    const currentPPC = totalCount > 0 ? Math.round((approvedCount / (totalCount * 0.5)) * 100) : 0;

    const ppcData = [
        { name: 'Semana 1', ppc: 62 },
        { name: 'Semana 2', ppc: 74 },
        { name: 'Semana 3', ppc: 58 },
        { name: 'Semana 4', ppc: 82 },
        { name: 'Atual', ppc: currentPPC > 100 ? 100 : currentPPC },
    ];

    // --- METRIC 2: ISSUES (Pareto) ---
    const issues = tasks.filter(t => t.issue_reason);
    const issueCounts: Record<string, number> = {};
    issues.forEach(t => {
        const reason = t.issue_reason || 'Outros';
        issueCounts[reason] = (issueCounts[reason] || 0) + 1;
    });

    const issueData = Object.keys(issueCounts).map(reason => ({
        name: reason,
        value: issueCounts[reason]
    })).sort((a, b) => b.value - a.value); // Sort Descending

    const totalIssues = issues.length;

    // --- METRIC 3: PHYSICAL PROGRESS (Stacked) ---
    // Group by Zone Floor/Block (Simplified: Just show top 10 Zones)
    const activeZones = zones.slice(0, 10);
    const progressData = activeZones.map(z => {
        const zoneTasks = tasks.filter(t => t.zone_id === z.id);
        const done = zoneTasks.filter(t => t.status === 'approved').length;
        const total = zoneTasks.length;
        const planned = Math.round(total * 0.8); // Simulate that 80% was planned to be done by now

        return {
            name: z.name,
            Executado: done,
            Planejado: planned,
            Total: total
        };
    });

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
            <header>
                <h2 className="text-2xl font-bold text-gray-800">Painéis de Gestão (KPIs)</h2>
                <p className="text-gray-500">Indicadores de desempenho, qualidade e produção.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
                    <div className="text-gray-500 text-sm font-medium uppercase">PPC Médio (5 Sem)</div>
                    <div className="text-3xl font-bold text-gray-800">75%</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500">
                    <div className="text-gray-500 text-sm font-medium uppercase">Atividades Concluídas</div>
                    <div className="text-3xl font-bold text-gray-800">{approvedCount}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-red-500">
                    <div className="text-gray-500 text-sm font-medium uppercase">Total de Bloqueios</div>
                    <div className="text-3xl font-bold text-red-600">{totalIssues}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-yellow-500">
                    <div className="text-gray-500 text-sm font-medium uppercase">Inspeções Pendentes</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {tasks.filter(t => t.status === 'ready_for_review').length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: PPC */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        📊 Confiabilidade do Planejamento (PPC)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={ppcData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ppc" name="PPC %" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="ppc" stroke="#1d4ed8" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Issues Pareto */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🚫 Causas de Não Cumprimento (Pareto)
                    </h3>
                    {issueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={issueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {issueData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                            Nenhum impedimento registrado ainda.
                        </div>
                    )}
                </div>
            </div>

            {/* Chart 3: Physical Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🏗️ Progresso Físico (Executado vs Planejado)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={progressData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Planejado" stackId="a" fill="#e5e7eb" name="Meta Planejada" />
                        <Bar dataKey="Executado" stackId="a" fill="#10b981" name="Executado Real" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
