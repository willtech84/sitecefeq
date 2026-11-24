





// ================= VARIÁVEIS =================
let products = [];
let categories = [];

let editingId = null;
let searchTerm = "";
// Arquivos novos selecionados no upload (porque o input é limpo para permitir selecionar mais)
let pendingUploadFiles = [];

// Variáveis para ordenação e filtros avançados
let sortBy = 'name'; // 'name', 'price', 'date', 'category'
let sortOrder = 'asc'; // 'asc', 'desc'
let filterMinPrice = null;
let filterMaxPrice = null;
let filterAvailable = 'all'; // 'all', 'available', 'unavailable'

// ================= SISTEMA DE NOTIFICAÇÕES TOAST =================
function showToast(message, type = 'success', duration = 3000) {
  // Remover toast anterior se existir
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;
  
  // Adicionar animação CSS se não existir
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remover após duração
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  return toast;
}

// ================= EDITOR DE FICHA TÉCNICA =================
function openFichaTecnicaEditor() {
  const modal = document.getElementById("fichaTecnicaModal");
  const itemsContainer = document.getElementById("fichaTecnicaItems");
  const previewContainer = document.getElementById("fichaTecnicaPreview");
  
  if (!modal || !itemsContainer) return;
  
  // Limpar itens anteriores
  itemsContainer.innerHTML = "";
  if (previewContainer) {
    previewContainer.innerHTML = '<p class="ficha-preview-empty">Adicione linhas para ver o preview</p>';
  }
  
  // Adicionar primeira linha vazia
  addFichaTecnicaItem();
  
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.style.visibility = "visible";
  modal.style.opacity = "1";
  modal.style.pointerEvents = "auto";
  modal.style.zIndex = "9999";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  
  // Focar no primeiro campo
  setTimeout(() => {
    const firstInput = itemsContainer.querySelector('.ficha-caracteristica');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeFichaTecnicaEditor() {
  const modal = document.getElementById("fichaTecnicaModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
    modal.style.zIndex = "-9999";
    modal.style.position = "fixed";
    modal.style.top = "-99999px";
    modal.style.left = "-99999px";
    modal.style.width = "1px";
    modal.style.height = "1px";
    modal.style.overflow = "hidden";
  }
}

function addFichaTecnicaItem(caracteristica = "", especificacao = "") {
  const itemsContainer = document.getElementById("fichaTecnicaItems");
  if (!itemsContainer) return;
  
  const itemDiv = document.createElement("div");
  itemDiv.className = "ficha-tecnica-item";
  
  itemDiv.innerHTML = `
    <input 
      type="text" 
      class="ficha-caracteristica" 
      placeholder="Ex: Voltagem, Capacidade, Modelo..." 
      value="${escapeHtml(caracteristica)}"
    >
    <input 
      type="text" 
      class="ficha-especificacao" 
      placeholder="Ex: 18V, 5.0 Ah, BL1850B..." 
      value="${escapeHtml(especificacao)}"
    >
    <button 
      type="button" 
      onclick="removeFichaTecnicaItem(this)" 
      title="Remover linha"
    >
      <i class="fa-solid fa-trash"></i>
    </button>
  `;
  
  itemsContainer.appendChild(itemDiv);
  
  // Adicionar evento para atualizar preview em tempo real
  const inputs = itemDiv.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', updateFichaTecnicaPreview);
  });
  
  // Focar no primeiro campo
  itemDiv.querySelector('.ficha-caracteristica').focus();
  
  // Atualizar preview
  updateFichaTecnicaPreview();
}

function removeFichaTecnicaItem(button) {
  const itemDiv = button.closest(".ficha-tecnica-item");
  if (itemDiv) {
    itemDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      itemDiv.remove();
      updateFichaTecnicaPreview();
    }, 300);
  }
}

function updateFichaTecnicaPreview() {
  const itemsContainer = document.getElementById("fichaTecnicaItems");
  const previewContainer = document.getElementById("fichaTecnicaPreview");
  
  if (!itemsContainer || !previewContainer) return;
  
  const items = itemsContainer.querySelectorAll(".ficha-tecnica-item");
  const rows = [];
  
  items.forEach(item => {
    const caracteristica = item.querySelector(".ficha-caracteristica").value.trim();
    const especificacao = item.querySelector(".ficha-especificacao").value.trim();
    
    if (caracteristica && especificacao) {
      rows.push({ caracteristica, especificacao });
    }
  });
  
  if (rows.length === 0) {
    previewContainer.innerHTML = '<p class="ficha-preview-empty">Adicione linhas para ver o preview</p>';
    return;
  }
  
  let tableHTML = '<table><thead><tr><th>Característica</th><th>Especificação Técnica</th></tr></thead><tbody>';
  
  rows.forEach(row => {
    tableHTML += `<tr><td>${escapeHtml(row.caracteristica)}</td><td>${escapeHtml(row.especificacao)}</td></tr>`;
  });
  
  tableHTML += '</tbody></table>';
  previewContainer.innerHTML = tableHTML;
}

function insertFichaTecnica() {
  const itemsContainer = document.getElementById("fichaTecnicaItems");
  const descriptionTextarea = document.getElementById("description");
  
  if (!itemsContainer || !descriptionTextarea) return;
  
  const items = itemsContainer.querySelectorAll(".ficha-tecnica-item");
  if (items.length === 0) {
    alert("⚠️ Adicione pelo menos uma linha na ficha técnica!");
    return;
  }
  
  // Coletar dados
  const rows = [];
  items.forEach(item => {
    const caracteristica = item.querySelector(".ficha-caracteristica").value.trim();
    const especificacao = item.querySelector(".ficha-especificacao").value.trim();
    
    if (caracteristica && especificacao) {
      rows.push({ caracteristica, especificacao });
    }
  });
  
  if (rows.length === 0) {
    alert("⚠️ Preencha pelo menos uma linha completa (característica e especificação)!");
    return;
  }
  
  // Gerar HTML da tabela formatado
  let tableHTML = "<table>\n  <thead>\n    <tr>\n      <th>Característica</th>\n      <th>Especificação Técnica</th>\n    </tr>\n  </thead>\n  <tbody>\n";
  
  rows.forEach(row => {
    tableHTML += `    <tr>\n      <td>${escapeHtml(row.caracteristica)}</td>\n      <td>${escapeHtml(row.especificacao)}</td>\n    </tr>\n`;
  });
  
  tableHTML += "  </tbody>\n</table>";
  
  // Inserir na descrição
  const currentValue = descriptionTextarea.value.trim();
  const newValue = currentValue ? currentValue + "\n\n" + tableHTML : tableHTML;
  descriptionTextarea.value = newValue;
  
  // Fechar modal
  closeFichaTecnicaEditor();
  
  // Feedback visual
  descriptionTextarea.style.border = "2px solid #10b981";
  descriptionTextarea.style.transition = "border 0.3s";
  setTimeout(() => {
    descriptionTextarea.style.border = "";
  }, 2000);
  
  // Scroll para o textarea
  descriptionTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function parsePastedTable() {
  const pasteTextarea = document.getElementById("fichaTecnicaPaste");
  const itemsContainer = document.getElementById("fichaTecnicaItems");
  
  if (!pasteTextarea || !itemsContainer) return;
  
  const pastedText = pasteTextarea.value.trim();
  if (!pastedText) {
    alert("⚠️ Cole uma tabela primeiro!");
    return;
  }
  
  // Limpar itens existentes
  itemsContainer.innerHTML = "";
  
  // Dividir por linhas
  const lines = pastedText.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    alert("⚠️ Nenhuma linha encontrada!");
    return;
  }
  
  let parsedCount = 0;
  
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    let caracteristica = "";
    let especificacao = "";
    
    // Tentar diferentes delimitadores
    // 1. Tab (mais comum em tabelas copiadas)
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        caracteristica = parts[0];
        especificacao = parts.slice(1).join(' '); // Juntar se houver mais de 2 colunas
      }
    }
    // 2. Múltiplos espaços (tabelas formatadas)
    else if (line.match(/\s{2,}/)) {
      const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        caracteristica = parts[0];
        especificacao = parts.slice(1).join(' ');
      }
    }
    // 3. Dois pontos seguido de espaço
    else if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      caracteristica = line.substring(0, colonIndex).trim();
      especificacao = line.substring(colonIndex + 1).trim();
    }
    // 4. Vírgula (CSV)
    else if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        caracteristica = parts[0];
        especificacao = parts.slice(1).join(', ');
      }
    }
    // 5. Pipe (|)
    else if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        caracteristica = parts[0];
        especificacao = parts.slice(1).join(' | ');
      }
    }
    // 6. Se não encontrar delimitador, tentar dividir no primeiro espaço significativo
    else {
      const firstSpaceIndex = line.indexOf(' ');
      if (firstSpaceIndex > 0) {
        caracteristica = line.substring(0, firstSpaceIndex).trim();
        especificacao = line.substring(firstSpaceIndex).trim();
      } else {
        // Se não conseguir dividir, usar a linha inteira como especificação
        especificacao = line;
      }
    }
    
    // Só adicionar se tiver pelo menos uma característica ou especificação
    if (caracteristica || especificacao) {
      addFichaTecnicaItem(caracteristica, especificacao);
      parsedCount++;
    }
  });
  
  if (parsedCount === 0) {
    alert("⚠️ Não foi possível identificar o formato da tabela. Tente copiar novamente.");
    // Adicionar uma linha vazia para o usuário preencher manualmente
    addFichaTecnicaItem();
  } else {
    // Limpar o campo de colagem
    pasteTextarea.value = "";
    alert(`✅ ${parsedCount} linha(s) adicionada(s) com sucesso!`);
    // Atualizar preview
    updateFichaTecnicaPreview();
  }
}

// Tornar função acessível globalmente
window.parsePastedTable = parsePastedTable;

// Tornar funções acessíveis globalmente
window.openFichaTecnicaEditor = openFichaTecnicaEditor;
window.closeFichaTecnicaEditor = closeFichaTecnicaEditor;
window.addFichaTecnicaItem = addFichaTecnicaItem;
window.removeFichaTecnicaItem = removeFichaTecnicaItem;
window.insertFichaTecnica = insertFichaTecnica;

// ================= CONVERSÃO PARA WEBP COM CORTE AUTOMÁTICO =================
/**
 * Converte uma imagem para formato WebP automaticamente
 * Corta para quadrado (1:1) e redimensiona para tamanho ideal
 * @param {File} file - Arquivo de imagem original (JPG, PNG, GIF, etc.)
 * @returns {Promise<File>} - Arquivo convertido para WebP
 */
