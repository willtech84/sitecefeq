// Script para gerar sitemap com produtos
// Execute: node generate-sitemap.js (após configurar Supabase)

// Este script requer configuração do Supabase
// Você pode executá-lo localmente ou criar um endpoint no Netlify Functions

const fs = require('fs');

// Configuração do Supabase (use variáveis de ambiente em produção)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

async function generateSitemap() {
    const baseUrl = 'https://cefeqsc.net.br';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Página Principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Catálogo de Produtos -->
  <url>
    <loc>${baseUrl}/produtos.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Se tiver acesso ao Supabase, buscar produtos
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            
            const { data: products, error } = await supabase
                .from('products')
                .select('id, name, updated_at')
                .eq('available', true)
                .order('name');
            
            if (!error && products) {
                console.log(`✅ Encontrados ${products.length} produtos`);
                
                products.forEach(product => {
                    const slug = generateSlug(product.name);
                    const productUrl = `${baseUrl}/produto.html?id=${product.id}${slug ? `&slug=${slug}` : ''}`;
                    const lastmod = product.updated_at 
                        ? new Date(product.updated_at).toISOString().split('T')[0]
                        : currentDate;
                    
                    sitemap += `  
  <!-- ${product.name} -->
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
                });
            }
        } catch (err) {
            console.warn('⚠️ Erro ao buscar produtos do Supabase:', err.message);
            console.log('💡 Continuando sem produtos no sitemap...');
        }
    } else {
        console.log('⚠️ Variáveis SUPABASE_URL e SUPABASE_KEY não configuradas');
        console.log('💡 Sitemap será gerado apenas com páginas estáticas');
    }

    sitemap += `  
  <!-- Política de Privacidade -->
  <url>
    <loc>${baseUrl}/privacidade.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Termos de Uso -->
  <url>
    <loc>${baseUrl}/termos.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Central de Reclamações -->
  <url>
    <loc>${baseUrl}/reclamacoes.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
</urlset>
`;

    // Salvar sitemap
    fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
    console.log('✅ Sitemap gerado com sucesso!');
    console.log(`📄 Arquivo: sitemap.xml`);
}

function generateSlug(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
}

// Executar
if (require.main === module) {
    generateSitemap().catch(console.error);
}

module.exports = { generateSitemap, generateSlug };
