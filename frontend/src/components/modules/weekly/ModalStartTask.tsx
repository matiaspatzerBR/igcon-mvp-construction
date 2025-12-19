import { useState, useEffect } from 'react';
import { TriangleAlert, Play, X, Ban, CheckSquare, Square, Info } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { supabase } from '../../../lib/supabase';
import type { Task } from '../../../types';

interface Props {
    task: Task;
    onClose: () => void;
}

interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export const ModalStartTask = ({ task, onClose }: Props) => {
    const { templates, tasks, updateTaskStatus, reportIssue } = useStore();
    const [mode, setMode] = useState<'checklist' | 'issue'>('checklist');
    const [selectedIssue, setSelectedIssue] = useState('');

    // Unified Checklist State
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [manualAck, setManualAck] = useState(false);
    const [loading, setLoading] = useState(true);

    const template = templates.find(t => t.id === task.template_id);
    const activityName = template?.name.replace(/^\d+\.\s*/, '') || '';

    // Predecessor Check
    const predecessorId = template?.predecessor_id;
    const predecessorTask = predecessorId
        ? tasks.find(t => t.zone_id === task.zone_id && t.template_id === predecessorId)
        : null;
    const isBlocked = predecessorTask && predecessorTask.status !== 'approved' && !task.manual_release;

    useEffect(() => {
        const fetchChecklist = async () => {
            if (!activityName) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('checklist_templates')
                    .select('id, item_text')
                    .eq('activity_type', activityName);

                if (error) throw error;

                if (data && data.length > 0) {
                    const items = data.map(d => ({
                        id: d.id,
                        text: d.item_text,
                        checked: false
                    }));
                    setChecklistItems(items);
                }
            } catch (err) {
                console.error('Error fetching checklist:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChecklist();
    }, [activityName]);

    const handleToggleItem = (id: string) => {
        setChecklistItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const hasNoKit = checklistItems.length === 0;
    const allItemsChecked = hasNoKit ? manualAck : (checklistItems.length > 0 && checklistItems.every(item => item.checked));

    const handleStart = async () => {
        if (isBlocked || !allItemsChecked) return;

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
                {/* Header */}
                <div className="bg-white border-b p-5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode === 'checklist' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                            {mode === 'checklist' ? <Play fill="currentColor" size={24} /> : <TriangleAlert size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                                {mode === 'checklist' ? 'Kit Básico de Início' : 'Reportar Problema'}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {activityName || 'Tarefa'} • {task.id.split('_').pop()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto grow bg-gray-50/30">
                    {mode === 'checklist' ? (
                        <div className="space-y-6">
                            {/* Predecessor Alert */}
                            {isBlocked && (
                                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl flex gap-4 items-start shadow-sm shadow-red-100">
                                    <TriangleAlert className="text-red-600 shrink-0 mt-0.5" size={22} />
                                    <div>
                                        <h4 className="font-bold text-red-900 leading-tight">Bloqueio Ativo</h4>
                                        <p className="text-red-800 text-xs mt-1 leading-relaxed opacity-90">
                                            A etapa anterior no sistema não foi aprovada pelo Engenheiro. Início não permitido.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {task.manual_release && !isBlocked && predecessorTask && predecessorTask.status !== 'approved' && (
                                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl flex gap-4 items-start shadow-sm shadow-green-100">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                        <Info size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-900 leading-tight">Liberação Extraordinária</h4>
                                        <p className="text-green-800 text-xs mt-1 leading-relaxed opacity-90">
                                            O Engenheiro autorizou o início desta tarefa mesmo com pendências na etapa anterior.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-tight flex items-center gap-2">
                                        <CheckSquare size={16} className="text-blue-600" />
                                        Checklist de Qualidade Padrão
                                    </h4>
                                    {!hasNoKit && (
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {checklistItems.filter(i => i.checked).length}/{checklistItems.length} CONCLUÍDOS
                                        </span>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
                                        <span className="text-sm text-gray-400 font-medium">Buscando padrão...</span>
                                    </div>
                                ) : hasNoKit ? (
                                    <div className="bg-yellow-50 border border-yellow-400 p-5 rounded-xl shadow-sm space-y-4">
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                                <TriangleAlert size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-yellow-800 text-sm leading-tight">Kit Básico Não Definido</h5>
                                                <p className="text-yellow-700 text-xs mt-1 leading-relaxed">
                                                    Atenção: Não há Kit Básico configurado para esta atividade pelo Engenheiro.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-3 p-3 bg-white/50 rounded-lg cursor-pointer border border-yellow-200 hover:border-yellow-400 transition-all shadow-sm">
                                            <button
                                                onClick={() => setManualAck(!manualAck)}
                                                className={`shrink-0 transition-transform active:scale-90 ${manualAck ? 'text-yellow-600' : 'text-gray-300'}`}
                                            >
                                                {manualAck ? <CheckSquare size={24} /> : <Square size={24} />}
                                            </button>
                                            <span className="text-[11px] font-medium text-yellow-900 leading-tight">
                                                Declaro que verifiquei manualmente todas as condições de segurança e qualidade necessárias para o início.
                                            </span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {checklistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${item.checked
                                                    ? 'bg-blue-50/50 border-blue-200 shadow-inner'
                                                    : 'bg-white border-gray-200 group shadow-sm'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => handleToggleItem(item.id)}
                                                    className={`shrink-0 transition-transform active:scale-90 ${item.checked ? 'text-blue-600' : 'text-gray-300'}`}
                                                >
                                                    {item.checked ? <CheckSquare size={24} /> : <Square size={24} />}
                                                </button>

                                                <span className={`flex-1 text-sm transition-all ${item.checked ? 'text-blue-900 font-medium opacity-60' : 'text-gray-700 font-medium'
                                                    }`}>
                                                    {item.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                                <Info className="text-red-500 shrink-0" size={18} />
                                <p className="text-sm text-red-800 font-medium">
                                    Por que o serviço não pode ser iniciado hoje?
                                </p>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { id: 'ant', label: 'Etapa anterior pendente', desc: 'A zona ainda não está pronta para esta atividade' },
                                    { id: 'qual', label: 'Problema de qualidade', desc: 'Existem defeitos na base que impedem o início' },
                                    { id: 'mat', label: 'Falta de Kit Básico', desc: 'Material, ferramentas ou equipe incompleta' }
                                ].map((issue) => (
                                    <label
                                        key={issue.id}
                                        className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all ${selectedIssue === issue.label
                                            ? 'bg-red-50 border-red-200 ring-2 ring-red-100 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-red-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="issue"
                                            value={issue.label}
                                            checked={selectedIssue === issue.label}
                                            className="mt-1 text-red-600 focus:ring-red-500 h-4 w-4"
                                            onChange={(e) => setSelectedIssue(e.target.value)}
                                        />
                                        <div>
                                            <strong className="text-sm text-gray-900 block">{issue.label}</strong>
                                            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{issue.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-white border-t flex items-center justify-between shrink-0">
                    {mode === 'checklist' ? (
                        <>
                            <button
                                onClick={() => setMode('issue')}
                                className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <TriangleAlert size={18} /> Registrar Impedimento
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleStart}
                                    disabled={isBlocked || !allItemsChecked || loading}
                                    className={`px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${isBlocked || !allItemsChecked || loading
                                        ? 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed border border-gray-200'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 active:translate-y-0 shadow-blue-200'
                                        }`}
                                >
                                    {isBlocked ? <Ban size={18} /> : <Play fill="currentColor" size={18} />}
                                    {isBlocked ? 'Início Bloqueado' : 'Confirmar Início'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setMode('checklist')}
                                className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!selectedIssue}
                                className="px-10 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-100 transition-all active:scale-95"
                            >
                                <Ban size={18} /> Confirmar Impedimento
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