async function convertToWebP(file) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Iniciando processamento automático: ${file.name} (${file.type})`);
    
    // Se já for WebP, ainda precisa processar (cortar e redimensionar)
    // Verificar se é uma imagem válida
    if (!file.type.startsWith('image/')) {
      reject(new Error(`Arquivo não é uma imagem: ${file.type}`));
      return;
    }

    // Verificar suporte do navegador
    if (!HTMLCanvasElement.prototype.toBlob) {
      console.warn('⚠️ Navegador não suporta processamento, usando arquivo original');
      resolve(file);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`📐 Dimensões originais: ${img.width}x${img.height}`);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tamanho final desejado (quadrado 1200x1200px - ideal para web)
        const finalSize = 1200;
        
        // Calcular o tamanho do corte quadrado (usar o menor lado)
        const minDimension = Math.min(img.width, img.height);
        
        // Calcular posição de corte para centralizar
        const sourceX = (img.width - minDimension) / 2;
        const sourceY = (img.height - minDimension) / 2;
        
        // Configurar canvas para tamanho final
        canvas.width = finalSize;
        canvas.height = finalSize;
        
        // Melhorar qualidade de renderização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Desenhar imagem cortada e redimensionada
        // Cortar quadrado do centro e redimensionar para 1200x1200
        ctx.drawImage(
          img,
          sourceX, sourceY, minDimension, minDimension, // Área de origem (corte quadrado)
          0, 0, finalSize, finalSize // Área de destino (redimensionado)
        );
        
        console.log(`✂️ Cortado para quadrado: ${minDimension}x${minDimension}`);
        console.log(`📏 Redimensionado para: ${finalSize}x${finalSize}`);
        console.log('🎨 Convertendo para WebP...');
        
        // Converter para WebP com qualidade 90% (boa qualidade e tamanho)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              const webpFile = new File([blob], `${originalName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now()
              });
              
              const originalSize = (file.size / 1024).toFixed(2);
              const webpSize = (blob.size / 1024).toFixed(2);
              const reduction = ((1 - blob.size / file.size) * 100).toFixed(1);
              
              console.log(`✅ Processamento concluído: ${file.name} → ${webpFile.name}`);
              console.log(`   📐 Tamanho: ${img.width}x${img.height} → ${finalSize}x${finalSize} (quadrado)`);
              console.log(`   💾 Arquivo: ${originalSize}KB → ${webpSize}KB (${reduction}% menor)`);
              resolve(webpFile);
            } else {
              console.error('❌ Blob vazio retornado do canvas.toBlob');
              reject(new Error('Erro ao converter para WebP: blob vazio'));
            }
          },
          'image/webp',
          0.90 // Qualidade 90% - bom equilíbrio entre qualidade e tamanho
        );
      };
      
      img.onerror = (error) => {
        console.error('❌ Erro ao carregar imagem no elemento <img>:', error);
        reject(new Error('Erro ao carregar imagem para processamento'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error);
      reject(new Error('Erro ao ler arquivo para processamento'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Função para formatar valor no formato brasileiro completo (1.998,00)
function formatPriceBR(value) {
  if (!value && value !== 0) return "";
  
  // Remover tudo que não é número, exceto vírgula e ponto
  let cleanValue = String(value).replace(/[^\d,.-]/g, '');
  
  // Se tiver vírgula, usar como separador decimal
  if (cleanValue.includes(',')) {
    // Remover pontos (separadores de milhar)
    cleanValue = cleanValue.replace(/\./g, '');
    const parts = cleanValue.split(',');
    const integer = parts[0] || '0';
    const decimal = parts[1] ? parts[1].substring(0, 2) : '00';
    
    // Adicionar separador de milhar (ponto)
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimal.padEnd(2, '0')}`;
  }
  // Se tiver ponto, verificar se é separador decimal ou milhar
  else if (cleanValue.includes('.')) {
    const parts = cleanValue.split('.');
    // Se último parte tem 2 dígitos, é decimal
    if (parts[parts.length - 1].length <= 2 && parts.length === 2) {
      const integer = parts[0] || '0';
      const decimal = parts[1].substring(0, 2).padEnd(2, '0');
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${formattedInteger},${decimal}`;
    } else {
      // É separador de milhar, remover e reformatar
      cleanValue = cleanValue.replace(/\./g, '');
      const formattedInteger = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${formattedInteger},00`;
    }
  }
  // Apenas números
  else {
    if (!cleanValue) return "";
    const formattedInteger = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},00`;
  }
}

// Função para normalizar valores numéricos (aceita vírgula ou ponto)
function normalizePrice(value) {
  if (!value || value === "") return null;
  // Remover pontos (separadores de milhar) e substituir vírgula por ponto (separador decimal)
  const normalized = String(value).replace(/\./g, '').replace(/,/g, '.').replace(/\s/g, '');
  const num = Number(normalized);
  return isNaN(num) ? null : num;
}
let showOnlyDestaques = false;
let selectedBrand = "";

const previewImages = document.getElementById("previewImages");
const list = document.getElementById("list");

// ================= ABAS =================
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  if (!tabButtons || tabButtons.length === 0) {
    console.warn('Botões de abas não encontrados');
    return;
  }
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) {
        console.error('Botão de aba sem data-tab:', btn);
        return;
      }
      
      // Remover active de todos os botões e abas
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      
      // Adicionar active ao botão clicado
      btn.classList.add("active");
      
      // Mostrar a aba correspondente
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.classList.add("active");
      } else {
        console.error('Aba não encontrada:', tabId);
      }
    });
  });
  
  console.log('✅ Abas configuradas:', tabButtons.length);
}

// Configurar abas quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTabs);
} else {
  setupTabs();
}

// ================= PRODUTOS =================

async function saveProduct() {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    showToast('❌ Erro: Supabase não está configurado. Verifique o console.', 'error', 5000);
    console.error('Supabase não disponível');
    return;
  }

  try {
    const name = document.getElementById("name").value;
    
    // Preço à vista
    const priceCashInput = document.getElementById("priceCash");
    const priceCashValue = priceCashInput && priceCashInput.value ? priceCashInput.value : null;
    const priceCash = normalizePrice(priceCashValue);
    
    if (priceCashValue && priceCash === null) {
      showToast("❌ Preço à vista inválido! Use 99,99 ou 99.99", 'error', 5000);
      if (priceCashInput) priceCashInput.focus();
      return;
    }
    
    // Preço parcelado
    const priceInstallmentInput = document.getElementById("priceInstallment");
    const priceInstallmentValue = priceInstallmentInput && priceInstallmentInput.value ? priceInstallmentInput.value : null;
    const priceInstallment = normalizePrice(priceInstallmentValue);
    
    if (priceInstallmentValue && priceInstallment === null) {
      showToast("❌ Preço parcelado inválido! Use 110,99 ou 110.99", 'error', 5000);
      if (priceInstallmentInput) priceInstallmentInput.focus();
      return;
    }
    
    // Número de parcelas
    const maxInstallmentsInput = document.getElementById("maxInstallments");
    let maxInstallments = maxInstallmentsInput && maxInstallmentsInput.value ? parseInt(maxInstallmentsInput.value) : 12;
    
    // Validar número de parcelas
    if (isNaN(maxInstallments) || maxInstallments < 1) {
      showToast("❌ Número de parcelas inválido (1 a 24).", 'error', 5000);
      if (maxInstallmentsInput) maxInstallmentsInput.focus();
      return;
    }
    
    if (maxInstallments > 24) {
      showToast("❌ Máximo de parcelas: 24.", 'error', 5000);
      if (maxInstallmentsInput) maxInstallmentsInput.focus();
      return;
    }
    
    // Campos legados (manter para compatibilidade)
    const priceInput = document.getElementById("price");
    const price = priceCash || (priceInput && priceInput.value ? normalizePrice(priceInput.value) : null);
    
    const promotionalPriceInput = document.getElementById("promotionalPrice");
    let promotionalPriceValue = promotionalPriceInput && promotionalPriceInput.value ? promotionalPriceInput.value : null;
    
    // Se for porcentagem, calcular o desconto baseado no preço à vista
    if (promotionalPriceValue && promotionalPriceValue.includes('%')) {
      const percentMatch = promotionalPriceValue.match(/(\d+(?:[.,]\d+)?)/);
      if (percentMatch && priceCash !== null && priceCash > 0) {
        const percent = parseFloat(percentMatch[1].replace(',', '.'));
        if (percent > 0 && percent <= 100) {
          const discount = (priceCash * percent) / 100;
          promotionalPriceValue = (priceCash - discount).toString();
        }
      }
    }
    
    const promotionalPrice = normalizePrice(promotionalPriceValue);
    
    if (priceCashValue && priceCash === null) {
      showToast("❌ Preço à vista inválido! Use 99,99 ou 99.99", 'error', 5000);
      if (priceCashInput) priceCashInput.focus();
      return;
    }
    
    if (priceInstallmentValue && priceInstallment === null) {
      showToast("❌ Preço parcelado inválido! Use 110,99 ou 110.99", 'error', 5000);
      if (priceInstallmentInput) priceInstallmentInput.focus();
      return;
    }
    const description = document.getElementById("description").value;
    const productCodeInput = document.getElementById("productCode");
    const productCode = productCodeInput ? productCodeInput.value.trim() : null;
    
    // Validar código do produto (obrigatório)
    if (!productCode || productCode.length === 0) {
      showToast("⚠️ Código do produto é obrigatório.", 'info', 4000);
      if (productCodeInput) {
        productCodeInput.focus();
      }
      return;
    }
    
    const category = document.getElementById("category").value;
    const brandSelect = document.getElementById("brand");
    const brand = brandSelect ? brandSelect.value.trim() : null;
    
    const availableSelect = document.getElementById("available");
    const featuredSelect = document.getElementById("featured");
    const inputEl = document.getElementById("image");
    const filesFromInput = (inputEl && inputEl.files) ? Array.from(inputEl.files) : [];
    const files = (pendingUploadFiles && pendingUploadFiles.length > 0) ? pendingUploadFiles : filesFromInput;

    // Converter valores do select para boolean
    const available = availableSelect ? availableSelect.value === "true" : true;
    const featured = featuredSelect ? featuredSelect.value === "true" : false;

    console.log('Valores antes de salvar:', { available, featured, availableType: typeof available, featuredType: typeof featured });

    if (!name || (priceCash === null && price === null)) {
      showToast("⚠️ Preencha Nome e Preço à vista.", 'info', 4500);
      const nameEl = document.getElementById("name");
      if (nameEl && !nameEl.value) nameEl.focus();
      return;
    }
    
    if (priceCash === null && priceInstallment === null) {
      showToast("⚠️ Preencha pelo menos Preço à vista ou Parcelado.", 'info', 4500);
      return;
    }
    
    // Validação do código já foi feita acima, mas garantir novamente
    if (!productCode || productCode.length === 0) {
      alert("⚠️ O código do produto é obrigatório!");
      return;
    }

    // Obter imagens do preview (apenas URLs salvas, não data URLs de preview)
    let images = [];
    
    // Se estiver editando, pegar apenas imagens já salvas do preview (filtrar data URLs)
    if (editingId && previewImages) {
      const previewItems = previewImages.querySelectorAll('.image-preview-item img');
      previewItems.forEach(img => {
        if (img.src && !img.src.includes('data:image') && !img.src.includes('data:image/svg')) {
          // Apenas URLs salvas (começam com http:// ou https://)
          if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
            images.push(img.src);
          }
        }
      });
    }
    
    // A primeira imagem sempre será a capa (já está na ordem correta)

    // Upload de novas imagens
    if (files && files.length > 0) {
      // Verificar se supabase está disponível
      if (typeof supabase === 'undefined' || !supabase.storage) {
        showToast('❌ Erro: Supabase não está configurado corretamente', 'error');
        console.error('Supabase não está disponível:', typeof supabase);
        return;
      }

      // Mostrar indicador de progresso
      const saveBtn = document.querySelector('button[onclick="saveProduct()"]');
      const originalBtnText = saveBtn ? saveBtn.innerHTML : '';
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fazendo upload de ${files.length} imagem(ns)...`;
      }
      
      let uploadedCount = 0;

      for (const file of files) {
        try {
          console.log(`🔄 Processando imagem: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);
          
          // Converter imagem para WebP
          const webpFile = await convertToWebP(file);
          
          if (!webpFile) {
            throw new Error('Conversão retornou arquivo vazio');
          }
          
          console.log(`✅ Conversão concluída: ${webpFile.name} (${webpFile.type}, ${(webpFile.size / 1024).toFixed(2)}KB)`);
          
          // Gerar nome do arquivo com extensão .webp
          const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extensão original
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${originalName}.webp`;

          console.log(`📤 Fazendo upload: ${fileName}`);

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, webpFile, {
              contentType: 'image/webp',
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Erro ao fazer upload:', uploadError);
            showToast(`❌ Erro ao fazer upload de "${file.name}": ${uploadError.message}`, 'error', 5000);
            continue;
          }
          
          uploadedCount++;
          if (saveBtn) {
            saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Upload: ${uploadedCount}/${files.length}...`;
          }

          console.log(`✅ Upload concluído: ${fileName}`);

          const { data: urlData } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

          if (urlData) {
            images.push(urlData.publicUrl);
            console.log(`✅ URL gerada: ${urlData.publicUrl}`);
          }
        } catch (conversionError) {
          console.error('❌ Erro ao converter imagem para WebP:', conversionError);
          console.error('Detalhes do erro:', {
            message: conversionError.message,
            stack: conversionError.stack,
            file: file.name,
            type: file.type
          });
          
          // Se falhar a conversão, tentar upload do arquivo original
          console.warn(`⚠️ Tentando upload do arquivo original: ${file.name}`);
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, file);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("products")
              .getPublicUrl(fileName);
            if (urlData) {
              images.push(urlData.publicUrl);
              console.log(`✅ Upload do arquivo original concluído: ${urlData.publicUrl}`);
            }
          } else {
            console.error('❌ Erro ao fazer upload do arquivo original:', uploadError);
            showToast(`❌ Erro ao fazer upload de "${file.name}": ${uploadError.message}`, 'error', 5000);
          }
        }
      }
    }

    // Remover duplicatas do array de imagens
    images = [...new Set(images)];

    // Se estiver editando, manter imagens existentes se não houver novas
    if (editingId && images.length === 0) {
      const existingProduct = products.find(p => p.id === editingId);
      if (existingProduct && existingProduct.images) {
        images = existingProduct.images;
      }
    }
    
    // Restaurar botão de salvar após upload
    const saveBtnAfterUpload = document.querySelector('button[onclick="saveProduct()"]');
    if (saveBtnAfterUpload && files && files.length > 0) {
      saveBtnAfterUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando produto...';
    }

    // Garantir que available e featured são booleanos verdadeiros (não strings)
    // O Supabase/PostgreSQL espera boolean verdadeiro
    const availableBool = available === true || available === "true" || available === 1;
    const featuredBool = featured === true || featured === "true" || featured === 1;
    
    const productData = {
      name,
      price: priceCash || price, // Usar priceCash se disponível, senão usar price legado
      price_cash: priceCash,
      price_installment: priceInstallment,
      max_installments: maxInstallments || 12,
      promotional_price: promotionalPrice && promotionalPrice > 0 ? promotionalPrice : null,
      description: description || null,
      product_code: productCode && productCode.length > 0 ? productCode : null,
      category: category || null,
      brand: brand && brand.length > 0 ? brand : null,
      available: availableBool, // boolean verdadeiro
      featured: featuredBool,   // boolean verdadeiro
      images: images.length > 0 ? images : []
    };

    console.log('Dados que serão salvos:', productData);
    console.log('Featured será salvo como:', productData.featured, 'tipo:', typeof productData.featured);
    console.log('Available será salvo como:', productData.available, 'tipo:', typeof productData.available);

    if (editingId) {
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId)
        .select();

      if (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar produto: ' + error.message);
        return;
      }
      
      if (data && data[0]) {
        console.log('✅ Produto atualizado:', data[0]);
        console.log('   Featured salvo como:', data[0].featured, 'tipo:', typeof data[0].featured);
      }
      
      editingId = null;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select();

      if (error) {
        console.error('Erro ao criar:', error);
        alert('Erro ao criar produto: ' + error.message);
        return;
      }
      
      if (data && data[0]) {
        console.log('✅ Produto criado:', data[0]);
        console.log('   Featured salvo como:', data[0].featured, 'tipo:', typeof data[0].featured);
      }
    }

    // Restaurar botão de salvar
    const saveBtn = document.querySelector('button[onclick="saveProduct()"]');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Salvar Produto';
    }
    
    clearForm();
    showToast(editingId ? "✅ Produto atualizado com sucesso!" : "✅ Produto cadastrado com sucesso!", 'success');
    await loadAdminData();
  } catch (err) {
    console.error('Erro ao salvar produto:', err);
    showToast('❌ Erro ao salvar produto: ' + err.message, 'error', 5000);
    
    // Restaurar botão de salvar em caso de erro
    const saveBtn = document.querySelector('button[onclick="saveProduct()"]');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Salvar Produto';
    }
  }
}


