-- ============================================
-- ADICIONAR CAMPOS DE PREÇO À VISTA E PARCELADO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna de preço à vista
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_cash numeric(10,2);

-- Adicionar coluna de preço parcelado
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_installment numeric(10,2);

-- Adicionar coluna de número máximo de parcelas
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS max_installments integer DEFAULT 12;

-- Atualizar produtos existentes: usar price como price_cash e price_installment
-- (você pode ajustar esses valores manualmente no admin depois)
UPDATE public.products 
SET 
  price_cash = price,
  price_installment = price * 1.1, -- 10% de acréscimo como exemplo
  max_installments = 12
WHERE price_cash IS NULL OR price_installment IS NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_price_cash ON public.products(price_cash);
CREATE INDEX IF NOT EXISTS idx_products_price_installment ON public.products(price_installment);

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
-- Os preços serão exibidos como:
-- "R$ 99,99 à vista ou R$ 110,99 em até 12x de R$ 9,25"
-- ============================================
