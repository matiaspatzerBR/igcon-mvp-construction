import { create } from 'zustand';
import type { Task, Zone, ActivityTemplate, Profile, TaskStatus, Sector, TaskEvent } from '../types';

interface StoreState {
    profiles: Profile[];
    sectors: Sector[];
    zones: Zone[];
    templates: ActivityTemplate[];
    tasks: Task[];
    taskEvents: TaskEvent[];
    currentUser: Profile | null;

    setCurrentUser: (user: Profile) => void;
    logTaskEvent: (taskId: string, type: TaskEvent['event_type'], description: string) => void;
    updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
    reportIssue: (taskId: string, reason: string) => void;
    resolveIssue: (taskId: string, action: 'approve' | 'reprogram') => void;
    assignTask: (taskId: string, userId: string) => void;
    approveTask: (taskId: string) => void;
    rejectTask: (taskId: string, reason: string) => void;

    // SECTOR & ZONE ACTIONS
    addZone: (name: string, sectorId: string) => void;
    addSector: (name: string) => void;
    deleteSector: (id: string) => void;
    updateSectorName: (id: string, name: string) => void;
    updateSectorForeman: (sectorId: string, foremanId: string) => void;
    updateZoneResponsibility: (zoneId: string, foremanId: string, updateBacklog: boolean) => void;
    updateZone: (zoneId: string, data: Partial<Zone>) => void;
    deleteZone: (zoneId: string) => void;

    addActivityTemplate: (name: string, predecessorId: string | null, estimatedDuration: number) => void;
    addTask: (zoneId: string, templateId: string) => void;

    // LOOKAHEAD ACTIONS
    scheduleTask: (taskId: string, date: string | null) => void;
    publishTasks: () => void;
    forceReleaseTask: (taskId: string) => void;
    cascadeRescheduleTask: (taskId: string) => void;
}

const MOCK_PROFILES: Profile[] = [
    { id: '1', name: 'Eng. Ricardo', role: 'engenheiro' },
    { id: '2', name: 'João (Mestre)', role: 'mestre' },
    { id: '3', name: 'Davi (Estagiário)', role: 'estagiario' },
    { id: '4', name: 'Pedro (Mestre)', role: 'mestre' },
];

const MOCK_SECTORS: Sector[] = [
    { id: 's1', name: 'Torre 1', default_foreman_id: '2' },
    { id: 's2', name: 'Torre 2', default_foreman_id: '4' },
];

const MOCK_TEMPLATES: ActivityTemplate[] = [
    { id: 'a1', name: '1. Alvenaria', sequence_order: 1, estimated_duration: 3, standard_crew_size: 3, checklist_guide: "Verificar esquadro e prumo da primeira fiada." },
    { id: 'a2', name: '2. Elétrica (Tubul.)', sequence_order: 2, estimated_duration: 2, standard_crew_size: 2, predecessor_id: 'a1', checklist_guide: "Conferir posicionamento de caixinhas conforme projeto." },
    { id: 'a3', name: '3. Hidráulica', sequence_order: 3, estimated_duration: 2, standard_crew_size: 2, predecessor_id: 'a1', checklist_guide: "Teste de estanqueidade obrigatório após montagem." },
    { id: 'a4', name: '4. Gesso', sequence_order: 4, estimated_duration: 4, standard_crew_size: 3, predecessor_id: 'a2', checklist_guide: "Verificar nível do laser e fixação dos tirantes." },
    { id: 'a5', name: '5. Carpintaria', sequence_order: 5, estimated_duration: 3, standard_crew_size: 2, predecessor_id: 'a4', checklist_guide: "Verificar prumo dos batentes e funcionamento das travas." },
    { id: 'a6', name: '6. Pintura', sequence_order: 6, estimated_duration: 5, standard_crew_size: 2, predecessor_id: 'a5', checklist_guide: "Parede lixada? Proteção de piso instalada?" },
    { id: 'a7', name: '7. Louças e Metais', sequence_order: 7, estimated_duration: 2, standard_crew_size: 1, predecessor_id: 'a6' },
    { id: 'a8', name: '8. Pisos e Rev.', sequence_order: 8, estimated_duration: 3, standard_crew_size: 2, predecessor_id: 'a3', checklist_guide: "Conferir paginação, alinhamento e dupla colagem." },
];