function clearForm(){
  editingId = null; // Resetar o ID de edição
  document.querySelectorAll("input,textarea,select").forEach(el=>{
    if(el.type!=="file") el.value="";
  });
  // Resetar número de parcelas para o padrão
  const maxInstallments = document.getElementById("maxInstallments");
  if (maxInstallments) maxInstallments.value = "12";
  const imageInput = document.getElementById("image");
  if (imageInput) imageInput.value="";
  if (previewImages) previewImages.innerHTML="";
  pendingUploadFiles = [];
}

function render(){
  // Garantir que list está inicializado
  if (!list) {
    list = document.getElementById("list");
    if (!list) {
      console.warn('Elemento list não encontrado');
      return;
    }
  }
  
  list.innerHTML="";

  // Se não houver termo de busca E não estiver filtrando por destaques E não estiver filtrando por marca, mostrar mensagem informativa
  if ((!searchTerm || searchTerm.trim() === "") && !showOnlyDestaques && (!selectedBrand || selectedBrand.trim() === "")) {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.cssText = "text-align: center; padding: 40px 20px; color: #666; font-size: 16px;";
    emptyMsg.innerHTML = `
      <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
      <p style="margin: 0;"><strong>Digite na barra de pesquisa</strong> para buscar produtos</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #999;">Busque por nome, código, descrição ou categoria. Ou use os filtros de marca ou destaques</p>
    `;
    list.appendChild(emptyMsg);
    return;
  }

  // Filtrar produtos pelo termo de busca (nome, código, descrição ou categoria)
  let filtered = products;
  
  // Se houver termo de busca, filtrar por ele
  if (searchTerm && searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase().trim();
    filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      (p.product_code && p.product_code.toLowerCase().includes(searchLower)) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.category && p.category.toLowerCase().includes(searchLower))
    );
  }
  
  // Se o filtro de destaques estiver ativo, filtrar apenas produtos em destaque
  if (showOnlyDestaques) {
    filtered = filtered.filter(p => {
      const isFeatured = p.featured === true || p.featured === "true" || p.featured === 1 || p.featured === "1";
      return isFeatured;
    });
  }
  
  // Se houver marca selecionada, filtrar por marca
  if (selectedBrand && selectedBrand.trim() !== "") {
    filtered = filtered.filter(p => {
      const brand = (p.brand || p.marca || p.brand_name || "").trim();
      return brand === selectedBrand;
    });
  }
  
  // Filtro de disponibilidade
  if (filterAvailable && filterAvailable !== 'all') {
    filtered = filtered.filter(p => {
      // available já está normalizado como boolean ao carregar
      const isAvailable = p.available === true;
      
      if (filterAvailable === 'available') {
        return isAvailable;
      } else if (filterAvailable === 'unavailable') {
        // Retornar produtos que NÃO estão disponíveis
        return !isAvailable;
      }
      
      return true;
    });
  }
  
  // Filtro de preço mínimo
  if (filterMinPrice !== null && filterMinPrice > 0) {
    filtered = filtered.filter(p => {
      const price = p.price_cash || p.price || 0;
      return price >= filterMinPrice;
    });
  }
  
  // Filtro de preço máximo
  if (filterMaxPrice !== null && filterMaxPrice > 0) {
    filtered = filtered.filter(p => {
      const price = p.price_cash || p.price || 0;
      return price <= filterMaxPrice;
    });
  }
  
  // Ordenar produtos
  filtered.sort((a, b) => {
    let compareA, compareB;
    
    switch(sortBy) {
      case 'price':
        compareA = a.price_cash || a.price || 0;
        compareB = b.price_cash || b.price || 0;
        break;
      case 'category':
        compareA = (a.category || '').toLowerCase();
        compareB = (b.category || '').toLowerCase();
        break;
      case 'date':
        compareA = new Date(a.created_at || a.id || 0);
        compareB = new Date(b.created_at || b.id || 0);
        break;
      case 'name':
      default:
        compareA = (a.name || '').toLowerCase();
        compareB = (b.name || '').toLowerCase();
        break;
    }
    
    if (typeof compareA === 'number' && typeof compareB === 'number') {
      return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
    } else if (compareA instanceof Date && compareB instanceof Date) {
      return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
    } else {
      const result = compareA.localeCompare(compareB, 'pt-BR');
      return sortOrder === 'asc' ? result : -result;
    }
  });

  // Se não houver resultados
  if (filtered.length === 0) {
    const noResults = document.createElement("div");
    noResults.style.cssText = "text-align: center; padding: 40px 20px; color: #666; font-size: 16px;";
    noResults.innerHTML = `
      <i class="fa-solid fa-box-open" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
      <p style="margin: 0;"><strong>Nenhum produto encontrado</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #999;">Tente pesquisar com outro termo</p>
    `;
    list.appendChild(noResults);
    return;
  }

  // Renderizar produtos encontrados
  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card-admin";
    
    // Imagem do produto
    const imgContainer = document.createElement("div");
    imgContainer.className = "product-image-admin";
    
    const productImage = document.createElement("img");
    const imageUrl = (p.images && Array.isArray(p.images) && p.images.length > 0) 
      ? p.images[0] 
      : (p.img || "img/sem-imagem.jpg");
    
    productImage.src = imageUrl;
    productImage.alt = p.name || "Produto";
    productImage.loading = "lazy";
    productImage.style.cssText = "width: 100%; height: 100%; object-fit: cover; display: block;";
    productImage.onerror = function() {
      this.src = "img/sem-imagem.jpg";
      this.onerror = null;
    };
    
    imgContainer.appendChild(productImage);
    
    // Informações do produto
    const info = document.createElement("div");
    info.className = "product-info-admin";
    
    const isFeatured = p.featured === true || p.featured === "true" || p.featured === 1 || p.featured === "1";
    const isAvailable = p.available === true || p.available === "true" || p.available === 1 || p.available === "1";
    const promo = p.promotional_price !== null && p.promotional_price !== undefined && Number(p.promotional_price) > 0
      ? Number(p.promotional_price)
      : null;

    // Função para formatar no formato brasileiro completo (1.998,00)
    const formatBRL = (v) => {
      if (!v && v !== 0) return "R$ 0,00";
      const num = Number(v);
      if (isNaN(num)) return "R$ 0,00";
      const formatted = num.toFixed(2).replace('.', ',');
      const parts = formatted.split(',');
      const integer = parts[0];
      const decimal = parts[1] || '00';
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `R$ ${formattedInteger},${decimal}`;
    };
    
    // Formatar preço com opções de pagamento
    const priceCash = p.price_cash || p.price || 0;
    const priceInstallment = p.price_installment || 0;
    const maxInstallments = p.max_installments || 12;
    
    let priceHtml = '';
    if (priceInstallment && priceInstallment > 0) {
      const installmentValue = priceInstallment / maxInstallments;
      priceHtml = `<div class="price-normal-admin">${formatBRL(priceCash)} à vista ou ${formatBRL(priceInstallment)} em até ${maxInstallments}x de ${formatBRL(installmentValue)}</div>`;
    } else {
      priceHtml = `<div class="price-normal-admin">${formatBRL(priceCash)} à vista</div>`;
    }

    const statusHtml = isAvailable 
      ? '<span class="status available">Disponível</span>'
      : '<span class="status unavailable">Indisponível</span>';

    info.innerHTML = `
      <h3 class="product-name-admin">${p.name}</h3>
      ${p.product_code ? `<div class="product-code-admin"><i class="fa-solid fa-barcode"></i> Cód: ${p.product_code}</div>` : ''}
      ${statusHtml}
      <div class="product-price-admin">${priceHtml}</div>
      ${p.brand ? `<div class="product-brand-admin">🏷️ ${p.brand}</div>` : ''}
      ${p.category ? `<div class="product-category-admin">📁 ${p.category}</div>` : ''}
    `;
    
    // Botões de ação
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "product-actions-admin";
    
    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit-admin";
    editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i> Editar';
    editBtn.onclick = () => editProduct(p.id);
    
    const duplicateBtn = document.createElement("button");
    duplicateBtn.className = "btn-duplicate-admin";
    duplicateBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Duplicar';
    duplicateBtn.onclick = () => duplicateProduct(p.id);
    duplicateBtn.title = "Duplicar produto (criar cópia)";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete-admin";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
    deleteBtn.onclick = () => removeProduct(p.id);
    
    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(duplicateBtn);
    buttonsContainer.appendChild(deleteBtn);
    
    div.appendChild(imgContainer);
    div.appendChild(info);
    div.appendChild(buttonsContainer);
    list.appendChild(div);
  });
}

function editProduct(id){
  const p = products.find(p=>p.id===id);
  if (!p) {
    console.error('Produto não encontrado:', id);
    return;
  }
  
  editingId = id;
  console.log('Editando produto:', p);

  const name = document.getElementById("name");
  const price = document.getElementById("price");
  const promotionalPrice = document.getElementById("promotionalPrice");
  const description = document.getElementById("description");
  const productCode = document.getElementById("productCode");
  const category = document.getElementById("category");
  const brand = document.getElementById("brand");
  const available = document.getElementById("available");
  const featured = document.getElementById("featured");

  if (name) name.value = p.name || "";
  
  // Preço à vista
  const priceCash = document.getElementById("priceCash");
  if (priceCash) {
    const priceCashValue = p.price_cash ? formatPriceBR(p.price_cash) : (p.price ? formatPriceBR(p.price) : "");
    priceCash.value = priceCashValue;
  }
  
  // Preço parcelado
  const priceInstallment = document.getElementById("priceInstallment");
  if (priceInstallment) {
    const priceInstallmentValue = p.price_installment ? formatPriceBR(p.price_installment) : "";
    priceInstallment.value = priceInstallmentValue;
  }
  
  // Número de parcelas
  const maxInstallments = document.getElementById("maxInstallments");
  if (maxInstallments) {
    maxInstallments.value = p.max_installments || 12;
  }
  
  // Campos legados (manter para compatibilidade)
  if (price) {
    // Formatar preço no formato brasileiro completo (1.998,00)
    const priceValue = p.price ? formatPriceBR(p.price) : "";
    price.value = priceValue;
  }
  if (promotionalPrice) {
    // Formatar preço promocional no formato brasileiro completo (1.998,00)
    const promoValue = p.promotional_price ? formatPriceBR(p.promotional_price) : "";
    promotionalPrice.value = promoValue;
  }
  if (description) description.value = p.description || "";
  if (productCode) productCode.value = p.product_code || "";
  if (category) category.value = p.category || "";
  if (brand) brand.value = p.brand || p.marca || p.brand_name || "";
  
  // Converter boolean para string corretamente
  if (available) {
    const availableValue = p.available === true || p.available === "true";
    available.value = availableValue ? "true" : "false";
  }
  
  if (featured) {
    const featuredValue = p.featured === true || p.featured === "true";
    featured.value = featuredValue ? "true" : "false";
  }
  
  renderPreview(p.images || []);

  const addTabBtn = document.querySelector('[data-tab="add-product"]');
  if (addTabBtn) addTabBtn.click();
}

