# Guía de Ejecución, Pruebas y Despliegue - iGcon

Esta guía detalla los pasos para ejecutar la aplicación localmente, conectada a su base de datos Supabase, y cómo desplegarla en un entorno productivo para pruebas en línea.

## 1. Configuración del Entorno (Supabase)

La aplicación ha sido configurada para conectarse a su proyecto de Supabase.
Se ha creado automáticamente un archivo `.env` en la carpeta `frontend` con las credenciales que proporcionó.

### Credenciales Configuradas
- **URL**: `https://uemhzzgtlrfrxdcexecz.supabase.co`
- **Key**: (Configurada en el archivo `.env`)

### Importante sobre Seguridad y Datos
1.  **Datos Iniciales**: Para que la aplicación muestre información, su base de datos debe tener datos. Si ejecutó los scripts de `schema.sql` y `seed.sql` en el SQL Editor de Supabase, las tablas deberían estar pobladas correctamente.
2.  **Permisos (RLS - Row Level Security)**:
    - La aplicación utiliza la conexión anónima (`anon key`).
    - Si sus tablas en Supabase tienen RLS habilitado (por defecto sí), las políticas actuales (`TO authenticated`) podrían bloquear la lectura de datos si no hay un usuario logueado.
    - **Para pruebas rápidas**: Puede modificar las políticas RLS en el dashboard de Supabase para permitir lectura (`SELECT`) al rol `anon` o `public` en las tablas `profiles`, `zones`, `tasks`, etc.
    - Si ve errores de "Permission denied" o "Erro ao carregar dados", es probable que sea debido a las políticas RLS.

## 2. Ejecución Local

Para correr la aplicación en su computadora:

1.  Abra una terminal (PowerShell o CMD) y navegue a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instale las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicie el servidor de desarrollo local:
    ```bash
    npm run dev
    ```
4.  La terminal mostrará una URL local (generalmente `http://localhost:5173`). Abra esa dirección en su navegador.

## 3. Pruebas de la Aplicación

Una vez que la aplicación esté abierta en el navegador:

1.  **Verificación de Carga**:
    - Debería ver la "Matriz de Terminalidad" con tareas (cuadros de colores) organizados por torres/pisos.
    - Si ve un mensaje rojo de error, verifique la consola del navegador (F12 > Console) y revise los permisos RLS en Supabase.

2.  **Interacción**:
    - Use el selector en la esquina superior derecha para "cambiar de usuario" (esto simula ser otro usuario basado en los perfiles cargados).
    - Haga clic en una tarea para ver sus detalles.
    - Intente cambiar el estado de una tarea o marcar ítems del checklist (si la funcionalidad está habilitada).

3.  **Verificación en Base de Datos**:
    - Después de realizar un cambio en la UI, puede ir al "Table Editor" en su dashboard de Supabase y verificar que el registro correspondiente en la tabla `tasks` se haya actualizado.

## 4. Subir el Código a GitHub

Para respaldar su código y facilitar el despliegue:

1.  Inicialice el repositorio git (si no lo ha hecho):
    ```bash
    git init
    ```
2.  Añada los archivos al área de preparación:
    ```bash
    git add .
    ```
3.  Realice el primer commit:
    ```bash
    git commit -m "Versión inicial conectada a Supabase"
    ```
4.  Cree un **Nuevo Repositorio** en su cuenta de GitHub.
5.  Siga las instrucciones de GitHub para empujar el código (reemplace la URL por la de su repositorio):
    ```bash
    git remote add origin https://github.com/USUARIO/igcon-mes.git
    git branch -M main
    git push -u origin main
    ```

*Nota: El archivo `.env` está generalmente ignorado por `.gitignore` para no exponer sus claves secretas en el repositorio público.*

## 5. Despliegue en Línea (Recomendado: Vercel)

Vercel es la plataforma recomendada para aplicaciones Vite/React y tiene un plan gratuito excelente para pruebas.

1.  Cree una cuenta en [Vercel.com](https://vercel.com).
2.  Haga clic en **"Add New..."** > **"Project"**.
3.  Importe su repositorio de GitHub (`igcon-mes`).
4.  **Configuración de Variables de Entorno**:
    - En la pantalla de configuración del despliegue, expanda la sección **Environment Variables**.
    - Debe agregar manualmente las variables que están en su `.env` local para que funcionen en la nube:
        - **Name**: `VITE_SUPABASE_URL` | **Value**: `https://uemhzzgtlrfrxdcexecz.supabase.co`
        - **Name**: `VITE_SUPABASE_ANON_KEY` | **Value**: *(Copie el valor largo de su archivo .env)*
5.  Haga clic en **Deploy**.

En unos segundos, Vercel le dará una URL pública (ej. `https://igcon-mes.vercel.app`) donde podrá acceder a su aplicación desde cualquier lugar.
