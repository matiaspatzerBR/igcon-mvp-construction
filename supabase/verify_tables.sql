-- SCRIPT DE VERIFICACIÓN: Comprobar que las tablas existen
-- Ejecuta este script en el SQL Editor de Supabase

-- Este query te mostrará TODAS las tablas que existen en tu esquema público
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- Si ves las tablas listadas (profiles, zones, tasks, etc.), entonces existen
-- Si NO ves las tablas, significa que necesitas ejecutar schema.sql y seed.sql primero