// Tornar função acessível globalmente
window.editProduct = editProduct;

async function removeProduct(id){
  const product = products.find(p => p.id === id);
  const productName = product ? product.name : 'este produto';
  
  if (!confirm(`Tem certeza que deseja excluir "${productName}"?\n\nEsta ação não pode ser desfeita.`)) return;

  try {
    // Verificar se supabase está disponível
    if (typeof supabase === 'undefined' || !supabase.from) {
      alert('Erro: Supabase não está configurado.');
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir produto: ' + error.message);
      return;
    }

    await loadAdminData(true); // true = preservar filtros
    showToast("✅ Produto excluído com sucesso!", 'success');
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    alert('Erro ao excluir produto: ' + err.message);
  }
}

// Tornar função acessível globalmente
window.removeProduct = removeProduct;


function renderPreview(images){
  // Garantir que previewImages está inicializado
  if (!previewImages) {
    previewImages = document.getElementById("previewImages");
    if (!previewImages) {
      console.warn('Elemento previewImages não encontrado');
      return;
    }
  }
  
  previewImages.innerHTML="";
  
  if (!images || images.length === 0) {
    return;
  }
  
  images.forEach((img,i)=>{
    const div = document.createElement("div");
    div.className = "image-preview-item";
    div.draggable = true;
    div.dataset.index = i;
    div.innerHTML = `
      <img src="${img}" alt="Imagem ${i + 1}" loading="lazy">
      <div class="image-preview-actions">
        <button class="image-remove-btn" onclick="removeImage(${i})" title="Remover imagem">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    
    // Adicionar eventos de drag and drop
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);
    div.addEventListener('dragend', handleDragEnd);
    
    previewImages.appendChild(div);
  });
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  if (draggedElement !== this && draggedElement) {
    const allItems = Array.from(previewImages.querySelectorAll('.image-preview-item'));
    const draggedIndex = allItems.indexOf(draggedElement);
    const targetIndex = allItems.indexOf(this);
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      // Coletar todas as imagens na ordem atual do DOM
      const currentImages = [];
      allItems.forEach((item) => {
        const img = item.querySelector('img');
        if (img && img.src && !img.src.includes('data:image/svg')) {
          currentImages.push(img.src);
        }
      });
      
      // Verificar se temos o número correto de imagens
      if (currentImages.length === allItems.length && draggedIndex < currentImages.length && targetIndex < currentImages.length) {
        // Criar uma cópia do array para manipulação
        const reorderedImages = [...currentImages];
        
        // Remover a imagem da posição original
        const [movedImage] = reorderedImages.splice(draggedIndex, 1);
        
        // Calcular o índice correto para inserção
        // Se movendo para frente (draggedIndex < targetIndex), após remover, o targetIndex diminui em 1
        // Se movendo para trás (draggedIndex > targetIndex), o targetIndex permanece o mesmo
        let insertIndex = targetIndex;
        if (draggedIndex < targetIndex) {
          // Se movendo para frente, após remover o item, todos os índices depois diminuem em 1
          // Queremos inserir onde estava o target, então inserimos em targetIndex (que agora é targetIndex - 1 após remoção)
          insertIndex = targetIndex;
        } else {
          // Se movendo para trás, o targetIndex não muda após remoção
          insertIndex = targetIndex;
        }
        
        // Inserir na nova posição (splice insere ANTES do índice especificado, então usamos insertIndex diretamente)
        reorderedImages.splice(insertIndex, 0, movedImage);
        
        // Verificar se não há duplicatas antes de renderizar
        const uniqueImages = [...new Set(reorderedImages)];
        if (uniqueImages.length === reorderedImages.length && reorderedImages.length === currentImages.length) {
          // Re-renderizar com as imagens reordenadas
          renderPreview(reorderedImages);
        } else {
          console.error('Erro: duplicatas ou número incorreto de imagens detectado');
          // Tentar renderizar com array único como fallback
          renderPreview(uniqueImages);
        }
      }
    }
  }
  
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedElement = null;
}


async function removeImage(index){
  // Remover do preview (pode ser imagem nova ou existente)
  if (!previewImages) return;
  
  const previewItems = previewImages.querySelectorAll('.image-preview-item');
  if (index >= previewItems.length) return;
  
  // Obter todas as imagens atuais
  let currentImages = [];
  previewItems.forEach((item, i) => {
    if (i !== index) {
      const img = item.querySelector('img');
      if (img && img.src && !img.src.includes('data:image/svg')) {
        currentImages.push(img.src);
      }
    }
  });
  
  // Se estiver editando um produto existente, atualizar no banco
  if (editingId) {
    const p = products.find(p => p.id === editingId);
    if (p) {
      // Filtrar apenas URLs (não data URLs de preview)
      const savedImages = currentImages.filter(img => !img.startsWith('data:'));
      
      try {
        const { error } = await supabase
          .from("products")
          .update({ images: savedImages })
          .eq("id", editingId);

        if (error) {
          showToast('❌ Erro ao remover imagem: ' + error.message, 'error', 5000);
          return;
        }

        p.images = savedImages;
      } catch (err) {
        console.error('Erro ao remover imagem:', err);
        showToast('❌ Erro ao remover imagem: ' + err.message, 'error', 5000);
        return;
      }
    }
  }
  
  // Atualizar preview
  renderPreview(currentImages);
}


// ================= BUSCA =================
function setupSearchInput() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    // Debounce para não renderizar a cada tecla (mais profissional e rápido)
    let t = null;
    searchInput.oninput = (e) => {
      const value = e.target.value;
      clearTimeout(t);
      t = setTimeout(() => {
        searchTerm = value; // Manter valor original para melhor busca
        render();
      }, 180);
    };
    
    // Melhorar placeholder
    searchInput.placeholder = "Pesquisar produto... (digite para ver resultados)";
    
    // Inicializar com termo vazio para mostrar mensagem
    searchTerm = "";
    render();
  }
}

// Configurar busca quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSearchInput);
} else {
  setupSearchInput();
}

// ================= FILTRO DE DESTAQUES =================
function toggleDestaquesFilter() {
  showOnlyDestaques = !showOnlyDestaques;
  const filterBtn = document.getElementById("filterDestaques");
  
  if (filterBtn) {
    if (showOnlyDestaques) {
      filterBtn.classList.add("active");
      filterBtn.innerHTML = '<i class="fa-solid fa-star"></i> <span>Todos os Produtos</span>';
    } else {
      filterBtn.classList.remove("active");
      filterBtn.innerHTML = '<i class="fa-solid fa-star"></i> <span>Apenas Destaques</span>';
    }
  }
  
  render();
}

// Expor função globalmente
window.toggleDestaquesFilter = toggleDestaquesFilter;

// ================= FILTRO DE MARCAS =================
function updateBrandFilter() {
  const brandSelect = document.getElementById("filterBrand");
  if (!brandSelect) return;
  
  // Limpar opções existentes (exceto "Todas as Marcas")
  brandSelect.innerHTML = '<option value="">TODAS AS MARCAS</option>';
  
  // Usar marcas do banco de dados (já carregadas na variável brands)
  // Se não houver marcas no banco, usar fallback dos produtos
  let sortedBrands = [];
  if (brands && brands.length > 0) {
    sortedBrands = brands.map(b => b.name || b).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } else {
    // Fallback: extrair marcas únicas dos produtos
    const brandSet = new Set();
    products.forEach(p => {
      const brand = (p.brand || p.marca || p.brand_name || "").trim();
      if (brand && brand.length > 0) {
        brandSet.add(brand);
      }
    });
    sortedBrands = Array.from(brandSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }
  
  // Adicionar opções de marca
  sortedBrands.forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = String(brand).toLocaleUpperCase("pt-BR");
    brandSelect.appendChild(option);
  });
  
  // Adicionar event listener se ainda não tiver
  if (!brandSelect.dataset.listenerAdded) {
    brandSelect.addEventListener("change", (e) => {
      selectedBrand = e.target.value || "";
      render();
    });
    brandSelect.dataset.listenerAdded = "true";
  }
}

// ================= ATUALIZAR FILTRO DE MARCAS AO CARREGAR DADOS =================

// ================= FORMATAÇÃO AUTOMÁTICA DE PREÇOS =================
function setupPriceFormatting() {
  const priceCashInput = document.getElementById("priceCash");
  const priceInstallmentInput = document.getElementById("priceInstallment");
  const priceInput = document.getElementById("price");
  const promotionalPriceInput = document.getElementById("promotionalPrice");
  
  // Formatar preço à vista - apenas ao perder foco (não durante digitação)
  if (priceCashInput) {
    priceCashInput.addEventListener('blur', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null && value !== 0) {
        e.target.value = formatPriceBR(value);
        
        // Se o preço promocional tiver porcentagem, recalcular
        if (promotionalPriceInput && promotionalPriceInput.value.includes('%')) {
          const promoValue = promotionalPriceInput.value.trim();
          const percentMatch = promoValue.match(/(\d+(?:[.,]\d+)?)/);
          if (percentMatch) {
            const percent = parseFloat(percentMatch[1].replace(',', '.'));
            if (percent > 0 && percent <= 100) {
              const discount = (value * percent) / 100;
              promotionalPriceInput.value = formatPriceBR(value - discount);
            }
          }
        }
      } else if (e.target.value.trim() !== '') {
        e.target.value = '';
      }
    });
    
    priceCashInput.addEventListener('focus', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null) {
        e.target.value = value.toString().replace('.', ',');
      }
    });
  }
  
  // Formatar preço parcelado - apenas ao perder foco
  if (priceInstallmentInput) {
    priceInstallmentInput.addEventListener('blur', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null && value !== 0) {
        e.target.value = formatPriceBR(value);
      } else if (e.target.value.trim() !== '') {
        e.target.value = '';
      }
    });
    
    priceInstallmentInput.addEventListener('focus', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null) {
        e.target.value = value.toString().replace('.', ',');
      }
    });
  }
  
  // Formatar preço normal (legado) - apenas ao perder foco (não durante digitação)
  if (priceInput) {
    // Permitir digitação livre, formatar apenas ao sair do campo
    priceInput.addEventListener('blur', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null && value !== 0) {
        e.target.value = formatPriceBR(value);
      } else if (e.target.value.trim() !== '') {
        // Se tiver valor mas não conseguir normalizar, limpar
        e.target.value = '';
      }
    });
    
    // Ao focar, permitir edição livre (remover formatação temporariamente)
    priceInput.addEventListener('focus', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null) {
        // Mostrar apenas o número sem formatação para facilitar edição
        e.target.value = value.toString().replace('.', ',');
      }
    });
  }
  
  // Formatar preço promocional com suporte a porcentagem
  if (promotionalPriceInput) {
    // Função para calcular desconto por porcentagem
    const calculatePromotionalPrice = () => {
      const promoValue = promotionalPriceInput.value.trim();
      const priceCashValue = priceCashInput ? priceCashInput.value.trim() : '';
      
      // Verificar se é porcentagem
      if (promoValue.includes('%')) {
        // Extrair o número da porcentagem
        const percentMatch = promoValue.match(/(\d+(?:[.,]\d+)?)/);
        if (percentMatch && priceCashValue) {
          const percent = parseFloat(percentMatch[1].replace(',', '.'));
          const priceCash = normalizePrice(priceCashValue);
          
          if (priceCash !== null && priceCash > 0 && percent > 0 && percent <= 100) {
            // Calcular preço com desconto
            const discount = (priceCash * percent) / 100;
            const promotionalPrice = priceCash - discount;
            
            // Atualizar o campo com o valor calculado
            promotionalPriceInput.value = formatPriceBR(promotionalPrice);
            return promotionalPrice;
          }
        }
      }
      return null;
    };
    
    // Calcular desconto quando o usuário digitar ou sair do campo
    promotionalPriceInput.addEventListener('input', (e) => {
      if (e.target.value.includes('%')) {
        // Calcular em tempo real se tiver preço à vista
        const priceCashValue = priceCashInput ? priceCashInput.value.trim() : '';
        if (priceCashValue) {
          calculatePromotionalPrice();
        }
      }
    });
    
    // Permitir digitação livre, formatar apenas ao sair do campo
    promotionalPriceInput.addEventListener('blur', (e) => {
      // Se for porcentagem, calcular
      if (e.target.value.includes('%')) {
        const calculated = calculatePromotionalPrice();
        if (calculated === null) {
          // Se não conseguir calcular, limpar
          e.target.value = '';
        }
      } else {
        // Se não for porcentagem, formatar normalmente
        const value = normalizePrice(e.target.value);
        if (value !== null && value !== 0) {
          e.target.value = formatPriceBR(value);
        } else if (e.target.value.trim() !== '') {
          // Se tiver valor mas não conseguir normalizar, limpar
          e.target.value = '';
        }
      }
    });
    
    // Ao focar, permitir edição livre
    promotionalPriceInput.addEventListener('focus', (e) => {
      const value = normalizePrice(e.target.value);
      if (value !== null) {
        // Mostrar apenas o número sem formatação para facilitar edição
        e.target.value = value.toString().replace('.', ',');
      }
    });
  }
}

// Configurar formatação de preços quando o DOM estiver pronto
function initPriceFormatting() {
  setupPriceFormatting();
  // Reconfigurar após mudar de aba (caso os campos sejam recriados)
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(setupPriceFormatting, 100);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPriceFormatting);
} else {
  initPriceFormatting();
}

// ================= ESTATÍSTICAS DE VISITANTES =================

// Função para gerar um ID único de sessão
function getSessionId() {
  let sessionId = sessionStorage.getItem('site_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('site_session_id', sessionId);
  }
  return sessionId;
}

// Função para registrar visita (chamada no index.html e produtos.html)
async function registerVisit() {
  try {
    if (typeof supabase === 'undefined' || !supabase.from) {
      return; // Supabase não disponível, pular registro
    }

    const sessionId = getSessionId();
    const pageUrl = window.location.href;
    const userAgent = navigator.userAgent;
    
    // Tentar obter IP (será null se não disponível)
    let ipAddress = null;
    
    // Registrar visita no banco
    const { error } = await supabase
      .from('site_visitors')
      .insert({
        session_id: sessionId,
        page_url: pageUrl,
        user_agent: userAgent,
        ip_address: ipAddress,
        visited_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar visita:', error);
    } else {
      console.log('✅ Visita registrada');
    }
  } catch (err) {
    console.error('Erro ao registrar visita:', err);
  }
}

// Função para carregar estatísticas no admin
async function loadStatistics() {
  try {
    if (typeof supabase === 'undefined' || !supabase.from) {
      console.error('Supabase não disponível');
      return;
    }

    // Mostrar loading
    document.getElementById('totalVisitors').textContent = '...';
    document.getElementById('todayVisitors').textContent = '...';
    document.getElementById('weekVisitors').textContent = '...';
    document.getElementById('monthVisitors').textContent = '...';
    
    // Loading para compras
    const totalOrdersEl = document.getElementById('totalOrders');
    const todayOrdersEl = document.getElementById('todayOrders');
    const weekOrdersEl = document.getElementById('weekOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    if (totalOrdersEl) totalOrdersEl.textContent = '...';
    if (todayOrdersEl) todayOrdersEl.textContent = '...';
    if (weekOrdersEl) weekOrdersEl.textContent = '...';
    if (totalRevenueEl) totalRevenueEl.textContent = '...';

    // Calcular datas
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Buscar todos os visitantes e contar únicos por período
    const { data: allVisitors, error: visitorsError } = await supabase
      .from('site_visitors')
      .select('session_id, visited_at');

    if (visitorsError) {
      throw visitorsError;
    }

    // Contar visitantes únicos por período
    const uniqueTotal = new Set(allVisitors.map(v => v.session_id)).size;
    
    const uniqueToday = new Set(
      allVisitors
        .filter(v => new Date(v.visited_at) >= todayStart)
        .map(v => v.session_id)
    ).size;
    
    const uniqueWeek = new Set(
      allVisitors
        .filter(v => new Date(v.visited_at) >= weekStart)
        .map(v => v.session_id)
    ).size;
    
    const uniqueMonth = new Set(
      allVisitors
        .filter(v => new Date(v.visited_at) >= monthStart)
        .map(v => v.session_id)
    ).size;

    // Atualizar interface
    document.getElementById('totalVisitors').textContent = uniqueTotal || 0;
    document.getElementById('todayVisitors').textContent = uniqueToday || 0;
    document.getElementById('weekVisitors').textContent = uniqueWeek || 0;
    document.getElementById('monthVisitors').textContent = uniqueMonth || 0;

    // Carregar estatísticas de compras finalizadas
    await loadCompletedOrders();

    // Carregar visitas recentes
    await loadRecentVisitors();

  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
    document.getElementById('totalVisitors').textContent = 'Erro';
    document.getElementById('todayVisitors').textContent = 'Erro';
    document.getElementById('weekVisitors').textContent = 'Erro';
    document.getElementById('monthVisitors').textContent = 'Erro';
    
    // Erros para compras
    if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = 'Erro';
    if (document.getElementById('todayOrders')) document.getElementById('todayOrders').textContent = 'Erro';
    if (document.getElementById('weekOrders')) document.getElementById('weekOrders').textContent = 'Erro';
    if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = 'Erro';
  }
}

// Função para carregar estatísticas de compras finalizadas
async function loadCompletedOrders() {
  try {
    // Calcular datas
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // Buscar todas as compras finalizadas
    const { data: allOrders, error: ordersError } = await supabase
      .from('completed_orders')
      .select('*');

    if (ordersError) {
      // Se a tabela não existir, apenas mostrar 0
      if (ordersError.message && ordersError.message.includes('relation') && ordersError.message.includes('does not exist')) {
        console.warn('Tabela completed_orders não existe. Execute o script setup_compras_finalizadas.sql');
        if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = '0';
        if (document.getElementById('todayOrders')) document.getElementById('todayOrders').textContent = '0';
        if (document.getElementById('weekOrders')) document.getElementById('weekOrders').textContent = '0';
        if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = 'R$ 0,00';
        return;
      }
      throw ordersError;
    }

    if (!allOrders || allOrders.length === 0) {
      if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = '0';
      if (document.getElementById('todayOrders')) document.getElementById('todayOrders').textContent = '0';
      if (document.getElementById('weekOrders')) document.getElementById('weekOrders').textContent = '0';
      if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = 'R$ 0,00';
      return;
    }

    // Contar compras por período
    const totalOrders = allOrders.length;
    
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart;
    }).length;
    
    const weekOrders = allOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= weekStart;
    }).length;

    // Calcular receita total
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);

    // Formatar receita
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Atualizar interface
    if (document.getElementById('totalOrders')) {
      document.getElementById('totalOrders').textContent = totalOrders;
    }
    if (document.getElementById('todayOrders')) {
      document.getElementById('todayOrders').textContent = todayOrders;
    }
    if (document.getElementById('weekOrders')) {
      document.getElementById('weekOrders').textContent = weekOrders;
    }
    if (document.getElementById('totalRevenue')) {
      document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    }

  } catch (err) {
    console.error('Erro ao carregar compras finalizadas:', err);
    if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = 'Erro';
    if (document.getElementById('todayOrders')) document.getElementById('todayOrders').textContent = 'Erro';
    if (document.getElementById('weekOrders')) document.getElementById('weekOrders').textContent = 'Erro';
    if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = 'Erro';
  }
}

// Função para carregar visitas recentes
async function loadRecentVisitors() {
  try {
    const { data, error } = await supabase
      .from('site_visitors')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erro ao carregar visitas recentes:', error);
      return;
    }

    const listContainer = document.getElementById('recentVisitors');
    if (!listContainer) return;

    if (!data || data.length === 0) {
      listContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma visita registrada ainda.</p>';
      return;
    }

    // Agrupar por session_id para mostrar visitantes únicos
    const uniqueVisitors = new Map();
    data.forEach(visit => {
      if (!uniqueVisitors.has(visit.session_id)) {
        uniqueVisitors.set(visit.session_id, visit);
      }
    });

    const visitorsArray = Array.from(uniqueVisitors.values());

    listContainer.innerHTML = visitorsArray.map(visit => {
      const date = new Date(visit.visited_at);
      const formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="visitor-item">
          <div class="visitor-info">
            <i class="fa-solid fa-user"></i>
            <div>
              <strong>Sessão: ${visit.session_id.substring(0, 20)}...</strong>
              <span>${formattedDate}</span>
            </div>
          </div>
          <div class="visitor-url">
            <i class="fa-solid fa-link"></i>
            <span>${visit.page_url || 'N/A'}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao carregar visitas recentes:', err);
  }
}

// Função para exportar estatísticas
async function exportStatistics() {
  try {
    const { data, error } = await supabase
      .from('site_visitors')
      .select('*')
      .order('visited_at', { ascending: false });

    if (error) {
      alert('Erro ao exportar dados: ' + error.message);
      return;
    }

    // Converter para CSV
    const headers = ['ID', 'Session ID', 'Data/Hora', 'URL', 'User Agent', 'IP'];
    const rows = data.map(v => [
      v.id,
      v.session_id,
      new Date(v.visited_at).toLocaleString('pt-BR'),
      v.page_url || '',
      v.user_agent || '',
      v.ip_address || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Criar arquivo e fazer download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Dados exportados com sucesso!');
  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert('Erro ao exportar dados: ' + err.message);
  }
}

// Carregar estatísticas quando a aba for aberta
document.addEventListener('DOMContentLoaded', () => {
  const statsTab = document.querySelector('[data-tab="statistics"]');
  if (statsTab) {
    statsTab.addEventListener('click', () => {
      setTimeout(loadStatistics, 100);
    });
  }
});

// Tornar funções globais
window.loadStatistics = loadStatistics;
window.exportStatistics = exportStatistics;
window.registerVisit = registerVisit;


// ================= CATEGORIAS =================

async function addCategory() {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    alert('Erro: Supabase não está configurado. Verifique o console.');
    console.error('Supabase não disponível');
    return;
  }

  const newCategory = document.getElementById("newCategory");
  if (!newCategory) {
    alert('Campo de categoria não encontrado!');
    return;
  }
  
  const v = newCategory.value.trim().toLowerCase().replace(/\s+/g,"-");
  if (!v) {
    alert("Nome da categoria inválido");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: v })
      .select();

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      if (error.code === '23505') { // Unique violation
        alert('Esta categoria já existe!');
      } else {
        alert('Erro ao adicionar categoria: ' + error.message);
      }
      return;
    }

    newCategory.value = "";
    await loadAdminData();
    alert("Categoria adicionada com sucesso!");
  } catch (err) {
    console.error('Erro ao adicionar categoria:', err);
    alert('Erro ao adicionar categoria: ' + err.message);
  }
}

// Função já exportada globalmente no final do arquivo

async function removeCategory(cat){
  if (!confirm(`Excluir categoria "${cat}"?`)) return;

  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("name", cat);

    if (error) {
      alert('Erro ao excluir categoria: ' + error.message);
      return;
    }

    loadAdminData();
    alert("Categoria excluída com sucesso!");
  } catch (err) {
    console.error('Erro ao excluir categoria:', err);
    alert('Erro ao excluir categoria: ' + err.message);
  }
}

async function editCategory(category) {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    alert('Erro: Supabase não está configurado. Verifique o console.');
    return;
  }

  const categoryId = category.id;
  const currentName = category.name;
  
  // Pedir novo nome
  const newName = prompt(`Editar categoria "${currentName}":`, currentName);
  
  if (!newName || newName.trim() === "") {
    return; // Usuário cancelou ou deixou vazio
  }
  
  const normalizedName = newName.trim().toLowerCase().replace(/\s+/g, "-");
  
  if (normalizedName === currentName.toLowerCase().replace(/\s+/g, "-")) {
    alert("O nome não foi alterado!");
    return;
  }

  try {
    // Verificar se já existe categoria com esse nome (exceto a atual)
    let existingQuery = supabase
      .from("categories")
      .select("id")
      .eq("name", normalizedName);
    
    if (categoryId) {
      existingQuery = existingQuery.neq("id", categoryId);
    } else {
      existingQuery = existingQuery.neq("name", currentName);
    }
    
    const { data: existing } = await existingQuery.single();
    
    if (existing) {
      alert("Já existe uma categoria com esse nome!");
      return;
    }

    // Atualizar categoria (usar ID se disponível, senão usar nome)
    let updateQuery;
    if (categoryId) {
      updateQuery = supabase
        .from("categories")
        .update({ name: normalizedName })
        .eq("id", categoryId);
    } else {
      updateQuery = supabase
        .from("categories")
        .update({ name: normalizedName })
        .eq("name", currentName);
    }

    const { data, error } = await updateQuery.select();

    if (error) {
      console.error('Erro ao editar categoria:', error);
      if (error.code === '23505') { // Unique violation
        alert('Já existe uma categoria com esse nome!');
      } else {
        alert('Erro ao editar categoria: ' + error.message);
      }
      return;
    }

    // Atualizar produtos que usam essa categoria
    const { error: updateProductsError } = await supabase
      .from("products")
      .update({ category: normalizedName })
      .eq("category", currentName);
    
    if (updateProductsError) {
      console.warn('Aviso: Categoria atualizada, mas alguns produtos podem não ter sido atualizados:', updateProductsError);
    }

    await loadAdminData();
    alert("Categoria editada com sucesso!");
  } catch (err) {
    console.error('Erro ao editar categoria:', err);
    alert('Erro ao editar categoria: ' + err.message);
  }
}

// Tornar função acessível globalmente
window.editCategory = editCategory;

function renderCategories(){
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;
  
  categoryList.innerHTML = "";
  categories.forEach(c => {
    const div = document.createElement("div");
    div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; background: #fff;";
    
    const nameSpan = document.createElement("span");
    nameSpan.id = `category-name-${c.id || c.name}`;
    nameSpan.textContent = c.name;
    nameSpan.style.cssText = "flex: 1; font-weight: 500;";
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Editar";
    editBtn.onclick = () => editCategory(c);
    editBtn.style.cssText = "padding: 5px 12px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 3px; font-size: 13px;";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "× Excluir";
    deleteBtn.onclick = () => removeCategory(c.name);
    deleteBtn.style.cssText = "padding: 5px 12px; cursor: pointer; background: #ff4444; color: white; border: none; border-radius: 3px; font-size: 13px;";
    
    div.appendChild(nameSpan);
    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    categoryList.appendChild(div);
  });
}

function updateCategorySelect(){
  const category = document.getElementById("category");
  if (!category) return;
  
  category.innerHTML = `<option value="">Selecione</option>`;
  categories.forEach(c => {
    const option = document.createElement("option");
    option.value = c.name;
    option.textContent = c.name;
    category.appendChild(option);
  });
}

// ================= MARCAS =================

let brands = [];

async function addBrand() {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    alert('Erro: Supabase não está configurado. Verifique o console.');
    console.error('Supabase não disponível');
    return;
  }

  const newBrand = document.getElementById("newBrand");
  if (!newBrand) {
    alert('Campo de marca não encontrado!');
    return;
  }
  
  const brandName = newBrand.value.trim();
  if (!brandName) {
    alert("Nome da marca inválido");
    return;
  }

  // Normalizar marca (capitalizar primeira letra de cada palavra)
  const normalizedBrand = brandName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  try {
    const { data, error } = await supabase
      .from("brands")
      .insert({ name: normalizedBrand })
      .select();

    if (error) {
      console.error('Erro ao adicionar marca:', error);
      if (error.code === '23505') { // Unique violation
        alert('Esta marca já existe!');
      } else {
        alert('Erro ao adicionar marca: ' + error.message);
      }
      return;
    }

    newBrand.value = "";
    await loadAdminData();
    alert("Marca adicionada com sucesso!");
  } catch (err) {
    console.error('Erro ao adicionar marca:', err);
    alert('Erro ao adicionar marca: ' + err.message);
  }
}

// Função já exportada globalmente no final do arquivo

async function removeBrand(brand){
  if (!confirm(`Excluir marca "${brand}"?`)) return;

  try {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("name", brand);

    if (error) {
      alert('Erro ao excluir marca: ' + error.message);
      return;
    }

    loadAdminData();
    alert("Marca excluída com sucesso!");
  } catch (err) {
    console.error('Erro ao excluir marca:', err);
    alert('Erro ao excluir marca: ' + err.message);
  }
}

async function editBrand(brand) {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    alert('Erro: Supabase não está configurado. Verifique o console.');
    return;
  }

  const brandId = brand.id;
  const currentName = brand.name;
  
  // Pedir novo nome
  const newName = prompt(`Editar marca "${currentName}":`, currentName);
  
  if (!newName || newName.trim() === "") {
    return; // Usuário cancelou ou deixou vazio
  }
  
  // Normalizar marca
  const normalizedName = newName.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  if (normalizedName === currentName) {
    alert("O nome não foi alterado!");
    return;
  }

  try {
    // Verificar se já existe marca com esse nome (exceto a atual)
    let existingQuery = supabase
      .from("brands")
      .select("id")
      .eq("name", normalizedName);
    
    if (brandId) {
      existingQuery = existingQuery.neq("id", brandId);
    } else {
      existingQuery = existingQuery.neq("name", currentName);
    }
    
    const { data: existing } = await existingQuery.single();
    
    if (existing) {
      alert("Já existe uma marca com esse nome!");
      return;
    }

    // Atualizar marca (usar ID se disponível, senão usar nome)
    let updateQuery;
    if (brandId) {
      updateQuery = supabase
        .from("brands")
        .update({ name: normalizedName })
        .eq("id", brandId);
    } else {
      updateQuery = supabase
        .from("brands")
        .update({ name: normalizedName })
        .eq("name", currentName);
    }

    const { data, error } = await updateQuery.select();

    if (error) {
      console.error('Erro ao editar marca:', error);
      if (error.code === '23505') { // Unique violation
        alert('Já existe uma marca com esse nome!');
      } else {
        alert('Erro ao editar marca: ' + error.message);
      }
      return;
    }

    await loadAdminData();
    alert("Marca editada com sucesso!");
  } catch (err) {
    console.error('Erro ao editar marca:', err);
    alert('Erro ao editar marca: ' + err.message);
  }
}

// Tornar função acessível globalmente
window.editBrand = editBrand;

function renderBrands(){
  const brandList = document.getElementById("brandList");
  if (!brandList) return;
  
  brandList.innerHTML = "";
  brands.forEach(b => {
    const div = document.createElement("div");
    div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; background: #fff;";
    
    const nameSpan = document.createElement("span");
    nameSpan.id = `brand-name-${b.id || b.name}`;
    nameSpan.textContent = b.name;
    nameSpan.style.cssText = "flex: 1; font-weight: 500;";
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Editar";
    editBtn.onclick = () => editBrand(b);
    editBtn.style.cssText = "padding: 5px 12px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 3px; font-size: 13px;";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "× Excluir";
    deleteBtn.onclick = () => removeBrand(b.name);
    deleteBtn.style.cssText = "padding: 5px 12px; cursor: pointer; background: #ff4444; color: white; border: none; border-radius: 3px; font-size: 13px;";
    
    div.appendChild(nameSpan);
    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    brandList.appendChild(div);
  });
}

function updateBrandSelect(){
  const brandSelect = document.getElementById("brand");
  if (!brandSelect) return;
  
  brandSelect.innerHTML = `<option value="">Selecione uma marca</option>`;
  brands.forEach(b => {
    const option = document.createElement("option");
    option.value = b.name;
    option.textContent = b.name;
    brandSelect.appendChild(option);
  });
}





async function loadAdminData(preserveFilters = false) {
  try {
    // Verificar se supabase está disponível
    if (typeof supabase === 'undefined' || !supabase.from) {
      console.error('Supabase não está disponível. Verifique se supabase.js foi carregado corretamente.');
      return;
    }

    // Preservar filtros se solicitado
    const preservedSearchTerm = preserveFilters ? searchTerm : "";
    const preservedShowOnlyDestaques = preserveFilters ? showOnlyDestaques : false;
    const preservedSelectedBrand = preserveFilters ? selectedBrand : "";

    const { data: cats, error: catError } = await supabase.from("categories").select("*");
    if (catError) {
      console.error('Erro ao carregar categorias:', catError);
      categories = [];
    } else {
      categories = cats || [];
    }
    renderCategories();
    updateCategorySelect();

    // Carregar marcas do banco
    const { data: brandData, error: brandError } = await supabase.from("brands").select("*").order("name");
    if (brandError) {
      console.error('Erro ao carregar marcas:', brandError);
      // Se a tabela não existir, criar array vazio
      brands = [];
    } else {
      brands = brandData || [];
    }
    renderBrands();
    updateBrandSelect();

    const { data: prods, error: prodError } = await supabase.from("products").select("*");
    if (prodError) {
      console.error('Erro ao carregar produtos:', prodError);
      products = [];
    } else {
      // Normalizar produtos para garantir que available seja sempre boolean
      products = (prods || []).map(p => {
        // Normalizar available: true, "true", 1, "1" -> true, resto -> false
        const available = p.available === true || 
                         p.available === "true" || 
                         p.available === 1 || 
                         p.available === "1";
        
        return {
          ...p,
          available: available
        };
      });
      
      console.log(`📦 ${products.length} produtos carregados. Disponíveis: ${products.filter(p => p.available).length}, Indisponíveis: ${products.filter(p => !p.available).length}`);
    }
    
    // Atualizar filtro de marcas com as marcas disponíveis
    updateBrandFilter();
    
    // Restaurar filtros se foram preservados
    if (preserveFilters) {
      searchTerm = preservedSearchTerm;
      showOnlyDestaques = preservedShowOnlyDestaques;
      selectedBrand = preservedSelectedBrand;
      
      // Restaurar valor do campo de pesquisa no HTML
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = preservedSearchTerm;
      }
      
      // Restaurar filtro de destaques no botão
      const filterDestaquesBtn = document.getElementById("filterDestaques");
      if (filterDestaquesBtn) {
        if (preservedShowOnlyDestaques) {
          filterDestaquesBtn.classList.add("active");
          filterDestaquesBtn.innerHTML = '<i class="fa-solid fa-star"></i> <span>Todos os Produtos</span>';
        } else {
          filterDestaquesBtn.classList.remove("active");
          filterDestaquesBtn.innerHTML = '<i class="fa-solid fa-star"></i> <span>Apenas Destaques</span>';
        }
      }
      
      // Restaurar filtro de marca no select
      const filterBrandSelect = document.getElementById("filterBrand");
      if (filterBrandSelect) {
        filterBrandSelect.value = preservedSelectedBrand;
      }
    } else {
      // Inicializar busca vazia para mostrar mensagem inicial (apenas na primeira carga)
      searchTerm = "";
    }
    
    // Sincronizar filtros avançados com elementos HTML
    const availableSelect = document.getElementById('filterAvailable');
    const minPriceInput = document.getElementById('filterMinPrice');
    const maxPriceInput = document.getElementById('filterMaxPrice');
    
    if (availableSelect && !preserveFilters) {
      filterAvailable = availableSelect.value || 'all';
    }
    
    if (minPriceInput && minPriceInput.value && !preserveFilters) {
      const value = parseFloat(minPriceInput.value);
      filterMinPrice = !isNaN(value) && value > 0 ? value : null;
    }
    
    if (maxPriceInput && maxPriceInput.value && !preserveFilters) {
      const value = parseFloat(maxPriceInput.value);
      filterMaxPrice = !isNaN(value) && value > 0 ? value : null;
    }
    
    render();
  } catch (err) {
    console.error('Erro geral ao carregar dados admin:', err);
    alert('Erro ao carregar dados. Verifique a conexão com o Supabase.');
  }
}

// ================= ATALHOS DE TECLADO =================
document.addEventListener('keydown', function(e) {
  // Ctrl+S ou Cmd+S para salvar produto
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    const addTab = document.querySelector('[data-tab="add-product"]');
    if (addTab && !addTab.classList.contains('active')) {
      return; // Só salvar se estiver na aba de cadastro
    }
    const saveBtn = document.querySelector('button[onclick="saveProduct()"]');
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click();
    }
  }
  
  // Esc para limpar formulário ou fechar modais
  if (e.key === 'Escape') {
    const fichaModal = document.getElementById('fichaTecnicaModal');
    if (fichaModal && !fichaModal.classList.contains('hidden')) {
      closeFichaTecnicaEditor();
    } else if (editingId) {
      if (confirm('Deseja cancelar a edição?')) {
        clearForm();
        const editTab = document.querySelector('[data-tab="edit-products"]');
        if (editTab) editTab.click();
      }
    }
  }
});

// ================= FUNÇÃO PARA DUPLICAR PRODUTO =================
function duplicateProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    showToast('❌ Produto não encontrado', 'error');
    return;
  }
  
  // Limpar formulário primeiro
  clearForm();
  
  // Preencher com dados do produto (exceto ID)
  const name = document.getElementById("name");
  const priceCash = document.getElementById("priceCash");
  const priceInstallment = document.getElementById("priceInstallment");
  const maxInstallments = document.getElementById("maxInstallments");
  const description = document.getElementById("description");
  const productCode = document.getElementById("productCode");
  const category = document.getElementById("category");
  const brand = document.getElementById("brand");
  const available = document.getElementById("available");
  const featured = document.getElementById("featured");
  
  if (name) name.value = `${product.name} (Cópia)`;
  if (priceCash) {
    const priceCashValue = product.price_cash ? formatPriceBR(product.price_cash) : (product.price ? formatPriceBR(product.price) : "");
    priceCash.value = priceCashValue;
  }
  if (priceInstallment) {
    const priceInstallmentValue = product.price_installment ? formatPriceBR(product.price_installment) : "";
    priceInstallment.value = priceInstallmentValue;
  }
  if (maxInstallments) maxInstallments.value = product.max_installments || 12;
  if (description) description.value = product.description || "";
  if (productCode) productCode.value = `${product.product_code || ''}-COPY`;
  if (category) category.value = product.category || "";
  if (brand) brand.value = product.brand || product.marca || "";
  if (available) available.value = product.available ? "true" : "false";
  if (featured) featured.value = product.featured ? "true" : "false";
  
  // Copiar imagens (apenas URLs, não fazer upload novamente)
  if (product.images && product.images.length > 0) {
    renderPreview(product.images);
  }
  
  // Ir para aba de cadastro
  const addTab = document.querySelector('[data-tab="add-product"]');
  if (addTab) addTab.click();
  
  showToast('✅ Produto duplicado! Revise os dados antes de salvar.', 'success');
}

// Tornar funções acessíveis globalmente
window.saveProduct = saveProduct;
window.addCategory = addCategory;
window.addBrand = addBrand;
window.toggleDestaquesFilter = toggleDestaquesFilter;
window.editProduct = editProduct;
window.removeProduct = removeProduct;
window.editCategory = editCategory;
window.removeCategory = removeCategory;
window.editBrand = editBrand;
window.removeBrand = removeBrand;
window.removeImage = removeImage;
window.duplicateProduct = duplicateProduct;

// ================= FUNÇÕES DE ORDENAÇÃO E FILTROS =================
function updateSorting() {
  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) {
    sortBy = sortSelect.value;
    render();
  }
}

function toggleSortOrder() {
  sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  const btn = document.getElementById('sortOrderBtn');
  if (btn) {
    btn.innerHTML = sortOrder === 'asc' 
      ? '<i class="fa-solid fa-arrow-up"></i>' 
      : '<i class="fa-solid fa-arrow-down"></i>';
    btn.title = sortOrder === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente';
  }
  render();
}

function updateFilters() {
  const availableSelect = document.getElementById('filterAvailable');
  const minPriceInput = document.getElementById('filterMinPrice');
  const maxPriceInput = document.getElementById('filterMaxPrice');
  
  if (availableSelect) {
    filterAvailable = availableSelect.value || 'all';
  }
  
  if (minPriceInput && minPriceInput.value && minPriceInput.value.trim() !== '') {
    const value = parseFloat(minPriceInput.value);
    filterMinPrice = !isNaN(value) && value > 0 ? value : null;
  } else {
    filterMinPrice = null;
  }
  
  if (maxPriceInput && maxPriceInput.value && maxPriceInput.value.trim() !== '') {
    const value = parseFloat(maxPriceInput.value);
    filterMaxPrice = !isNaN(value) && value > 0 ? value : null;
  } else {
    filterMaxPrice = null;
  }
  
  console.log('Filtros atualizados:', { filterAvailable, filterMinPrice, filterMaxPrice });
  render();
}

function clearAdvancedFilters() {
  filterMinPrice = null;
  filterMaxPrice = null;
  filterAvailable = 'all';
  
  const minPriceInput = document.getElementById('filterMinPrice');
  const maxPriceInput = document.getElementById('filterMaxPrice');
  const availableSelect = document.getElementById('filterAvailable');
  
  if (minPriceInput) minPriceInput.value = '';
  if (maxPriceInput) maxPriceInput.value = '';
  if (availableSelect) availableSelect.value = 'all';
  
  render();
  showToast('✅ Filtros avançados limpos', 'success');
}

// ================= VALIDAÇÃO EM TEMPO REAL =================
function setupRealTimeValidation() {
  // Validar nome
  const nameInput = document.getElementById('name');
  if (nameInput) {
    nameInput.addEventListener('blur', function() {
      validateField(this, this.value.trim().length > 0, 'Nome é obrigatório');
    });
  }
  
  // Validar preço à vista
  const priceCashInput = document.getElementById('priceCash');
  if (priceCashInput) {
    priceCashInput.addEventListener('blur', function() {
      const price = normalizePrice(this.value);
      validateField(this, price !== null && price > 0, 'Preço à vista inválido');
    });
    priceCashInput.addEventListener('input', function() {
      clearFieldError(this);
    });
  }
  
  // Validar código do produto
  const productCodeInput = document.getElementById('productCode');
  if (productCodeInput) {
    productCodeInput.addEventListener('blur', function() {
      validateField(this, this.value.trim().length > 0, 'Código do produto é obrigatório');
    });
    productCodeInput.addEventListener('input', function() {
      clearFieldError(this);
    });
  }
  
  // Validar número de parcelas
  const maxInstallmentsInput = document.getElementById('maxInstallments');
  if (maxInstallmentsInput) {
    maxInstallmentsInput.addEventListener('blur', function() {
      const value = parseInt(this.value);
      validateField(this, !isNaN(value) && value >= 1 && value <= 24, 'Número de parcelas deve ser entre 1 e 24');
    });
  }
}

function validateField(field, isValid, errorMessage) {
  clearFieldError(field);
  
  if (!isValid) {
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = '#fef2f2';
    
    // Adicionar mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = errorMessage;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px;';
    
    field.parentElement.appendChild(errorDiv);
  } else {
    field.style.borderColor = '#10b981';
    field.style.backgroundColor = '#f0fdf4';
  }
}

function clearFieldError(field) {
  field.style.borderColor = '';
  field.style.backgroundColor = '';
  
  const errorDiv = field.parentElement.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ================= PREVIEW DO PRODUTO =================
function showProductPreview() {
  const name = document.getElementById("name").value;
  const priceCash = normalizePrice(document.getElementById("priceCash").value);
  const priceInstallment = normalizePrice(document.getElementById("priceInstallment").value);
  const maxInstallments = parseInt(document.getElementById("maxInstallments").value) || 12;
  const description = document.getElementById("description").value;
  const productCode = document.getElementById("productCode").value;
  const category = document.getElementById("category").value;
  const brand = document.getElementById("brand").value;
  const available = document.getElementById("available").value === "true";
  const featured = document.getElementById("featured").value === "true";
  
  // Validar campos obrigatórios
  if (!name || !priceCash || !productCode) {
    showToast('❌ Preencha todos os campos obrigatórios antes de visualizar', 'error');
    return;
  }
  
  // Obter imagens do preview
  let images = [];
  if (previewImages) {
    const previewItems = previewImages.querySelectorAll('.image-preview-item img');
    previewItems.forEach(img => {
      if (img.src && !img.src.includes('data:image')) {
        images.push(img.src);
      }
    });
  }
  
  // Criar modal de preview
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    overflow-y: auto;
    padding: 20px;
  `;
  
  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };
  
  modal.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; position: relative;">
      <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 20px;">
        <i class="fa-solid fa-times"></i>
      </button>
      <h2 style="margin-top: 0;">Preview do Produto</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div>
          ${images.length > 0 ? `<img src="${images[0]}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : '<div style="width: 100%; height: 300px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9ca3af;"><i class="fa-solid fa-image" style="font-size: 48px;"></i></div>'}
          <div style="display: flex; gap: 10px;">
            ${images.slice(0, 4).map(img => `<img src="${img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">`).join('')}
          </div>
        </div>
        <div>
          <h1 style="margin-top: 0;">${name}</h1>
          ${featured ? '<span style="background: #fbbf24; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">⭐ DESTAQUE</span>' : ''}
          ${available ? '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 8px;">✓ Disponível</span>' : '<span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 8px;">✗ Indisponível</span>'}
          <div style="font-size: 32px; font-weight: 700; color: #2563eb; margin: 15px 0;">
            ${formatPrice(priceCash)}
          </div>
          ${priceInstallment ? `<div style="color: #666; margin-bottom: 15px;">ou ${maxInstallments}x de ${formatPrice(priceInstallment / maxInstallments)}</div>` : ''}
          ${description ? `<div style="margin: 20px 0; color: #374151; line-height: 1.6;">${description}</div>` : ''}
          ${category ? `<div style="color: #6b7280; margin-top: 10px;"><strong>Categoria:</strong> ${category}</div>` : ''}
          ${brand ? `<div style="color: #6b7280;"><strong>Marca:</strong> ${brand}</div>` : ''}
          <div style="color: #6b7280; font-size: 12px; margin-top: 10px;"><strong>Código:</strong> ${productCode}</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Fechar ao clicar fora
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ================= EXPORTAÇÃO/IMPORTAÇÃO =================
const PRODUCT_CSV_COLUMNS = [
  'product_code',
  'name',
  'price_cash',
  'promotional_price',
  'price_installment',
  'max_installments',
  'description',
  'category',
  'brand',
  'available',
  'featured',
  'images'
];

function escapeCsvCell(value) {
  let text = '';
  if (Array.isArray(value)) {
    text = value.join('|');
  } else if (typeof value === 'number') {
    text = new Intl.NumberFormat('pt-BR', {
      useGrouping: false,
      maximumFractionDigits: 2
    }).format(value);
  } else if (value !== null && value !== undefined) {
    text = String(value);
  }
  return `"${text.replace(/"/g, '""')}"`;
}

