import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import type { Task } from '../../../types';
import { BadgeCheck, PlayCircle, AlertCircle, Ban, ShieldCheck } from 'lucide-react';
import { ModalStartTask } from './ModalStartTask';
import { ModalConfirm } from '../../ui/ModalConfirm';
import { toast } from 'sonner';

const KanbanColumn = ({
    title,
    tasks,
    color,
    onAction,
    actionLabel
}: {
    title: string,
    tasks: Task[],
    color: string,
    onAction?: (task: Task) => void,
    actionLabel?: string
}) => {
    const { zones, templates } = useStore();

    const getMeta = (task: Task) => {
        const zone = zones.find(z => z.id === task.zone_id)?.name || 'Unidade Desconhecida';
        const template = templates.find(t => t.id === task.template_id);
        return { zone, activity: template?.name };
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 rounded-lg p-3 min-w-[300px] border-t-4 ${color}`}>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                {title}
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{tasks.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                {tasks.map(task => {
                    const { zone, activity } = getMeta(task);
                    const isIssue = task.status === 'issue';

                    return (
                        <div key={task.id} className={`p-3 rounded shadow-sm border flex flex-col gap-2 relative ${isIssue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>

                            {task.status === 'rejected' && (
                                <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 px-2 py-1 text-[10px] uppercase font-bold rounded-bl">
                                    Reprovado
                                </div>
                            )}
                            {isIssue && !task.manual_release && (
                                <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-2 py-1 text-[10px] uppercase font-bold rounded-bl flex items-center gap-1">
                                    <Ban size={10} /> Impedimento
                                </div>
                            )}
                            {task.manual_release && (
                                <div className="absolute top-0 right-0 bg-green-100 text-green-700 px-2 py-1 text-[10px] uppercase font-black rounded-bl flex items-center gap-1 border-b border-l border-green-200 shadow-sm z-30">
                                    <ShieldCheck size={10} /> Liberado por Ing.
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{zone}</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 text-sm">{activity}</h4>

                            {/* Feedback (Review Rejection) */}
                            {task.feedback && task.status === 'rejected' && (
                                <div className="bg-orange-50 border border-orange-100 p-2 rounded text-xs text-orange-700 flex items-start gap-1">
                                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                    {task.feedback}
                                </div>
                            )}

                            {/* Issue Reason */}
                            {task.issue_reason && (
                                <div className="bg-red-100 border border-red-200 p-2 rounded text-xs text-red-800 flex items-start gap-1 font-medium">
                                    <Ban size={12} className="mt-0.5 shrink-0" />
                                    {task.issue_reason}
                                </div>
                            )}

                            {(!isIssue || task.manual_release) && onAction && (
                                <button
                                    onClick={() => onAction(task)}
                                    className={`mt-2 w-full py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-black uppercase tracking-tight transition-all active:scale-95 shadow-sm border ${actionLabel === 'Start' && task.manual_release
                                        ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-emerald-100"
                                        : "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100"
                                        }`}
                                >
                                    {actionLabel === 'Start' ? (
                                        task.manual_release ? <ShieldCheck size={16} /> : <PlayCircle size={16} />
                                    ) : (
                                        <BadgeCheck size={16} />
                                    )}
                                    {actionLabel === 'Start' && task.manual_release ? "Iniciar (Liberado)" : actionLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const ForemanKanban = () => {
    const { tasks, updateTaskStatus, currentUser } = useStore();
    const [startModalTask, setStartModalTask] = useState<Task | null>(null);
    const [confirmFinishTask, setConfirmFinishTask] = useState<Task | null>(null);

    // Filter tasks assigned to CURRENT USER (Multi-Foreman support) AND ONLY PUBLISHED
    const myTasks = tasks.filter(t => t.assigned_user_id === currentUser?.id && t.is_published === true);

    // Columns Logic
    // To Do: Pending (Gray), Rejected (Orange), Issue (Red - showing here so they see it blocked)
    const todoTasks = myTasks.filter(t => ['pending', 'rejected', 'issue'].includes(t.status));
    const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
    const doneTasks = myTasks.filter(t => t.status === 'ready_for_review');

    const handleStartClick = (task: Task) => {
        if (task.status === 'issue' && !task.manual_release) return; // Cannot start an issue directly unless released

        if (task.manual_release) {
            updateTaskStatus(task.id, 'in_progress');
            toast.success("Tarefa iniciada com autorização especial do Engenheiro.", {
                description: "Checks e impedimentos foram ignorados por liberação manual.",
                duration: 4000
            });
            return;
        }

        setStartModalTask(task);
    };

    const handleFinishRequest = (task: Task) => {
        setConfirmFinishTask(task);
    };

    const handleFinishConfirm = () => {
        if (confirmFinishTask) {
            updateTaskStatus(confirmFinishTask.id, 'ready_for_review');
            setConfirmFinishTask(null);
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            <header className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Planejamento Semanal
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Visão do Mestre</span>
                </h2>
                <p className="text-sm text-gray-500">
                    Apenas tarefas alocadas para <strong>{currentUser?.name}</strong> são exibidas.
                </p>
            </header>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
                <KanbanColumn
                    title="A Fazer"
                    tasks={todoTasks}
                    color="border-gray-400"
                    onAction={handleStartClick}
                    actionLabel="Start"
                />
                <KanbanColumn
                    title="Em Andamento"
                    tasks={inProgressTasks}
                    color="border-blue-500"
                    onAction={handleFinishRequest}
                    actionLabel="Marcar Pronto"
                />
                <KanbanColumn
                    title="Aguardando Qualidade"
                    tasks={doneTasks}
                    color="border-yellow-400"
                />
            </div>

            {startModalTask && (
                <ModalStartTask
                    task={startModalTask}
                    onClose={() => setStartModalTask(null)}
                />
            )}

            <ModalConfirm
                isOpen={!!confirmFinishTask}
                onClose={() => setConfirmFinishTask(null)}
                onConfirm={handleFinishConfirm}
                title="Concluir Serviço"
                message="Marcar como Pronto para Inspeção? Isso notificará o engenheiro."
                confirmLabel="Confirmar"
                variant="success"
            />
        </div>
    );
};
