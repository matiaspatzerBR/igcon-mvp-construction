import { useState } from 'react';
import { TriangleAlert, Play, X, Ban } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import type { Task } from '../../../types';

interface Props {
    task: Task;
    onClose: () => void;
}

export const ModalStartTask = ({ task, onClose }: Props) => {
    const { templates, updateTaskStatus, reportIssue } = useStore();
    const [mode, setMode] = useState<'checklist' | 'issue'>('checklist');
    const [selectedIssue, setSelectedIssue] = useState('');

    const template = templates.find(t => t.id === task.template_id);
    const checklistText = template?.checklist_guide || "Nenhuma instrução específica.";

    const handleStart = async () => {
        // Attempt to start
        const success = await updateTaskStatus(task.id, 'in_progress');
        if (success) {
            onClose();
        }
    };

    const handleReport = () => {
        if (!selectedIssue) return;
        reportIssue(task.id, selectedIssue);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">
                        {mode === 'checklist' ? 'Iniciar Atividade' : 'Reportar Impedimento'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {mode === 'checklist' ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <h4 className="font-bold text-blue-800 text-sm mb-1">Checklist de Início</h4>
                                <p className="text-blue-900 text-sm italic">{checklistText}</p>
                            </div>

                            <p className="text-sm text-gray-600">
                                Ao iniciar, você confirma que o local está liberado e os materiais estão disponíveis.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-100 p-4 rounded text-sm space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="issue"
                                        value="Atividade anterior não concluída"
                                        className="mt-1"
                                        onChange={(e) => setSelectedIssue(e.target.value)}
                                    />
                                    <span>
                                        <strong>Atividade anterior não concluída</strong><br />
                                        <span className="text-gray-500 text-xs">Bloqueio físico real vs Sistema</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="issue"
                                        value="Problema de qualidade anterior"
                                        className="mt-1"
                                        onChange={(e) => setSelectedIssue(e.target.value)}
                                    />
                                    <span>
                                        <strong>Problema de qualidade anterior</strong><br />
                                        <span className="text-gray-500 text-xs">Serviço anterior mal feito/danificado</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="issue"
                                        value="Falta de material/equipamento"
                                        className="mt-1"
                                        onChange={(e) => setSelectedIssue(e.target.value)}
                                    />
                                    <span>
                                        <strong>Falta de material/equipamento</strong><br />
                                        <span className="text-gray-500 text-xs">Kit de trabalho incompleto</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    {mode === 'checklist' ? (
                        <>
                            <button
                                onClick={() => setMode('issue')}
                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded text-sm font-semibold flex items-center gap-2"
                            >
                                <TriangleAlert size={16} /> Reportar Problema
                            </button>
                            <button
                                onClick={handleStart}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold flex items-center gap-2 shadow-sm"
                            >
                                <Play size={16} /> Iniciar Execução
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setMode('checklist')}
                                className="mr-auto text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!selectedIssue}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm font-bold flex items-center gap-2 shadow-sm"
                            >
                                <Ban size={16} /> Confirmar Impedimento
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
