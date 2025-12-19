import { useState } from 'react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import { ModalTaskDecision } from '../components/modules/matrix/ModalTaskDecision';
import { ModalTaskHistory } from '../components/modules/matrix/ModalTaskHistory';
import { ShieldCheck } from 'lucide-react';

export const MatrixPage = () => {
    const { tasks, zones, templates, currentUser } = useStore();
    const [decisionTask, setDecisionTask] = useState<{ id: string, zoneName: string, activityName: string } | null>(null);
    const [historyTask, setHistoryTask] = useState<{ id: string, zoneName: string, activityName: string } | null>(null);

    const isEngineer = currentUser?.role === 'engenheiro';

    // Color Map for Status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-200 text-gray-400';
            case 'in_progress': return 'bg-blue-500 text-white';
            case 'ready_for_review': return 'bg-yellow-400 text-yellow-900 font-medium';
            case 'approved': return 'bg-green-500 text-white font-bold';
            case 'rejected': return 'bg-orange-500 text-white font-bold';
            case 'issue': return 'bg-red-600 text-white font-bold animate-pulse'; // RED FLAG
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-20">
            {decisionTask && (
                <ModalTaskDecision
                    taskId={decisionTask.id}
                    zoneName={decisionTask.zoneName}
                    activityName={decisionTask.activityName}
                    onClose={() => setDecisionTask(null)}
                />
            )}
            {historyTask && (
                <ModalTaskHistory
                    taskId={historyTask.id}
                    zoneName={historyTask.zoneName}
                    activityName={historyTask.activityName}
                    onClose={() => setHistoryTask(null)}
                />
            )}
            <header className="flex justify-between items-end border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-800">Matriz de Acabamentos (Balanço Físico)</h2>
                <p className="text-gray-500">Visualização em tempo real do progresso físico por unidade.</p>
            </header>

            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white p-4">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 text-left border-b-2 font-bold text-gray-700 bg-gray-50 sticky left-0 z-10 w-32">
                                Unidade
                            </th>
                            {templates.map(t => (
                                <th key={t.id} className="p-3 border-b-2 text-sm font-semibold text-gray-600 min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span>{t.name}</span>
                                        <span className="text-[10px] text-gray-400 font-normal">Seq: {t.sequence_order}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map(zone => (
                            <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 border-b font-medium text-gray-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {zone.name}
                                </td>
                                {templates.map(template => {
                                    const task = tasks.find(t => t.zone_id === zone.id && t.template_id === template.id);
                                    if (!task) return <td key={template.id} className="border-b bg-gray-50"></td>;

                                    return (
                                        <td
                                            key={template.id}
                                            className={clsx(
                                                "p-1 border-b text-center",
                                                isEngineer && "cursor-pointer hover:bg-gray-100 transition-colors"
                                            )}
                                            onClick={() => {
                                                if (!isEngineer) return;

                                                // Split Logic: Blocked/Issue -> Decision. OK/Plain -> History.
                                                const template = templates.find(tpl => tpl.id === task.template_id);
                                                const predecessorId = template?.predecessor_id;
                                                const predecessorTask = predecessorId ? tasks.find(t => t.zone_id === zone.id && t.template_id === predecessorId) : null;
                                                const isBlocked = predecessorTask && predecessorTask.status !== 'approved';

                                                const payload = {
                                                    id: task.id,
                                                    zoneName: zone.name,
                                                    activityName: template?.name || ''
                                                };

                                                if (task.status === 'issue' || task.status === 'rejected' || (isBlocked && !task.manual_release)) {
                                                    setDecisionTask(payload);
                                                } else {
                                                    setHistoryTask(payload);
                                                }
                                            }}
                                        >
                                            <div
                                                className={clsx(
                                                    "w-full h-10 rounded flex items-center justify-center text-xs shadow-sm transition-all relative overflow-hidden",
                                                    getStatusColor(task.status),
                                                    task.manual_release && "ring-2 ring-green-500 ring-offset-1"
                                                )}
                                                title={`Status: ${task.status}${task.manual_release ? ' (LIBERADO)' : ''}`}
                                            >
                                                {task.manual_release && (
                                                    <div className="absolute top-0 right-0 p-0.5 bg-green-500 text-white rounded-bl shadow-sm z-20">
                                                        <ShieldCheck size={8} />
                                                    </div>
                                                )}
                                                {task.status === 'pending' ? '-' :
                                                    task.status === 'in_progress' ? 'Exec.' :
                                                        task.status === 'ready_for_review' ? 'Qualid.' :
                                                            task.status === 'approved' ? 'OK' :
                                                                task.status === 'issue' ? 'IMPED.' : '!'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-4 mt-2 text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm w-fit">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200"></div> Pendente</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500"></div> Em Execução</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-400"></div> Inspeção</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div> Concluído</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-500"></div> Reprovado</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-600"></div> Impedimento</div>
            </div>
        </div>
    );
};
