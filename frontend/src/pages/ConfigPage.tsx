import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
    Plus, List, Grid3X3, ArrowRight, Settings2,
    Users, UserPlus, Trash2, CheckCircle2,
    Building2, LayoutDashboard, Save, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { ModalEditKit } from '../components/modules/config/ModalEditKit';
import { ChangeForemanModal } from '../components/modules/config/ChangeForemanModal';
import { DeleteSectorModal } from '../components/modules/config/DeleteSectorModal';
import { ModalEditUnit } from '../components/modules/config/ModalEditUnit';
import { ModalConfirm } from '../components/ui/ModalConfirm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const ConfigPage = () => {
    const {
        zones, templates, profiles, sectors, tasks,
        addZone, addSector, deleteSector, updateSectorName,
        addActivityTemplate, updateSectorForeman, deleteZone
    } = useStore();

    // UI States
    const [selectedActivityForKit, setSelectedActivityForKit] = useState<string | null>(null);
    const [zoneToChangeForeman, setZoneToChangeForeman] = useState<{ id: string, name: string } | null>(null);
    const [sectorToDelete, setSectorToDelete] = useState<{ id: string, name: string } | null>(null);
    const [unitToEdit, setUnitToEdit] = useState<{ id: string } | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<{ id: string, name: string } | null>(null);

    // Sector Editing States
    const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
    const [editSectorName, setEditSectorName] = useState('');

    // Form States
    const [newSectorName, setNewSectorName] = useState('');
    const [newZoneName, setNewZoneName] = useState('');
    const [selectedSectorId, setSelectedSectorId] = useState('');
    const [newActivityName, setNewActivityName] = useState('');
    const [newActivityPred, setNewActivityPred] = useState('');
    const [newActivityDuration, setNewActivityDuration] = useState(1);

    const foremen = profiles.filter(p => p.role === 'mestre');

    const handleAddSector = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectorName.trim()) return;
        addSector(newSectorName);
        setNewSectorName('');
        toast.success("Novo Setor criado!");
    };

    const handleSaveSectorName = (id: string) => {
        if (!editSectorName.trim()) return;
        updateSectorName(id, editSectorName);
        setEditingSectorId(null);
        toast.success("Nome do Setor atualizado.");
    };

    const handleAddZone = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZoneName.trim() || !selectedSectorId) {
            toast.error("Preencha o nome e selecione um setor.");
            return;
        }
        addZone(newZoneName, selectedSectorId);
        setNewZoneName('');
        toast.success('Unidade adicionada com sucesso!');
    };

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newActivityName.trim()) return;
        addActivityTemplate(newActivityName, newActivityPred || null, Number(newActivityDuration));
        setNewActivityName('');
        setNewActivityDuration(1);
        setNewActivityPred('');
        toast.success('Atividade criada! Verifique a Matriz.');
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-12">
            {/* Modals */}
            {selectedActivityForKit && (
                <ModalEditKit
                    activityName={selectedActivityForKit.replace(/^\d+\.\s*/, '')}
                    onClose={() => setSelectedActivityForKit(null)}
                />
            )}

            {zoneToChangeForeman && (
                <ChangeForemanModal
                    zoneId={zoneToChangeForeman.id}
                    zoneName={zoneToChangeForeman.name}
                    onClose={() => setZoneToChangeForeman(null)}
                />
            )}

            {sectorToDelete && (
                <DeleteSectorModal
                    isOpen={!!sectorToDelete}
                    sectorName={sectorToDelete.name}
                    onClose={() => setSectorToDelete(null)}
                    onConfirm={() => {
                        deleteSector(sectorToDelete.id);
                        toast.success(`Setor ${sectorToDelete.name} removido.`);
                    }}
                />
            )}

            {unitToEdit && (
                <ModalEditUnit
                    zoneId={unitToEdit.id}
                    onClose={() => setUnitToEdit(null)}
                />
            )}

            {unitToDelete && (
                <ModalConfirm
                    isOpen={!!unitToDelete}
                    title="Excluir Unidade"
                    message={`Tem certeza que deseja excluir a unidade '${unitToDelete.name}'? Todas as tarefas e históricos associados serão apagados permanentemente.`}
                    onConfirm={() => {
                        deleteZone(unitToDelete.id);
                        toast.success(`Unidade ${unitToDelete.name} excluída.`);
                        setUnitToDelete(null);
                    }}
                    onClose={() => setUnitToDelete(null)}
                />
            )}

            <header className="flex justify-between items-end border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings2 className="text-blue-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Sistema de Gestão</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 leading-none">Estrutura de Engenharia</h2>
                    <p className="text-gray-500 font-medium mt-2">Defina Macro-Zonas, Unidades e Padrões de Qualidade.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-gray-400 uppercase">Total Unidades</span>
                        <span className="text-2xl font-black text-gray-900">{zones.length}</span>
                    </div>
                    <div className="h-10 w-px bg-gray-200 mx-2"></div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-gray-400 uppercase">Tarefas em Matriz</span>
                        <span className="text-2xl font-black text-blue-600">{tasks.length}</span>
                    </div>
                </div>
            </header>

            {/* SECTION: MACRO ZONAS & EQUIPES */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                        <Building2 className="text-blue-600" /> Estrutura da Obra (Macro-Zonas)
                    </h3>
                    <form onSubmit={handleAddSector} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nome do Novo Setor (ex: Torre 3)"
                            className="text-xs p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white"
                            value={newSectorName}
                            onChange={(e) => setNewSectorName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newSectorName}
                            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectors.map(sector => {
                        const zoneCount = zones.filter(z => z.sector_id === sector.id).length;
                        const isEditing = editingSectorId === sector.id;

                        return (
                            <div key={sector.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-5 flex flex-col gap-4 relative group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="flex gap-1 items-center">
                                                <input
                                                    autoFocus
                                                    className="font-black text-lg text-gray-900 border-b border-blue-500 outline-none w-full"
                                                    value={editSectorName}
                                                    onChange={(e) => setEditSectorName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSectorName(sector.id)}
                                                />
                                                <button onClick={() => handleSaveSectorName(sector.id)} className="text-green-600 p-1">
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <h4
                                                className="font-black text-lg text-gray-900 leading-tight flex items-center gap-2 cursor-pointer hover:text-blue-600"
                                                onClick={() => {
                                                    setEditingSectorId(sector.id);
                                                    setEditSectorName(sector.name);
                                                }}
                                            >
                                                {sector.name}
                                                <Settings2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h4>
                                        )}
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                {zoneCount} Unidades
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSectorToDelete({ id: sector.id, name: sector.name })}
                                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Users size={10} /> Mestre Responsável Padrão
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 border-none font-bold text-xs text-gray-700 rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                                        value={sector.default_foreman_id || ''}
                                        onChange={(e) => updateSectorForeman(sector.id, e.target.value)}
                                    >
                                        <option value="">-- Sem Atribuição --</option>
                                        {foremen.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">

                {/* SECTION 1: UNITS */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                        <div className="flex justify-between items-center border-b pb-6 mb-6">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <LayoutDashboard size={20} className="text-blue-500" /> Gestão de Unidades
                            </h3>
                            <button className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full uppercase">
                                Exportar Lista
                            </button>
                        </div>
                        <ul className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {zones.map(z => {
                                const foreman = profiles.find(p => p.id === z.responsible_foreman_id);
                                return (
                                    <li key={z.id} className="text-sm p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-800 text-base">{z.name}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] uppercase font-black text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded tracking-tighter">
                                                    {sectors.find(s => s.id === z.sector_id)?.name || 'Sem Setor'}
                                                </span>
                                                <span className="text-[9px] uppercase font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded tracking-tighter border border-blue-100">
                                                    {z.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right mr-2">
                                                <span className="block text-[8px] font-black text-gray-400 uppercase">Mestre Resp.</span>
                                                <span className="text-xs font-bold text-gray-900">{foreman?.name || '---'}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setUnitToEdit({ id: z.id })}
                                                    className="p-2 bg-white text-gray-400 hover:text-blue-600 hover:shadow-lg rounded-xl transition-all border border-gray-100"
                                                    title="Editar Unidade"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setUnitToDelete({ id: z.id, name: z.name })}
                                                    className="p-2 bg-white text-gray-400 hover:text-red-500 hover:shadow-lg rounded-xl transition-all border border-gray-100"
                                                    title="Excluir Unidade"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <form onSubmit={handleAddZone} className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-100 space-y-6">
                        <h4 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                            <Plus size={16} /> Nova Unidade de Produção
                        </h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                className="w-full border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-white outline-none shadow-inner bg-blue-500/50 text-white placeholder:text-blue-200"
                                placeholder="Nome (ex: Apt 301)"
                                value={newZoneName}
                                onChange={e => setNewZoneName(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <select
                                    className="flex-1 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-white outline-none cursor-pointer bg-blue-500/50 text-white font-bold appearance-none"
                                    value={selectedSectorId}
                                    onChange={(e) => setSelectedSectorId(e.target.value)}
                                >
                                    <option value="" className="text-blue-900">-- Selecionar Setor --</option>
                                    {sectors.map(s => <option key={s.id} value={s.id} className="text-blue-900">{s.name}</option>)}
                                </select>
                                <button
                                    type="submit"
                                    disabled={!newZoneName || !selectedSectorId}
                                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-sm font-black hover:bg-blue-50 disabled:opacity-30 transition-all active:scale-95 uppercase tracking-wider"
                                >
                                    CRIAR
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* SECTION 2: ACTIVITIES */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[600px] flex flex-col">
                        <div className="flex justify-between items-center border-b pb-6 mb-6">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <List size={20} className="text-orange-500" /> Biblioteca de Atividades
                            </h3>
                            <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full uppercase border border-orange-100">
                                {templates.length} Padrões
                            </span>
                        </div>
                        <ul className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {templates.map(t => (
                                <li key={t.id} className="text-sm p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <span className="font-black text-gray-900 block text-lg leading-tight">{t.name}</span>
                                            {t.predecessor_id ? (
                                                <div className="text-[10px] text-orange-600 flex items-center gap-1 mt-1 font-black bg-orange-100/50 w-fit px-2 py-1 rounded-lg">
                                                    <ArrowRight size={10} />
                                                    REQUER: {templates.find(p => p.id === t.predecessor_id)?.name}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-green-600 font-black mt-1 bg-green-50 w-fit px-2 py-1 rounded-lg uppercase tracking-tighter border border-green-100">Início Imediato</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-3 px-2">
                                            <div className="text-right">
                                                <span className="block text-[8px] font-black text-gray-400 uppercase">Duração</span>
                                                <span className="text-sm font-black text-gray-900">{t.estimated_duration}D</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedActivityForKit(t.name)}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-orange-100 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                                                title="Configurar Checklist"
                                            >
                                                <Settings2 size={14} /> Checklist
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <form onSubmit={handleAddActivity} className="bg-gray-900 p-8 rounded-3xl shadow-xl shadow-gray-200 space-y-6">
                        <h4 className="font-black text-white text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                            NOVO PADRÃO TÉCNICO
                        </h4>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-gray-800 text-white placeholder:text-gray-500"
                                placeholder="Nome da Atividade (ex: Alvenaria Estrutural)"
                                value={newActivityName}
                                onChange={e => setNewActivityName(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <select
                                    className="flex-1 border-none rounded-2xl p-4 text-sm bg-gray-800 text-gray-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer appearance-none font-bold"
                                    value={newActivityPred}
                                    onChange={e => setNewActivityPred(e.target.value)}
                                >
                                    <option value="">-- Sem Dependência --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-24 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-gray-800 text-white font-black pr-8"
                                        placeholder="0"
                                        value={newActivityDuration}
                                        onChange={e => setNewActivityDuration(parseInt(e.target.value) || 1)}
                                    />
                                    <span className="absolute right-3 top-4 text-[9px] font-black text-gray-500 uppercase">Dias</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!newActivityName}
                                className="w-full bg-orange-500 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-30 shadow-lg shadow-orange-900/20 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                <Plus size={20} /> Registrar Serviço
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};
