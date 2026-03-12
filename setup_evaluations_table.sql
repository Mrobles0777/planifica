-- ==========================================================
-- SCRIPT PARA CREACIÓN DE TABLA DE EVALUACIONES
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================================

-- 1. Crear la tabla de evaluaciones si no existe
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  establishment TEXT,
  rbd TEXT,
  level TEXT,
  year TEXT,
  child_ids UUID[] DEFAULT '{}',
  indicators JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas para 'evaluations'

-- Política: Los usuarios solo pueden ver sus propias evaluaciones
DROP POLICY IF EXISTS "Usuarios ven sus propias evaluaciones" ON public.evaluations;
CREATE POLICY "Usuarios ven sus propias evaluaciones" 
ON public.evaluations FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias evaluaciones
DROP POLICY IF EXISTS "Usuarios insertan sus propias evaluaciones" ON public.evaluations;
CREATE POLICY "Usuarios insertan sus propias evaluaciones" 
ON public.evaluations FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias evaluaciones
DROP POLICY IF EXISTS "Usuarios eliminan sus propias evaluaciones" ON public.evaluations;
CREATE POLICY "Usuarios eliminan sus propias evaluaciones" 
ON public.evaluations FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- NOTA: Ejecuta este script completo en el editor SQL de Supabase para aplicar los cambios.
