# Extended Functional Specifications (Construction Tech MVP)

## 1. Overview and Architecture
The goal is to transform the current viewer into a comprehensive **Lean Construction** system that manages two speeds:
1.  **Strategic:** Finishes Matrix (Global Physical Progress).
2.  **Tactical:** Weekly Planning (Last Planner System) and Quality Control.

**User Roles (Simulation):**
* **Engineer (Planner):** Plans the week, creates tasks, views everything.
* **Foreman (Crew Lead):** Executes. Only views their Kanban and updates progress.
* **Intern (Quality Control):** Validates quality. Approves or rejects deliverables.

---

## 2. New Navigation Structure (Layout)
* **Persistent Navbar:** Must include access to 4 modules + Current Role Selector (for demo purposes).
* **Modules:**
    1.  Finishes Matrix (Global).
    2.  Weekly Management (Planning & Execution).
    3.  Dashboards (PPC & KPIs).
    4.  Configuration (Settings/Parameters).

---

## 3. Module Details and Business Logic

### Module A: Finishes Matrix (Strategic View)
* **Behavior:** Read-only (reflects the real state of tasks).
* **Rows/Cols:** Dynamic based on active Units and Activities.
* **Cell Color Code:**
    * *Gray:* Pending / Not planned.
    * *Blue:* In Progress (Started by Foreman).
    * *Orange:* **Quality Issue** (Rejected by Intern).
    * *Green:* Completed & Approved (Only after Intern's OK).

### Module B: Weekly Management (System Core)
This view changes drastically based on the selected ROLE:

#### B.1. Engineer View (Planning)
* **Planning Grid:** Allows creating tasks for the "Current Week" (Monday to Sunday).
* **Actions:** Create Task -> Assign to Unit (Dept) -> Assign to Team/Foreman -> Define Date.
* **Business Rule:** At the end of the week (Sunday night), unfinished tasks are automatically closed as "Non-Compliant" (Failed) for PPC calculation.

#### B.2. Foreman View (Execution - Kanban)
* **Kanban Board:** Columns: [To Do] -> [In Progress] -> [Ready for Review].
* **Hard Constraint:** The system **BLOCKS** moving a card to "In Progress" if its predecessor activity (e.g., Plaster) is not finished in that specific unit.
    * *Alert:* "Blocked: Predecessor incomplete".
* **Rejection Feedback:** If the Intern rejects a task:
    1.  The task moves back to the "To Do" column.
    2.  A visual alert appears at the top: "Task Rejected: [Reason]".

#### B.3. Intern View (Quality Control)
* **QC Inbox:** List of tasks in "Ready for Review" status.
* **Validation Action:** Modal with task details + Inspection Guide.
    * **APPROVE Button:** Updates Matrix to Green. Counts for PPC if done before Sunday.
    * **REJECT Button:** Mandatory comment/reason field. Sends task back to Foreman. Updates Matrix to Orange.

### Module C: Dashboards (Strict PPC)
* **PPC Calculation (Percent Plan Complete):**
    * Formula: `(Tasks Approved by Intern before Sunday 23:59 / Total Tasks Planned for the Week) * 100`.
    * *Note:* If a task was executed but not approved in time, it counts as 0 for that week.
* **Chart:** Historical weekly evolution.

### Module D: Configuration (Parameters)
* **Activities with Predecessors:** When creating an activity (e.g., Painting), the user must be able to select its prerequisite (e.g., Plaster). This feeds the Foreman's blocking logic.
* **Units:** CRUD for apartments/units.
* **Users:** Basic CRUD for the demo.

---

## 4. Seed Data (Mock Data)
For the demo, the system must initialize with:
* **Sequential Activities:** 1. Masonry -> 2. Electrical Install -> 3. Plaster -> 4. Flooring -> 5. Carpentry -> 6. Painting -> 7. Fixtures -> 8. Final Cleaning.
* **Units:** 10 Apartments (Floor 1 and 2).
* **History:** Simulated data from the last 3 weeks so the PPC chart is not empty.