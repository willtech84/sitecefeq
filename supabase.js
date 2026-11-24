const supabaseConfig = window.SUPABASE_CONFIG;

if (!supabaseConfig || !supabaseConfig.url || !supabaseConfig.key) {
  console.error('Configuração do Supabase ausente. Verifique as variáveis SUPABASE_URL e SUPABASE_KEY no Netlify.');
} else if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
  console.error('❌ Supabase JS não foi carregado!');
  console.error('Certifique-se de que o script está incluído ANTES deste arquivo.');
  console.error('Ordem: 1) CDN do Supabase 2) supabase.js 3) admin.js');
} else {
  const supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key);
  window.supabase = supabaseClient;
  console.log('✅ Supabase inicializado com sucesso!');
}
