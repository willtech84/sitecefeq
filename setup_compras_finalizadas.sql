-- Tabela para armazenar compras finalizadas
CREATE TABLE IF NOT EXISTS public.completed_orders (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_type TEXT,
  customer_document TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  items_count INTEGER NOT NULL,
  payment_method TEXT,
  delivery_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_data JSONB -- Armazenar dados completos do pedido
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_completed_orders_created_at ON public.completed_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completed_orders_session_id ON public.completed_orders(session_id);

-- RLS (Row Level Security) - Permitir leitura pública e inserção pública
ALTER TABLE public.completed_orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para admin)
DROP POLICY IF EXISTS "Permitir leitura de compras finalizadas" ON public.completed_orders;
CREATE POLICY "Permitir leitura de compras finalizadas" ON public.completed_orders
  FOR SELECT
  USING (true);

-- Política para permitir inserção pública (quando cliente finaliza compra)
DROP POLICY IF EXISTS "Permitir inserção de compras finalizadas" ON public.completed_orders;
CREATE POLICY "Permitir inserção de compras finalizadas" ON public.completed_orders
  FOR INSERT
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.completed_orders IS 'Registra todas as compras finalizadas pelos clientes';
COMMENT ON COLUMN public.completed_orders.session_id IS 'ID da sessão do cliente';
COMMENT ON COLUMN public.completed_orders.customer_name IS 'Nome do cliente';
COMMENT ON COLUMN public.completed_orders.customer_email IS 'E-mail do cliente';
COMMENT ON COLUMN public.completed_orders.total_amount IS 'Valor total do pedido';
COMMENT ON COLUMN public.completed_orders.items_count IS 'Quantidade de itens no pedido';
COMMENT ON COLUMN public.completed_orders.order_data IS 'Dados completos do pedido em JSON';
