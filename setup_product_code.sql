-- ============================================
-- ADICIONAR CAMPO DE CÓDIGO DO PRODUTO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna de código do produto na tabela de produtos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_code text;

-- Atualizar produtos existentes sem código (usar ID temporário se necessário)
-- IMPORTANTE: Você deve preencher os códigos manualmente no admin após executar este script
UPDATE public.products 
SET product_code = 'TEMP-' || id::text 
WHERE product_code IS NULL OR product_code = '';

-- Tornar o campo obrigatório (NOT NULL)
-- NOTA: Se houver produtos sem código, você precisará preenchê-los primeiro no admin
-- Descomente a linha abaixo APENAS após preencher todos os códigos:
-- ALTER TABLE public.products ALTER COLUMN product_code SET NOT NULL;

-- Criar índice para melhor performance em buscas por código
CREATE INDEX IF NOT EXISTS idx_products_product_code ON public.products(product_code);

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
-- O código do produto ficará oculto no site
-- e aparecerá apenas na mensagem do WhatsApp
-- ============================================
