import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }
    try {
        const { prompt, model = "gemini-1.5-flash", responseSchema, responseMimeType } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        // Modo diagnóstico
        if (prompt === "ping") {
            return new Response(JSON.stringify({
                status: "ok",
                hasApiKey: !!apiKey,
                apiKeyPrefix: apiKey ? apiKey.substring(0, 4) + "..." : "missing",
                info: "Usando Gemini 1.5 Flash en v1 API"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY no está configurada en los secretos de Supabase.');
        }

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: responseMimeType || "application/json"
            }
        };

        if (responseSchema) {
            body.generationConfig.responseSchema = responseSchema;
        }

        // Usamos v1 para gemini-1.5-flash (más estable) y v1beta para otros si es necesario
        const apiVersion = model.includes("2.0") ? "v1beta" : "v1";
        const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(`Google API Error: ${data.error?.message || response.statusText}`);
        }
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return new Response(JSON.stringify({
            text: generatedText
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
});
