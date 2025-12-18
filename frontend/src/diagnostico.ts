import { supabase } from './lib/supabase';

// Script de diagnóstico para verificar la conexión a Supabase
async function testSupabaseConnection() {
    console.log('🔍 Iniciando diagnóstico de Supabase...\n');

    // Test 1: Verificar configuración
    console.log('1️⃣ Verificando configuración:');
    console.log('   URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('   Key configurada:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Sí' : '❌ No');
    console.log('');

    // Test 2: Probar conexión a cada tabla
    const tables = [
        'profiles',
        'zones',
        'activity_templates',
        'tasks',
        'template_checklists',
        'constraints',
        'projects'
    ];

    for (const table of tables) {
        try {
            const { data, error, status } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.log(`❌ ${table}: Error ${status} - ${error.message}`);
            } else {
                console.log(`✅ ${table}: OK (${data?.length || 0} registros en muestra)`);
            }
        } catch (e: any) {
            console.log(`❌ ${table}: Excepción - ${e.message}`);
        }
    }

    console.log('\n🔍 Diagnóstico completado');
}

// Ejecutar al cargar la página
testSupabaseConnection();

export default testSupabaseConnection;