const MOCK_ZONES: Zone[] = Array.from({ length: 10 }).map((_, i) => {
    const floor = i < 5 ? 1 : 2;
    const num = (i % 5) + 1;
    const sectorId = i < 5 ? 's1' : 's2';
    const foremanId = i < 5 ? '2' : '4';
    return {
        id: `z${i + 1}`,
        name: `Apt ${floor}0${num}`,
        type: 'Unidade',
        parent_id: null,
        sector_id: sectorId,
        responsible_foreman_id: foremanId
    };
});

const INITIAL_TASKS: Task[] = [];
MOCK_ZONES.forEach((zone) => {
    const assignedId = zone.responsible_foreman_id;
    MOCK_TEMPLATES.forEach(template => {
        let status: TaskStatus = 'pending';
        // Some initial data published for demo
        INITIAL_TASKS.push({
            id: `t_${zone.id}_${template.id}`,
            project_id: 'p1',
            zone_id: zone.id,
            template_id: template.id,
            status,
            assigned_user_id: assignedId,
            scheduled_start_date: new Date().toISOString(),
            is_published: true
        });
    });
});

export const useStore = create<StoreState>((set, get) => ({
    profiles: MOCK_PROFILES,
    sectors: MOCK_SECTORS,
    zones: MOCK_ZONES,
    templates: MOCK_TEMPLATES,
    tasks: INITIAL_TASKS,
    taskEvents: [],
    currentUser: MOCK_PROFILES[0],

    setCurrentUser: (user) => set({ currentUser: user }),

    logTaskEvent: (taskId, type, description) => {
        const user = get().currentUser;
        if (!user) return;

        const newEvent: TaskEvent = {
            id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task_id: taskId,
            user_id: user.id,
            event_type: type,
            description,
            created_at: new Date().toISOString()
        };

        set(state => ({ taskEvents: [newEvent, ...state.taskEvents] }));
    },

    updateTaskStatus: async (taskId, status) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, status, actual_start_date: status === 'in_progress' ? new Date().toISOString() : t.actual_start_date } : t)
        }));

        // Logging
        const eventType = status === 'in_progress' ? 'STARTED' : (status === 'ready_for_review' ? 'REVIEW_REQUESTED' : (status === 'approved' ? 'COMPLETED' : 'COMMENT'));
        const user = get().currentUser;
        get().logTaskEvent(taskId, eventType as any, `${user?.name} alterou status para ${status}`);

        return true;
    },

    reportIssue: (taskId, reason) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'issue', issue_reason: reason } : t)
        }));
        get().logTaskEvent(taskId, 'BLOCKED', `Impedimento registrado: ${reason}`);
    },

    resolveIssue: (taskId, action) => {
        set(state => ({
            tasks: state.tasks.map(t => {
                if (t.id !== taskId) return t;
                return { ...t, status: 'pending', issue_reason: undefined, feedback: action === 'approve' ? 'Impedimento resolvido pelo Engenheiro' : 'Reprogramado' };
            })
        }));
    },

    assignTask: (taskId, userId) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, assigned_user_id: userId } : t)
        }));
    },

    approveTask: (taskId) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'approved', feedback: undefined } : t)
        }));
    },

    rejectTask: (taskId, reason) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'rejected', feedback: reason } : t)
        }));
        get().logTaskEvent(taskId, 'REPROVED', `Etapa reprovida: ${reason}`);
    },

    addZone: (name, sectorId) => {
        const sector = get().sectors.find(s => s.id === sectorId);
        const newZone: Zone = {
            id: `z${Date.now()}`,
            name,
            type: 'Unidade',
            parent_id: null,
            sector_id: sectorId,
            responsible_foreman_id: sector?.default_foreman_id
        };

        // Automation: Create tasks and assign inheriting foreman
        const newTasks: Task[] = get().templates.map(tpl => ({
            id: `t_${newZone.id}_${tpl.id}`,
            project_id: 'p1',
            zone_id: newZone.id,
            template_id: tpl.id,
            status: 'pending',
            assigned_user_id: newZone.responsible_foreman_id,
            scheduled_start_date: undefined,
            is_published: false
        }));

        set(state => ({
            zones: [...state.zones, newZone],
            tasks: [...state.tasks, ...newTasks]
        }));
    },

    addSector: (name: string) => {
        const newSector: Sector = {
            id: `s${Date.now()}`,
            name,
        };
        set(state => ({ sectors: [...state.sectors, newSector] }));
    },

    deleteSector: (id: string) => {
        set(state => {
            const zonesToDelete = state.zones.filter(z => z.sector_id === id).map(z => z.id);
            return {
                sectors: state.sectors.filter(s => s.id !== id),
                zones: state.zones.filter(z => z.sector_id !== id),
                tasks: state.tasks.filter(t => !zonesToDelete.includes(t.zone_id))
            };
        });
    },

    updateSectorName: (id: string, name: string) => {
        set(state => ({
            sectors: state.sectors.map(s => s.id === id ? { ...s, name } : s)
        }));
    },

    updateSectorForeman: (sectorId, foremanId) => {
        set(state => ({
            sectors: state.sectors.map(s => s.id === sectorId ? { ...s, default_foreman_id: foremanId } : s)
        }));
    },

    updateZoneResponsibility: (zoneId, foremanId, updateBacklog) => {
        set(state => ({
            zones: state.zones.map(z => z.id === zoneId ? { ...z, responsible_foreman_id: foremanId } : z),
            tasks: state.tasks.map(t => {
                if (updateBacklog && t.zone_id === zoneId && t.status !== 'approved') {
                    return { ...t, assigned_user_id: foremanId };
                }
                return t;
            })
        }));
    },

    updateZone: (zoneId, data) => {
        set(state => ({
            zones: state.zones.map(z => z.id === zoneId ? { ...z, ...data } : z)
        }));
    },

    deleteZone: (zoneId) => {
        set(state => ({
            zones: state.zones.filter(z => z.id !== zoneId),
            tasks: state.tasks.filter(t => t.zone_id !== zoneId)
        }));
    },

    addActivityTemplate: (name, predecessorId, estimatedDuration) => {
        const newTemplate: ActivityTemplate = {
            id: `a${Date.now()}`,
            name,
            sequence_order: get().templates.length + 1,
            estimated_duration: estimatedDuration || 1,
            standard_crew_size: 2,
            predecessor_id: predecessorId || null,
            checklist_guide: ''
        };

        const newTasks: Task[] = get().zones.map(zone => ({
            id: `t_${zone.id}_${newTemplate.id}`,
            project_id: 'p1',
            zone_id: zone.id,
            template_id: newTemplate.id,
            status: 'pending',
            assigned_user_id: zone.responsible_foreman_id,
            scheduled_start_date: undefined,
            is_published: false
        }));

        set(state => ({
            templates: [...state.templates, newTemplate],
            tasks: [...state.tasks, ...newTasks]
        }));
    },

    addTask: (zoneId, templateId) => {
        const zone = get().zones.find(z => z.id === zoneId);
        const newTask: Task = {
            id: `t_${zoneId}_${templateId}_${Date.now()}`,
            project_id: 'p1',
            zone_id: zoneId,
            template_id: templateId,
            status: 'pending',
            assigned_user_id: zone?.responsible_foreman_id,
            scheduled_start_date: undefined,
            is_published: false
        };
        set(state => ({
            tasks: [...state.tasks, newTask]
        }));
    },

    scheduleTask: (taskId, date) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, scheduled_start_date: date || undefined } : t)
        }));
    },

    publishTasks: () => {
        set(state => ({
            tasks: state.tasks.map(t => (t.scheduled_start_date && !t.is_published) ? { ...t, is_published: true } : t)
        }));
    },

    forceReleaseTask: (taskId) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, manual_release: true } : t)
        }));
        get().logTaskEvent(taskId, 'RELEASED_MANUALLY', `Engenheiro ${get().currentUser?.name} autorizou liberação extraordinária.`);
    },

    cascadeRescheduleTask: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const template = get().templates.find(tpl => tpl.id === task.template_id);
        if (!template) return;

        set(state => ({
            tasks: state.tasks.map(t => {
                const targetTemplate = state.templates.find(tpl => tpl.id === t.template_id);
                // Same zone AND sequence_order >= current task's template sequence order
                if (t.zone_id === task.zone_id && targetTemplate && targetTemplate.sequence_order >= template.sequence_order) {
                    return {
                        ...t,
                        scheduled_start_date: undefined,
                        is_published: false,
                        status: 'pending',
                        manual_release: false // Reset force release too
                    };
                }
                return t;
            })
        }));
        get().logTaskEvent(taskId, 'RESCHEDULED', `Reprogramação em cascata executada a partir desta etapa.`);
    }
}));
