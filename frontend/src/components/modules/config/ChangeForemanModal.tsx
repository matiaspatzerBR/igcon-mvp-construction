import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { User, X, CheckSquare, Square, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    zoneId: string;
    zoneName: string;
    onClose: () => void;
}

export const ChangeForemanModal = ({ zoneId, zoneName, onClose }: Props) => {
    const { profiles, zones, updateZoneResponsibility } = useStore();
    const zone = zones.find(z => z.id === zoneId);

    const [selectedForeman, setSelectedForeman] = useState(zone?.responsible_foreman_id || '');
    const [updateBacklog, setUpdateBacklog] = useState(true);

    const foremen = profiles.filter(p => p.role === 'mestre');

    const handleSave = () => {
        if (!selectedForeman) {
            toast.error("Selecione um mestre responsável.");
            return;
        }
        updateZoneResponsibility(zoneId, selectedForeman, updateBacklog);
        toast.success(`Responsável por ${zoneName} atualizado!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Trocar Responsável</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{zoneName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Novo Mestre Responsável</label>
                        <select
                            className="w-full border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                            value={selectedForeman}
                            onChange={(e) => setSelectedForeman(e.target.value)}
                        >
                            <option value="">-- Selecionar Mestre --</option>
                            {foremen.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <button
                                onClick={() => setUpdateBacklog(!updateBacklog)}
                                className={cn(
                                    "mt-0.5 shrink-0 transition-all",
                                    updateBacklog ? "text-orange-600" : "text-gray-300 group-hover:text-orange-300"
                                )}
                            >
                                {updateBacklog ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>
                            <div className="flex-1 select-none">
                                <span className="text-sm font-bold text-orange-900 block">Atualizar Backlog</span>
                                <p className="text-[11px] text-orange-700 leading-tight">
                                    Também trocar o responsável em todas as tarefas **pendentes** desta unidade na matriz?
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="p-5 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        <Save size={18} /> Salvar Alteração
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal utility for consistency
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
