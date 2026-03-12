
import { createClient } from '@supabase/supabase-js';

// Datos de tu proyecto: Planifica
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    // Forzamos el uso del fetch nativo del navegador para evitar problemas en entornos sandbox
    fetch: (input, init) => fetch(input, init)
  }
});

/**
 * Función utilitaria para probar si la URL de Supabase es alcanzable.
 * Ayuda a diagnosticar errores de 'Failed to fetch'.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const startTime = Date.now();
    // Intentamos una petición simple a la API de Auth (que siempre debería responder)
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { 'apikey': SUPABASE_ANON_KEY }
    });
    const duration = Date.now() - startTime;

    if (response.ok) {
      return { success: true, message: `Conexión exitosa (${duration}ms). El servidor responde correctamente.` };
    } else {
      return { success: false, message: `Error del servidor: Código ${response.status}. La URL es correcta pero el servicio reporta un problema.` };
    }
  } catch (err: any) {
    console.error("Diagnostic error:", err);
    return {
      success: false,
      message: "No se pudo alcanzar el servidor. Esto suele ocurrir porque: 1. No tienes internet. 2. El proyecto de Supabase está PAUSADO. 3. Hay un bloqueo de red (CORS/Firewall)."
    };
  }
}
