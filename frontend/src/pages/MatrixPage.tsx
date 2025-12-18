import { useStore } from '../store/useStore';
import clsx from 'clsx';

export const MatrixPage = () => {
    const { tasks, zones, templates } = useStore();

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
        <div className="flex flex-col gap-4">
            <header>
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
                                        <td key={template.id} className="p-1 border-b text-center">
                                            <div
                                                className={clsx(
                                                    "w-full h-10 rounded flex items-center justify-center text-xs shadow-sm transition-all",
                                                    getStatusColor(task.status)
                                                )}
                                                title={`Status: ${task.status}`}
                                            >
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
