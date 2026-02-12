
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { prompt, model = "gemini-2.0-flash", responseSchema, responseMimeType } = await req.json();

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno de Supabase.');
        }

        // Usamos la REST API directamente para evitar dependencias complejas en Deno
        // Mapeamos "gemini-3-flash-preview" a un modelo válido si es necesario, 
        // pero intentaremos usar el que nos pasen o "gemini-2.0-flash" por defecto.
        // Nota: "gemini-3-flash-preview" podría no existir realmente, usaremos "gemini-2.0-flash" como fallback seguro si falla,
        // o confiamos en el input.

        // Construimos el body para la API REST de Google
        const body: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: responseMimeType || "application/json",
            }
        };

        if (responseSchema) {
            body.generationConfig.responseSchema = responseSchema;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        console.log(`Llamando a Gemini API: ${model}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(data.error?.message || 'Error desconocido en Gemini API');
        }

        // Extraemos el texto de la respuesta para mantener compatibilidad con el frontend
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return new Response(JSON.stringify({ text: generatedText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
