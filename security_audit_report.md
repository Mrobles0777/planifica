
# SECURITY AUDIT REPORT - Planifica (Antigravity)

**Fecha:** 2026-02-12
**Auditor:** Antigravity AI Security workflow

---

## 📊 Resumen Ejecutivo

| Categoría | Estado |
| :--- | :--- |
| 🔐 **Credenciales** | 🟢 **OK** |
| 🔐 **Base de Datos (Supabase)** | 🟢 **OK** |
| 🔐 **Arquitectura** | 🟢 **OK** |
| 🔐 **Autenticación** | 🟢 **OK** |
| 🔐 **APIs / Edge Functions** | 🟠 **MEDIO** |
| 🔐 **Dependencias** | 🟢 **OK** |

**RIESGO TOTAL:** 🟢 **BAJO / MEDIO**
**DEPLOY RECOMENDADO:** ✅ **SÍ** (Con observaciones)

---

## 🧩 Detalles de la Auditoría

### 1. Credenciales y Secretos
*   **Estado:** 🟢 OK
*   **Hallazgos:**
    *   No se encontraron API Keys hardcodeadas en el código fuente (`App.tsx`, `components/`, `services/`).
    *   `GEMINI_API_KEY` se accede correctamente a través de `Deno.env.get` en la Edge Function.
    *   `supabaseClient.ts` utiliza `import.meta.env` para las variables públicas, lo cual es correcto.

### 2. Seguridad de Base de Datos
*   **Estado:** 🟢 OK
*   **Hallazgos:**
    *   **RLS (Row Level Security):** Habilitado para tablas `saved_plans` y `profiles` en `supabase_setup.sql`.
    *   **Políticas:** Correctamente definidas con `CHECK (auth.uid() = user_id)` y `USING (auth.uid() = id)`. Los usuarios solo pueden leer/modificar sus propios datos.
    *   **Trigger:** `handle_new_user` configurado con `SECURITY DEFINER` para creación automática de perfiles, lo cual es un patrón seguro si se controla el input (se toman datos de `raw_user_meta_data`).

### 3. Arquitectura de la Aplicación
*   **Estado:** 🟢 OK
*   **Hallazgos:**
    *   La lógica sensible de generación de contenido con IA se ha movido exitosamente a `supabase/functions/generate-content`.
    *   El frontend (`geminiService.ts`) ahora invoca la función remota en lugar de llamar a Google directamente, protegiendo la API Key.

### 4. Autenticación y Autorización
*   **Estado:** 🟢 OK
*   **Hallazgos:**
    *   Uso correcto de `supabase.auth` en `App.tsx` para manejo de sesiones.
    *   Vistas protegidas: La UI verifica la sesión antes de mostrar contenido privado (Redirección a `LoginView` si no hay sesión).

### 5. APIs y Edge Functions
*   **Estado:** 🟠 MEDIO
*   **Hallazgos:**
    *   **Validación de Auth Implícita:** La función `generate-content` no valida explícitamente el usuario dentro del código (`req.headers.get('Authorization')`). Depende de que la opción strict "Enforce JWT" esté habilitada en el dashboard de Supabase. Si estuviera deshabilitada, cualquier usuario anónimo podría consumir la cuota de IA.
    *   **Falta de Rate Limiting:** No hay lógica en la Edge Function para limitar el número de peticiones por usuario. Un usuario malicioso podría abusar del endpoint `generate-content`.
*   **Recomendación:**
    1.  Asegurar que "Enforce Verification of JWT" esté activo en la configuración de la Function en Supabase.
    2.  Implementar Rate Limiting básico (ej. usando Upstash Redis o lógica simple en DB) si el tráfico aumenta.

### 6. Dependencias
*   **Estado:** 🟢 OK
*   **Hallazgos:**
    *   Paquetes actualizados (`react 19`, `vite 6`).
    *   No se detectan dependencias obsoletas críticas a simple vista.

---

## ✅ Conclusión

La aplicación cuenta con una postura de seguridad sólida para una fase de desarrollo/producción temprana. La separación de la lógica de la API Key hacia una Edge Function ha mitigado el riesgo más crítico. Se recomienda monitorizar el uso de la Edge Function para prevenir abusos.
