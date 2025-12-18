import { useStore } from '../../../store/useStore';
import { Calendar, Ban, CheckCircle, RotateCcw } from 'lucide-react';

export const EngineerPlanning = () => {
    const { tasks, zones, templates, profiles, resolveIssue, assignTask } = useStore();

    // Stats
    const totalPending = tasks.filter(t => t.status === 'pending').length;
    const totalIssues = tasks.filter(t => t.status === 'issue').length;

    // Filter foreman profiles
    const foremen = profiles.filter(p => p.role === 'mestre');

    // Show Issues First, then Pending
    const planTasks = tasks
        .filter(t => ['pending', 'issue'].includes(t.status))
        .sort((a, _b) => (a.status === 'issue' ? -1 : 1)) // Issues first
        .slice(0, 15); // Show top 15

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Planejamento Semanal
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Visão do Engenheiro</span>
                    </h2>
                    <p className="text-sm text-gray-500">Gerenciar impedimentos e alocações de equipe.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{totalIssues}</div>
                        <div className="text-xs text-gray-500 uppercase">Impedimentos</div>
                    </div>
                    <div className="text-right border-l pl-4">
                        <div className="text-2xl font-bold text-gray-800">{totalPending}</div>
                        <div className="text-xs text-gray-500 uppercase">Pendentes</div>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar size={18} /> Plano da Semana Atual
                    </h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Publicar Plano
                    </button>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b text-gray-500 bg-gray-50/50">
                            <th className="p-3 font-medium">Unidade</th>
                            <th className="p-3 font-medium">Atividade</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Impedimento / Ação</th>
                            <th className="p-3 font-medium text-right">Equipe (Mestre)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planTasks.map(task => {
                            const zone = zones.find(z => z.id === task.zone_id);
                            const tpl = templates.find(t => t.id === task.template_id);
                            const isIssue = task.status === 'issue';

                            return (
                                <tr key={task.id} className={`border-b last:border-0 hover:bg-gray-50 ${isIssue ? 'bg-red-50' : ''}`}>
                                    <td className="p-3 font-bold text-gray-700">{zone?.name}</td>
                                    <td className="p-3">
                                        {tpl?.name}
                                        {tpl?.predecessor_id && <div className="text-[10px] text-gray-400">Pred: Sim</div>}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs lowercase font-bold ${isIssue ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {task.status === 'issue' ? 'IMPEDIMENTO' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="p-3 min-w-[250px]">
                                        {isIssue ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 text-red-700 text-xs font-bold">
                                                    <Ban size={12} /> {task.issue_reason}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => resolveIssue(task.id, 'approve')}
                                                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200 hover:bg-green-200 flex items-center gap-1"
                                                    >
                                                        <CheckCircle size={10} /> Liberar
                                                    </button>
                                                    <button
                                                        onClick={() => resolveIssue(task.id, 'reprogram')}
                                                        className="px-2 py-1 bg-white text-gray-600 text-xs rounded border hover:bg-gray-100 flex items-center gap-1"
                                                    >
                                                        <RotateCcw size={10} /> Reprogramar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <select
                                            className="border rounded px-2 py-1 text-xs bg-white cursor-pointer"
                                            value={task.assigned_user_id || ''}
                                            onChange={(e) => assignTask(task.id, e.target.value)}
                                        >
                                            <option value="">-- Selecionar --</option>
                                            {foremen.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
