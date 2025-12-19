import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import type { ChecklistTemplate } from '../../../types';

interface Props {
    activityName: string;
    onClose: () => void;
}

export const ModalEditKit = ({ activityName, onClose }: Props) => {
    const [items, setItems] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('checklist_templates')
                    .select('*')
                    .eq('activity_type', activityName)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setItems(data || []);
            } catch (err) {
                console.error('Error fetching kit:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [activityName]);

    const handleAddItem = () => {
        const newItem: Partial<ChecklistTemplate> = {
            id: `temp-${Date.now()}`,
            activity_type: activityName,
            item_text: '',
            is_mandatory: true
        };
        setItems(prev => [...prev, newItem as ChecklistTemplate]);
    };

    const handleUpdateItem = (id: string, text: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, item_text: text } : item
        ));
    };

    const handleRemoveItem = async (id: string) => {
        if (!id.startsWith('temp-')) {
            try {
                const { error } = await supabase
                    .from('checklist_templates')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error('Error deleting item:', err);
                return;
            }
        }
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Separate new items from existing ones
            const newItems = items.filter(item => item.id.startsWith('temp-')).map(item => ({
                activity_type: item.activity_type,
                item_text: item.item_text,
                is_mandatory: item.is_mandatory
            }));

            const existingItems = items.filter(item => !item.id.startsWith('temp-'));

            // Upsert existing items
            if (existingItems.length > 0) {
                const { error: upsertError } = await supabase
                    .from('checklist_templates')
                    .upsert(existingItems);
                if (upsertError) throw upsertError;
            }

            // Insert new items
            if (newItems.length > 0) {
                const { error: insertError } = await supabase
                    .from('checklist_templates')
                    .insert(newItems);
                if (insertError) throw insertError;
            }

            toast.success('Kit Básico atualizado com sucesso!');
            onClose();
        } catch (err) {
            console.error('Error saving kit:', err);
            toast.error('Erro ao salvar kit. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
                {/* Header */}
                <div className="bg-white border-b p-5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Configurar Kit Básico</h3>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Atividade: {activityName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto grow bg-gray-50/30">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Defina os itens obrigatórios que o mestre deve verificar antes de iniciar este serviço.
                            As mudanças aqui afetarão todas as tarefas futuras e atuais deste tipo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-orange-600" size={32} />
                            <span className="text-sm text-gray-400 font-medium">Carregando itens...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm group hover:border-orange-200 transition-all"
                                    >
                                        <input
                                            type="text"
                                            value={item.item_text}
                                            onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                                            placeholder="Ex: Verificar prumo das paredes"
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 text-gray-700"
                                        />
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Excluir item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">Nenhum item definido para este kit.</p>
                                </div>
                            )}

                            <button
                                onClick={handleAddItem}
                                className="w-full py-3 border-2 border-dashed border-orange-200 rounded-xl text-orange-600 hover:bg-orange-50 transition-all text-sm font-bold flex items-center justify-center gap-2 mt-4"
                            >
                                <Plus size={18} />
                                Adicionar Novo Item ao Padrão
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-white border-t flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar Padrão Global
                    </button>
                </div>
            </div>
        </div>
    );
};
