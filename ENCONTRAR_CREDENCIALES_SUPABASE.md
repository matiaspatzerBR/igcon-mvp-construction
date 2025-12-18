# Cómo Encontrar las Credenciales Correctas de Supabase

## Paso 1: Ve a tu Dashboard de Supabase
1. Abre https://app.supabase.com
2. Selecciona tu proyecto `uemhzzgtlrfrxdcexecz`

## Paso 2: Ir a Project Settings
1. En el menú lateral izquierdo, haz clic en el ícono de **engranaje** (⚙️)
2. Selecciona **API** en el menú de configuración

## Paso 3: Copiar las Credenciales Correctas
Verás una sección llamada **"Project API keys"**. Necesitas copiar:

### URL del Proyecto
- Busca: **"Project URL"** o **"URL"**
- Debe ser: `https://uemhzzgtlrfrxdcexecz.supabase.co`

### Anon Key (Clave Pública)
- Busca: **"anon" key** o **"public" key**
- Es un JWT muy largo que empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- **NO uses** la "service_role" key (esa es secreta y solo para el backend)

## Ejemplo de cómo se ven las keys correctas:

```
URL: https://uemhzzgtlrfrxdcexecz.supabase.co

anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbWh6emd0bHJmcnhkY2V4ZWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODU0NTUsImV4cCI6MjA4MDk2MTQ1NX0.3twBSG6hELUPNBWGqLy1dYkXV1pVUWe9bKuQhmfiUfA
```

## ⚠️ Importante
- La **anon key** es la que va en el `.env` del frontend
- La **service_role key** NUNCA debe usarse en el frontend (es solo para backend/servidor)
- Las keys que empiezan con `sb_publishable_` o `sb_secret_` NO son las correctas para Supabase JS Client

## Una vez que tengas las credenciales correctas:
1. Actualiza el archivo `.env` en la carpeta `frontend`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Recarga la página en el navegador
