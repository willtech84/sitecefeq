-- ============================================
-- ADICIONAR CONTADOR DE VISUALIZAÇÕES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna de visualizações na tabela de produtos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

-- Criar índice para melhor performance em ordenações por visualizações
CREATE INDEX IF NOT EXISTS idx_products_views ON public.products(views DESC);

-- Atualizar produtos existentes para ter 0 visualizações (se necessário)
UPDATE public.products 
SET views = 0 
WHERE views IS NULL;

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
