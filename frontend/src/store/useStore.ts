import { create } from 'zustand';
import type {
    Profile, Zone, ActivityTemplate, Task, TaskStatus
} from '../types';

// --- SEED DATA ---

const MOCK_PROFILES: Profile[] = [
    { id: '1', name: 'Carlos (Engenheiro)', role: 'engenheiro' },
    { id: '2', name: 'João (Mestre - T1)', role: 'mestre' }, // Team 1
    { id: '4', name: 'Pedro (Mestre - T2)', role: 'mestre' }, // Team 2 (New)
    { id: '3', name: 'Maria (Estagiária)', role: 'estagiario' },
];

const MOCK_TEMPLATES: ActivityTemplate[] = [
    { id: 'a1', name: '1. Alvenaria', sequence_order: 1, estimated_duration: 3, standard_crew_size: 2, predecessor_id: null, checklist_guide: "Verificar prumo, nível e esquadro. Confirmar caixas elétricas." },
    { id: 'a2', name: '2. Inst. Elétricas', sequence_order: 2, estimated_duration: 2, standard_crew_size: 1, predecessor_id: 'a1', checklist_guide: "Conferir posicionamento das caixas e desobstrução dos conduítes." },
    { id: 'a3', name: '3. Reboco/Gesso', sequence_order: 3, estimated_duration: 4, standard_crew_size: 3, predecessor_id: 'a2', checklist_guide: "Base limpa? Taliscas conferidas? Verificar cura do chapisco." },
    { id: 'a4', name: '4. Contrapiso', sequence_order: 4, estimated_duration: 2, standard_crew_size: 2, predecessor_id: 'a3', checklist_guide: "Verificar níveis e caimentos." },
    { id: 'a5', name: '5. Carpintaria', sequence_order: 5, estimated_duration: 3, standard_crew_size: 2, predecessor_id: 'a4', checklist_guide: "Verificar prumo dos batentes e funcionamento das travas." },
    { id: 'a6', name: '6. Pintura', sequence_order: 6, estimated_duration: 5, standard_crew_size: 2, predecessor_id: 'a5', checklist_guide: "Parede lixada? Proteção de piso instalada?" },
    { id: 'a7', name: '7. Louças e Metais', sequence_order: 7, estimated_duration: 2, standard_crew_size: 1, predecessor_id: 'a6' },
    { id: 'a8', name: '8. Pisos e Rev.', sequence_order: 8, estimated_duration: 3, standard_crew_size: 2, predecessor_id: 'a3', checklist_guide: "Conferir paginação, alinhamento e dupla colagem." }, // Note: Predecessor Logic might vary, used a3 for demo
];

// Generate 10 Units (Apt 101-105, 201-205)
const MOCK_ZONES: Zone[] = Array.from({ length: 10 }).map((_, i) => {
    const floor = i < 5 ? 1 : 2;
    const num = (i % 5) + 1;
    return {
        id: `z${i + 1}`,
        name: `Apt ${floor}0${num}`,
        type: 'Unidade',
        parent_id: null
    };
});

// Generate Initial Tasks (Matrix)
const INITIAL_TASKS: Task[] = [];
MOCK_ZONES.forEach((zone, index) => {
    // Assign logic: Apt 1xx -> João (id 2), Apt 2xx -> Pedro (id 4)
    const assignedId = index < 5 ? '2' : '4';

    MOCK_TEMPLATES.forEach(template => {
        let status: TaskStatus = 'pending';
        // Simulate history
        if (template.sequence_order <= 2 && index <= 5) {
            status = 'approved';
        }

        INITIAL_TASKS.push({
            id: `t_${zone.id}_${template.id}`,
            project_id: 'p1',
            zone_id: zone.id,
            template_id: template.id,
            status: status,
            assigned_user_id: assignedId,
            scheduled_start_date: new Date().toISOString(),
        });
    });
});


interface AppState {
    currentUser: Profile | null;
    profiles: Profile[];
    zones: Zone[];
    templates: ActivityTemplate[];
    tasks: Task[];

    // UI State
    lastError: string | null;

    // Actions
    setCurrentUser: (user: Profile) => void;

    // Core Logic
    updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<boolean>;
    reportIssue: (taskId: string, reason: string) => void;
    resolveIssue: (taskId: string, action: 'reprogram' | 'approve') => void;
    assignTask: (taskId: string, userId: string) => void;

    approveTask: (taskId: string) => void;
    rejectTask: (taskId: string, reason: string) => void;

