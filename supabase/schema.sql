-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- 1. PROFILES (Extends auth.users - DECOUPLED FOR SEEDING)
CREATE TYPE user_role AS ENUM ('engenheiro', 'mestre', 'estagiario', 'operario');

CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- <--- CAMBIO AQUÍ: Ya no referencia a auth.users(id)
  name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 2. ZONES (Hierarchical)
CREATE TYPE zone_type AS ENUM ('Torre', 'Pavimento', 'Unidade');

CREATE TABLE zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES zones(id),
  name TEXT NOT NULL,
  type zone_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ACTIVITY TEMPLATES (Cadastros)
CREATE TABLE activity_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- PT-BR
  estimated_duration INTEGER NOT NULL, -- in hours
  standard_crew_size INTEGER NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MATERIALS DB
CREATE TABLE materials_db (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- PT-BR
  unit TEXT NOT NULL, -- kg, m2, sc, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TEMPLATE MATERIALS
CREATE TABLE template_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES activity_templates(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_db(id),
  quantity_per_unit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TEMPLATE CHECKLISTS
CREATE TYPE checklist_type AS ENUM ('PRE_START', 'QUALITY_CLOSE');

CREATE TABLE template_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES activity_templates(id) ON DELETE CASCADE,
  type checklist_type NOT NULL,
  item_description TEXT NOT NULL, -- PT-BR
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PROJECTS (Simple wrapper)
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TASKS
CREATE TYPE task_status AS ENUM (
  'planned', 
  'blocked', 
  'ready', 
  'in_progress', 
  'completed_pending_verify', 
  'verified_closed', 
  'rework_needed'
);

CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  template_id UUID REFERENCES activity_templates(id),
  zone_id UUID REFERENCES zones(id),
  status task_status DEFAULT 'planned',
  
  scheduled_start_date DATE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  
  assigned_user_id UUID REFERENCES profiles(id),
  material_consumed_actual DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CONSTRAINTS
CREATE TYPE constraint_status AS ENUM ('open', 'resolved');

CREATE TABLE constraints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status constraint_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TASK CHECKLIST EXECUTION
CREATE TABLE task_checklist_execution (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES template_checklists(id),
  is_checked BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified for MVP but strict structure)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials_db ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_execution ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users for all tables
CREATE POLICY "Allow read access for authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON activity_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON materials_db FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON template_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON template_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON constraints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON task_checklist_execution FOR SELECT TO authenticated USING (true);

-- Allow write access based on roles (Simplified: Engineers/Masters can write almost everything, Workers update tasks)
-- For MVP, we'll open up write access to authenticated users to ensure the demo works smoothly without complex auth simulation
CREATE POLICY "Allow insert/update for authenticated users" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert/update for authenticated users" ON task_checklist_execution FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow insert/update for authenticated users" ON constraints FOR ALL TO authenticated USING (true);
