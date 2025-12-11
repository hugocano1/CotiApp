import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("AI Orchestrator function booting up...");

// Define los encabezados CORS para permitir peticiones desde cualquier origen.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Maneja las peticiones OPTIONS (pre-flight) que los navegadores envían para CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Asegurarse de que el método sea POST
    if (req.method !== "POST") {
      throw new Error("Método no permitido. Por favor, usa POST.");
    }
    
    // Extraer el 'prompt' del cuerpo de la petición.
    const { prompt } = await req.json();
    console.log("Prompt recibido en el orquestador:", prompt);

    // --- Aquí irá la lógica de IA en el futuro ---
    // Por ahora, solo devolvemos una respuesta de prueba.
    const aiResponse = `Este es el 'puerto USB'. He recibido tu prompt: "${prompt}"`;

    const responseData = {
      reply: aiResponse,
    };

    // Devolver la respuesta a la aplicación cliente.
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en AI Orchestrator:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
