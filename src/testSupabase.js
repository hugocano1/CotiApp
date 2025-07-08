import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    const { data, error } = await supabase.from('offers').select('*').limit(1);
    
    if (error) {
        console.error('❌ Error en la conexión con Supabase:', error);
    } else {
        console.log('✅ Conexión exitosa con Supabase:', data);
    }
}

testConnection();
