export type UserRole = 'engenheiro' | 'mestre' | 'estagiario' | 'operario';

export interface Profile {
    id: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
}

export type ZoneType = 'Torre' | 'Pavimento' | 'Unidade';

export interface Zone {
    id: string;
    parent_id: string | null;
    name: string;
    type: ZoneType;
    children?: Zone[]; // For recursive tree structure
}

export interface ActivityTemplate {
    id: string;
    name: string;
    estimated_duration: number; // days
    standard_crew_size: number;
    sequence_order: number;
    predecessor_id?: string | null; // For blocking logic
    checklist_guide?: string; // New: For the Start Modal
}

export type ChecklistType = 'PRE_START' | 'QUALITY_CLOSE';

export interface TemplateChecklist {
    id: string;
    template_id: string;
    type: ChecklistType;
    item_description: string;
}

export type TaskStatus =
    | 'pending'           // Gray: Planned / To Do
    | 'in_progress'       // Blue: Started
    | 'ready_for_review'  // Yellow: QC
    | 'approved'          // Green: OK
    | 'rejected'          // Orange: QC Rejected
    | 'issue';            // NEW Red: Field Issue (Impedimento)

export interface Task {
    id: string;
    project_id: string;
    template_id: string; // Links to ActivityTemplate
    zone_id: string;     // Links to Unit
    status: TaskStatus;

    // Dates
    scheduled_start_date?: string;
    actual_start_date?: string;
    actual_end_date?: string;

    assigned_user_id?: string;

    // Feedback / Issue Report
    feedback?: string; // Reason for rejection
    issue_reason?: string; // NEW: For the Radio Button selection

    created_at?: string;
    updated_at?: string;
}

export interface Constraint {
    id: string;
    task_id: string;
    description: string;
    status: 'open' | 'resolved';
}

export interface TaskChecklistExecution {
    id: string;
    task_id: string;
    checklist_item_id: string;
    is_checked: boolean;
    timestamp: string;
}
