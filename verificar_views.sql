-- ============================================
-- VERIFICAR SE A COLUNA VIEWS EXISTE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para verificar se a coluna views foi criada
-- ============================================

-- Verificar se a coluna views existe
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name = 'views';

-- Se não retornar nenhuma linha, a coluna não existe
-- Execute o script setup_views.sql para criá-la

-- Verificar produtos que não têm views definido
SELECT id, name, views
FROM public.products
WHERE views IS NULL
LIMIT 10;

-- ============================================
-- FIM DA VERIFICAÇÃO
-- ============================================
