import { useState, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import {
    Send,
    GripVertical, Package, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { ModalConfirm } from '../../ui/ModalConfirm';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Sub-components ---

interface DraggableTaskProps {
    taskId: string;
    zoneName: string;
    activityName: string;
    isPublished: boolean;
}

const DraggableTask = ({ taskId, zoneName, activityName, isPublished }: DraggableTaskProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: taskId,
        data: { taskId }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "bg-white p-3 rounded-lg border-2 mb-2 transition-all cursor-grab active:cursor-grabbing group shadow-sm",
                isDragging ? "opacity-30 z-50 border-blue-400 border-dashed" : "hover:border-blue-300",
                !isPublished && "border-dashed border-gray-300 bg-gray-50/50",
                isPublished && "border-white shadow shadow-gray-100"
            )}
        >
            <div className="flex items-start gap-2">
                <GripVertical size={14} className="text-gray-300 mt-1 shrink-0 group-hover:text-blue-400 transition-colors" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                        <MapPin size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{zoneName}</span>
                        {!isPublished && (
                            <span className="ml-auto text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-black uppercase">Rascunho</span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-700 block truncate leading-tight">{activityName}</span>
                </div>
            </div>
        </div>
    );
};

interface DroppableColumnProps {
    id: string; // "backlog" or "YYYY-MM-DD"
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const DroppableColumn = ({ id, title, subtitle, children, className }: DroppableColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col h-full rounded-xl transition-all border-2",
                isOver ? "bg-blue-50/50 border-blue-300 scale-[1.01]" : "bg-gray-100/50 border-transparent",
                className
            )}
        >
            <div className="p-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center justify-between">
                    {title}
                    {subtitle && <span className="text-[10px] text-gray-400 font-normal">{subtitle}</span>}
                </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-[100px]">
                {children}
            </div>
        </div>
    );
};

// --- Main Page ---

export const EngineerPlanning = () => {
    const { tasks, zones, templates, scheduleTask, publishTasks } = useStore();
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Setup dates for the week (Mon-Sat)
    const weekDates = useMemo(() => {
        const today = new Date();
        const monday = startOfWeek(today, { weekStartsOn: 1 });
        return Array.from({ length: 6 }).map((_, i) => {
            const date = addDays(monday, i);
            return {
                id: format(date, 'yyyy-MM-dd'),
                label: format(date, 'eeee', { locale: ptBR }),
                sub: format(date, 'dd/MM')
            };
        });
    }, []);

    const backlogTasks = tasks.filter(t => !t.scheduled_start_date);
    const scheduledTasks = tasks.filter(t => !!t.scheduled_start_date);

    // Sensors for DND
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id as string;
        const targetId = over.id as string;

        if (targetId === 'backlog') {
            scheduleTask(taskId, null);
        } else {
            // targetId is a date string YYYY-MM-DD
            scheduleTask(taskId, targetId);
        }
    };

    const handlePublishConfirm = () => {
        publishTasks();
        toast.success("Planejamento publicado!");
        setShowPublishModal(false);
    };

    // Helper to get task details
    const getTaskDetails = (taskId: string) => {
        const t = tasks.find(x => x.id === taskId);
        if (!t) return null;
        const zone = zones.find(z => z.id === t.zone_id);
        const tpl = templates.find(temp => temp.id === t.template_id);
        return { zone, tpl, task: t };
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="max-w-[1400px] mx-auto space-y-4 px-4 h-[calc(100vh-120px)] flex flex-col">
                <header className="flex justify-between items-center shrink-0 py-2">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                            Lookahead Design
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full uppercase tracking-tighter">Engine v2</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">Arraste as tarefas para planejar a semana.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white border rounded-xl p-2 px-4 shadow-sm flex items-center gap-6">
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-bold text-gray-400">Backlog</span>
                                <span className="block text-lg font-black text-gray-700">{backlogTasks.length}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100"></div>
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-bold text-gray-400">Agendados</span>
                                <span className="block text-lg font-black text-blue-600">{scheduledTasks.length}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPublishModal(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-green-700 shadow-xl shadow-green-100 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Send size={18} /> Publicar Plano
                        </button>
                    </div>
                </header>

                <div className="flex gap-4 flex-1 min-h-0">
                    {/* BACKLOG COLUMN */}
                    <div className="w-[300px] flex flex-col shrink-0">
                        <DroppableColumn id="backlog" title="📦 Backlog de Obras">
                            {backlogTasks.length === 0 ? (
                                <div className="text-center py-20 bg-white/50 border border-dashed rounded-xl">
                                    <Package className="mx-auto text-gray-300 mb-2" size={30} />
                                    <p className="text-xs text-gray-400 font-medium px-4">Tudo planejado! Adicione novas unidades na Configuração.</p>
                                </div>
                            ) : (
                                backlogTasks.map(t => {
                                    const details = getTaskDetails(t.id);
                                    if (!details) return null;
                                    return (
                                        <DraggableTask
                                            key={t.id}
                                            taskId={t.id}
                                            zoneName={details.zone?.name || '---'}
                                            activityName={details.tpl?.name.replace(/^\d+\.\s*/, '') || ''}
                                            isPublished={t.is_published}
                                        />
                                    );
                                })
                            )}
                        </DroppableColumn>
                    </div>

                    {/* WEEK GRID */}
                    <div className="flex-1 grid grid-cols-6 gap-3 min-h-0">
                        {weekDates.map(day => (
                            <DroppableColumn
                                key={day.id}
                                id={day.id}
                                title={day.label}
                                subtitle={day.sub}
                                className="bg-white/80 border-gray-100"
                            >
                                {tasks
                                    .filter(t => t.scheduled_start_date === day.id)
                                    .map(t => {
                                        const details = getTaskDetails(t.id);
                                        if (!details) return null;
                                        return (
                                            <DraggableTask
                                                key={t.id}
                                                taskId={t.id}
                                                zoneName={details.zone?.name || '---'}
                                                activityName={details.tpl?.name.replace(/^\d+\.\s*/, '') || ''}
                                                isPublished={t.is_published}
                                            />
                                        );
                                    })
                                }
                            </DroppableColumn>
                        ))}
                    </div>
                </div>

                {/* Drag Overlay for smooth preview */}
                <DragOverlay>
                    {activeId ? (
                        <div className="bg-blue-600 p-3 rounded-lg border-2 border-blue-400 shadow-2xl rotate-2">
                            <div className="flex items-center gap-2">
                                <GripVertical size={14} className="text-white/50" />
                                <div>
                                    <span className="text-[10px] font-bold text-white/70 uppercase truncate block">MOVENDO...</span>
                                    <span className="text-xs font-bold text-white truncate block">
                                        {getTaskDetails(activeId)?.tpl?.name.replace(/^\d+\.\s*/, '')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>

                <ModalConfirm
                    isOpen={showPublishModal}
                    onClose={() => setShowPublishModal(false)}
                    onConfirm={handlePublishConfirm}
                    title="Liberar para Equipes?"
                    message="Todas as tarefas agendadas mas não publicadas serão liberadas para visualização dos Mestres."
                    confirmLabel="Publicar Toda a Semana"
                    variant="primary"
                />
            </div>
        </DndContext>
    );
};
