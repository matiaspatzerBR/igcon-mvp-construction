import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, List, Grid3X3, ArrowRight } from 'lucide-react';

export const ConfigPage = () => {
    const { zones, templates, addZone, addActivityTemplate } = useStore();

    // Form States
    const [newZoneName, setNewZoneName] = useState('');
    const [newActivityName, setNewActivityName] = useState('');
    const [newActivityPred, setNewActivityPred] = useState('');
    const [newActivityDuration, setNewActivityDuration] = useState(1);

    const handleAddZone = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZoneName.trim()) return;
        addZone(newZoneName);
        setNewZoneName('');
        alert('Unidade adicionada com sucesso!');
    };

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newActivityName.trim()) return;
        addActivityTemplate(newActivityName, newActivityPred || null, Number(newActivityDuration));
        setNewActivityName('');
        setNewActivityDuration(1);
        setNewActivityPred('');
        alert('Atividade criada! Verifique a Matriz.');
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Configurações & Dados Mestres</h2>
                <p className="text-gray-500">Adicione novas Unidades ou Tipos de Serviço ao projeto.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* SECTION 1: UNITS */}
                <div className="flex flex-col gap-6">
                    {/* List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border h-[400px] flex flex-col">
                        <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <Grid3X3 size={20} /> Unidades / Apartamentos ({zones.length})
                        </h3>
                        <ul className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {zones.map(z => (
                                <li key={z.id} className="text-sm p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                                    <span className="font-medium text-gray-700">{z.name}</span>
                                    <span className="text-[10px] uppercase bg-gray-200 text-gray-500 px-2 py-0.5 rounded">{z.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAddZone} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">Nova Unidade</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome (ex: Apt 301)"
                                value={newZoneName}
                                onChange={e => setNewZoneName(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newZoneName}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus size={16} /> Adicionar
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECTION 2: ACTIVITIES */}
                <div className="flex flex-col gap-6">
                    {/* List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border h-[400px] flex flex-col">
                        <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <List size={20} /> Serviços e Sequência ({templates.length})
                        </h3>
                        <ul className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {templates.map(t => (
                                <li key={t.id} className="text-sm p-3 bg-gray-50 rounded border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-gray-800">{t.name}</span>
                                        <span className="text-xs text-gray-500">{t.estimated_duration} dias</span>
                                    </div>
                                    {t.predecessor_id ? (
                                        <div className="text-xs text-orange-600 flex items-center gap-1">
                                            <ArrowRight size={10} />
                                            Requer: {templates.find(p => p.id === t.predecessor_id)?.name}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-green-600 font-medium">Início Imediato</div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAddActivity} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-orange-500">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">Novo Tipo de Serviço</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Nome da Atividade (ex: Forro de Gesso)"
                                value={newActivityName}
                                onChange={e => setNewActivityName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 border rounded p-2 text-sm bg-white"
                                    value={newActivityPred}
                                    onChange={e => setNewActivityPred(e.target.value)}
                                >
                                    <option value="">-- Sem Predecessor --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-20 border rounded p-2 text-sm"
                                    placeholder="Dias"
                                    value={newActivityDuration}
                                    onChange={e => setNewActivityDuration(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newActivityName}
                                className="w-full bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50"
                            >
                                <Plus size={16} /> Criar Atividade
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};