function csvDelimiterFor(text) {
  let inQuotes = false;
  const counts = { ',': 0, ';': 0, '\t': 0 };

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"' && inQuotes && text[index + 1] === '"') {
      index++;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && (character === '\n' || character === '\r')) {
      break;
    } else if (!inQuotes && Object.prototype.hasOwnProperty.call(counts, character)) {
      counts[character]++;
    }
  }

  return Object.keys(counts).reduce((best, delimiter) =>
    counts[delimiter] > counts[best] ? delimiter : best, ';');
}

function parseCsvRows(text) {
  const source = text.replace(/^\uFEFF/, '');
  if (!source.trim()) throw new Error('O arquivo CSV está vazio.');

  const delimiter = csvDelimiterFor(source);
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (inQuotes) {
      if (character === '"' && source[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      inQuotes = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = '';
    } else if (character === '\n' || character === '\r') {
      row.push(cell);
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      if (character === '\r' && source[index + 1] === '\n') index++;
    } else {
      cell += character;
    }
  }

  if (inQuotes) throw new Error('O CSV contém uma célula com aspas não fechadas.');
  row.push(cell);
  if (row.some(value => value.trim() !== '')) rows.push(row);
  if (rows.length < 2) throw new Error('O CSV precisa ter uma linha de cabeçalho e pelo menos um produto.');

  const aliases = {
    codigo: 'product_code',
    codigo_do_produto: 'product_code',
    codigo_produto: 'product_code',
    nome: 'name',
    preco: 'price_cash',
    preco_a_vista: 'price_cash',
    preco_vista: 'price_cash',
    preco_promocional: 'promotional_price',
    preco_parcelado: 'price_installment',
    parcelas_maximas: 'max_installments',
    numero_maximo_de_parcelas: 'max_installments',
    descricao: 'description',
    categoria: 'category',
    marca: 'brand',
    disponivel: 'available',
    disponibilidade: 'available',
    destaque: 'featured',
    imagens: 'images'
  };
  const headers = rows[0].map(header => {
    const normalized = header.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '_')
      .replace(/[^\w]/g, '');
    return aliases[normalized] || normalized;
  });
  const supportedHeaders = new Set(PRODUCT_CSV_COLUMNS);

  if (!headers.includes('product_code') || !headers.includes('name')
      || (!headers.includes('price_cash') && !headers.includes('price'))) {
    throw new Error('O CSV precisa incluir as colunas product_code, name e price_cash.');
  }
  if (headers.some(header => !supportedHeaders.has(header) && header !== 'price')) {
    throw new Error('O CSV contém uma coluna desconhecida. Use o modelo exportado pelo painel.');
  }

  return rows.slice(1).map((values, rowIndex) => {
    const record = {};
    headers.forEach((header, columnIndex) => {
      const key = header === 'price' ? 'price_cash' : header;
      record[key] = values[columnIndex] ?? '';
    });
    record.__rowNumber = rowIndex + 2;
    return record;
  }).filter(record => Object.keys(record).some(key =>
    key !== '__rowNumber' && String(record[key]).trim() !== ''));
}

