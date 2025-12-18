# MASTER TECHNICAL SPECIFICATION: LEAN CONSTRUCTION MES (MVP)

## 1. PRODUCT VISION
Manufacturing Execution System (MES) for civil construction based on Last Planner System®.
The goal is to digitize the flow: Pull Planning -> Make Ready (Lookahead) -> Standardized Execution (Cadastros) -> Quality Control (Checklists) -> Analytics (PPC/Deviations).

**LANGUAGE REQUIREMENT:** - **Codebase/DB:** English (variable names, tables, comments).
- **User Interface (UI):** **Brazilian Portuguese** (strictly).

## 2. TECH STACK (NON-NEGOTIABLE)
- **Frontend:** React + Vite + TypeScript.
- **UI Kit:** Tailwind CSS + shadcn/ui.
- **Icons:** Lucide-React.
- **State Management:** TanStack Query v5.
- **Drag & Drop:** dnd-kit.
- **Charts:** Recharts.
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime).

## 3. DATA MODEL (DATABASE SCHEMA)
The agent must generate SQL for these exact tables:

### A. Structure & Standardization
1. **zones**: (Hierarchical) id, parent_id, name, type ('Torre', 'Pavimento', 'Unidade').
2. **activity_templates** (Cadastros): id, name (PT-BR), estimated_duration (hours), standard_crew_size, sequence_order.
3. **materials_db**: id, name (PT-BR), unit (kg, m2, sc).
4. **template_materials**: id, template_id, material_id, quantity_per_unit.
5. **template_checklists**: id, template_id, type ('PRE_START', 'QUALITY_CLOSE'), item_description (PT-BR).

### B. Core Execution
6. **profiles**: id (auth.users), role ('engenheiro', 'mestre', 'estagiario', 'operario'), name.
7. **tasks**:
   - id, project_id, template_id, zone_id.
   - status: 'planned', 'blocked', 'ready', 'in_progress', 'completed_pending_verify', 'verified_closed', 'rework_needed'.
   - scheduled_start_date, actual_start_date, actual_end_date.
   - assigned_user_id.
   - material_consumed_actual (float).
8. **constraints**: id, task_id, description, status ('open', 'resolved').
9. **task_checklist_execution**: id, task_id, checklist_item_id, is_checked (bool), timestamp.

## 4. FUNCTIONAL REQUIREMENTS & UI (IN PORTUGUESE)

### MODULE 1: CONFIGURATION (Role: Engenheiro)
- **Gestor de Zonas:** CRUD to create zone tree (e.g., "Torre A -> 1º Andar -> Apto 101").
- **Cadastros (Templates):** UI to create templates.
  - *Seed Data Examples:* "Alvenaria", "Reboco Interno", "Gesso", "Pintura", "Porcelanato".

### MODULE 2: PLANNING & MATRIX (The "Control Tower")
- **Matriz de Terminalidade (Main Dashboard):**
  - **Rows:** Terminal Zones (e.g., Aptos).
  - **Columns:** Templates ordered by `sequence_order`.
  - **Cells:** Color mapped to `tasks.status`.
    - GREY: "Não planejado".
    - YELLOW: "Em andamento" (`in_progress`).
    - RED: "Bloqueado/Kit Incompleto" OR "Retrabalho" (`blocked`/`rework_needed`).
    - GREEN: "Concluído" (`verified_closed`).
    - BLUE: "Aguardando Verificação" (`completed_pending_verify`).
  - **Interaction:** Click empty -> "Adicionar Tarefa". Click filled -> Open Detail Modal.

### MODULE 3: EXECUTION (Role: Operário/Mestre)
- **View "Minhas Tarefas":** List of cards assigned to the logged-in user.
- **Start Logic (Kit Básico):**
  - Button "Iniciar Execução".
  - Opens Modal: "Checklist de Pré-Início" (Kit Básico).
  - If any critical item is unchecked -> Status `blocked`. UI shows: "Bloqueado: Contate o Engenheiro".
- **Finish Logic (Self-Control):**
  - Button "Concluir Tarefa".
  - Opens Modal: "Checklist de Qualidade".
  - Requirement: Upload photo (mock) and confirm items.
  - Input: "Material Real Consumido".
  - Status -> `completed_pending_verify`.

### MODULE 4: QUALITY & CLOSE (Role: Estagiário/Engenheiro)
- **Verificação de Serviços:** List of tasks waiting for approval.
- **Actions:**
  - **Aprovar:** Status -> `verified_closed`. Toast: "Serviço Aprovado".
  - **Reprovar:** Status -> `rework_needed`. Toast: "Enviado para Retrabalho".
    - *Logic:* The task reappears in the Operário's list with a "URGENTE" badge.
- **Fechar Semana:** Button to archive completed tasks and push incomplete ones to next week.

### MODULE 5: INTELLIGENCE (Analytics)
- **Gráfico PPC:** Weekly evolution.
- **Desvio de Padrão:** Chart comparing `estimated` vs `actual` duration/materials per Template.

## 5. UI/UX RULES
- **Language:** **ALL visible text must be in Brazilian Portuguese.**
- **Navigation:** Sidebar with roles logic.
- **Matrix View:** Sticky headers for Zones and Templates. Horizontal scrolling.