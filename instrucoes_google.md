# 🚀 Instruções Simples para Indexação no Google

## ✅ TUDO JÁ ESTÁ PRONTO!

Seu site já está **100% configurado** para o Google indexar. Só precisa fazer 3 passos:

---

## 📋 3 PASSOS SIMPLES:

### **PASSO 1: Acessar Google Search Console**
1. Vá em: https://search.google.com/search-console
2. Faça login com sua conta Google
3. Clique em **"Adicionar propriedade"**
4. Digite: `https://cefeqsc.net.br`
5. Clique em **"Continuar"**

### **PASSO 2: Verificar o Site**
O Google vai pedir para verificar. Escolha **"Arquivo HTML"**:
1. Baixe o arquivo que o Google fornece
2. Faça upload na raiz do site (mesma pasta do index.html)
3. Clique em **"Verificar"**

### **PASSO 3: Enviar Sitemap**
1. No Google Search Console, vá em **"Sitemaps"** (menu lateral)
2. Digite: `sitemap.xml`
3. Clique em **"Enviar"**
4. ✅ PRONTO!

---

## ⏱️ Quanto tempo demora?

- **Primeira indexação**: 1 a 7 dias
- **Produtos aparecerem**: 1 a 2 semanas
- **Resultados completos**: 2 a 4 semanas

---

## ✅ O que já está configurado:

- ✅ **robots.txt** - Permite indexação
- ✅ **sitemap.xml** - Mapa do site
- ✅ **Schema.org** - Dados estruturados (TODOS os produtos)
- ✅ **Meta tags** - Todas as páginas
- ✅ **URLs canônicas** - Todas as páginas
- ✅ **Mobile-friendly** - Site responsivo
- ✅ **Links internos** - Produtos linkados

---

## 🔍 Como verificar se está funcionando:

### **No Google Search Console:**
- Vá em **"Cobertura"** para ver páginas indexadas
- Vá em **"Performance"** para ver palavras-chave

### **Pesquisar no Google:**
Digite: `site:cefeqsc.net.br`

Isso mostra todas as páginas indexadas.

---

## 📱 Páginas que serão indexadas:

1. ✅ **Home** (`/`) - Página principal
2. ✅ **Catálogo** (`/produtos.html`) - Lista de produtos
3. ✅ **Produtos individuais** (`/produto.html?id=X`) - TODOS os produtos
4. ✅ **Privacidade** (`/privacidade.html`)
5. ✅ **Termos** (`/termos.html`)
6. ✅ **Reclamações** (`/reclamacoes.html`)

**TODAS as páginas serão indexadas automaticamente!**

---

## 🎯 Dicas para acelerar:

1. **Adicione produtos regularmente** - Google prefere sites atualizados
2. **Compartilhe nas redes sociais** - Ajuda na descoberta
3. **Peça para clientes acessarem** - Mais tráfego = mais indexação

---

## ❓ Dúvidas?

- **"Página não indexada?"** → Aguarde alguns dias, é normal
- **"Erro no sitemap?"** → Verifique se o arquivo está acessível
- **"Produtos não aparecem?"** → Aguarde 1-2 semanas, é normal para conteúdo dinâmico

---

**Tudo está pronto! Só fazer os 3 passos acima e aguardar! 🚀**

---

## Feed de produtos Google Merchant Center e Meta

O feed CSV é servido dinamicamente em:

`https://cefeqsc.net.br/feed/meta-products.csv`

O arquivo consulta os produtos no Supabase sempre que é requisitado, portanto acompanha inclusões e alterações no catálogo (com cache de até 1 minuto). Produtos sem ID, nome, preço positivo ou imagem são omitidos. Produtos indisponíveis são incluídos como `out of stock`.

### Publicação no Netlify

1. Em **Site configuration → Environment variables**, configure `SUPABASE_URL` com a URL HTTPS do projeto Supabase.
2. Configure `SUPABASE_KEY` com a chave pública/anon do projeto (ou `SUPABASE_ANON_KEY`). Nunca use a chave service role.
3. O site recebe essa configuração por uma função do Netlify; não copie a URL ou a chave para arquivos HTML, JavaScript ou documentação publicada.
4. Faça um novo deploy do site.
5. Abra o endereço do feed e confirme que ele começa com os campos `id,title,description,availability,condition,price,link,image_link,brand`.
6. Cadastre essa URL como origem agendada do feed no Google Merchant Center e no Commerce Manager da Meta.

O projeto Supabase precisa permitir a leitura pública dos produtos pela chave anon, como já é necessário para exibir o catálogo no site. Se uma variável de ambiente estiver ausente ou a consulta ao banco falhar, o endpoint retorna erro HTTP em vez de um CSV vazio.
