require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const https = require('https');

const url = 'https://besyjnekyhwawdmocehw.supabase.co/rest/v1/offers?select=*&limit=1';
const options = {
  headers: {
    'apikey': process.env.EXPO_PUBLIC_SUPABASE_KEY,
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_KEY}`
  }
};

console.log('Probando petición HTTPS nativa a:', url);

const req = https.get(url, options, (res) => {
  console.log('Estado:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Respuesta recibida correctamente (longitud):', data.length);
    if (res.statusCode === 200) {
      console.log('✅ Conexión HTTPS exitosa.');
    } else {
      console.log('❌ Error en la respuesta:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de red:', e.message);
});

req.end();