-- ============================================
-- CRIAÇÃO DA TABELA DE VISITANTES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script é SEGURO e cria apenas a estrutura necessária
-- ============================================

-- 1. Criar tabela de visitantes (apenas se não existir)
CREATE TABLE IF NOT EXISTS public.site_visitors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    visited_at timestamptz DEFAULT now(),
    ip_address text,
    user_agent text,
    page_url text,
    created_at timestamptz DEFAULT now()
);

-- 2. Criar índices para melhor performance (apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON public.site_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.site_visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.site_visitors(created_at DESC);

-- 3. Habilitar RLS (Row Level Security) - SEGURO
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas apenas se existirem (SEGURO - usa IF EXISTS)
-- Isso evita erros se as políticas não existirem
DO $$ 
BEGIN
    -- Remover políticas antigas se existirem
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_visitors' AND policyname = 'Visitantes são públicos para leitura') THEN
        DROP POLICY "Visitantes são públicos para leitura" ON public.site_visitors;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_visitors' AND policyname = 'Permitir inserção de visitantes') THEN
        DROP POLICY "Permitir inserção de visitantes" ON public.site_visitors;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_visitors' AND policyname = 'Admin pode ver visitantes') THEN
        DROP POLICY "Admin pode ver visitantes" ON public.site_visitors;
    END IF;
END $$;

-- 5. Criar políticas RLS (SEGURO - permite leitura e inserção públicas)
CREATE POLICY "Visitantes são públicos para leitura"
ON public.site_visitors FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de visitantes"
ON public.site_visitors FOR INSERT
WITH CHECK (true);

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
-- Este script é SEGURO e não modifica dados existentes
-- Ele apenas cria a estrutura necessária para rastrear visitantes
-- ============================================
