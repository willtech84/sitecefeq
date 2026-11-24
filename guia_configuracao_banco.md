# 📋 GUIA DE CONFIGURAÇÃO DO BANCO DE DADOS

## 🔗 Acesso ao Supabase

O site usa o Supabase. A URL do projeto e a chave pública anon são configuradas nas variáveis de ambiente do Netlify; não coloque esses valores em arquivos publicados.
- **Arquivo de inicialização:** `supabase.js`
- **Configuração entregue pelo Netlify:** `/.netlify/functions/supabase-config`

## 📝 Scripts SQL Disponíveis

Todos os scripts SQL estão na raiz do projeto:

### 1. **setup_price_installment.sql** ⭐ (NOVO - EXECUTAR AGORA)
   - Adiciona campos de preço à vista, preço parcelado e número máximo de parcelas
   - **Arquivo:** `setup_price_installment.sql`

### 2. Outros Scripts:
   - `setup_product_code.sql` - Adiciona campo de código do produto
   - `setup_views.sql` - Adiciona contador de visualizações
   - `setup_avaliacoes.sql` - Configura sistema de avaliações
   - `setup_compras_finalizadas.sql` - Configura registro de compras
   - `setup_rls_final.sql` - Configura segurança (RLS)
   - `setup_visitors.sql` - Configura registro de visitantes

## 🚀 Como Executar o Script de Preços e Parcelas

### Passo 1: Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### Passo 3: Copiar e Colar o Script
1. Abra o arquivo `setup_price_installment.sql` no seu projeto
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase

### Passo 4: Executar o Script
1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Aguarde a confirmação de sucesso

### Passo 5: Verificar se Funcionou
Execute esta consulta para verificar se os campos foram criados:

```sql
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name IN ('price_cash', 'price_installment', 'max_installments');
```

Você deve ver 3 linhas retornadas:
- `price_cash` (tipo: numeric)
- `price_installment` (tipo: numeric)
- `max_installments` (tipo: integer, padrão: 12)

## 📊 Verificar Produtos Existentes

Para ver os produtos e seus novos campos:

```sql
SELECT 
  id,
  name,
  price,
  price_cash,
  price_installment,
  max_installments
FROM public.products
LIMIT 10;
```

## ⚙️ Estrutura da Tabela `products`

Após executar o script, a tabela `products` terá estes campos relacionados a preços:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `price` | numeric | Preço original (mantido para compatibilidade) |
| `price_cash` | numeric(10,2) | Preço à vista |
| `price_installment` | numeric(10,2) | Preço total quando parcelado |
| `max_installments` | integer | Número máximo de parcelas (padrão: 12) |
| `promotional_price` | numeric | Preço promocional (legado) |

## 🔧 Configuração no Admin

Após executar o script SQL:
1. Acesse o painel admin do seu site
2. Vá em "Cadastrar Produto" ou "Editar Produtos"
3. Você verá os novos campos:
   - **Preço à Vista**
   - **Preço Parcelado**
   - **Número Máximo de Parcelas**

## ✅ Checklist de Configuração

- [ ] Executar `setup_price_installment.sql` no Supabase
- [ ] Verificar se os campos foram criados (usar consulta acima)
- [ ] Testar cadastro de produto no admin
- [ ] Verificar se os preços aparecem corretamente no site
- [ ] Testar finalização de compra e verificar mensagem do WhatsApp

## 🆘 Problemas Comuns

### Erro: "column already exists"
- **Solução:** O campo já existe. Pode ignorar o erro ou usar `DROP COLUMN` antes.

### Erro: "permission denied"
- **Solução:** Verifique se está usando a conta correta do Supabase ou execute com Service Role Key.

### Campos não aparecem no admin
- **Solução:** Limpe o cache do navegador (Ctrl+Shift+R) e recarregue a página.

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase no dashboard
3. Confirme que o script foi executado completamente

---

**Última atualização:** Configuração de preços e parcelas
**Status:** ✅ Pronto para uso após executar o script SQL
