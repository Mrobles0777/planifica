-- ==========================================================
-- SCRIPT DE CONFIGURACIÓN PARA BORRADO Y SEGURIDAD
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================================

-- 1. Asegurar que la tabla de planes guardados exista
CREATE TABLE IF NOT EXISTS public.saved_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT,
  content JSONB NOT NULL,
  plan_type TEXT DEFAULT 'planning_variable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de perfiles para metadatos de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  location TEXT,
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.saved_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para saved_plans
DROP POLICY IF EXISTS "Usuarios eliminan sus propios planes" ON public.saved_plans;
CREATE POLICY "Usuarios eliminan sus propios planes" 
ON public.saved_plans FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios ven sus propios planes" ON public.saved_plans;
CREATE POLICY "Usuarios ven sus propios planes" 
ON public.saved_plans FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios insertan sus propios planes" ON public.saved_plans;
CREATE POLICY "Usuarios insertan sus propios planes" 
ON public.saved_plans FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. Políticas para profiles
DROP POLICY IF EXISTS "Perfiles son visibles por sus dueños" ON public.profiles;
CREATE POLICY "Perfiles son visibles por sus dueños" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios actualizan su propio perfil" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- 6. Función y Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, location, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.email,
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Configuración de Storage (Ejecutar si es necesario)
-- Nota: La creación de buckets suele hacerse desde la consola de Supabase, 
-- pero aquí se definen las políticas de seguridad para un bucket llamado 'avatars'.

-- Insertar bucket si no existe (opcional, requiere permisos de superusuario en algunos entornos)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para 'avatars'
-- Permitir que cualquiera vea las fotos de perfil (si es público)
-- CREATE POLICY "Cualquiera puede ver avatares" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuarios autenticados suban sus propias fotos
-- CREATE POLICY "Usuarios suben sus propios avatares" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Permitir que usuarios actualicen sus fotos
-- CREATE POLICY "Usuarios actualizan sus propios avatares" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- NOTA: Ejecuta este script completo en el editor SQL de Supabase para aplicar los cambios.