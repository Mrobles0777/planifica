
-- ==========================================================
-- SCRIPT DE CONFIGURACIÓN DE STORAGE (AVATARES)
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================================

-- 1. Crear el bucket 'avatars' si no existe
-- Supabase usa la tabla storage.buckets para gestionar buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en storage.objects (por defecto suele estar activo)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas previas para evitar conflictos
DROP POLICY IF EXISTS "Cualquiera puede ver avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios suben sus propios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios actualizan sus propios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios eliminan sus propios avatares" ON storage.objects;

-- 4. Crear Políticas

-- Permitir acceso público a las imágenes
CREATE POLICY "Cualquiera puede ver avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir a usuarios autenticados subir archivos a su propia carpeta
-- La ruta esperada es: avatars / {user_id} / archivo.jpg
CREATE POLICY "Usuarios suben sus propios avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios actualizar sus propios archivos
CREATE POLICY "Usuarios actualizan sus propios avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios eliminar sus propios archivos
CREATE POLICY "Usuarios eliminan sus propios avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
