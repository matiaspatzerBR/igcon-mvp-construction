import { AlertTriangle, CheckCircle2, RefreshCcw, X, Info } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ModalConfirm } from '../../ui/ModalConfirm';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    taskId: string;
    zoneName: string;
    activityName: string;
    onClose: () => void;
}

export const ModalTaskDecision = ({ taskId, zoneName, activityName, onClose }: Props) => {
    const { forceReleaseTask, cascadeRescheduleTask, tasks } = useStore();
    const [showConfirmCascade, setShowConfirmCascade] = useState(false);
    const task = tasks.find(t => t.id === taskId);

    if (!task) return null;

    const handleForceRelease = () => {
        forceReleaseTask(taskId);
        onClose();
    };

    const handleCascadeReschedule = () => {
        cascadeRescheduleTask(taskId);
        setShowConfirmCascade(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Info size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-xl leading-none">Gestão Avançada</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                {zoneName} • {activityName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 gap-6">
                    {/* Option A: Force Release */}
                    <button
                        onClick={handleForceRelease}
                        disabled={task.manual_release}
                        className={cn(
                            "group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                            task.manual_release
                                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60"
                                : "bg-green-50/30 border-green-100 hover:border-green-500 hover:shadow-xl hover:shadow-green-100 active:scale-95"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            task.manual_release ? "bg-gray-200 text-gray-400" : "bg-green-100 text-green-600 group-hover:scale-110 transition-transform"
                        )}>
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="block font-black text-gray-900 text-base">Liberar Tarea Manualmente</span>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Autoriza a execução imediata pelo mestre, ignorando bloqueios de sequência (predecessores pendentes).
                            </p>
                            {task.manual_release && (
                                <span className="inline-block mt-2 text-[10px] font-black uppercase text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    Já Liberado
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Option B: Cascade Reschedule */}
                    <button
                        onClick={() => setShowConfirmCascade(true)}
                        className="group flex items-start gap-4 p-5 rounded-2xl border-2 bg-orange-50/30 border-orange-100 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 active:scale-95 transition-all text-left"
                    >
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-180 transition-transform duration-500">
                            <RefreshCcw size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="block font-black text-gray-900 text-base">Reprogramar en Cascada</span>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Retira esta tarefa e **todas as seguintes** desta unidade do cronograma semanal, enviando-as de volta ao backlog.
                            </p>
                        </div>
                        <AlertTriangle size={18} className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-black text-gray-500 hover:bg-gray-200 rounded-xl transition-all uppercase tracking-widest"
                    >
                        FECHAR
                    </button>
                </div>
            </div>

            <ModalConfirm
                isOpen={showConfirmCascade}
                onClose={() => setShowConfirmCascade(false)}
                onConfirm={handleCascadeReschedule}
                title="Reprogramar em Cascada?"
                message={`Isso enviará a tarefa "${activityName}" e TODAS as tarefas posteriores desta unidade de volta para o backlog. Esta ação não pode ser desfeita facilmente.`}
                confirmLabel="Reprogramar"
                variant="danger"
            />
        </div>
    );
};
