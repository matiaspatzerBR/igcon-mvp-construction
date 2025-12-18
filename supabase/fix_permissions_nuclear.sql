-- SCRIPT NUCLEAR: Permisos Totales y RLS Open
-- Ejecuta esto para asegurar que NO sea un problema de permisos básicos

-- 1. Asegurar permisos de uso en el esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Asegurar permisos en TODAS las tablas para anon y authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 3. Asegurar que las tablas futuras también tengan permisos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- 4. Reactivar RLS (Supabase lo prefiere) pero con política OPEN
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

-- 5. Borrar políticas viejas para asegurar limpieza
DROP POLICY IF EXISTS "Public access" ON profiles;
DROP POLICY IF EXISTS "Public access" ON zones;
DROP POLICY IF EXISTS "Public access" ON activity_templates;
DROP POLICY IF EXISTS "Public access" ON materials_db;
DROP POLICY IF EXISTS "Public access" ON template_materials;
DROP POLICY IF EXISTS "Public access" ON template_checklists;
DROP POLICY IF EXISTS "Public access" ON projects;
DROP POLICY IF EXISTS "Public access" ON tasks;
DROP POLICY IF EXISTS "Public access" ON constraints;
DROP POLICY IF EXISTS "Public access" ON task_checklist_execution;

-- 6. Crear política universal única y simple
CREATE POLICY "Public access" ON profiles FOR ALL USING (true);
CREATE POLICY "Public access" ON zones FOR ALL USING (true);
CREATE POLICY "Public access" ON activity_templates FOR ALL USING (true);
CREATE POLICY "Public access" ON materials_db FOR ALL USING (true);
CREATE POLICY "Public access" ON template_materials FOR ALL USING (true);
CREATE POLICY "Public access" ON template_checklists FOR ALL USING (true);
CREATE POLICY "Public access" ON projects FOR ALL USING (true);
CREATE POLICY "Public access" ON tasks FOR ALL USING (true);
CREATE POLICY "Public access" ON constraints FOR ALL USING (true);
CREATE POLICY "Public access" ON task_checklist_execution FOR ALL USING (true);

-- ✅ Permisos GRANT explícitos + RLS Open policies aplicados
