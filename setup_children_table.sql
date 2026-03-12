-- ==========================================================
-- SCRIPT PARA CREACIÓN DE TABLA DE NIÑOS (Listado Base)
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================================

-- 1. Crear la tabla de niños si no existe
CREATE TABLE IF NOT EXISTS public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  level TEXT NOT NULL,
  vaccines TEXT,
  allergies TEXT,
  other_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas para 'children'

-- Política: Los usuarios solo pueden ver sus propios niños
DROP POLICY IF EXISTS "Usuarios ven sus propios niños" ON public.children;
CREATE POLICY "Usuarios ven sus propios niños" 
ON public.children FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios niños
DROP POLICY IF EXISTS "Usuarios insertan sus propios niños" ON public.children;
CREATE POLICY "Usuarios insertan sus propios niños" 
ON public.children FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios niños
DROP POLICY IF EXISTS "Usuarios actualizan sus propios niños" ON public.children;
CREATE POLICY "Usuarios actualizan sus propios niños" 
ON public.children FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios niños
DROP POLICY IF EXISTS "Usuarios eliminan sus propios niños" ON public.children;
CREATE POLICY "Usuarios eliminan sus propios niños" 
ON public.children FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- NOTA: Ejecuta este script completo en el editor SQL de Supabase para aplicar los cambios.
