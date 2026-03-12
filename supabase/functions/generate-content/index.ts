import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Timeout for the Gemini API call to avoid Supabase Edge Function limits
const GEMINI_REQUEST_TIMEOUT_MS = 45_000;

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { prompt, model = "gemini-2.0-flash", responseSchema, responseMimeType } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        // Modo diagnóstico
        if (prompt === "ping") {
            return new Response(JSON.stringify({
                status: "ok",
                hasApiKey: !!apiKey,
                apiKeyPrefix: apiKey ? apiKey.substring(0, 4) + "..." : "missing",
                info: "Usando v1beta con modelo estable gemini-2.0-flash."
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY no está configurada en los secretos de Supabase.');
        }

        const body: Record<string, unknown> = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: responseMimeType || "application/json"
            }
        };

        if (responseSchema) {
            (body.generationConfig as Record<string, unknown>).responseSchema = responseSchema;
        }

        // v1beta soporta responseSchema y nuevos modelos
        const apiVersion = "v1beta";
        const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

        // Usamos AbortController para limitar el tiempo de espera a Gemini
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), GEMINI_REQUEST_TIMEOUT_MS);

        let response: Response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: abortController.signal
            });
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
            const message = isTimeout
                ? `La API de Gemini no respondió en ${GEMINI_REQUEST_TIMEOUT_MS / 1000}s. Intenta de nuevo.`
                : `Error de red al contactar Gemini: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`;
            throw new Error(message);
        }
        clearTimeout(timeoutId);

        const data = await response.json();
        if (!response.ok) {
            console.error("Gemini API Error Response:", JSON.stringify(data));
            const geminiError = data?.error?.message || response.statusText;
            throw new Error(`Google API Error (${response.status}): ${geminiError}`);
        }

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
            console.error("Gemini empty response:", JSON.stringify(data));
            throw new Error("La API de Gemini devolvió una respuesta vacía. Verifica el modelo y la API Key.");
        }

        return new Response(JSON.stringify({ text: generatedText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido en la función.";
        console.error("Function Error:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
