-- SCRIPT COMPLETO: Crear Base de Datos desde Cero
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase
-- Esto eliminará todo y lo recreará

-- PASO 1: Eliminar todo lo existente (si hay algo)
DROP TABLE IF EXISTS task_checklist_execution CASCADE;
DROP TABLE IF EXISTS constraints CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS template_checklists CASCADE;
DROP TABLE IF EXISTS template_materials CASCADE;
DROP TABLE IF EXISTS materials_db CASCADE;
DROP TABLE IF EXISTS activity_templates CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS constraint_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS checklist_type CASCADE;
DROP TYPE IF EXISTS zone_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- PASO 2: Crear extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PASO 3: Crear tipos ENUM
CREATE TYPE user_role AS ENUM ('engenheiro', 'mestre', 'estagiario', 'operario');
CREATE TYPE zone_type AS ENUM ('Torre', 'Pavimento', 'Unidade');
CREATE TYPE checklist_type AS ENUM ('PRE_START', 'QUALITY_CLOSE');
CREATE TYPE task_status AS ENUM (
  'planned', 
  'blocked', 
  'ready', 
  'in_progress', 
  'completed_pending_verify', 
  'verified_closed', 
  'rework_needed'
);
CREATE TYPE constraint_status AS ENUM ('open', 'resolved');

-- PASO 4: Crear tablas SIN RLS
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES zones(id),
  name TEXT NOT NULL,
  type zone_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL,
  standard_crew_size INTEGER NOT NULL,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE materials_db (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE template_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES activity_templates(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_db(id),
  quantity_per_unit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE template_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES activity_templates(id) ON DELETE CASCADE,
  type checklist_type NOT NULL,
  item_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

CREATE TABLE constraints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status constraint_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE task_checklist_execution (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES template_checklists(id),
  is_checked BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 5: Insertar datos de prueba
INSERT INTO profiles (id, name, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Engenheiro', 'engenheiro'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marcos Mestre', 'mestre'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'João Operário', 'operario'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Ana Estagiária', 'estagiario');

INSERT INTO projects (id, name) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Residencial Horizonte');

INSERT INTO zones (id, parent_id, name, type) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NULL, 'Torre A', 'Torre'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '1º Andar', 'Pavimento'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2º Andar', 'Pavimento'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '3º Andar', 'Pavimento'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apto 101', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apto 102', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Apto 201', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Apto 202', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Apto 301', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Apto 302', 'Unidade');

INSERT INTO activity_templates (id, name, estimated_duration, standard_crew_size, sequence_order) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Alvenaria', 40, 3, 1),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Instalação Elétrica', 16, 2, 2),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Reboco', 32, 3, 3),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Pintura', 24, 2, 4);

INSERT INTO template_checklists (template_id, type, item_description) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PRE_START', 'Projeto de alvenaria disponível?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PRE_START', 'Marcação (eixos) conferida?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'QUALITY_CLOSE', 'Prumo e nível conferidos?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'PRE_START', 'Caixinhas 4x2 disponíveis?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'QUALITY_CLOSE', 'Tubulação desobstruída?');

INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'verified_closed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'completed_pending_verify', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'in_progress', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'rework_needed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'blocked', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'ready', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

INSERT INTO constraints (task_id, description, status) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Falta de eletrodutos na obra', 'open');

-- ✅ LISTO! Base de datos creada SIN RLS
-- Todas las tablas son accesibles públicamente para testing