    // Config Actions
    addZone: (name: string) => void;
    addActivityTemplate: (name: string, predecessorId: string | null, duration: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
    currentUser: MOCK_PROFILES[0],
    profiles: MOCK_PROFILES,
    zones: MOCK_ZONES,
    templates: MOCK_TEMPLATES,
    tasks: INITIAL_TASKS,
    lastError: null,

    setCurrentUser: (user) => set({ currentUser: user }),

    updateTaskStatus: async (taskId, newStatus) => {
        const { tasks, templates } = get();
        const task = tasks.find(t => t.id === taskId);

        if (!task) return false;

        // BLOCKING LOGIC: If trying to start (pending/rejected -> in_progress)
        if (newStatus === 'in_progress') {
            const template = templates.find(t => t.id === task.template_id);
            if (template?.predecessor_id) {
                const predecessor = tasks.find(t =>
                    t.zone_id === task.zone_id &&
                    t.template_id === template.predecessor_id
                );

                // STRICT: Predecessor must be 'approved'
                if (predecessor && predecessor.status !== 'approved') {
                    set({ lastError: `Bloqueado: A atividade anterior '${MOCK_TEMPLATES.find(t => t.id === predecessor.template_id)?.name}' não foi aprovada!` });

                    setTimeout(() => set({ lastError: null }), 4000);
                    return false;
                }
            }
        }

        // Apply update
        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === taskId
                    ? { ...t, status: newStatus, issue_reason: undefined } // clear issues if moving forward
                    : t
            )
        }));
        return true;
    },

    reportIssue: (taskId, reason) => {
        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === taskId ? {
                    ...t,
                    status: 'issue', // Red Flag
                    issue_reason: reason
                } : t
            )
        }));
    },

    resolveIssue: (taskId, action) => {
        set(state => ({
            tasks: state.tasks.map(t => {
                if (t.id !== taskId) return t;

                if (action === 'approve') {
                    // Force start or force pending? User said "Liberar/Aprovar -> Pending or In Progress"
                    // Let's set to PENDING so they can try start again properly, or IN_PROGRESS directly?
                    // "Overrides the issue and sets task to PENDING (Ready to start) or IN_PROGRESS"
                    return { ...t, status: 'pending', issue_reason: undefined, feedback: 'Impedimento resolvido pelo Engenheiro' };
                } else {
                    // Reprogram -> Pending
                    return { ...t, status: 'pending', issue_reason: undefined, feedback: 'Reprogramado' };
                }
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
            tasks: state.tasks.map(t =>
                t.id === taskId ? { ...t, status: 'approved', feedback: undefined } : t
            )
        }));
    },

    rejectTask: (taskId, reason) => {
        set(state => ({
            tasks: state.tasks.map(t =>
                t.id === taskId ? {
                    ...t,
                    status: 'rejected',
                    feedback: reason
                } : t
            )
        }));
    },

    // --- NEW ACTIONS for Config ---
    addZone: (name) => {
        const newZone: Zone = {
            id: `z${Date.now()}`, // Simple ID generation
            name,
            type: 'Unidade',
            parent_id: null
        };

        // When adding a zone, we must also generate the TASKS for it based on existing templates
        const newTasks: Task[] = get().templates.map(tpl => ({
            id: `t_${newZone.id}_${tpl.id}`,
            project_id: 'p1',
            zone_id: newZone.id,
            template_id: tpl.id,
            status: 'pending',
            assigned_user_id: undefined, // Default unassigned
            scheduled_start_date: new Date().toISOString()
        }));

        set(state => ({
            zones: [...state.zones, newZone],
            tasks: [...state.tasks, ...newTasks]
        }));
    },

    addActivityTemplate: (name, predecessorId, estimatedDuration) => {
        const newTemplate: ActivityTemplate = {
            id: `a${Date.now()}`,
            name,
            sequence_order: get().templates.length + 1,
            estimated_duration: estimatedDuration || 1,
            standard_crew_size: 2,
            predecessor_id: predecessorId || null
        };

        // When adding a template, we must add this Task to ALL existing Zones
        const newTasks: Task[] = get().zones.map(zone => ({
            id: `t_${zone.id}_${newTemplate.id}`,
            project_id: 'p1',
            zone_id: zone.id,
            template_id: newTemplate.id,
            status: 'pending',
            assigned_user_id: undefined,
            scheduled_start_date: new Date().toISOString()
        }));

        set(state => ({
            templates: [...state.templates, newTemplate],
            tasks: [...state.tasks, ...newTasks]
        }));
    }
}));
