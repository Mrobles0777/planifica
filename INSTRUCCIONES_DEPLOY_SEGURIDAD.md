
# 🔐 Instrucciones para Desplegar la Seguridad (Edge Functions)

Para completar la corrección de seguridad y ocultar tu API Key de Gemini, debes desplegar la "Edge Function" que he creado. Esto moverá la lógica de IA del navegador (inseguro) a los servidores de Supabase (seguro).

## PASO 1: Instalar Supabase CLI (si no lo tienes)

Si ya tienes `npm`, puedes usar `npx` sin instalar nada globalmente, o instalarlo:

```bash
npm install -g supabase
```

## PASO 2: Login en Supabase

```bash
npx supabase login
```
Sigue las instrucciones en pantalla para autorizar el CLI.

## PASO 3: Vincular tu Proyecto

Necesitas el "Project ID" de tu proyecto en Supabase (lo puedes ver en la URL de tu dashboard: `https://supabase.com/dashboard/project/gbdtngkdtdnsmhkczdru`).

```bash
npx supabase link --project-ref gbdtngkdtdnsmhkczdru
```
Te pedirá la contraseña de tu base de datos. Si no la recuerdas, puedes resetearla en el panel de Supabase (Database > Settings).

## PASO 4: Establecer el Secreto (API Key)

Ahora guardaremos tu API Key de Gemini de forma segura en Supabase. **Nunca más estará en el código del frontend.**

```bash
npx supabase secrets set GEMINI_API_KEY=AIzaSyCCfCxvayrPKALF1A8aU3qwzP5kzx679Wg
```

## PASO 5: Desplegar la Función

Sube la función que creé (`supabase/functions/generate-content`) a la nube.

```bash
npx supabase functions deploy generate-content
```

---

## ✅ Verificación

Una vez desplegado:
1. Recarga tu aplicación Planifica.
2. Intenta generar una planificación.
3. Ahora la petición no irá a Google directamente, sino a `https://gbdtngkdtdnsmhkczdru.supabase.co/functions/v1/generate-content`, y tu API Key nunca será visible para el usuario.