function parseImportNumber(value, label, optional = false) {
  if (value === null || value === undefined || String(value).trim() === '') {
    if (optional) return null;
    throw new Error(`${label} é obrigatório.`);
  }

  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    throw new Error(`${label} não é um número válido.`);
  }

  let normalized = String(value).trim().replace(/R\$\s?/gi, '').replace(/\s/g, '');
  normalized = normalized.replace(/[^\d,.-]/g, '');
  if (normalized.includes(',') && normalized.includes('.')) {
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (normalized.includes(',')) {
    const parts = normalized.split(',');
    normalized = parts.length > 2
      ? `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`
      : normalized.replace(',', '.');
  } else if ((normalized.match(/\./g) || []).length > 1) {
    const parts = normalized.split('.');
    normalized = parts[parts.length - 1].length <= 2
      ? `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`
      : parts.join('');
  } else if (/^\d{1,3}\.\d{3}$/.test(normalized)) {
    normalized = normalized.replace('.', '');
  }

  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new Error(`${label} não é um número válido.`);
  return number;
}

function parseImportBoolean(value, defaultValue, label) {
  if (value === null || value === undefined || String(value).trim() === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (['true', '1', 'sim', 's', 'yes', 'y', 'disponivel'].includes(normalized)) return true;
  if (['false', '0', 'nao', 'n', 'no', 'indisponivel'].includes(normalized)) return false;
  throw new Error(`${label} deve ser sim/não ou true/false.`);
}

function normalizeImportedProduct(product) {
  const code = String(product.product_code || '').trim();
  const name = String(product.name || '').trim();
  if (!code) throw new Error('Código do produto é obrigatório.');
  if (!name) throw new Error('Nome do produto é obrigatório.');

  const cashValue = product.price_cash !== undefined && product.price_cash !== ''
    ? product.price_cash
    : product.price;
  const priceCash = parseImportNumber(cashValue, 'Preço à vista');
  if (priceCash <= 0) throw new Error('Preço à vista deve ser maior que zero.');

  const maxInstallments = product.max_installments === undefined || String(product.max_installments).trim() === ''
    ? 12
    : parseImportNumber(product.max_installments, 'Número máximo de parcelas');
  if (!Number.isInteger(maxInstallments) || maxInstallments < 1 || maxInstallments > 24) {
    throw new Error('Número máximo de parcelas deve ser um inteiro entre 1 e 24.');
  }

  const payload = {
    product_code: code,
    name,
    price: priceCash,
    price_cash: priceCash,
    promotional_price: parseImportNumber(product.promotional_price, 'Preço promocional', true),
    price_installment: parseImportNumber(product.price_installment, 'Preço parcelado', true),
    max_installments: maxInstallments,
    description: String(product.description || ''),
    category: String(product.category || '').trim() || null,
    brand: String(product.brand || '').trim() || null,
    available: parseImportBoolean(product.available, true, 'Disponibilidade'),
    featured: parseImportBoolean(product.featured, false, 'Destaque')
  };

  if (Array.isArray(product.images)) {
    payload.images = product.images.filter(image => typeof image === 'string' && image.trim());
  } else if (String(product.images || '').trim()) {
    payload.images = String(product.images).split('|').map(image => image.trim()).filter(Boolean);
  }

  return payload;
}

function downloadProductsCsvTemplate() {
  const blob = new Blob([
    '\uFEFF',
    PRODUCT_CSV_COLUMNS.map(escapeCsvCell).join(';'),
    '\r\n'
  ], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modelo-produtos.csv';
  link.click();
  URL.revokeObjectURL(url);
}

async function exportProducts() {
  try {
    if (typeof supabase === 'undefined' || !supabase.from) {
      showToast('❌ Erro: Supabase não está configurado', 'error');
      return;
    }
    
    const { data, error } = await supabase.from("products").select("*");
    
    if (error) {
      showToast('❌ Erro ao exportar produtos: ' + error.message, 'error');
      return;
    }
    
    const csvRows = [
      PRODUCT_CSV_COLUMNS.map(escapeCsvCell).join(';'),
      ...data.map(product => PRODUCT_CSV_COLUMNS.map(column =>
        escapeCsvCell(column === 'images' && Array.isArray(product.images)
          ? product.images
          : product[column])
      ).join(';'))
    ];
    const blob = new Blob(['\uFEFF', csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`✅ ${data.length} produto(s) exportado(s) para CSV!`, 'success');
  } catch (err) {
    showToast('❌ Erro ao exportar: ' + err.message, 'error');
  }
}

async function importProducts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split('.').pop().toLowerCase();
  if (!['csv', 'json'].includes(extension)) {
    showToast('❌ Selecione um arquivo CSV ou um backup JSON', 'error');
    event.target.value = '';
    return;
  }
  
  try {
    const text = await file.text();
    let records;
    if (extension === 'json') {
      const importData = JSON.parse(text);
      records = Array.isArray(importData) ? importData : importData.products;
      if (!Array.isArray(records)) throw new Error('O backup JSON precisa conter uma lista de produtos.');
    } else {
      records = parseCsvRows(text);
    }
    
    if (!confirm(`Deseja importar ${records.length} produto(s)?\n\nProdutos com código existente serão atualizados.`)) {
      return;
    }
    
    if (typeof supabase === 'undefined' || !supabase.from) {
      showToast('❌ Erro: Supabase não está configurado', 'error');
      return;
    }
    
    let imported = 0;
    let updated = 0;
    const importErrors = [];
    
    for (let index = 0; index < records.length; index++) {
      const record = records[index];
      try {
        const product = normalizeImportedProduct(record);
        const { data: existing, error: lookupError } = await supabase
          .from("products")
          .select("id")
          .eq("product_code", product.product_code)
          .limit(1);

        if (lookupError) throw lookupError;
        if (existing && existing.length > 0) {
          const { error } = await supabase
            .from("products")
            .update(product)
            .eq("id", existing[0].id);
          
          if (error) throw error;
          updated++;
        } else {
          const { error } = await supabase
            .from("products")
            .insert({ images: [], ...product });
          
          if (error) throw error;
          imported++;
        }
      } catch (err) {
        const rowNumber = record.__rowNumber || index + 1;
        const reason = err.message || String(err);
        console.error(`Erro ao importar produto na linha ${rowNumber}:`, err);
        importErrors.push(`Linha ${rowNumber}: ${reason}`);
      }
    }
    
    if (importErrors.length === 0) {
      showToast(`✅ Importação concluída! ${imported} novo(s), ${updated} atualizado(s).`, 'success');
    } else {
      console.error('Erros da importação:', importErrors);
      showToast(`Importação parcial: ${imported} novo(s), ${updated} atualizado(s), ${importErrors.length} erro(s). Consulte o console.`, 'error', 6000);
    }
    await loadAdminData();
  } catch (err) {
    showToast('❌ Erro ao importar: ' + err.message, 'error');
  } finally {
    event.target.value = '';
  }
}

// Tornar funções acessíveis globalmente
window.updateSorting = updateSorting;
window.toggleSortOrder = toggleSortOrder;
window.updateFilters = updateFilters;
window.clearAdvancedFilters = clearAdvancedFilters;
window.showProductPreview = showProductPreview;
window.exportProducts = exportProducts;
window.downloadProductsCsvTemplate = downloadProductsCsvTemplate;
window.importProducts = importProducts;

// Configurar upload de imagens
function setupImageUpload() {
  const imageInput = document.getElementById("image");
  const imageUploadArea = document.getElementById("imageUploadArea");
  
  if (!imageInput || !imageUploadArea) return;
  
  // Clique na área de upload
  imageUploadArea.addEventListener('click', () => {
    imageInput.click();
  });
  
  // Drag and drop
  imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
  });
  
  imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('dragover');
  });
  
  imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          dataTransfer.items.add(file);
        }
      });
      imageInput.files = dataTransfer.files;
      imageInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  // Preview ao selecionar arquivos
  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Guardar arquivos para upload (o input será limpo no final)
    files.forEach(f => {
      if (f && f.type && f.type.startsWith('image/')) {
        // evitar duplicar o mesmo arquivo (nome+tamanho)
        const key = `${f.name}::${f.size}`;
        const exists = pendingUploadFiles.some(x => `${x.name}::${x.size}` === key);
        if (!exists) pendingUploadFiles.push(f);
      }
    });
    
    // Obter imagens atuais do preview ANTES de adicionar novas (snapshot)
    // Isso evita coletar as novas imagens que serão adicionadas progressivamente
    let existingImages = [];
    if (previewImages) {
      const previewItems = previewImages.querySelectorAll('.image-preview-item img');
      previewItems.forEach(img => {
        if (img.src) {
          existingImages.push(img.src);
        }
      });
    }
    
    // Se estiver editando e não houver imagens no preview, usar imagens do produto
    if (editingId && existingImages.length === 0) {
      const product = products.find(p => p.id === editingId);
      if (product && product.images && product.images.length > 0) {
        existingImages = [...product.images];
      }
    }
    
    // Contador de arquivos processados
    let processedCount = 0;
    const totalFiles = files.filter(f => f.type.startsWith('image/')).length;
    
    // Array para armazenar as novas imagens (data URLs)
    const newImageDataUrls = [];
    const seenDataUrls = new Set(); // Para evitar duplicatas
    
    // Criar previews das novas imagens
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Verificar tamanho do arquivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          alert(`A imagem "${file.name}" é muito grande (máx. 5MB). Ela será ignorada.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          
          // Verificar se a imagem já não foi adicionada (evitar duplicatas)
          if (!seenDataUrls.has(dataUrl) && !existingImages.includes(dataUrl)) {
            seenDataUrls.add(dataUrl);
            newImageDataUrls.push(dataUrl);
            processedCount++;
            
            // Atualizar preview quando todas as imagens forem processadas
            if (processedCount === totalFiles) {
              // Combinar imagens existentes com novas (sem duplicatas)
              const allImages = [...existingImages, ...newImageDataUrls];
              renderPreview(allImages);
              // Mostrar mensagem de sucesso
              if (totalFiles > 1) {
                console.log(`✅ ${totalFiles} imagens adicionadas com sucesso!`);
              }
            } else {
              // Atualizar preview progressivamente
              const allImages = [...existingImages, ...newImageDataUrls];
              renderPreview(allImages);
            }
          } else {
            console.warn(`Imagem "${file.name}" já existe, ignorando duplicata.`);
            processedCount++;
            // Se todas foram processadas (mesmo com duplicatas), atualizar preview
            if (processedCount === totalFiles) {
              const allImages = [...existingImages, ...newImageDataUrls];
              renderPreview(allImages);
            }
          }
        };
        reader.onerror = () => {
          alert(`Erro ao ler o arquivo "${file.name}"`);
          processedCount++;
          // Se todas foram processadas, atualizar preview mesmo com erro
          if (processedCount === totalFiles) {
            const allImages = [...existingImages, ...newImageDataUrls];
            renderPreview(allImages);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert(`O arquivo "${file.name}" não é uma imagem válida.`);
      }
    });
    
    // Limpar o input para permitir adicionar mais imagens
    imageInput.value = '';
  });
}

// Aguardar o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
    setupSearchInput();
    setupImageUpload();
    setupTabs();
    setupRealTimeValidation();
  });
  } else {
    loadAdminData();
    setupSearchInput();
    setupImageUpload();
    setupTabs();
    setupRealTimeValidation();
  }
