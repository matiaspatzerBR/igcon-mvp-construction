import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import type { Task } from '../../../types';
import { CheckCircle, XCircle } from 'lucide-react';

export const InternQC = () => {
    const { tasks, zones, templates, approveTask, rejectTask } = useStore();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    const reviewTasks = tasks.filter(t => t.status === 'ready_for_review');

    const handleApprove = (task: Task) => {
        if (confirm('Aprovar esta tarefa? Ela será marcada como Verde/Concluída.')) {
            approveTask(task.id);
        }
    };

    const handleRejectClick = (task: Task) => {
        setRejectingId(task.id);
        setReason('');
    };

    const confirmReject = () => {
        if (!rejectingId) return;
        if (!reason.trim()) {
            alert('Por favor, informe o motivo da reprovação.');
            return;
        }
        rejectTask(rejectingId, reason);
        setRejectingId(null);
    };

    const getMeta = (task: Task) => {
        const zone = zones.find(z => z.id === task.zone_id)?.name || 'Unidade Desconhecida';
        const template = templates.find(t => t.id === task.template_id);
        return { zone, activity: template?.name };
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Controle de Qualidade (Ficha de Verificação)
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Visão Estagiário</span>
                </h2>
                <p className="text-sm text-gray-500">Valide as tarefas marcadas como 'Pronto'. Aprove ou Rejeite com feedback.</p>
            </header>

            <div className="grid gap-4">
                {reviewTasks.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-white rounded-lg shadow-sm">
                        <CheckCircle size={48} className="mx-auto mb-2 text-gray-200" />
                        <p>Tudo limpo! Nenhuma tarefa aguardando revisão.</p>
                    </div>
                )}

                {reviewTasks.map(task => {
                    const { zone, activity } = getMeta(task);
                    const isRejectingThis = rejectingId === task.id;

                    return (
                        <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-yellow-400 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{zone}</div>
                                <h3 className="text-lg font-semibold text-gray-800">{activity}</h3>
                                <p className="text-sm text-gray-500">Enviado pelo Mestre</p>
                            </div>

                            {!isRejectingThis ? (
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleRejectClick(task)}
                                        className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-700 rounded hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <XCircle size={18} /> Reprovar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(task)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                                    >
                                        <CheckCircle size={18} /> Aprovar
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full md:w-1/2 p-3 bg-red-50 rounded border border-red-100">
                                    <textarea
                                        className="w-full text-sm p-2 border rounded mb-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="Motivo da reprovação (ex: Desnível, Sujeira...)"
                                        autoFocus
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        rows={2}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setRejectingId(null)}
                                            className="text-xs text-gray-600 hover:underline px-2"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmReject}
                                            className="bg-red-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-red-700"
                                        >
                                            Confirmar Reprovação
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
