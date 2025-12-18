# Guía: Configurar Permisos RLS en Supabase

## Problema Identificado
La aplicación se conecta correctamente a Supabase, pero recibe errores **401 (Unauthorized)** al intentar leer datos. Esto se debe a que las políticas de Row Level Security (RLS) están bloqueando el acceso a usuarios anónimos.

## Solución: Configurar Políticas RLS

Sigue estos pasos en tu dashboard de Supabase:

### Opción 1: Usar el SQL Editor (Más Rápido)

1. Ve a tu proyecto en Supabase: https://uemhzzgtlrfrxdcexecz.supabase.co
2. En el menú lateral, haz clic en **SQL Editor**
3. Copia y pega el siguiente script SQL:

```sql
-- Permitir lectura anónima para todas las tablas necesarias
CREATE POLICY "Allow anonymous read access" ON profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON zones FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON activity_templates FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON materials_db FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON template_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON template_checklists FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON constraints FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read access" ON task_checklist_execution FOR SELECT TO anon USING (true);

-- Permitir escritura anónima para tablas que necesitan actualizaciones
CREATE POLICY "Allow anonymous write access" ON tasks FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous write access" ON task_checklist_execution FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous write access" ON constraints FOR ALL TO anon USING (true);
```

4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Si ves errores diciendo que las políticas ya existen, es normal - significa que algunas ya están configuradas

### Opción 2: Configurar Manualmente (Interfaz Gráfica)

Si prefieres usar la interfaz gráfica:

1. Ve a **Authentication** > **Policies** en el menú lateral
2. Para cada tabla (`profiles`, `zones`, `activity_templates`, `tasks`, etc.):
   - Haz clic en **New Policy**
   - Selecciona **For full customization**
   - Configura:
     - **Policy name**: `Allow anonymous read access`
     - **Allowed operation**: `SELECT`
     - **Target roles**: `anon`
     - **USING expression**: `true`
   - Haz clic en **Save policy**

3. Para las tablas `tasks`, `task_checklist_execution` y `constraints`, crea políticas adicionales:
   - **Policy name**: `Allow anonymous write access`
   - **Allowed operation**: `ALL`
   - **Target roles**: `anon`
   - **USING expression**: `true`

## Verificar que Funciona

Después de configurar las políticas:

1. Recarga la aplicación en tu navegador (http://localhost:5174/)
2. Deberías ver:
   - Los nombres de usuarios en el selector superior derecho
   - La matriz de terminalidad con tareas de colores
   - Las zonas (Torre A, Apartamentos, etc.)

## Nota de Seguridad

⚠️ **Importante**: Esta configuración permite acceso completo anónimo a los datos. Es perfecta para desarrollo y pruebas, pero **NO** es recomendable para producción.

Para producción, deberías:
- Implementar autenticación de usuarios real
- Crear políticas RLS más restrictivas basadas en el usuario autenticado
- Usar la tabla `profiles` para controlar permisos por rol

## ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Recarga la página
4. Busca las peticiones a Supabase (filtro: `supabase.co`)
5. Verifica el código de respuesta (debería ser 200, no 401)
