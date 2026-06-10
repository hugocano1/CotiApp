require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    const { data, error } = await supabase.from('offers').select('*').limit(1);
    
    if (error) {
        console.error('❌ Error en la conexión con Supabase:', error);
    } else {
        console.log('✅ Conexión exitosa con Supabase. Se obtuvo 1 registro de "offers".');
    }
}

testConnection();