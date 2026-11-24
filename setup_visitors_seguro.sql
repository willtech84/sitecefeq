-- ============================================
-- VERSÃO SEGURA - CRIAÇÃO DA TABELA DE VISITANTES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Esta versão é mais conservadora e evita avisos
-- ============================================

-- PASSO 1: Criar tabela (apenas se não existir)
CREATE TABLE IF NOT EXISTS public.site_visitors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    visited_at timestamptz DEFAULT now(),
    ip_address text,
    user_agent text,
    page_url text,
    created_at timestamptz DEFAULT now()
);

-- PASSO 2: Criar índices (apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON public.site_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.site_visitors(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.site_visitors(created_at DESC);

-- PASSO 3: Habilitar RLS
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas (se não existirem, serão criadas; se existirem, serão ignoradas)
-- Política de leitura pública
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'site_visitors' 
        AND policyname = 'Visitantes são públicos para leitura'
    ) THEN
        CREATE POLICY "Visitantes são públicos para leitura"
        ON public.site_visitors FOR SELECT
        USING (true);
    END IF;
END $$;

-- Política de inserção pública
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'site_visitors' 
        AND policyname = 'Permitir inserção de visitantes'
    ) THEN
        CREATE POLICY "Permitir inserção de visitantes"
        ON public.site_visitors FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
-- Esta versão evita avisos do SQL Editor
-- Todas as operações são seguras e usam IF NOT EXISTS
-- ============================================
