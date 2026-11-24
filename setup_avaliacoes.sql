-- ============================================
-- CRIAÇÃO DA TABELA DE AVALIAÇÕES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    customer_email text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.products(id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.product_reviews(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Avaliações são públicas para leitura" ON public.product_reviews;
DROP POLICY IF EXISTS "Permitir inserção de avaliações" ON public.product_reviews;
DROP POLICY IF EXISTS "Permitir atualização de avaliações" ON public.product_reviews;
DROP POLICY IF EXISTS "Permitir exclusão de avaliações" ON public.product_reviews;

-- Políticas RLS para avaliações
-- Leitura pública (qualquer um pode ver avaliações)
CREATE POLICY "Avaliações são públicas para leitura"
ON public.product_reviews FOR SELECT
USING (true);

-- Inserção permitida (qualquer um pode avaliar)
CREATE POLICY "Permitir inserção de avaliações"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

-- Atualização permitida (apenas o próprio autor pode atualizar - opcional)
CREATE POLICY "Permitir atualização de avaliações"
ON public.product_reviews FOR UPDATE
USING (true);

-- Exclusão permitida (apenas o próprio autor pode excluir - opcional)
CREATE POLICY "Permitir exclusão de avaliações"
ON public.product_reviews FOR DELETE
USING (true);

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
