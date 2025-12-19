import { History, X, Clock, User, MessageSquare } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    taskId: string;
    zoneName: string;
    activityName: string;
    onClose: () => void;
}

export const ModalTaskHistory = ({ taskId, zoneName, activityName, onClose }: Props) => {
    const { taskEvents, profiles } = useStore();

    const events = taskEvents
        .filter(ev => ev.task_id === taskId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const getUserName = (userId: string) => {
        return profiles.find(p => p.id === userId)?.name || 'Usuário Desconhecido';
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'STARTED': return <Clock size={14} className="text-blue-500" />;
            case 'COMPLETED': return <History size={14} className="text-green-500" />;
            case 'BLOCKED': return <X size={14} className="text-red-500" />;
            case 'RELEASED_MANUALLY': return <History size={14} className="text-purple-500" />;
            default: return <MessageSquare size={14} className="text-gray-400" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-xl leading-none">Histórico da Tarefa</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                {zoneName} • {activityName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="p-8 overflow-y-auto grow">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                            <History size={48} className="opacity-10" />
                            <p className="text-sm font-medium">Nenhum evento registrado ainda.</p>
                        </div>
                    ) : (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {events.map((event) => (
                                <div key={event.id} className="relative flex items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow-sm shrink-0 z-10 group-hover:border-blue-400 transition-colors">
                                            {getEventIcon(event.event_type)}
                                        </div>
                                        <div className="flex flex-col gap-1 w-full bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                                                    {event.event_type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {format(new Date(event.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                                {event.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                                <User size={10} className="text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    {getUserName(event.user_id)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-black text-gray-500 hover:bg-gray-200 rounded-xl transition-all uppercase tracking-widest"
                    >
                        FECHAR
                    </button>
                </div>
            </div>
        </div>
    );
};
