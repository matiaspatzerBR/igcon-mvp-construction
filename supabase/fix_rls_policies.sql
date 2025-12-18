-- SCRIPT ALTERNATIVO: Resetear y Configurar RLS desde Cero
-- Ejecuta este script en el SQL Editor de Supabase

-- PASO 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON zones;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON activity_templates;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON materials_db;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON template_materials;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON template_checklists;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON constraints;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON task_checklist_execution;

DROP POLICY IF EXISTS "Allow insert/update for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Allow insert/update for authenticated users" ON task_checklist_execution;
DROP POLICY IF EXISTS "Allow insert/update for authenticated users" ON constraints;

DROP POLICY IF EXISTS "Allow anonymous read access" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous read access" ON zones;
DROP POLICY IF EXISTS "Allow anonymous read access" ON activity_templates;
DROP POLICY IF EXISTS "Allow anonymous read access" ON materials_db;
DROP POLICY IF EXISTS "Allow anonymous read access" ON template_materials;
DROP POLICY IF EXISTS "Allow anonymous read access" ON template_checklists;
DROP POLICY IF EXISTS "Allow anonymous read access" ON projects;
DROP POLICY IF EXISTS "Allow anonymous read access" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous read access" ON constraints;
DROP POLICY IF EXISTS "Allow anonymous read access" ON task_checklist_execution;

DROP POLICY IF EXISTS "Allow anonymous write access" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous write access" ON task_checklist_execution;
DROP POLICY IF EXISTS "Allow anonymous write access" ON constraints;

-- PASO 2: Crear políticas SUPER PERMISIVAS para testing
-- Estas permiten acceso completo a TODOS (anon, authenticated, service_role)

-- Profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON profiles FOR ALL USING (true);

-- Zones
CREATE POLICY "Public read zones" ON zones FOR SELECT USING (true);
CREATE POLICY "Public write zones" ON zones FOR ALL USING (true);

-- Activity Templates
CREATE POLICY "Public read activity_templates" ON activity_templates FOR SELECT USING (true);
CREATE POLICY "Public write activity_templates" ON activity_templates FOR ALL USING (true);

-- Materials DB
CREATE POLICY "Public read materials_db" ON materials_db FOR SELECT USING (true);
CREATE POLICY "Public write materials_db" ON materials_db FOR ALL USING (true);

-- Template Materials
CREATE POLICY "Public read template_materials" ON template_materials FOR SELECT USING (true);
CREATE POLICY "Public write template_materials" ON template_materials FOR ALL USING (true);

-- Template Checklists
CREATE POLICY "Public read template_checklists" ON template_checklists FOR SELECT USING (true);
CREATE POLICY "Public write template_checklists" ON template_checklists FOR ALL USING (true);

-- Projects
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public write projects" ON projects FOR ALL USING (true);

-- Tasks
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public write tasks" ON tasks FOR ALL USING (true);

-- Constraints
CREATE POLICY "Public read constraints" ON constraints FOR SELECT USING (true);
CREATE POLICY "Public write constraints" ON constraints FOR ALL USING (true);

-- Task Checklist Execution
CREATE POLICY "Public read task_checklist_execution" ON task_checklist_execution FOR SELECT USING (true);
CREATE POLICY "Public write task_checklist_execution" ON task_checklist_execution FOR ALL USING (true);

-- PASO 3: Verificar que RLS esté habilitado
-- (Ya debería estarlo desde schema.sql, pero por si acaso)
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

-- ✅ LISTO! Ahora TODAS las tablas permiten acceso completo a cualquier usuario
