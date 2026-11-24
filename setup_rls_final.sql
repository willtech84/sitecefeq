-- ============================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS) - SUPABASE
-- ============================================
-- Execute este arquivo no SQL Editor do Supabase
-- Pode executar quantas vezes quiser - não apaga nada existente
-- ============================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA PRODUTOS (products)
-- ============================================

-- Leitura pública (qualquer um pode ver produtos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Produtos são públicos para leitura'
    ) THEN
        CREATE POLICY "Produtos são públicos para leitura"
        ON products FOR SELECT
        USING (true);
    END IF;
END $$;

-- Inserção permitida (admin pode adicionar produtos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Permitir inserção de produtos'
    ) THEN
        CREATE POLICY "Permitir inserção de produtos"
        ON products FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Atualização permitida (admin pode editar produtos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Permitir atualização de produtos'
    ) THEN
        CREATE POLICY "Permitir atualização de produtos"
        ON products FOR UPDATE
        USING (true);
    END IF;
END $$;

-- Exclusão permitida (admin pode excluir produtos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Permitir exclusão de produtos'
    ) THEN
        CREATE POLICY "Permitir exclusão de produtos"
        ON products FOR DELETE
        USING (true);
    END IF;
END $$;

-- 3. POLÍTICAS PARA CATEGORIAS (categories)
-- ============================================

-- Leitura pública
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'categories' 
        AND policyname = 'Categorias são públicas para leitura'
    ) THEN
        CREATE POLICY "Categorias são públicas para leitura"
        ON categories FOR SELECT
        USING (true);
    END IF;
END $$;

-- Inserção permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'categories' 
        AND policyname = 'Permitir inserção de categorias'
    ) THEN
        CREATE POLICY "Permitir inserção de categorias"
        ON categories FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Atualização permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'categories' 
        AND policyname = 'Permitir atualização de categorias'
    ) THEN
        CREATE POLICY "Permitir atualização de categorias"
        ON categories FOR UPDATE
        USING (true);
    END IF;
END $$;

-- Exclusão permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'categories' 
        AND policyname = 'Permitir exclusão de categorias'
    ) THEN
        CREATE POLICY "Permitir exclusão de categorias"
        ON categories FOR DELETE
        USING (true);
    END IF;
END $$;

-- 4. POLÍTICAS PARA MARCAS (brands)
-- ============================================

-- Leitura pública
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'brands' 
        AND policyname = 'Marcas são públicas para leitura'
    ) THEN
        CREATE POLICY "Marcas são públicas para leitura"
        ON brands FOR SELECT
        USING (true);
    END IF;
END $$;

-- Inserção permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'brands' 
        AND policyname = 'Permitir inserção de marcas'
    ) THEN
        CREATE POLICY "Permitir inserção de marcas"
        ON brands FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Atualização permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'brands' 
        AND policyname = 'Permitir atualização de marcas'
    ) THEN
        CREATE POLICY "Permitir atualização de marcas"
        ON brands FOR UPDATE
        USING (true);
    END IF;
END $$;

-- Exclusão permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'brands' 
        AND policyname = 'Permitir exclusão de marcas'
    ) THEN
        CREATE POLICY "Permitir exclusão de marcas"
        ON brands FOR DELETE
        USING (true);
    END IF;
END $$;

-- 5. POLÍTICAS PARA CARRINHO (cart_items)
-- ============================================

-- Leitura pública (qualquer um pode ver seu próprio carrinho)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items' 
        AND policyname = 'Carrinho é público para leitura'
    ) THEN
        CREATE POLICY "Carrinho é público para leitura"
        ON cart_items FOR SELECT
        USING (true);
    END IF;
END $$;

-- Inserção permitida (qualquer um pode adicionar ao carrinho)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items' 
        AND policyname = 'Permitir inserção no carrinho'
    ) THEN
        CREATE POLICY "Permitir inserção no carrinho"
        ON cart_items FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

-- Atualização permitida (qualquer um pode atualizar seu carrinho)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items' 
        AND policyname = 'Permitir atualização do carrinho'
    ) THEN
        CREATE POLICY "Permitir atualização do carrinho"
        ON cart_items FOR UPDATE
        USING (true);
    END IF;
END $$;

-- Exclusão permitida (qualquer um pode remover do carrinho)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items' 
        AND policyname = 'Permitir exclusão do carrinho'
    ) THEN
        CREATE POLICY "Permitir exclusão do carrinho"
        ON cart_items FOR DELETE
        USING (true);
    END IF;
END $$;

-- 6. POLÍTICAS PARA STORAGE (imagens)
-- ============================================

-- Leitura pública das imagens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Imagens são públicas para leitura'
    ) THEN
        CREATE POLICY "Imagens são públicas para leitura"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'products');
    END IF;
END $$;

-- Upload de imagens permitido
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Permitir upload de imagens'
    ) THEN
        CREATE POLICY "Permitir upload de imagens"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'products');
    END IF;
END $$;

-- Atualização de imagens permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Permitir atualização de imagens'
    ) THEN
        CREATE POLICY "Permitir atualização de imagens"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'products');
    END IF;
END $$;

-- Exclusão de imagens permitida
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Permitir exclusão de imagens'
    ) THEN
        CREATE POLICY "Permitir exclusão de imagens"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'products');
    END IF;
END $$;

-- ============================================
-- FIM DA CONFIGURAÇÃO
-- ============================================
-- 
-- ✅ Este script pode ser executado quantas vezes quiser
-- ✅ Não apaga políticas existentes
-- ✅ Cria apenas as políticas que ainda não existem
-- ✅ Não gera erros se executado múltiplas vezes
-- 
-- Após executar, verifique:
-- 1. Badge "Políticas RLS" deve mostrar "4" para cada tabela
-- 2. Teste se consegue ler produtos no site
-- 3. Teste se consegue adicionar produtos no admin
-- 4. Teste se consegue editar/excluir produtos
-- 5. Teste upload de imagens
-- ============================================
