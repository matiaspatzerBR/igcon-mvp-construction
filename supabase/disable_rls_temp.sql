-- SOLUCIÓN TEMPORAL: DESHABILITAR RLS COMPLETAMENTE
-- ⚠️ ADVERTENCIA: Esto es SOLO para desarrollo/testing
-- NO usar en producción

-- Deshabilitar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials_db DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE constraints DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_execution DISABLE ROW LEVEL SECURITY;

-- ✅ Ahora TODAS las tablas son accesibles sin restricciones
-- Esto debería permitir que la aplicación funcione inmediatamente
