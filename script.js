





// ==============================
  // CONFIGURAÇÕES
  // ==============================
  const WHATSAPP_NUMBER = '554799970023';
  const CURRENCY = 'R$';
  

  // ==============================
  // ELEMENTOS DO DOM
  // ==============================
  const yearEl = document.getElementById('year');
  const whatsappTop = document.getElementById('whatsappTop');
  const productsList = document.getElementById('productsList');
  const cartBox = document.getElementById('cartBox');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const isHome = window.location.pathname.includes("index.html") || window.location.pathname === "/";
  const isProductPage = window.location.pathname.includes("produto.html");


  // MODAL
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalPrice = document.getElementById("modalPrice");

  // ==============================
  // ANO AUTOMÁTICO
  // ==============================
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==============================
  // WHATSAPP
  // ==============================
  if (whatsappTop) {
    const msg = encodeURIComponent("Olá! Tenho interesse em saber mais.");
    whatsappTop.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  //adicionar produtos pelo admin 
 let categories = [];
 let brands = [];

function toDisplayUpper(text) {
  if (text === null || text === undefined) return "";
  return String(text).toLocaleUpperCase("pt-BR");
}

function toTitleCasePT(text) {
  if (text === null || text === undefined) return "";
  const s = String(text).trim().toLocaleLowerCase("pt-BR");
  const minorWords = new Set([
    "de","da","do","das","dos","e","em","na","no","nas","nos","para","por","com","sem","a","o","as","os"
  ]);
  const words = s
    .split(/\s+/)
    .map((w, idx) => {
      if (!w) return w;
      // manter siglas comuns e padrões tipo "epi", "mig", "tig", "cnc", "3m", "2t"
      const raw = w.replace(/[^\p{L}\p{N}]+/gu, "");
      if (/^\d+[a-z]{0,3}$/i.test(raw)) return raw.toUpperCase();
      if (/^(epi|cnc|pvc|mig|tig|mma|aws|sae|iso|nr\d+|ip\d+|3m)$/i.test(raw)) return raw.toUpperCase();
      if (raw.length <= 3 && /^[a-z]+$/i.test(raw)) return raw.toUpperCase();
      if (idx !== 0 && minorWords.has(w)) return w;
      return w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1);
    })
  return words.join(" ");
}

function formatCategoryOptionLabel(cat) {
  // Aceita categorias com /, -, _, etc. e transforma em texto mais “bonito”
  const raw = String(cat ?? "").trim();
  // normalizar separadores e espaços
  let normalized = raw
    .replace(/[-_]+/g, " ")
    .replace(/\s*\/\s*/g, " • ")
    .replace(/\s*\|\s*/g, " • ")
    .replace(/\s+/g, " ")
    .trim();

  // aplicar Title Case por "segmento" (entre bullets) para ficar mais legível
  const parts = normalized.split("•").map(p => toTitleCasePT(p.trim())).filter(Boolean);
  normalized = parts.join(" • ");

  // deixar "&" mais elegante em vez de " E " quando fizer sentido
  normalized = normalized.replace(/\s+E\s+/g, " & ");

  return normalized;
}

function formatCategoryLabel(cat) {
  // Exibir categoria de forma amigável (trocar hífens por espaços) e em MAIÚSCULO
  return toDisplayUpper(String(cat).replace(/-/g, " "));
}

// ==============================
// GERAR SLUG AMIGÁVEL PARA URL
// ==============================
function generateSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
}

// Gerar URL amigável para produto
function getProductUrl(product) {
  if (!product || !product.id) return '#';
  const slug = generateSlug(product.name);
  return `produto.html?id=${product.id}${slug ? `&slug=${slug}` : ''}`;
}



function renderCategoryFilters() {
  const menu = document.getElementById("categoryMenu");
  const toggle = document.getElementById("categoryToggle");

  if (!menu || !toggle) return;

  // --- UX MOBILE: abrir como "bottom-sheet" com backdrop (uma vez por elemento) ---
  const isMobile = () => {
    try {
      const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      const small = window.innerWidth <= 1024;
      return coarse || small;
    } catch {
      return window.innerWidth <= 1024;
    }
  };

  function ensureDropdownBackdrop() {
    let backdrop = document.getElementById("dropdownBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "dropdownBackdrop";
      backdrop.className = "dropdown-backdrop hidden";
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function openMenu() {
    const backdrop = ensureDropdownBackdrop();
    menu.classList.remove("hidden");
    if (isMobile()) {
      backdrop.classList.remove("hidden");
      menu.classList.add("dropdown-sheet");
      document.body.classList.add("dropdown-sheet-open");
    }
  }

  function closeMenu() {
    const backdrop = document.getElementById("dropdownBackdrop");
    menu.classList.add("hidden");
    menu.classList.remove("dropdown-sheet");
    document.body.classList.remove("dropdown-sheet-open");
    if (backdrop) backdrop.classList.add("hidden");
  }

  if (!toggle.dataset.dropdownBound) {
    toggle.dataset.dropdownBound = "1";

    toggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    };

    const backdrop = ensureDropdownBackdrop();
    backdrop.onclick = () => {
      // fecha qualquer menu aberto
      document.getElementById("categoryMenu")?.classList.add("hidden");
      document.getElementById("brandMenu")?.classList.add("hidden");
      document.getElementById("categoryMenu")?.classList.remove("dropdown-sheet");
      document.getElementById("brandMenu")?.classList.remove("dropdown-sheet");
      document.body.classList.remove("dropdown-sheet-open");
      backdrop.classList.add("hidden");
    };

    document.addEventListener("click", (e) => {
      // fecha categorias se estiver aberto e clicou fora
      const m = document.getElementById("categoryMenu");
      if (!m || m.classList.contains("hidden")) return;
      if (!e.target.closest(".categories-dropdown") && !e.target.closest("#categoryMenu")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const m = document.getElementById("categoryMenu");
      if (m && !m.classList.contains("hidden")) closeMenu();
    });
  }

  menu.innerHTML = "";

  // Cabeçalho do menu
  const header = document.createElement("div");
  header.className = "category-menu-header";
  header.innerHTML = `
    <i class="fa-solid fa-layer-group"></i>
    <span>Selecione uma Categoria</span>
  `;
  menu.appendChild(header);

  // Container scrollável para os itens
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "category-menu-scroll";
  menu.appendChild(scrollContainer);

  // Separador
  const separator1 = document.createElement("div");
  separator1.className = "category-menu-separator";
  scrollContainer.appendChild(separator1);

  // Botão TODOS (destaque)
  const allBtn = document.createElement("button");
  allBtn.className = "category-menu-item category-menu-all";
  allBtn.innerHTML = `
    <span class="category-item-content">
      <i class="fa-solid fa-grid-2"></i>
      <span>${toDisplayUpper("Todos os Produtos")}</span>
    </span>
    ${currentCategory === "all" ? '<i class="fa-solid fa-check category-check"></i>' : ''}
  `;
  allBtn.onclick = () => {
    filterByCategory("all");
    closeMenu();
  };
  if (currentCategory === "all") {
    allBtn.classList.add("active");
  }
  scrollContainer.appendChild(allBtn);

  // Separador entre "Todos" e categorias
  if (categories.length > 0) {
    const separator2 = document.createElement("div");
    separator2.className = "category-menu-separator";
    scrollContainer.appendChild(separator2);
  }

  // Categorias do admin (organizadas)
  categories.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.className = "category-menu-item";
    const icon = getCategoryIcon(cat);
    btn.innerHTML = `
      <span class="category-item-content">
        <i class="${icon}"></i>
        <span>${formatCategoryLabel(cat)}</span>
      </span>
      ${currentCategory === cat ? '<i class="fa-solid fa-check category-check"></i>' : ''}
    `;
    btn.onclick = () => {
      filterByCategory(cat);
      closeMenu();
    };
    if (currentCategory === cat) {
      btn.classList.add("active");
    }
    scrollContainer.appendChild(btn);
  });
}

// Função para obter ícone baseado na categoria
function getCategoryIcon(category) {
  const catLower = category.toLowerCase();
  const iconMap = {
    'maquinas': 'fa-solid fa-toolbox',
    'ferramentas': 'fa-solid fa-wrench',
    'acessorios': 'fa-solid fa-puzzle-piece',
    'solda': 'fa-solid fa-fire',
    'eletrica': 'fa-solid fa-bolt',
    'manual': 'fa-solid fa-hammer',
    'pneumatica': 'fa-solid fa-wind',
    'hidraulica': 'fa-solid fa-droplet',
    'medicao': 'fa-solid fa-ruler',
    'seguranca': 'fa-solid fa-hard-hat',
    'epi': 'fa-solid fa-shield-halved',
    'equipamentos': 'fa-solid fa-cogs',
    'pecas': 'fa-solid fa-cog',
    'consumiveis': 'fa-solid fa-box',
    'outros': 'fa-solid fa-tags'
  };

  // Buscar por palavra-chave na categoria
  for (const [key, icon] of Object.entries(iconMap)) {
    if (catLower.includes(key)) {
      return icon;
    }
  }

  // Ícone padrão
  return 'fa-solid fa-tag';
}

function normalizeBrandValue(value) {
  if (!value) return "";
  return String(value).trim();
}

function renderBrandFilters() {
  const dropdown = document.getElementById("brandsDropdown");
  const menu = document.getElementById("brandMenu");
  const toggle = document.getElementById("brandToggle");

  if (!dropdown || !menu || !toggle) return;

  const isMobile = () => {
    try {
      const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      const small = window.innerWidth <= 1024;
      return coarse || small;
    } catch {
      return window.innerWidth <= 1024;
    }
  };

  function ensureDropdownBackdrop() {
    let backdrop = document.getElementById("dropdownBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "dropdownBackdrop";
      backdrop.className = "dropdown-backdrop hidden";
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function openMenu() {
    const backdrop = ensureDropdownBackdrop();
    menu.classList.remove("hidden");
    if (isMobile()) {
      backdrop.classList.remove("hidden");
      menu.classList.add("dropdown-sheet");
      document.body.classList.add("dropdown-sheet-open");
    }
  }

  function closeMenu() {
    const backdrop = document.getElementById("dropdownBackdrop");
    menu.classList.add("hidden");
    menu.classList.remove("dropdown-sheet");
    document.body.classList.remove("dropdown-sheet-open");
    if (backdrop) backdrop.classList.add("hidden");
  }

  if (!toggle.dataset.dropdownBound) {
    toggle.dataset.dropdownBound = "1";

    toggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    };

    document.addEventListener("click", (e) => {
      const m = document.getElementById("brandMenu");
      if (!m || m.classList.contains("hidden")) return;
      if (!e.target.closest("#brandsDropdown") && !e.target.closest("#brandMenu")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const m = document.getElementById("brandMenu");
      if (m && !m.classList.contains("hidden")) closeMenu();
    });
  }

  // Se não houver marcas detectadas, esconder o filtro por marca
  if (!Array.isArray(brands) || brands.length === 0) {
    dropdown.classList.add("hidden");
    menu.classList.add("hidden");
    return;
  }

  dropdown.classList.remove("hidden");
  menu.innerHTML = "";

  // Cabeçalho do menu
  const header = document.createElement("div");
  header.className = "category-menu-header";
  header.innerHTML = `
    <i class="fa-solid fa-tag"></i>
    <span>Selecione uma Marca</span>
  `;
  menu.appendChild(header);

  // Container scrollável para os itens
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "category-menu-scroll";
  menu.appendChild(scrollContainer);

  // Separador
  const separator1 = document.createElement("div");
  separator1.className = "category-menu-separator";
  scrollContainer.appendChild(separator1);

  // Botão TODAS (destaque)
  const allBtn = document.createElement("button");
  allBtn.className = "category-menu-item category-menu-all";
  allBtn.innerHTML = `
    <span class="category-item-content">
      <i class="fa-solid fa-grid-2"></i>
      <span>${toDisplayUpper("Todas as Marcas")}</span>
    </span>
    ${currentBrand === "all" ? '<i class="fa-solid fa-check category-check"></i>' : ''}
  `;
  allBtn.onclick = () => {
    filterByBrand("all");
    closeMenu();
  };
  if (currentBrand === "all") {
    allBtn.classList.add("active");
  }
  scrollContainer.appendChild(allBtn);

  // Separador entre "Todas" e marcas
  if (brands.length > 0) {
    const separator2 = document.createElement("div");
    separator2.className = "category-menu-separator";
    scrollContainer.appendChild(separator2);
  }

  // Marcas do admin (organizadas)
  brands.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "category-menu-item";
    const icon = getBrandIcon(b);
    btn.innerHTML = `
      <span class="category-item-content">
        <i class="${icon}"></i>
        <span>${toDisplayUpper(b)}</span>
      </span>
      ${currentBrand === b ? '<i class="fa-solid fa-check category-check"></i>' : ''}
    `;
    btn.onclick = () => {
      filterByBrand(b);
      closeMenu();
    };
    if (currentBrand === b) {
      btn.classList.add("active");
    }
    scrollContainer.appendChild(btn);
  });
}

// Função para obter ícone baseado na marca
function getBrandIcon(brand) {
  const brandLower = brand.toLowerCase();
  const iconMap = {
    'bosch': 'fa-brands fa-bootstrap',
    'makita': 'fa-solid fa-toolbox',
    'dewalt': 'fa-solid fa-wrench',
    'black': 'fa-solid fa-hammer',
    'stanley': 'fa-solid fa-cog',
    'metabo': 'fa-solid fa-bolt',
    'hilti': 'fa-solid fa-hard-hat',
    'milwaukee': 'fa-solid fa-fire',
    'festool': 'fa-solid fa-cogs',
    'hitachi': 'fa-solid fa-industry',
    'ryobi': 'fa-solid fa-battery-full',
    'skil': 'fa-solid fa-screwdriver',
    'porter': 'fa-solid fa-tools',
    'vonder': 'fa-solid fa-tag',
    'tramontina': 'fa-solid fa-cutlery',
    'outros': 'fa-solid fa-tags',
    'outras': 'fa-solid fa-tags'
  };

  // Buscar por palavra-chave na marca
  for (const [key, icon] of Object.entries(iconMap)) {
    if (brandLower.includes(key)) {
      return icon;
    }
  }

  // Ícone padrão para marcas
  return 'fa-solid fa-certificate';
}

  // ==============================
  // PRODUTOS
  // ==============================
  
let products = [];



  // ==============================
  // UTIL
  // ==============================
  // Função para formatar preço no formato brasileiro completo (1.998,00)
  function formatPriceBR(value) {
    if (!value && value !== 0) return `${CURRENCY} 0,00`;
    const num = Number(value);
    if (isNaN(num)) return `${CURRENCY} 0,00`;
    
    // Formatar com separador de milhar (ponto) e vírgula para decimais
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    const integer = parts[0];
    const decimal = parts[1] || '00';
    
    // Adicionar separador de milhar
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${CURRENCY} ${formattedInteger},${decimal}`;
  }

  function formatPrice(value) {
    return formatPriceBR(value);
  }
  
  // Função para formatar preço com opções de pagamento (HTML bonito e alinhado)
  function formatPriceWithInstallment(product) {
    const priceCash = product.price_cash || product.price || 0;
    const priceInstallment = product.price_installment || 0;
    // Usar max_installments do produto se existir, senão calcular baseado no valor mínimo de R$ 250,00
    let maxInstallments = product.max_installments;
    if (!maxInstallments && priceInstallment > 0) {
      // Se não tiver max_installments definido, calcular baseado no valor mínimo de R$ 250,00
      const minParcelValue = 250;
      maxInstallments = Math.min(Math.floor(priceInstallment / minParcelValue), 12);
      if (maxInstallments < 1) maxInstallments = 1;
    }
    const promotionalPrice = product.promotional_price && Number(product.promotional_price) > 0 
      ? Number(product.promotional_price) 
      : null;
    
    // Verificar se tem preço promocional
    const hasPromo = promotionalPrice !== null && promotionalPrice < priceCash;
    
    // Calcular desconto em porcentagem
    let discountPercent = 0;
    if (hasPromo && priceCash > 0) {
      discountPercent = Math.round(((priceCash - promotionalPrice) / priceCash) * 100);
    }
    
    // Se não tiver preço parcelado OU não tiver max_installments configurado, mostrar apenas à vista
    if (!priceInstallment || priceInstallment === 0 || !maxInstallments || maxInstallments === 0) {
      if (hasPromo) {
        // Preço promocional sem parcelamento - layout moderno
        return `<div class="price-modern price-with-promo">
          <div class="price-promo-header">
            ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
            <span class="price-original-modern">${formatPrice(priceCash)}</span>
          </div>
          <div class="price-promo-main">
            <span class="price-value-modern">${formatPrice(promotionalPrice)}</span>
            <span class="price-label-modern">à vista</span>
          </div>
        </div>`;
      } else {
        // Preço normal sem parcelamento
        return `<div class="price-simple">
          <span class="price-value">${formatPrice(priceCash)}</span>
          <span class="price-label">à vista</span>
        </div>`;
      }
    }
    
    // Calcular valor da parcela
    const installmentValue = priceInstallment / maxInstallments;
    
    // Formatar com HTML bonito e alinhado
    if (hasPromo) {
      // Preço promocional com parcelamento - layout moderno
      return `<div class="price-modern price-with-promo">
        <div class="price-promo-header">
          ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
          <span class="price-original-modern">${formatPrice(priceCash)}</span>
        </div>
        <div class="price-promo-main">
          <span class="price-value-modern">${formatPrice(promotionalPrice)}</span>
          <span class="price-label-modern">à vista</span>
        </div>
        <div class="price-divider-modern">ou</div>
        <div class="price-installment-modern">
          <span class="price-total-installment">${formatPrice(priceInstallment)}</span>
          <span class="price-label-installment">em até ${maxInstallments}x de</span>
          <span class="price-value-parcel">${formatPrice(installmentValue)}</span>
        </div>
      </div>`;
    } else {
      // Preço normal com parcelamento
      return `<div class="price-with-installment">
        <div class="price-cash-option">
          <span class="price-value-main">${formatPrice(priceCash)}</span>
          <span class="price-label-cash">à vista</span>
        </div>
        <div class="price-divider">ou</div>
        <div class="price-installment-option">
          <span class="price-value-installment">${formatPrice(priceInstallment)}</span>
          <span class="price-label-installment">em até ${maxInstallments}x de</span>
          <span class="price-value-parcel">${formatPrice(installmentValue)}</span>
        </div>
      </div>`;
    }
  }

  // ==============================
  // RENDERIZA PRODUTOS
  // ==============================
  // ==============================
  // OTIMIZAÇÕES DE PERFORMANCE
  // ==============================
  let currentPage = 0;
  // Ajustar quantidade por dispositivo
  const isMobileDevice = window.innerWidth <= 768;
  const PRODUCTS_PER_PAGE = isMobileDevice ? 12 : 20; // Mobile: menos produtos, mais rápido
  let allProducts = [];
  let isLoading = false;

  // Debounce para busca
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Lazy loading de imagens com Intersection Observer (otimizado para mobile)
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      // No mobile, carregar imagens mais cedo para melhor experiência
      const isMobile = window.innerWidth <= 768;
      const rootMargin = isMobile ? '200px' : '100px'; // Mobile: carregar mais cedo
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              // Carregar imediatamente quando visível
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy-img');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: rootMargin,
        threshold: 0.1 // Carregar quando 10% visível
      });

      // Observar todas as imagens lazy
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback: carregar todas as imagens se não suportar IntersectionObserver
      document.querySelectorAll('img[data-src]').forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy-img');
        }
      });
    }
  }

  // Criar placeholder de imagem
  function createImagePlaceholder() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f6f6f6" width="200" height="200"/%3E%3C/svg%3E';
  }

  // Variáveis globais para filtros
  let currentSearchTerm = '';
  let currentCategory = 'all';
  let currentBrand = 'all';
  let currentSort = 'default';

  // Configurar busca e filtros com debounce
  function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterSort = document.getElementById('filterSort');
    const categorySelect = document.getElementById('categorySelect');
    const brandSelect = document.getElementById('brandSelect');
    
    // Busca com debounce (300ms) - otimizado para muitos produtos
    if (searchInput) {
      // Desabilitar autocomplete e histórico do navegador
      searchInput.setAttribute('autocomplete', 'off');
      searchInput.setAttribute('name', 'search');
      searchInput.setAttribute('autocapitalize', 'off');
      searchInput.setAttribute('autocorrect', 'off');
      searchInput.setAttribute('spellcheck', 'false');
      
      const debouncedSearch = debounce((value) => {
        currentSearchTerm = value.toLowerCase().trim();
        currentPage = 0; // Resetar página ao buscar
        renderProducts(true);
      }, 300);
      
      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }
    
    // Ordenação
    if (filterSort) {
      filterSort.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 0; // Resetar página ao ordenar
        renderProducts(true);
      });
    }

    // Categoria (novo layout)
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        filterByCategory(e.target.value);
      });
    }

    // Marca (novo layout)
    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        filterByBrand(e.target.value);
      });
    }

    // Abrir modal bonito ao tocar no card (principalmente no celular)
    const categoryControl = document.getElementById('categoryControl');
    if (categoryControl) {
      categoryControl.addEventListener('click', () => openFilterPicker('category'));
      categoryControl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFilterPicker('category');
        }
      });
    }

    const brandControl = document.getElementById('brandControl');
    if (brandControl) {
      brandControl.addEventListener('click', () => openFilterPicker('brand'));
      brandControl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFilterPicker('brand');
        }
      });
    }

    // Fechar modal bonito
    const filterPickerClose = document.getElementById('filterPickerClose');
    const filterPickerModal = document.getElementById('filterPickerModal');
    if (filterPickerClose) filterPickerClose.addEventListener('click', closeFilterPicker);
    if (filterPickerModal) {
      filterPickerModal.addEventListener('click', (e) => {
        if (e.target === filterPickerModal) closeFilterPicker();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFilterPicker();
    });
  }

  function renderCategorySelect() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;

    categorySelect.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'Categorias: Todas';
    categorySelect.appendChild(optAll);

    (categories || []).forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = formatCategoryOptionLabel(cat);
      categorySelect.appendChild(opt);
    });

    categorySelect.value = currentCategory || 'all';

    const label = document.getElementById('categorySelectedLabel');
    if (label) {
      label.textContent = currentCategory === 'all' ? 'Todas' : formatCategoryOptionLabel(currentCategory);
    }
  }

  function renderBrandSelect() {
    const brandSelect = document.getElementById('brandSelect');
    const brandControl = document.getElementById('brandControl');
    if (!brandSelect || !brandControl) return;

    if (!Array.isArray(brands) || brands.length === 0) {
      brandControl.classList.add('hidden');
      return;
    }

    brandControl.classList.remove('hidden');
    brandSelect.innerHTML = '';

    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'Marcas: Todas';
    brandSelect.appendChild(optAll);

    (brands || []).forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = toTitleCasePT(b);
      brandSelect.appendChild(opt);
    });

    brandSelect.value = currentBrand || 'all';

    const label = document.getElementById('brandSelectedLabel');
    if (label) {
      label.textContent = currentBrand === 'all' ? 'Todas' : toTitleCasePT(currentBrand);
    }
  }

  // Modal bonito para escolher Categoria/Marca (substitui o select nativo no celular)
  let currentPickerType = null; // 'category' | 'brand'

  function openFilterPicker(type) {
    const modal = document.getElementById('filterPickerModal');
    const title = document.getElementById('filterPickerTitle');
    const list = document.getElementById('filterPickerList');
    if (!modal || !title || !list) return;

    currentPickerType = type;
    title.textContent = type === 'brand' ? 'Selecionar Marca' : 'Selecionar Categoria';

    function getItems() {
      if (type === 'brand') {
        return [{ value: 'all', label: 'Todas' }, ...(brands || []).map(b => ({ value: b, label: toTitleCasePT(b) }))];
      }
      return [{ value: 'all', label: 'Todas' }, ...(categories || []).map(c => ({ value: c, label: formatCategoryOptionLabel(c) }))];
    }

    function isActive(val) {
      if (type === 'brand') return (currentBrand || 'all') === val;
      return (currentCategory || 'all') === val;
    }

    function renderList() {
      list.innerHTML = '';
      const items = getItems();

      items.forEach(it => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-picker-item' + (isActive(it.value) ? ' active' : '');
        btn.innerHTML = `
          <span class="badge"><i class="fa-solid ${type === 'brand' ? 'fa-tag' : 'fa-layer-group'}"></i></span>
          <span class="label">${it.label}</span>
          ${isActive(it.value) ? '<i class="fa-solid fa-check check"></i>' : '<span class="check" style="opacity:.0">✓</span>'}
        `;
        btn.onclick = () => {
          if (type === 'brand') {
            const sel = document.getElementById('brandSelect');
            if (sel) sel.value = it.value;
            filterByBrand(it.value);
          } else {
            const sel = document.getElementById('categorySelect');
            if (sel) sel.value = it.value;
            filterByCategory(it.value);
          }
          closeFilterPicker();
        };
        list.appendChild(btn);
      });
    }

    renderList();

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dropdown-sheet-open');
  }

  function closeFilterPicker() {
    const modal = document.getElementById('filterPickerModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dropdown-sheet-open');
    currentPickerType = null;
  }

  // Filtrar e ordenar produtos antes de renderizar
  function getFilteredProducts() {
    let filtered = [...products];
    
    // Busca por nome, descrição, categoria ou marca (suporta múltiplas palavras)
    if (currentSearchTerm) {
      // Dividir o termo de busca em palavras individuais
      const searchWords = currentSearchTerm.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(p => {
        // Criar string combinada com todos os campos pesquisáveis
        const searchableText = [
          p.name || '',
          p.description || '',
          p.category || '',
          p.brand || p.marca || p.brand_name || '',
          p.product_code || ''
        ].join(' ').toLowerCase();
        
        // Verificar se TODAS as palavras da busca aparecem em algum campo
        return searchWords.every(word => searchableText.includes(word));
      });
    }
    
    // Filtro por categoria
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Filtro por marca
    if (currentBrand && currentBrand !== 'all') {
      filtered = filtered.filter(p => {
        const brand = normalizeBrandValue(p.brand || p.marca || p.brand_name);
        return brand === currentBrand;
      });
    }
    
    // Ordenação - usar preço promocional se disponível
    if (currentSort === 'low-high') {
      filtered.sort((a, b) => {
        // Usar preço à vista para ordenação
        const priceA = a.price_cash || a.price || 0;
        const priceB = b.price_cash || b.price || 0;
        return priceA - priceB;
      });
    } else if (currentSort === 'high-low') {
      filtered.sort((a, b) => {
        // Usar preço à vista para ordenação
        const priceA = a.price_cash || a.price || 0;
        const priceB = b.price_cash || b.price || 0;
        return priceB - priceA;
      });
    } else if (currentSort === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    return filtered;
  }

  function renderProducts(reset = false) {
    // Não renderizar produtos na página individual de produto
    if (isProductPage) {
      return;
    }
    
    if (!productsList) {
      console.error('❌ productsList não encontrado no DOM!');
      return;
    }

    if (isLoading) return;
    isLoading = true;

    try {
      if (reset) {
        productsList.innerHTML = "";
        currentPage = 0;
      }

    // 🔥 FILTRO DE DESTAQUES APENAS NA HOME
      let listToRender = products || [];

    if (isHome) {
        // Filtrar apenas produtos em destaque
        listToRender = products.filter(p => {
          const isFeatured = p.featured === true || p.featured === "true" || p.featured === 1;
          return isFeatured;
        });
        console.log('⭐ Produtos em destaque para home:', listToRender.length);
      } else {
        // Na página de produtos, aplicar filtros e busca
        listToRender = getFilteredProducts();
      }

    if (listToRender.length === 0) {
      productsList.innerHTML = "<p>Nenhum produto encontrado.</p>";
        isLoading = false;
      return;
    }

      // Paginação: pegar apenas os produtos da página atual
      const startIndex = currentPage * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      const productsToRender = listToRender.slice(startIndex, endIndex);

      if (productsToRender.length === 0) {
        isLoading = false;
        return; // Não há mais produtos para carregar
      }

      // Criar fragmento para melhor performance
      const fragment = document.createDocumentFragment();

      productsToRender.forEach(prod => {
        try {
      const card = document.createElement("article");
      card.className = "card";

          // 👇 IMPORTANTE PARA ORDENAÇÃO DO CATÁLOGO
          // Usar preço à vista para ordenação
          const sortPrice = prod.price_cash || prod.price || 0;
          card.dataset.price = sortPrice;
          card.dataset.name = (prod.name || '').toLowerCase();
          card.dataset.category = prod.category || '';
          card.dataset.brand = normalizeBrandValue(prod.brand || prod.marca || prod.brand_name);

      const status = prod.available
        ? `<span class="status available">Disponível</span>`
        : `<span class="status unavailable">Indisponível</span>`;

      const button = prod.available
        ? `<button class="btn btn-cart" data-id="${prod.id}">
            <i class="fa-solid fa-cart-plus"></i> Adicionar
          </button>`
        : `<button class="btn btn-disabled" disabled>Fora de estoque</button>`;

          const imageUrl = prod.images?.[0] || 'img/sem-imagem.jpg';
          
          // No mobile, carregar primeiras 4 imagens imediatamente (reduzido para mais velocidade)
          const isMobile = window.innerWidth <= 768;
          const productIndex = startIndex + productsToRender.indexOf(prod);
          const shouldLazyLoad = isMobile ? productIndex >= 4 : productIndex >= 6;

      card.innerHTML = `
            <button class="btn-review-card-small" data-id="${prod.id}" title="Avaliar produto" aria-label="Avaliar produto ${prod.name || 'Produto'}">
              <i class="fa-solid fa-star" aria-hidden="true"></i>
              <span class="review-text-small">Avaliações</span>
            </button>
            <a href="${getProductUrl(prod)}" style="display: block;" aria-label="Ver detalhes do produto ${prod.name || 'Produto'}">
              <img 
                ${shouldLazyLoad ? `class="lazy-img product-image-clickable" data-src="${imageUrl}" src="${createImagePlaceholder()}"` : `class="product-image-clickable" src="${imageUrl}"`}
                alt="${prod.name || 'Produto'}"
                loading="${shouldLazyLoad ? 'lazy' : 'eager'}"
                decoding="async"
                width="200"
                height="160"
                fetchpriority="${shouldLazyLoad ? 'low' : 'high'}"
                data-product-id="${prod.id}"
                style="cursor: pointer;"
              >
            </a>
            <h3><a href="${getProductUrl(prod)}" style="color: inherit; text-decoration: none;" aria-label="Ver detalhes do produto ${prod.name || 'Sem nome'}">${prod.name || 'Sem nome'}</a></h3>
        ${status}
            <div class="product-views-card">
              <i class="fa-solid fa-eye"></i>
              <span>${prod.views !== undefined && prod.views !== null ? Number(prod.views) : 0} ${(prod.views !== undefined && prod.views !== null ? Number(prod.views) : 0) === 1 ? 'visualização' : 'visualizações'}</span>
            </div>
            <div class="price">${formatPriceWithInstallment(prod)}</div>

        <div class="actions">
          ${button}
          <a href="${getProductUrl(prod)}" class="btn btn-more" data-id="${prod.id}" style="text-decoration: none; display: inline-block;" aria-label="Ver detalhes do produto ${prod.name || 'Produto'}">
            <i class="fa-solid fa-eye" aria-hidden="true"></i> Ver detalhes
          </a>
        </div>
      `;

          fragment.appendChild(card);
          
          // Adicionar event listener ao botão de avaliar (após adicionar ao fragment)
          const reviewBtn = card.querySelector('.btn-review-card-small');
          if (reviewBtn) {
            // Adicionar um atributo para identificação
            reviewBtn.setAttribute('data-review-button', 'true');
            
            // Registrar handler com capture: true para executar ANTES de outros handlers
            reviewBtn.addEventListener('click', function(e) {
              console.log('⭐ Botão de avaliar clicado!', reviewBtn, e);
              
              // Marcar flag global ANTES de qualquer outra coisa
              window.reviewButtonJustClicked = true;
              
              e.preventDefault();
              e.stopPropagation(); // Evitar que abra o modal de detalhes
              e.stopImmediatePropagation(); // Parar TODOS os handlers
              e.cancelBubble = true; // IE compatibility
              
              // Marcar o evento como processado pelo botão de avaliação
              e.reviewButtonClicked = true;
              
              // Resetar flag após um pequeno delay
              setTimeout(() => {
                window.reviewButtonJustClicked = false;
              }, 100);
              
              if (typeof openReviewFormFromCard === 'function') {
                openReviewFormFromCard(reviewBtn);
              } else {
                console.error('❌ Função openReviewFormFromCard não encontrada');
                alert('Erro: Função de avaliação não disponível. Recarregue a página.');
              }
              return false; // Garantir que não propague
            }, true); // Usar capture phase para executar primeiro
          } else {
            console.warn('⚠️ Botão de avaliar não encontrado no card');
          }
        } catch (cardErr) {
          console.error('Erro ao criar card:', cardErr, prod);
        }
      });

      productsList.appendChild(fragment);
      currentPage++;

      // Configurar lazy loading imediatamente (sem delay)
      setupLazyLoading();

      // Verificar se há mais produtos para carregar
      if (endIndex < listToRender.length) {
        // Criar observador para carregar mais quando chegar ao final
        const isMobile = window.innerWidth <= 768;
        const loadMoreObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
              renderProducts(false); // Carregar próxima página
            }
          });
        }, {
          rootMargin: isMobile ? '300px' : '200px' // Mobile: carregar mais cedo
        });

        // Observar último card
        const lastCard = productsList.lastElementChild;
        if (lastCard) {
          loadMoreObserver.observe(lastCard);
        }
      }
      
      console.log('✅ Produtos renderizados:', productsToRender.length, 'de', listToRender.length);
      isLoading = false;
    } catch (err) {
      console.error('❌ Erro ao renderizar produtos:', err);
      if (productsList) {
        productsList.innerHTML = "<p>Erro ao renderizar produtos. Verifique o console.</p>";
      }
      isLoading = false;
    }
  }


  // ==============================
  // CARRINHO COM SUPABASE
  // ==============================
  let cart = [];
  let sessionId = null;

  // Gerar session_id único baseado em características do navegador (sem localStorage)
  function getSessionId() {
    if (!sessionId) {
      // Criar um identificador único baseado em características do navegador
      // que permanecem consistentes entre recarregamentos E navegação entre páginas
      const browserFingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform || 'unknown'
      ].join('|');
      
      // Criar hash simples do fingerprint
      let hash = 0;
      for (let i = 0; i < browserFingerprint.length; i++) {
        const char = browserFingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // NÃO usar timestamp para garantir que o mesmo ID seja gerado em todas as páginas
      // Usar apenas o hash baseado nas características do navegador
      sessionId = `session_${Math.abs(hash)}`;
      
      console.log('🆔 Session ID gerado (consistente entre páginas):', sessionId);
    }
    return sessionId;
  }

  // Carregar carrinho do Supabase
  async function loadCart() {
    try {
      // Verificar se supabase está disponível
      if (typeof supabase === 'undefined') {
        console.warn('Supabase não está disponível. Carrinho será mantido apenas em memória.');
        // Inicializar carrinho vazio
        cart = [];
        updateCart();
        return;
      }

      const sid = getSessionId();
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('session_id', sid);

      if (error) {
        // Se a tabela não existir ainda, apenas logar o erro mas continuar
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Tabela cart_items não existe ainda. Execute o SQL do SUPABASE_SETUP.md');
        } else {
          console.error('Erro ao carregar carrinho:', error);
        }
        // Inicializar carrinho vazio mesmo com erro
        cart = [];
        updateCart();
        return;
      }

      if (data && data.length > 0) {
        // Limpar carrinho atual antes de carregar (evitar duplicação)
        cart = [];
        
        // Agrupar itens por product_id e somar quantidades
        const itemsMap = new Map();
        
        data.forEach(item => {
          try {
            const productId = item.product_id;
            // Usar quantity se existir, senão 1 (compatibilidade com tabela sem quantity)
            const qty = (item.quantity !== undefined && item.quantity !== null) ? Number(item.quantity) : 1;
            
            if (itemsMap.has(productId)) {
              // Se já existe, aumentar quantidade
              const existing = itemsMap.get(productId);
              existing.quantity = (existing.quantity || 1) + qty;
            } else {
              // Novo item
              itemsMap.set(productId, {
                id: item.id,
                product_id: productId,
                name: item.products?.name || item.name || 'Produto',
                price: item.products?.price || item.price,
                available: item.products?.available !== false,
                quantity: qty,
                product_code: item.products?.product_code || null,
                price_cash: item.products?.price_cash || null,
                price_installment: item.products?.price_installment || null,
                max_installments: item.products?.max_installments || null,
                promotional_price: item.products?.promotional_price || null,
                brand: item.products?.brand || null,
                category: item.products?.category || null,
                views: item.products?.views || 0
              });
            }
          } catch (itemErr) {
            console.error('Erro ao processar item do carrinho:', itemErr, item);
          }
        });
        
        cart = Array.from(itemsMap.values());
        
        console.log('✅ Carrinho carregado do Supabase:', cart.length, 'itens únicos');
        updateCart();
      } else {
        // Se não houver dados, limpar carrinho
        cart = [];
        updateCart();
      }
    } catch (err) {
      console.error('Erro geral ao carregar carrinho:', err);
      // Garantir que o carrinho está inicializado mesmo com erro
      if (!Array.isArray(cart)) {
        cart = [];
      }
      updateCart();
    }
  }

  // Salvar item no carrinho (Supabase)
  let addingToCart = false; // Flag para evitar duplicação
  
  // Função auxiliar para calcular o preço final (promocional se existir, senão preço normal)
  function getFinalPrice(product) {
    const priceCash = product.price_cash || product.price || 0;
    const promotionalPrice = product.promotional_price && Number(product.promotional_price) > 0 
      ? Number(product.promotional_price) 
      : null;
    
    // Se tem preço promocional e é menor que o preço normal, usar promocional
    if (promotionalPrice !== null && promotionalPrice < priceCash) {
      return promotionalPrice;
    }
    
    // Senão, usar preço normal
    return priceCash;
  }

  // Preço à vista: promocional (se existir e for menor), senão price_cash/price
  function getCashPrice(item) {
    const priceCash = Number(item?.price_cash ?? item?.price ?? 0) || 0;
    const promotionalPrice = item?.promotional_price && Number(item.promotional_price) > 0
      ? Number(item.promotional_price)
      : null;
    if (promotionalPrice !== null && promotionalPrice < priceCash) return promotionalPrice;
    return priceCash;
  }

  // Preço não à vista (sem desconto): preferir price_installment quando existir, senão price_cash/price
  function getNonCashPrice(item) {
    const priceInstallment = Number(item?.price_installment ?? 0) || 0;
    if (priceInstallment > 0) return priceInstallment;
    return Number(item?.price_cash ?? item?.price ?? 0) || 0;
  }

  async function addToCart(product, quantity = 1) {
    // Prevenir duplicação se já estiver adicionando
    if (addingToCart) {
      console.log('Já está adicionando ao carrinho, aguardando...');
      return;
    }
    
    if (!product.available) {
      alert("Este produto está indisponível no momento.");
      return;
    }
    
    // Calcular preço final (promocional se existir)
    const finalPrice = getFinalPrice(product);

    // Verificar se o produto já está no carrinho - se sim, aumentar quantidade
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem && existingItem.id) {
      // Se já existe no carrinho E tem ID do banco, apenas aumentar quantidade
      // (não inserir novamente no banco)
      const newQty = (existingItem.quantity || 1) + quantity;
      await updateCartItemQuantity(existingItem, newQty);
      updateCart(); // Garantir que o carrinho seja atualizado
      openCart(); // Abrir o carrinho para mostrar a atualização
      addingToCart = false;
      return;
    }
    // Se existe mas não tem ID do banco, continuar para inserir no banco
    // Se não existe, continuar para inserir no banco

    addingToCart = true; // Marcar como adicionando

    try {
      // Verificar se supabase está disponível
      if (typeof supabase === 'undefined') {
        // Fallback: adicionar apenas em memória se Supabase não estiver configurado
        cart.push({
          id: Date.now(),
          product_id: product.id,
          name: product.name,
          price: finalPrice, // Usar preço final (promocional se existir)
          available: product.available,
          product_code: product.product_code || null,
          price_cash: product.price_cash || null,
          price_installment: product.price_installment || null,
          max_installments: product.max_installments || null,
          promotional_price: product.promotional_price || null,
          brand: product.brand || null,
          category: product.category || null,
          views: product.views || 0
        });
    updateCart();
    openCart();
        addingToCart = false;
        return;
      }

      const sid = getSessionId();
      
      // Usar preço final (promocional se existir)
      const priceToUse = finalPrice;
      
      // Verificar se já existe no banco para esta sessão
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sid)
        .eq('product_id', product.id);
      
      if (existingItems && existingItems.length > 0) {
        // Se já existe no banco, significa que foi adicionado antes
        // Aumentar quantidade apenas se o usuário clicou novamente
        const existingItem = existingItems[0];
        const currentQty = existingItem.quantity || 1;
        const newQty = currentQty + 1;  // Sempre aumentar apenas 1
        
        const updateResult = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existingItem.id);
        
        // Se der erro sobre quantity, inserir novo item
        if (updateResult.error && updateResult.error.message && 
            (updateResult.error.message.includes('quantity') || updateResult.error.message.includes('schema cache'))) {
          console.warn('⚠️ Coluna quantity não existe. Inserindo novo item...');
          const result = await supabase
            .from('cart_items')
            .insert({
              session_id: sid,
              product_id: product.id,
              price: finalPrice // Usar preço final (promocional se existir)
            })
            .select()
            .single();
          
          if (result.data) {
            cart.push({
              id: result.data.id,
              product_id: product.id,
              name: product.name,
              price: finalPrice, // Usar preço final (promocional se existir)
              available: product.available,
              quantity: quantity || 1,
              product_code: product.product_code || null,
              price_cash: product.price_cash || null,
              price_installment: product.price_installment || null,
              max_installments: product.max_installments || null,
              promotional_price: product.promotional_price || null,
              brand: product.brand || null,
              category: product.category || null,
              views: product.views || 0
            });
            updateCart();
            openCart();
            addingToCart = false;
            return;
          }
        }
        
        // Atualizar no carrinho local (evitar duplicação)
        const localItem = cart.find(item => item.product_id === product.id);
        if (localItem) {
          localItem.quantity = newQty;
          localItem.id = existingItem.id; // Garantir ID do banco
        } else {
          // Verificar se já não foi adicionado antes
          const alreadyInCart = cart.some(item => item.id === existingItem.id || item.product_id === product.id);
          if (!alreadyInCart) {
            cart.push({
              id: existingItem.id,
              product_id: product.id,
              name: product.name,
              price: finalPrice, // Usar preço final (promocional se existir)
              available: product.available,
              quantity: newQty,
              product_code: product.product_code || null,
              price_cash: product.price_cash || null,
              price_installment: product.price_installment || null,
              max_installments: product.max_installments || null,
              promotional_price: product.promotional_price || null,
              brand: product.brand || null,
              category: product.category || null,
              views: product.views || 0
            });
          }
        }
        
        console.log('✅ Quantidade atualizada:', product.name, 'Nova quantidade:', newQty);
        updateCart();
        openCart();
        addingToCart = false;
        return;
      }
      
      console.log('📦 Inserindo produto no banco pela primeira vez:', product.name);
      
      // Preparar dados para inserção - SEMPRE quantidade = 1 na primeira vez
      const insertData = {
        session_id: sid,
        product_id: product.id,
        price: finalPrice, // Usar preço final (promocional se existir)
        quantity: 1  // SEMPRE 1 na primeira inserção
      };
      
      // Tentar inserir com quantity
      const result = await supabase
        .from('cart_items')
        .insert(insertData)
        .select()
        .single();
      
      let data = result.data;
      let error = result.error;

      // Se o erro for sobre a coluna quantity não existir
      if (error && error.message && (error.message.includes('quantity') || error.message.includes('schema cache'))) {
        console.warn('⚠️ Coluna quantity não existe na tabela cart_items');
        console.warn('📝 Execute este SQL no Supabase SQL Editor:');
        console.warn('ALTER TABLE cart_items ADD COLUMN quantity INTEGER DEFAULT 1;');
        
        // Tentar inserir sem quantity (coluna não existe)
        const insertDataWithoutQty = {
          session_id: sid,
          product_id: product.id,
          price: finalPrice // Usar preço final (promocional se existir)
        };
        const result2 = await supabase
          .from('cart_items')
          .insert(insertDataWithoutQty)
          .select()
          .single();
        
        data = result2.data;
        error = result2.error;
        
        if (error) {
          console.error('Erro ao adicionar ao carrinho:', error);
          alert('⚠️ ERRO: A coluna "quantity" não existe na tabela cart_items.\n\n' +
                '📝 SOLUÇÃO:\n' +
                '1. Acesse o Supabase Dashboard\n' +
                '2. Vá em SQL Editor\n' +
                '3. Execute este comando:\n\n' +
                'ALTER TABLE cart_items ADD COLUMN quantity INTEGER DEFAULT 1;\n\n' +
                '4. Recarregue esta página');
          addingToCart = false;
          return;
        }
      }

      if (error) {
        // Se a tabela não existir, usar fallback em memória
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('Tabela cart_items não existe. Usando carrinho em memória.');
          const existingItem = cart.find(item => item.product_id === product.id);
          if (existingItem) {
            // Se já existe, aumentar quantidade
            existingItem.quantity = (existingItem.quantity || 1) + 1;
          } else {
            // Se não existe, adicionar com quantidade = 1
            cart.push({
              id: Date.now(),
              product_id: product.id,
              name: product.name,
              price: finalPrice, // Usar preço final (promocional se existir)
              available: product.available,
              quantity: 1,  // SEMPRE 1 na primeira inserção
              product_code: product.product_code || null,
              price_cash: product.price_cash || null,
              price_installment: product.price_installment || null,
              max_installments: product.max_installments || null,
              promotional_price: product.promotional_price || null,
              brand: product.brand || null,
              category: product.category || null,
              views: product.views || 0
            });
          }
          updateCart();
          openCart();
        } else {
          console.error('Erro ao adicionar ao carrinho:', error);
          alert('Erro ao adicionar produto ao carrinho: ' + error.message);
        }
        addingToCart = false;
        return;
      }

      if (data) {
        // Verificar se já existe no carrinho local (evitar duplicação)
        const existingLocalItem = cart.find(item => item.product_id === product.id);
        
        if (existingLocalItem) {
          // Se já existe localmente, NÃO fazer nada - evitar duplicação
          // Apenas atualizar ID do banco se necessário
          if (!existingLocalItem.id) {
            existingLocalItem.id = data.id;
          }
          console.log('⚠️ Item já existia no carrinho local, ignorando duplicação:', product.name);
        } else {
          // Adicionar novo item ao carrinho local APENAS se não existir
          const alreadyAdded = cart.some(item => item.id === data.id || item.product_id === product.id);
          if (!alreadyAdded) {
            // Usar a quantidade do banco (sempre 1 na primeira inserção)
            cart.push({
              id: data.id,
              product_id: product.id,
              name: product.name,
              price: finalPrice, // Usar preço final (promocional se existir)
              available: product.available,
              quantity: 1,  // SEMPRE 1 na primeira inserção
              product_code: product.product_code || null,
              price_cash: product.price_cash || null,
              price_installment: product.price_installment || null,
              max_installments: product.max_installments || null,
              promotional_price: product.promotional_price || null,
              brand: product.brand || null,
              category: product.category || null,
              views: product.views || 0
            });
            console.log('✅ Produto adicionado ao carrinho:', product.name, 'Quantidade: 1');
          } else {
            console.warn('⚠️ Produto já estava no carrinho, ignorando duplicação');
          }
        }
        
        updateCart();
        openCart();
      }
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      // Fallback: adicionar em memória mesmo com erro, mas verificar duplicação
      const existingItemError = cart.find(item => item.product_id === product.id);
      if (existingItemError) {
        // Se já existe, aumentar quantidade
        existingItemError.quantity = (existingItemError.quantity || 1) + 1;
      } else {
        // Se não existe, adicionar com quantidade = 1
        cart.push({
          id: Date.now(),
          product_id: product.id,
          name: product.name,
          price: finalPrice, // Usar preço final (promocional se existir)
          available: product.available,
          quantity: 1,  // SEMPRE 1 na primeira inserção
          product_code: product.product_code || null,
          price_cash: product.price_cash || null,
          price_installment: product.price_installment || null,
          max_installments: product.max_installments || null,
          promotional_price: product.promotional_price || null,
          brand: product.brand || null,
          category: product.category || null,
          views: product.views || 0
        });
      }
      updateCart();
      openCart();
    } finally {
      // Sempre liberar a flag após um pequeno delay para garantir
      setTimeout(() => {
        addingToCart = false;
      }, 500);
    }
  }

  // Atualizar quantidade de um item no carrinho
  async function updateCartItemQuantity(item, newQuantity) {
    if (newQuantity < 1) {
      // Se quantidade for menor que 1, remover o item
      const index = cart.findIndex(c => c.product_id === item.product_id);
      if (index >= 0) {
        await removeFromCart(index);
      }
      return;
    }

    try {
      // Atualizar no Supabase se disponível
      if (typeof supabase !== 'undefined' && item.id) {
        const updateResult = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', item.id);

        // Se der erro sobre quantity, apenas atualizar localmente
        if (updateResult.error && updateResult.error.message && 
            (updateResult.error.message.includes('quantity') || updateResult.error.message.includes('schema cache'))) {
          console.warn('Coluna quantity não existe, atualizando apenas localmente');
        } else if (updateResult.error) {
          console.error('Erro ao atualizar quantidade no Supabase:', updateResult.error);
        }
      }

      // Atualizar no carrinho local
      const localItem = cart.find(c => c.product_id === item.product_id);
      if (localItem) {
        localItem.quantity = newQuantity;
        localItem.id = item.id; // Garantir que o ID do banco está presente
        updateCart();
      } else {
        // Se não encontrou localmente mas tem ID, recarregar o carrinho do banco
        console.warn('Item não encontrado localmente, mas existe no banco. Recarregando carrinho...');
        await loadCart();
      }
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      // Mesmo com erro, atualizar localmente
      const localItem = cart.find(c => c.product_id === item.product_id);
      if (localItem) {
        localItem.quantity = newQuantity;
        updateCart();
      }
    }
  }

  // Aumentar quantidade de um item
  window.increaseQuantity = async function(index) {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    const newQty = (item.quantity || 1) + 1;
    await updateCartItemQuantity(item, newQty);
  };

  // Diminuir quantidade de um item
  window.decreaseQuantity = async function(index) {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    const currentQty = item.quantity || 1;
    
    if (currentQty <= 1) {
      // Se quantidade for 1, remover o item
      await removeFromCart(index);
    } else {
      const newQty = currentQty - 1;
      await updateCartItemQuantity(item, newQty);
    }
  };

  // Atualizar quantidade de um item no carrinho
  async function updateCartItemQuantity(item, newQuantity) {
    if (newQuantity < 1) {
      // Se quantidade for menor que 1, remover o item
      const index = cart.findIndex(c => c.product_id === item.product_id);
      if (index >= 0) {
        await removeFromCart(index);
      }
      return;
    }

    try {
      // Atualizar no Supabase se disponível
      if (typeof supabase !== 'undefined' && item.id) {
        const updateResult = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', item.id);

        // Se der erro sobre quantity, apenas atualizar localmente
        if (updateResult.error && updateResult.error.message && 
            (updateResult.error.message.includes('quantity') || updateResult.error.message.includes('schema cache'))) {
          console.warn('Coluna quantity não existe, atualizando apenas localmente');
        }
      }

      // Atualizar no carrinho local
      const localItem = cart.find(c => c.product_id === item.product_id);
      if (localItem) {
        localItem.quantity = newQuantity;
        updateCart();
      }
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      // Mesmo com erro, atualizar localmente
      const localItem = cart.find(c => c.product_id === item.product_id);
      if (localItem) {
        localItem.quantity = newQuantity;
        updateCart();
      }
    }
  }

  // Remover item do carrinho (Supabase)
  async function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;

    const item = cart[index];
    
    try {
      // Se supabase não estiver disponível ou item não tiver id do banco, remover apenas da memória
      if (typeof supabase === 'undefined' || !item.id || typeof item.id === 'string') {
    cart.splice(index, 1);
    updateCart();
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.id);

      if (error) {
        // Se a tabela não existir, apenas remover da memória
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          cart.splice(index, 1);
          updateCart();
        } else {
          console.error('Erro ao remover do carrinho:', error);
          // Mesmo com erro, remover da memória para melhor UX
          cart.splice(index, 1);
          updateCart();
        }
        return;
      }

      cart.splice(index, 1);
      updateCart();
    } catch (err) {
      console.error('Erro ao remover do carrinho:', err);
      // Mesmo com erro, remover da memória
      cart.splice(index, 1);
      updateCart();
    }
  }

  function updateCart() {
    try {
      // Tentar encontrar os elementos novamente se não foram encontrados
      const itemsDiv = cartItemsDiv || document.getElementById('cartItems');
      const totalDiv = cartTotal || document.getElementById('cartTotal');
      
      if (!itemsDiv) {
        console.warn('⚠️ Elemento cartItems não encontrado');
        return;
      }

      itemsDiv.innerHTML = "";
      let totalCash = 0;
      let totalNonCash = 0;

      if (cart.length === 0) {
        itemsDiv.innerHTML = `
          <div class="cart-empty">
            <i class="fa-solid fa-cart-shopping"></i>
            <p>Seu carrinho está vazio</p>
            <span>Adicione produtos para começar</span>
          </div>
        `;
      } else {
      cart.forEach((item, i) => {
          if (!item) return; // Pular itens inválidos
          
          const quantity = item.quantity || 1;
          const itemCashPrice = getCashPrice(item);
          const itemNonCashPrice = getNonCashPrice(item);
          const itemTotalCash = itemCashPrice * quantity;
          const itemTotalNonCash = itemNonCashPrice * quantity;
          totalCash += itemTotalCash;
          totalNonCash += itemTotalNonCash;
          
        const div = document.createElement("div");
          div.className = "cart-item-modern";
        div.innerHTML = `
            <div class="cart-item-info">
              <h4 class="cart-item-name">${item.name || 'Produto sem nome'}</h4>
              <div class="cart-item-price">
                <div>${formatPrice(itemCashPrice)} <span style="opacity:.75">à vista</span></div>
                ${itemNonCashPrice !== itemCashPrice ? `<div><span style="opacity:.75">parcelado:</span> ${formatPrice(itemNonCashPrice)}</div>` : ``}
              </div>
            </div>
            <div class="cart-item-controls">
              <div class="quantity-controls">
                <button class="qty-btn qty-minus" onclick="decreaseQuantity(${i})" ${quantity <= 1 ? 'disabled' : ''}>
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-value">${quantity}</span>
                <button class="qty-btn qty-plus" onclick="increaseQuantity(${i})">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <div class="cart-item-total">
                <strong>${formatPrice(itemTotalCash)}</strong>
              </div>
              <button class="remove-btn-modern" onclick="removeFromCart(${i})" title="Remover item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;
          
          // Garantir que nenhuma imagem seja adicionada acidentalmente
          const allImages = div.querySelectorAll('img');
          allImages.forEach(img => img.remove());
          
        itemsDiv.appendChild(div);
      });
      }

      if (totalDiv) {
        const itemsCount = cart.reduce((sum, item) => sum + ((item && item.quantity) ? item.quantity : 1), 0);
        totalDiv.innerHTML = `
          <div class="cart-total-info">
            <div class="cart-total-items">${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}</div>
            <div class="cart-total-price">Total à vista: <strong>${formatPrice(totalCash)}</strong></div>
            <div class="cart-total-price" style="opacity:.9; margin-top:4px;">Total parcelado: <strong>${formatPrice(totalNonCash)}</strong></div>
          </div>
        `;
      }
      
      // Atualizar mensagem de frete grátis
      updateFreeShippingMessage(totalCash);
      
      updateWhatsAppLink();
    } catch (error) {
      console.error('Erro ao atualizar carrinho:', error);
      // Tentar mostrar pelo menos uma mensagem de erro
      const itemsDiv = cartItemsDiv || document.getElementById('cartItems');
      if (itemsDiv) {
        itemsDiv.innerHTML = `<div class="cart-empty"><p>Erro ao carregar carrinho. Recarregue a página.</p></div>`;
      }
    }
  }

  // ==============================
  // MENSAGEM DE FRETE
  // ==============================
  function updateFreeShippingMessage(total) {
    // Mensagem sempre visível: "FRETE A COMBINAR COM O VENDEDOR"
    // Não precisa de lógica condicional
  }

  // ==============================
  // EVENTOS DE PAGAMENTO
  // ==============================
  // Função mantida para compatibilidade, mas não faz mais nada
  // pois os campos foram movidos para o modal
  function setupPaymentEvents() {
    // Campos de pagamento agora estão no modal de dados do cliente
    // Esta função é mantida apenas para compatibilidade
  }

  // ==============================
  // EVENTOS (DELEGAÇÃO) - ÚNICO EVENT LISTENER
  // ==============================
  // Usar uma flag para evitar múltiplos event listeners
  if (!window.cartEventsInitialized) {
    // Flag global para rastrear se o botão de avaliação foi clicado
    if (typeof window.reviewButtonJustClicked === 'undefined') {
      window.reviewButtonJustClicked = false;
    }
    
    const handleClick = (e) => {
    // IGNORAR COMPLETAMENTE botões de navegação
    const navItem = e.target.closest(".nav-item");
    if (navItem) {
      // Se for qualquer botão de navegação, não fazer nada
      return;
    }
    
    // PRIMEIRA E ÚNICA VERIFICAÇÃO CRÍTICA: Se for botão de avaliação, IGNORAR COMPLETAMENTE
    const clickedElement = e.target;
    const isReviewButton = clickedElement.closest(".btn-review-card-small") !== null ||
                          clickedElement.classList?.contains('btn-review-card-small') ||
                          clickedElement.closest('[data-review-button="true"]') !== null ||
                          e.reviewButtonClicked === true ||
                          (window.reviewButtonJustClicked && clickedElement.closest(".btn-review-card-small"));
    
    if (isReviewButton) {
      console.log('🚫 Clique no botão de avaliar - IGNORADO completamente');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (window.reviewButtonJustClicked) {
        setTimeout(() => { window.reviewButtonJustClicked = false; }, 100);
      }
      return false;
    }
    
    // Verificar se é botão de carrinho (NÃO botão de avaliação)
    const cartBtn = e.target.closest(".btn-cart");
    
    if (cartBtn) {
      // Verificação adicional: garantir que NÃO é botão de avaliação
      const isCartBtnAlsoReview = cartBtn.closest(".btn-review-card-small") !== null ||
                                  cartBtn.classList.contains('btn-review-card-small') ||
                                  cartBtn.getAttribute('data-review-button') === 'true';
      
      if (isCartBtnAlsoReview) {
        console.log('🚫 Botão de carrinho é na verdade botão de avaliação - IGNORADO');
        return false;
      }
        // Prevenir múltiplos cliques
        if (cartBtn.disabled || cartBtn.classList.contains('adding')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
    const id = Number(cartBtn.dataset.id);
    const product = products.find(p => p.id === id);

    if (product && product.available) {
          // Marcar botão como "adicionando" para evitar duplicação
          cartBtn.classList.add('adding');
          cartBtn.disabled = true;
          
          // Calcular preço final (promocional se existir)
          const finalPrice = getFinalPrice(product);
          const productToAdd = { ...product, price: finalPrice };
          
          addToCart(productToAdd).finally(() => {
            // Reabilitar após um pequeno delay
            setTimeout(() => {
              cartBtn.disabled = false;
              cartBtn.classList.remove('adding');
            }, 1000);
          });
    } else if (product) {
      // Só mostrar alerta se realmente for um produto indisponível E não for botão de avaliação
      const isStillReviewBtn = e.target.closest(".btn-review-card-small") !== null ||
                              e.target.closest('[data-review-button="true"]') !== null;
      if (!isStillReviewBtn) {
      alert("Produto indisponível.");
      }
    }
    return;
  }

    // Verificar se clicou na imagem do produto
    const clickedImg = e.target.tagName === 'IMG' ? e.target : null;
    if (clickedImg && (clickedImg.classList.contains('product-image-clickable') || clickedImg.hasAttribute('data-product-id'))) {
      const id = Number(clickedImg.getAttribute('data-product-id') || clickedImg.dataset.productId);
      if (id) {
        const product = products.find(p => p.id === id);
        if (product) {
          // Abrir modal imediatamente (sem delay)
          openModal(product);
        }
      }
      return;
    }

    // Botão "Ver detalhes" deve navegar normalmente para a página do produto
    // Não interceptar de forma alguma - deixar o link funcionar normalmente
    // Se o clique for no link "Ver detalhes" ou em qualquer elemento dentro dele, não fazer nada
    // O link <a> vai funcionar normalmente sem interferência
    };
    
    // Registrar o handler com capture: false - mas botões de navegação serão ignorados
    document.addEventListener("click", handleClick, { passive: false, capture: false });
    window.cartEventsInitialized = true;
    console.log('✅ Event listeners do carrinho inicializados (único)');
  }

  // ==============================
  // BOTÕES DE NAVEGAÇÃO - LISTENERS DIRETOS
  // ==============================
  function setupNavButtons() {
    // Botão Início
    const homeBtn = document.querySelector('.nav-item[data-nav="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.goHome();
      }, true);
    }

    // Botão Sobre Nós
    const aboutBtn = document.querySelector('.nav-item[data-nav="about"]');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("🔍 Botão Sobre Nós clicado!");
        window.showAbout();
      }, true);
    }

    // Botão Destaques
    const productsBtn = document.querySelector('.nav-item[data-nav="products"]');
    if (productsBtn) {
      productsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.showProducts();
      }, true);
    }
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNavButtons);
  } else {
    setupNavButtons();
  }
  
  // Também tentar após um pequeno delay para garantir
  setTimeout(setupNavButtons, 500);


  // ==============================
  // MODAL
  // ==============================
  // Variável para rastrear se o modal foi aberto via pushState
  let modalHistoryState = false;

  function closeModal() {
    try {
      if (modal) {
        modal.classList.add("hidden");
        // Se o modal foi aberto com pushState, remover o estado do histórico
        if (modalHistoryState && window.history && window.history.state && window.history.state.modalOpen) {
          try {
            window.history.back();
          } catch (historyError) {
            console.warn('Erro ao voltar no histórico:', historyError);
            // Se der erro, apenas remover a flag
          }
          modalHistoryState = false;
        }
      }
    } catch (error) {
      console.error('Erro ao fechar modal:', error);
      // Tentar fechar mesmo com erro
      if (modal) {
        modal.classList.add("hidden");
      }
    }
  }

  // Tornar função acessível globalmente
  window.closeModal = closeModal;

  // Listener para o botão voltar do navegador (mobile)
  window.addEventListener('popstate', (e) => {
    // Se o modal estiver aberto e o usuário apertar voltar, fechar o modal
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      modalHistoryState = false;
    }
  });

  // ==============================
  // MODAL DE ZOOM DA IMAGEM
  // ==============================
  let currentZoomImages = [];
  let currentZoomIndex = 0;

  // Variável global para armazenar o produto atual do modal
  let currentModalProduct = null;

  function openImageZoom(imageSrc) {
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    const zoomCounter = document.getElementById('zoomImageCounter');
    
    if (!zoomModal || !zoomedImg) return;

    // Usar o produto atual do modal (definido em openModal)
    let product = currentModalProduct;

    // Se não tiver produto salvo, tentar encontrar pelo src da imagem
    if (!product) {
      const mainImg = document.getElementById('modalMainImage');
      if (mainImg && mainImg.src) {
        // Tentar encontrar produto pela URL da imagem
        product = products.find(p => {
          if (!p.images || !Array.isArray(p.images)) return false;
          return p.images.some(img => {
            // Comparar URLs (pode ter query params diferentes)
            const imgUrl = img.split('?')[0];
            const srcUrl = mainImg.src.split('?')[0];
            return imgUrl === srcUrl || mainImg.src.includes(img) || img.includes(mainImg.src);
          });
        });
      }
    }

    if (product && product.images && product.images.length > 0) {
      currentZoomImages = product.images;
      // Encontrar índice da imagem atual
      currentZoomIndex = currentZoomImages.findIndex(img => {
        const imgUrl = img.split('?')[0];
        const srcUrl = imageSrc.split('?')[0];
        return imgUrl === srcUrl || imageSrc.includes(img) || img.includes(imageSrc);
      });
      if (currentZoomIndex === -1) currentZoomIndex = 0;
    } else {
      // Fallback: usar apenas a imagem clicada
      currentZoomImages = [imageSrc];
      currentZoomIndex = 0;
    }

    // Atualizar imagem e contador
    zoomedImg.src = currentZoomImages[currentZoomIndex];
    updateZoomCounter();

    // Mostrar modal
    zoomModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
  }

  function closeImageZoom() {
    const zoomModal = document.getElementById('imageZoomModal');
    if (zoomModal) {
      zoomModal.classList.add('hidden');
      document.body.style.overflow = ''; // Restaurar scroll
    }
  }

  function changeZoomImage(direction) {
    if (currentZoomImages.length <= 1) return;

    currentZoomIndex += direction;

    if (currentZoomIndex < 0) {
      currentZoomIndex = currentZoomImages.length - 1;
    } else if (currentZoomIndex >= currentZoomImages.length) {
      currentZoomIndex = 0;
    }

    const zoomedImg = document.getElementById('zoomedImage');
    if (zoomedImg) {
      zoomedImg.src = currentZoomImages[currentZoomIndex];
      updateZoomCounter();
    }
  }

  function updateZoomCounter() {
    const zoomCounter = document.getElementById('zoomImageCounter');
    if (zoomCounter && currentZoomImages.length > 1) {
      zoomCounter.textContent = `${currentZoomIndex + 1} / ${currentZoomImages.length}`;
    } else if (zoomCounter) {
      zoomCounter.textContent = '';
    }
  }

  // Fechar zoom ao clicar fora da imagem
  const zoomModal = document.getElementById('imageZoomModal');
  if (zoomModal) {
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal || e.target.classList.contains('zoom-container')) {
        closeImageZoom();
      }
    });

    // Prevenir fechar ao clicar na imagem
    const zoomedImg = document.getElementById('zoomedImage');
    if (zoomedImg) {
      zoomedImg.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  // Navegação com teclado
  document.addEventListener('keydown', (e) => {
    const zoomModal = document.getElementById('imageZoomModal');
    if (!zoomModal || zoomModal.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      closeImageZoom();
    } else if (e.key === 'ArrowLeft') {
      changeZoomImage(-1);
    } else if (e.key === 'ArrowRight') {
      changeZoomImage(1);
    }
  });

  // Tornar funções globais
  window.openImageZoom = openImageZoom;
  window.closeImageZoom = closeImageZoom;
  window.changeZoomImage = changeZoomImage;

  // Função para incrementar visualizações do produto
  async function incrementProductViews(productId) {
    try {
      // Verificar se já incrementou nesta sessão (evitar spam)
      const viewedKey = `viewed_${productId}`;
      if (sessionStorage.getItem(viewedKey)) {
        console.log('⏭️ Visualização já contada nesta sessão para produto:', productId);
        return; // Já visualizou nesta sessão
      }

      // Buscar o produto atual para obter o número de visualizações
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) {
        console.error('❌ Produto não encontrado:', productId);
        return;
      }

      const currentViews = currentProduct.views !== undefined && currentProduct.views !== null 
        ? Number(currentProduct.views) 
        : 0;

      console.log('👁️ Incrementando visualizações para produto:', productId, 'Views atuais:', currentViews);

      // Incrementar no banco de dados usando update direto
      const { data, error: updateError } = await supabase
        .from('products')
        .update({ views: currentViews + 1 })
        .eq('id', productId)
        .select('views');
      
      if (updateError) {
        console.error('❌ Erro ao atualizar visualizações no banco:', updateError);
        
        // Se o erro for porque a coluna não existe, apenas atualizar localmente
        if (updateError.code === '42703' || updateError.message?.includes('column "views"')) {
          console.warn('⚠️ Coluna "views" não existe no banco. Atualizando apenas localmente.');
        }
        
        // Mesmo com erro, tentar atualizar localmente
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          products[productIndex].views = (products[productIndex].views || 0) + 1;
          
          // Atualizar exibição no modal se estiver aberto
          const modalViews = document.getElementById("modalViews");
          if (modalViews) {
            const views = products[productIndex].views;
            modalViews.innerHTML = `
              <i class="fa-solid fa-eye"></i>
              <span>${views} ${views === 1 ? 'visualização' : 'visualizações'}</span>
            `;
          }
        }
        return; // Sair se houver erro
      } else {
        // Atualizar o produto na lista local com o valor retornado do banco
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          const newViews = data && data[0] ? Number(data[0].views) : currentViews + 1;
          products[productIndex].views = newViews;
          console.log('✅ Visualizações atualizadas:', newViews);
          
          // Atualizar exibição no modal se estiver aberto
          const modalViews = document.getElementById("modalViews");
          if (modalViews) {
            modalViews.innerHTML = `
              <i class="fa-solid fa-eye"></i>
              <span>${newViews} ${newViews === 1 ? 'visualização' : 'visualizações'}</span>
            `;
          }
          
          // Atualizar também no card do produto se estiver visível
          const productCard = document.querySelector(`[data-id="${productId}"]`)?.closest('.card');
          if (productCard) {
            const viewsCard = productCard.querySelector('.product-views-card');
            if (viewsCard) {
              viewsCard.innerHTML = `
                <i class="fa-solid fa-eye"></i>
                <span>${newViews} ${newViews === 1 ? 'visualização' : 'visualizações'}</span>
              `;
            }
          }
        }
      }

      // Marcar como visualizado nesta sessão
      sessionStorage.setItem(viewedKey, 'true');
    } catch (err) {
      console.error('❌ Erro ao incrementar visualizações:', err);
    }
  }

  async function openModal(product) {
    // Salvar produto atual para uso no zoom
    currentModalProduct = product;

    // Mostrar modal IMEDIATAMENTE (antes de carregar tudo)
    modal.classList.remove("hidden");
    
    // Atualizar conteúdo básico primeiro (mais rápido)
    modalTitle.textContent = product.name;
    
    // Mostrar preço imediatamente
    modalPrice.innerHTML = formatPriceWithInstallment(product);

    // Exibir contador de visualizações inicial
    const modalViews = document.getElementById("modalViews");
    if (modalViews) {
      const views = product.views !== undefined && product.views !== null ? Number(product.views) : 0;
      modalViews.innerHTML = `
        <i class="fa-solid fa-eye"></i>
        <span>${views} ${views === 1 ? 'visualização' : 'visualizações'}</span>
      `;
    }

    const mainImg = document.getElementById("modalMainImage");
    const thumbs = document.getElementById("modalThumbs");
    const images = product.images?.length ? product.images : ["img/sem-imagem.jpg"];
    
    // Carregar primeira imagem IMEDIATAMENTE (sem esperar precarregamento)
    mainImg.classList.add("loading");
    mainImg.src = images[0];
    mainImg.loading = "eager";
    mainImg.fetchPriority = "high";
    mainImg.onload = () => {
      mainImg.classList.remove("loading");
    };
    mainImg.onerror = () => {
      mainImg.src = "img/sem-imagem.jpg";
      mainImg.classList.remove("loading");
    };
    
    // Limpar e preparar miniaturas
    thumbs.innerHTML = "";
    
    // Carregar descrição (pode ser pesado, fazer depois)
    requestAnimationFrame(() => {
      if (product.description) {
        modalDescription.innerHTML = product.description;
      } else {
        modalDescription.textContent = "Sem descrição disponível.";
      }
    });
    
    // Garantir que cliques na galeria não fechem o modal (só uma vez)
    const modalGallery = document.querySelector(".modal-gallery");
    if (modalGallery && !modalGallery.dataset.clickHandlerAdded) {
      modalGallery.addEventListener("click", (e) => {
        e.stopPropagation();
      }, { once: true });
      modalGallery.dataset.clickHandlerAdded = "true";
    }

    // Adicionar estado ao histórico (não bloqueante)
    if (window.history && window.history.pushState) {
      window.history.pushState({ modalOpen: true }, '', window.location.href);
      modalHistoryState = true;
    }
    
    // Incrementar visualizações de forma não-bloqueante (depois)
    if (product.id) {
      setTimeout(() => {
        incrementProductViews(product.id);
      }, 100);
    }

    // Carregar miniaturas de forma otimizada (não bloqueante)
    requestAnimationFrame(() => {
      images.forEach((img, index) => {
        const thumb = document.createElement("img");
        
        // Primeira miniatura carrega imediatamente
        if (index === 0) {
          thumb.src = img;
          thumb.loading = "eager";
          thumb.classList.add("active");
        } else {
          // Outras miniaturas carregam diretamente (mais rápido)
          thumb.src = img;
          thumb.loading = "lazy";
        }

        thumb.onclick = (e) => {
          // Impedir que o clique feche o modal
          e.stopPropagation();
          e.preventDefault();
          
          document.querySelectorAll(".modal-thumbs img")
            .forEach(i => i.classList.remove("active"));
          thumb.classList.add("active");
          
          // Trocar imagem principal diretamente (sem delay)
          mainImg.classList.add("loading");
          mainImg.src = img;
          mainImg.onload = () => {
            mainImg.classList.remove("loading");
          };
          mainImg.onerror = () => {
            mainImg.classList.remove("loading");
          };
        };

        thumbs.appendChild(thumb);
      });
    });

    const modalAdd = document.getElementById("modalAddCart");

  if (!product.available) {
    modalAdd.disabled = true;
    modalAdd.innerHTML = "Produto indisponível";
    modalAdd.classList.add("btn-disabled");
    modalAdd.onclick = null;
  } else {
    modalAdd.disabled = false;
    modalAdd.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Adicionar ao carrinho`;
    modalAdd.classList.remove("btn-disabled");

    modalAdd.onclick = async () => {
        // Prevenir múltiplos cliques
        if (modalAdd.disabled) return;
        
        modalAdd.disabled = true;
        const originalHtml = modalAdd.innerHTML;
        modalAdd.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adicionando...';
        
        try {
            // Calcular preço final (promocional se existir)
            const finalPrice = getFinalPrice(product);
            const productToAdd = { ...product, price: finalPrice };
            
            await addToCart(productToAdd);
            
            // Aguardar um pouco para garantir que o carrinho foi atualizado
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Verificar se updateCart foi executado sem erros
            try {
                updateCart();
                // Garantir que o botão de finalizar está configurado
                if (typeof updateWhatsAppLink === 'function') {
                    updateWhatsAppLink();
                }
            } catch (updateError) {
                console.error('Erro ao atualizar carrinho:', updateError);
            }
            
            // Fechar modal após sucesso
            setTimeout(() => {
                closeModal();
            }, 200);
            
            // Mostrar feedback visual
            modalAdd.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado!';
            setTimeout(() => {
                modalAdd.innerHTML = originalHtml;
                modalAdd.disabled = false;
            }, 1000);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            // Não fechar o modal em caso de erro
            modalAdd.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Erro!';
            setTimeout(() => {
                modalAdd.innerHTML = originalHtml;
                modalAdd.disabled = false;
            }, 2000);
            
            // Mostrar alerta apenas se for um erro crítico
            if (error.message && !error.message.includes('quantity')) {
                alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
            }
        }
    };
  }


    modal.classList.remove("hidden");
    
    // Não carregar avaliações aqui - elas estão em modal separado
  }

  // fechar ao clicar fora
  if (modal) {
    modal.addEventListener("click", () => {
      closeModal();
    });
  }

  // impedir fechar ao clicar dentro
  const modalBox = document.querySelector(".modal-box");
  if (modalBox) {
    modalBox.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // ==============================
  // CARRINHO LATERAL
  // ==============================
function openCart() {
  try {
    if (cartBox) {
      // Atualizar carrinho antes de abrir para garantir que está atualizado
      updateCart();
      
      // Garantir que o botão de finalizar está configurado
      setTimeout(() => {
        if (typeof updateWhatsAppLink === 'function') {
          updateWhatsAppLink();
        }
      }, 100);
      
      cartBox.classList.add("open");
      if (cartOverlay) {
        cartOverlay.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error('Erro ao abrir carrinho:', error);
  }
}

function toggleCart() {
  if (!cartBox) return;

  cartBox.classList.toggle("open");

  if (cartBox.classList.contains("open")) {
    cartOverlay.classList.remove("hidden");
  } else {
    cartOverlay.classList.add("hidden");
  }
}


  window.toggleCart = toggleCart;
  window.removeFromCart = removeFromCart;
  
  // Obter localização atual
  window.getCurrentLocation = async function() {
    const locationBtn = document.getElementById("getLocationBtn");
    const addressInput = document.getElementById("deliveryAddress");
    const streetInput = document.getElementById("deliveryStreet");
    const numberInput = document.getElementById("deliveryNumber");
    const complementInput = document.getElementById("deliveryComplement");
    const neighborhoodInput = document.getElementById("deliveryNeighborhood");
    const cityInput = document.getElementById("deliveryCity");
    const stateInput = document.getElementById("deliveryState");
    const cepInput = document.getElementById("deliveryCEP");
    
    if (!locationBtn) return;
    
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      alert("❌ Seu navegador não suporta geolocalização.");
      return;
    }
    
    // Desabilitar botão e mostrar loading
    locationBtn.disabled = true;
    locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    locationBtn.classList.add("loading");
    
    try {
      // Obter coordenadas
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Converter coordenadas em endereço (geocodificação reversa)
      const addressData = await reverseGeocode(latitude, longitude);
      
      if (addressData) {
        // Preencher campos separados (SEM preencher número - usuário deve preencher manualmente)
        if (streetInput) streetInput.value = addressData.street || "";
        if (numberInput) numberInput.value = ""; // Sempre deixar vazio para usuário preencher
        if (complementInput) complementInput.value = addressData.complement || "";
        if (neighborhoodInput) neighborhoodInput.value = addressData.neighborhood || "";
        if (cityInput) cityInput.value = addressData.city || "";
        if (stateInput) stateInput.value = addressData.state || "";
        if (cepInput) cepInput.value = addressData.cep || "";
        
        // Atualizar campo oculto para WhatsApp (sem número ainda)
        if (addressInput) {
          addressInput.value = addressData.fullAddress;
          addressInput.dispatchEvent(new Event('input'));
        }
        
        // Focar no campo de número para o usuário preencher manualmente
        if (numberInput) {
          numberInput.focus();
        }
        
        // Feedback visual
        locationBtn.classList.add("success");
        setTimeout(() => {
          locationBtn.classList.remove("success");
        }, 2000);
      } else {
        // Se não conseguir o endereço, usar coordenadas
        if (addressInput) {
          addressInput.value = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
          addressInput.dispatchEvent(new Event('input'));
        }
        if (streetInput) streetInput.focus();
      }
      
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      
      let errorMsg = "❌ Erro ao obter localização.";
      
      if (error.code === 1) {
        errorMsg = "❌ Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.";
      } else if (error.code === 2) {
        errorMsg = "❌ Localização indisponível. Verifique se o GPS está ativado.";
      } else if (error.code === 3) {
        errorMsg = "❌ Tempo esgotado ao obter localização. Tente novamente.";
      }
      
      alert(errorMsg);
      
      // Feedback visual de erro
      locationBtn.classList.add("error");
      setTimeout(() => {
        locationBtn.classList.remove("error");
      }, 2000);
    } finally {
      // Reabilitar botão
      locationBtn.disabled = false;
      locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
      locationBtn.classList.remove("loading");
    }
  };
  
  // Função para converter coordenadas em endereço (geocodificação reversa)
  async function reverseGeocode(lat, lon) {
    try {
      // Usar OpenStreetMap Nominatim (gratuito, sem API key)
      // Aumentar zoom e adicionar parâmetros para melhor precisão
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'User-Agent': 'E-commerce Delivery App' // Nominatim requer User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erro na API de geocodificação');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Extrair dados separados
        const street = addr.road || addr.street || addr.pedestrian || "";
        // NÃO pegar número automaticamente - sempre deixar vazio para usuário preencher
        const complement = addr.house_name || addr.building || "";
        const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || "";
        const city = addr.city || addr.town || addr.village || addr.municipality || "";
        const state = addr.state || addr.region || "";
        const cep = addr.postcode || "";
        
        // Montar endereço completo para WhatsApp (sem número - usuário preencherá)
        const fullParts = [];
        if (street) fullParts.push(street);
        if (neighborhood) fullParts.push(neighborhood);
        if (city) fullParts.push(city);
        if (state) fullParts.push(state);
        if (cep) fullParts.push(`CEP: ${cep}`);
        
        return {
          street: street,
          number: "", // Sempre vazio - usuário deve preencher manualmente
          complement: complement,
          neighborhood: neighborhood,
          city: city,
          state: state,
          cep: cep,
          fullAddress: fullParts.join(', ') // Sem número, será adicionado depois
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      return null;
    }
  }
  

  // ==============================
  // MODAL DE DADOS DO CLIENTE
  // ==============================
  
  // Função para formatar CPF
  function formatCPF(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }

  // Função para formatar CNPJ
  function formatCNPJ(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }

  // Função para validar CPF (validação completa e robusta dos dígitos verificadores)
  // NOTA: Esta validação verifica a estrutura matemática do CPF (dígitos verificadores)
  // Para verificar se o CPF está ativo na Receita Federal, seria necessário uma API paga
  function validateCPF(cpf) {
    if (!cpf) return false;
    
    const numbers = cpf.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (numbers.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais (CPFs inválidos conhecidos)
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Verificar CPFs inválidos conhecidos (sequências que não são válidas)
    const invalidCPFs = [
      '00000000000', '11111111111', '22222222222', '33333333333',
      '44444444444', '55555555555', '66666666666', '77777777777',
      '88888888888', '99999999999', '12345678909' // CPF de teste conhecido
    ];
    if (invalidCPFs.includes(numbers)) return false;
    
    // Validar primeiro dígito verificador usando algoritmo oficial da Receita Federal
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit !== parseInt(numbers.charAt(9))) {
      return false; // Primeiro dígito verificador inválido
    }
    
    // Validar segundo dígito verificador usando algoritmo oficial da Receita Federal
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    digit = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit !== parseInt(numbers.charAt(10))) {
      return false; // Segundo dígito verificador inválido
    }
    
    // Se passou em todas as validações, o CPF tem estrutura matemática válida
    // (Isso não garante que está ativo na Receita Federal, mas garante que o formato está correto)
    return true;
  }

  // Função para validar CNPJ (validação completa e robusta dos dígitos verificadores)
  // NOTA: Esta validação verifica a estrutura matemática do CNPJ (dígitos verificadores)
  // Para verificar se o CNPJ está ativo na Receita Federal, seria necessário uma API paga
  function validateCNPJ(cnpj) {
    if (!cnpj) return false;
    
    const numbers = cnpj.replace(/\D/g, '');
    
    // Verificar se tem 14 dígitos
    if (numbers.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais (CNPJs inválidos conhecidos)
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    
    // Verificar CNPJs inválidos conhecidos (sequências que não são válidas)
    const invalidCNPJs = [
      '00000000000000', '11111111111111', '22222222222222', '33333333333333',
      '44444444444444', '55555555555555', '66666666666666', '77777777777777',
      '88888888888888', '99999999999999'
    ];
    if (invalidCNPJs.includes(numbers)) return false;
    
    // Validar primeiro dígito verificador usando algoritmo oficial da Receita Federal
    let length = 12;
    let digits = numbers.substring(0, length);
    const checkDigits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(digits.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11;
    result = result < 2 ? 0 : 11 - result;
    
    if (result !== parseInt(checkDigits.charAt(0))) {
      return false; // Primeiro dígito verificador inválido
    }
    
    // Validar segundo dígito verificador usando algoritmo oficial da Receita Federal
    length = 13;
    digits = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(digits.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11;
    result = result < 2 ? 0 : 11 - result;
    
    if (result !== parseInt(checkDigits.charAt(1))) {
      return false; // Segundo dígito verificador inválido
    }
    
    // Se passou em todas as validações, o CNPJ tem estrutura matemática válida
    // (Isso não garante que está ativo na Receita Federal, mas garante que o formato está correto)
    return true;
  }
  
  // Função para validar email
  function validateEmail(email) {
    if (!email) return { valid: false, message: 'E-mail é obrigatório' };
    
    const trimmed = email.trim().toLowerCase();
    
    // Verificar se tem formato básico de email
    if (trimmed.length < 5) {
      return { valid: false, message: 'E-mail muito curto' };
    }
    
    // Regex para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Formato de e-mail inválido' };
    }
    
    // Verificar se não tem espaços
    if (/\s/.test(trimmed)) {
      return { valid: false, message: 'E-mail não pode conter espaços' };
    }
    
    // Verificar se tem pelo menos um ponto após o @
    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      return { valid: false, message: 'E-mail inválido' };
    }
    
    const domain = parts[1];
    if (!domain.includes('.')) {
      return { valid: false, message: 'Domínio do e-mail inválido' };
    }
    
    // Verificar se o domínio tem pelo menos 2 caracteres após o ponto
    const domainParts = domain.split('.');
    if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
      return { valid: false, message: 'Domínio do e-mail inválido' };
    }
    
    // Verificar caracteres inválidos
    if (/[<>()[\]\\.,;:\s@"]/.test(trimmed)) {
      return { valid: false, message: 'E-mail contém caracteres inválidos' };
    }
    
    return { valid: true, message: '' };
  }
  
  // Função para validar nome completo
  function validateName(name) {
    if (!name) return { valid: false, message: 'Nome é obrigatório' };
    
    const trimmed = name.trim();
    
    // Verificar se tem pelo menos 3 caracteres
    if (trimmed.length < 3) {
      return { valid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
    }
    
    // Verificar se tem pelo menos 2 palavras (nome e sobrenome)
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) {
      return { valid: false, message: 'Digite nome completo (nome e sobrenome)' };
    }
    
    // Verificar se cada palavra tem pelo menos 2 caracteres
    for (const word of words) {
      if (word.length < 2) {
        return { valid: false, message: 'Cada nome deve ter pelo menos 2 caracteres' };
      }
    }
    
    // Verificar se contém apenas letras, espaços e caracteres acentuados
    const nameRegex = /^[a-zA-ZÀ-ÿ\s']+$/;
    if (!nameRegex.test(trimmed)) {
      return { valid: false, message: 'Nome deve conter apenas letras' };
    }
    
    // Verificar se não tem números
    if (/\d/.test(trimmed)) {
      return { valid: false, message: 'Nome não deve conter números' };
    }
    
    // Verificar se não tem caracteres especiais inválidos
    if (/[^a-zA-ZÀ-ÿ\s']/.test(trimmed)) {
      return { valid: false, message: 'Nome contém caracteres inválidos' };
    }
    
    return { valid: true, message: '' };
  }

  // Abrir modal de dados do cliente
  function openCustomerDataModal() {
    const modal = document.getElementById('customerDataModal');
    if (!modal) {
      console.error('❌ Modal customerDataModal não encontrado no DOM');
      alert('Erro: Modal não encontrado. Recarregue a página.');
      return;
    }
    
    console.log('✅ Abrindo modal de dados do cliente');
    
    // Garantir que os event listeners estão configurados
    if (typeof setupCustomerDataModal === 'function') {
      setupCustomerDataModal();
    }
    
    modal.classList.remove('hidden');

    // Preencher resumo de valores do pedido
    const orderSummary = document.getElementById('orderSummary');
    if (orderSummary && cart.length > 0) {
      let totalCash = 0;
      let totalInstallment = 0;
      const itemsCount = cart.reduce((sum, item) => sum + ((item && item.quantity) ? item.quantity : 1), 0);
      cart.forEach(item => {
        const qty = item.quantity || 1;
        totalCash += getCashPrice(item) * qty;
        totalInstallment += getNonCashPrice(item) * qty;
      });
      const showBoth = totalInstallment !== totalCash;
      orderSummary.innerHTML = `
        <div class="order-summary-row">
          <span><i class="fa-solid fa-box"></i> ${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}</span>
        </div>
        <div class="order-summary-row order-summary-highlight">
          <span>Total à vista</span>
          <strong>${formatPrice(totalCash)}</strong>
        </div>
        ${showBoth ? `<div class="order-summary-row">
          <span>Total parcelado</span>
          <strong>${formatPrice(totalInstallment)}</strong>
        </div>` : ''}
      `;
    }
    
    // Limpar campos
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('customerEmail');
    const typeSelect = document.getElementById('customerType');
    const cpfInput = document.getElementById('customerCPF');
    const cnpjInput = document.getElementById('customerCNPJ');
    const deliveryType = document.getElementById('modalDeliveryType');
    const paymentMethod = document.getElementById('modalPaymentMethod');
    const installments = document.getElementById('modalInstallments');
    const errorMsg = document.getElementById('customerDataError');
    
    // Atualizar opções de parcelas baseado nos produtos do carrinho
    if (typeof window.updateInstallmentsOptions === 'function') {
      window.updateInstallmentsOptions();
    }
    
    // Limpar valores e erros de todos os campos
    const allFields = [
      nameInput, emailInput, typeSelect, cpfInput, cnpjInput, deliveryType, paymentMethod, installments,
      document.getElementById('modalDeliveryStreet'),
      document.getElementById('modalDeliveryNumber'),
      document.getElementById('modalDeliveryComplement'),
      document.getElementById('modalDeliveryNeighborhood'),
      document.getElementById('modalDeliveryCity'),
      document.getElementById('modalDeliveryState'),
      document.getElementById('modalDeliveryCEP')
    ];
    
    allFields.forEach(field => {
      if (field) {
        field.value = '';
        clearFieldValidation(field);
      }
    });
    
    // Limpar checkbox de consentimento LGPD
    const lgpdConsent = document.getElementById('lgpdConsent');
    if (lgpdConsent) {
      lgpdConsent.checked = false;
      if (lgpdConsent.parentElement) {
        lgpdConsent.parentElement.style.color = '';
      }
    }
    
    if (errorMsg) errorMsg.textContent = '';
    
    // Ocultar campos CPF/CNPJ e endereço inicialmente
    const cpfGroup = document.getElementById('cpfGroup');
    const cnpjGroup = document.getElementById('cnpjGroup');
    const addressSection = document.getElementById('modalAddressSection');
    const installmentsContainer = document.getElementById('modalInstallmentsContainer');
    
    // Verificar se já há um tipo selecionado e mostrar o campo correspondente
    if (typeSelect && typeSelect.value) {
      if (typeSelect.value === 'fisica') {
        if (cpfGroup) cpfGroup.style.display = 'block';
        if (cnpjGroup) cnpjGroup.style.display = 'none';
      } else if (typeSelect.value === 'juridica') {
        if (cpfGroup) cpfGroup.style.display = 'none';
        if (cnpjGroup) cnpjGroup.style.display = 'block';
      } else {
        if (cpfGroup) cpfGroup.style.display = 'none';
        if (cnpjGroup) cnpjGroup.style.display = 'none';
      }
    } else {
      // Se não há valor selecionado, ocultar ambos
      if (cpfGroup) cpfGroup.style.display = 'none';
      if (cnpjGroup) cnpjGroup.style.display = 'none';
    }
    
    if (addressSection) addressSection.style.display = 'none';
    if (installmentsContainer) installmentsContainer.style.display = 'none';
    
    // Focar no primeiro campo após um pequeno delay para garantir que o modal está visível
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 100);
  }

  // Fechar modal de dados do cliente
  function closeCustomerDataModal() {
    const modal = document.getElementById('customerDataModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Configurar eventos do modal
  function setupCustomerDataModal() {
    const customerType = document.getElementById('customerType');
    const cpfGroup = document.getElementById('cpfGroup');
    const cnpjGroup = document.getElementById('cnpjGroup');
    const cpfInput = document.getElementById('customerCPF');
    const cnpjInput = document.getElementById('customerCNPJ');
    const deliveryType = document.getElementById('modalDeliveryType');
    const addressSection = document.getElementById('modalAddressSection');
    const paymentMethod = document.getElementById('modalPaymentMethod');
    const installmentsContainer = document.getElementById('modalInstallmentsContainer');
    const installments = document.getElementById('modalInstallments');
    
    // Mostrar/ocultar campos baseado no tipo de pessoa
    if (customerType) {
      // Remover listener anterior se existir para evitar duplicação
      const existingHandler = customerType._changeHandler;
      if (existingHandler) {
        customerType.removeEventListener('change', existingHandler);
      }
      
      // Criar novo handler
      const changeHandler = (e) => {
        const value = e.target.value;
        console.log('🔄 Tipo de pessoa alterado:', value);
        if (value === 'fisica') {
          if (cpfGroup) {
            cpfGroup.style.display = 'block';
            console.log('✅ Campo CPF exibido');
          }
          if (cnpjGroup) cnpjGroup.style.display = 'none';
          if (cnpjInput) cnpjInput.value = '';
          if (cpfInput) {
            setTimeout(() => cpfInput.focus(), 100);
          }
        } else if (value === 'juridica') {
          if (cpfGroup) cpfGroup.style.display = 'none';
          if (cnpjGroup) {
            cnpjGroup.style.display = 'block';
            console.log('✅ Campo CNPJ exibido');
          }
          if (cpfInput) cpfInput.value = '';
          if (cnpjInput) {
            setTimeout(() => cnpjInput.focus(), 100);
          }
        } else {
          if (cpfGroup) cpfGroup.style.display = 'none';
          if (cnpjGroup) cnpjGroup.style.display = 'none';
        }
      };
      
      // Salvar referência do handler
      customerType._changeHandler = changeHandler;
      
      // Adicionar listener
      customerType.addEventListener('change', changeHandler);
      console.log('✅ Event listener do tipo de pessoa configurado');
    }
    
    // Função para atualizar opções de pagamento baseado no tipo de entrega
    const updatePaymentOptions = () => {
      if (!deliveryType || !paymentMethod) return;
      
      const deliveryValue = deliveryType.value;
      const dinheiroOption = paymentMethod.querySelector('option[value="dinheiro"]');
      
      if (deliveryValue === 'pickup') {
        // Retirada em loja: habilitar pagamento em dinheiro
        if (dinheiroOption) {
          dinheiroOption.disabled = false;
          dinheiroOption.style.display = '';
        }
        console.log('✅ Retirada em loja: pagamento em dinheiro habilitado');
      } else if (deliveryValue === 'delivery') {
        // Entrega: desabilitar pagamento em dinheiro
        if (dinheiroOption) {
          dinheiroOption.disabled = true;
          dinheiroOption.style.display = 'none';
          
          // Se dinheiro estiver selecionado, limpar seleção
          if (paymentMethod.value === 'dinheiro') {
            paymentMethod.value = '';
          }
        }
        console.log('✅ Entrega: pagamento em dinheiro desabilitado');
      }
    };

    // Mostrar/ocultar campos de endereço baseado no tipo de entrega
    if (deliveryType) {
      deliveryType.addEventListener('change', (e) => {
        const value = e.target.value;
        
        // Atualizar opções de pagamento
        updatePaymentOptions();
        
        if (value === 'delivery') {
          if (addressSection) addressSection.style.display = 'block';
        } else {
          if (addressSection) addressSection.style.display = 'none';
          
          // Limpar campos de endereço
          const addressFields = [
            document.getElementById('modalDeliveryStreet'),
            document.getElementById('modalDeliveryNumber'),
            document.getElementById('modalDeliveryComplement'),
            document.getElementById('modalDeliveryNeighborhood'),
            document.getElementById('modalDeliveryCity'),
            document.getElementById('modalDeliveryState'),
            document.getElementById('modalDeliveryCEP')
          ];
          addressFields.forEach(field => {
            if (field) {
              field.value = '';
              field.classList.remove('error');
            }
          });
          
        }
      });
      
      // Aplicar lógica inicial quando o modal abrir
      updatePaymentOptions();
    }
    
    // Função para atualizar opções de parcelas baseado nos produtos do carrinho
    window.updateInstallmentsOptions = () => {
      // Buscar o elemento novamente para garantir que existe
      const installmentsSelect = document.getElementById('modalInstallments');
      
      if (!installmentsSelect) {
        console.error('❌ Elemento modalInstallments não encontrado no DOM!');
        return;
      }
      
      if (!cart || cart.length === 0) {
        console.log('⚠️ updateInstallmentsOptions: cart vazio');
        return;
      }
      
      console.log('✅ Elemento installments encontrado:', installmentsSelect);
      
      console.log('📊 Atualizando opções de parcelas. Produtos no carrinho:', cart.length);
      
      // Calcular total PARCELADO do carrinho (sem desconto à vista)
      let cartTotal = 0;
      cart.forEach(item => {
        const quantity = item.quantity || 1;
        const itemNonCash = getNonCashPrice(item);
        const itemTotal = itemNonCash * quantity;
        cartTotal += itemTotal;
        console.log(`  - ${item.name}: ${quantity}x R$ ${itemNonCash} = R$ ${itemTotal} (max_installments: ${item.max_installments || 'não definido'})`);
      });
      
      console.log('💰 Total parcelado do carrinho: R$', cartTotal);
      
      // Valor mínimo da parcela: R$ 250,00
      const MIN_INSTALLMENT_VALUE = 250;
      const MAX_INSTALLMENTS = 12; // Máximo absoluto de parcelas
      
      // REGRA ÚNICA E SIMPLES:
      // Sempre usar APENAS o VALOR TOTAL do carrinho para calcular as parcelas,
      // independente de ser 1 produto com quantidade maior ou vários produtos.
      // Aqui NÃO usamos max_installments do produto.
      let maxAvailable = 1; // padrão: 1x
      
      if (cartTotal < MIN_INSTALLMENT_VALUE) {
        maxAvailable = 1;
        console.log(`✅ Valor total (${cartTotal}) menor que R$ ${MIN_INSTALLMENT_VALUE},00 - apenas à vista (1x)`);
      } else {
        const maxByMinValue = Math.floor(cartTotal / MIN_INSTALLMENT_VALUE);
        maxAvailable = Math.min(maxByMinValue, MAX_INSTALLMENTS);
        if (maxAvailable < 1) maxAvailable = 1;
        console.log(`✅ Calculando pelo valor total do carrinho (${cartTotal} ÷ ${MIN_INSTALLMENT_VALUE}) = ${maxAvailable}x`);
      }
      
      console.log(`📋 Máximo de parcelas disponíveis: ${maxAvailable}x`);
      
      console.log('🔍 Opções antes de limpar:', installmentsSelect.options.length);
      
      // Limpar opções existentes
      installmentsSelect.innerHTML = '';
      console.log('🧹 Opções anteriores limpas');
      
      // Adicionar opções de 1 até o máximo disponível
      let optionsAdded = 0;
      for (let i = 1; i <= maxAvailable; i++) {
        const option = document.createElement('option');
        option.value = i;
        const installmentValue = cartTotal / i;
        
        if (i === 1) {
          option.textContent = `${i}x (à vista)`;
        } else {
          // Se tiver mais de 1 produto, mostrar valor da parcela se for >= R$ 250,00
          if (cart.length > 1 && installmentValue >= MIN_INSTALLMENT_VALUE) {
            // Formatar valor manualmente para evitar problemas de escopo
            const formattedValue = installmentValue.toFixed(2).replace('.', ',');
            const parts = formattedValue.split(',');
            const integer = parts[0];
            const decimal = parts[1] || '00';
            const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            option.textContent = `${i}x de R$ ${formattedInteger},${decimal}`;
          } else {
            option.textContent = `${i}x`;
          }
        }
        installmentsSelect.appendChild(option);
        optionsAdded++;
        console.log(`  ✓ Opção ${i} adicionada: "${option.textContent}" (value: ${option.value})`);
      }
      
      // Selecionar 1x por padrão
      installmentsSelect.value = '1';
      console.log(`✅ ${optionsAdded} opções adicionadas! Total no select: ${installmentsSelect.options.length}`);
      console.log(`📝 Valor selecionado: ${installmentsSelect.value}`);
    };
    
    // Mostrar/ocultar campo de parcelas baseado na forma de pagamento
    if (paymentMethod) {
      paymentMethod.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'credito') {
          // Atualizar opções de parcelas antes de mostrar
          if (typeof window.updateInstallmentsOptions === 'function') {
            window.updateInstallmentsOptions();
          }
          if (installmentsContainer) installmentsContainer.style.display = 'block';
        } else {
          if (installmentsContainer) installmentsContainer.style.display = 'none';
          if (installments) installments.value = '1';
        }
      });
    }
    
    // Atualizar opções quando o modal abrir
    const customerModal = document.getElementById('customerDataModal');
    if (customerModal) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isVisible = !customerModal.classList.contains('hidden');
            if (isVisible) {
              // Atualizar opções sempre que o modal abrir
              if (typeof window.updateInstallmentsOptions === 'function') {
                window.updateInstallmentsOptions();
              }
              // Atualizar opções de pagamento baseado no tipo de entrega
              updatePaymentOptions();
            }
          }
        });
      });
      observer.observe(customerModal, { attributes: true });
    }
    
    // Expor função globalmente para ser chamada quando o modal abrir
    window.updateInstallmentsOptions = updateInstallmentsOptions;
    
    // Formatar e validar CPF enquanto digita
    if (cpfInput) {
      cpfInput.addEventListener('input', (e) => {
        const formatted = formatCPF(e.target.value);
        e.target.value = formatted;
        
        // Validar em tempo real quando tiver 11 dígitos
        const numbers = formatted.replace(/\D/g, '');
        if (numbers.length === 11) {
          const isValid = validateCPF(formatted);
          updateFieldValidation(cpfInput, isValid, 'CPF válido');
        } else {
          clearFieldValidation(cpfInput);
        }
      });
      
      // Validar ao perder foco
      cpfInput.addEventListener('blur', (e) => {
        const numbers = e.target.value.replace(/\D/g, '');
        if (numbers.length === 11) {
          const isValid = validateCPF(e.target.value);
          updateFieldValidation(cpfInput, isValid, 'CPF válido');
        }
      });
    }
    
    // Formatar e validar CNPJ enquanto digita
    if (cnpjInput) {
      cnpjInput.addEventListener('input', (e) => {
        const formatted = formatCNPJ(e.target.value);
        e.target.value = formatted;
        
        // Validar em tempo real quando tiver 14 dígitos
        const numbers = formatted.replace(/\D/g, '');
        if (numbers.length === 14) {
          const isValid = validateCNPJ(formatted);
          updateFieldValidation(cnpjInput, isValid, 'CNPJ válido');
        } else {
          clearFieldValidation(cnpjInput);
        }
      });
      
      // Validar ao perder foco
      cnpjInput.addEventListener('blur', (e) => {
        const numbers = e.target.value.replace(/\D/g, '');
        if (numbers.length === 14) {
          const isValid = validateCNPJ(e.target.value);
          updateFieldValidation(cnpjInput, isValid, 'CNPJ válido');
        }
      });
    }
    
    // Validar nome enquanto digita
    const nameInput = document.getElementById('customerName');
    if (nameInput) {
      nameInput.addEventListener('blur', (e) => {
        const nameValidation = validateName(e.target.value);
        if (e.target.value.trim().length > 0) {
          updateFieldValidation(nameInput, nameValidation.valid, nameValidation.valid ? 'Nome válido' : nameValidation.message);
        } else {
          clearFieldValidation(nameInput);
        }
      });
    }
    
    // Email não precisa de validação rigorosa - apenas campo obrigatório
    
    // Atualizar campo oculto de endereço quando campos separados mudarem
    const addressFields = [
      document.getElementById('modalDeliveryStreet'),
      document.getElementById('modalDeliveryNumber'),
      document.getElementById('modalDeliveryComplement'),
      document.getElementById('modalDeliveryNeighborhood'),
      document.getElementById('modalDeliveryCity'),
      document.getElementById('modalDeliveryState'),
      document.getElementById('modalDeliveryCEP')
    ];
    
    const updateAddressField = () => {
      const addressInput = document.getElementById('modalDeliveryAddress');
      if (!addressInput) return;
      
      const parts = [];
      const street = document.getElementById('modalDeliveryStreet');
      const number = document.getElementById('modalDeliveryNumber');
      const complement = document.getElementById('modalDeliveryComplement');
      const neighborhood = document.getElementById('modalDeliveryNeighborhood');
      const city = document.getElementById('modalDeliveryCity');
      const state = document.getElementById('modalDeliveryState');
      const cep = document.getElementById('modalDeliveryCEP');
      
      if (street && street.value) {
        let streetValue = street.value.trim();
        if (number && number.value) {
          streetValue += `, ${number.value.trim()}`;
        }
        if (complement && complement.value) {
          streetValue += ` - ${complement.value.trim()}`;
        }
        parts.push(streetValue);
      }
      if (neighborhood && neighborhood.value) {
        parts.push(neighborhood.value.trim());
      }
      if (city && city.value) {
        parts.push(city.value.trim());
      }
      if (state && state.value) {
        parts.push(state.value.trim());
      }
      if (cep && cep.value) {
        parts.push(`CEP: ${cep.value.trim()}`);
      }
      
      addressInput.value = parts.join(', ');
    };
    
    addressFields.forEach(field => {
      if (field) {
        field.addEventListener('input', updateAddressField);
        field.addEventListener('blur', updateAddressField);
      }
    });
    
    // Formatar CEP automaticamente e calcular frete
    const cepInput = document.getElementById('modalDeliveryCEP');
    if (cepInput) {
      cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
          if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5);
          }
          e.target.value = value;
        }
        
      });
    }
    
    // Fechar modal ao clicar fora
    if (customerModal) {
      customerModal.addEventListener('click', (e) => {
        if (e.target === customerModal) {
          closeCustomerDataModal();
        }
      });
    }
  }
  
  // Função para obter localização no modal
  window.getCurrentLocationModal = async function() {
    const locationBtn = document.getElementById("modalGetLocationBtn");
    const streetInput = document.getElementById("modalDeliveryStreet");
    const numberInput = document.getElementById("modalDeliveryNumber");
    const complementInput = document.getElementById("modalDeliveryComplement");
    const neighborhoodInput = document.getElementById("modalDeliveryNeighborhood");
    const cityInput = document.getElementById("modalDeliveryCity");
    const stateInput = document.getElementById("modalDeliveryState");
    const cepInput = document.getElementById("modalDeliveryCEP");
    const addressInput = document.getElementById("modalDeliveryAddress");
    
    if (!locationBtn) return;
    
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      alert("❌ Seu navegador não suporta geolocalização.");
      return;
    }

    // Desabilitar botão e mostrar loading
    locationBtn.disabled = true;
    locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    locationBtn.classList.add("loading");
    
    try {
      // Obter coordenadas
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Converter coordenadas em endereço (geocodificação reversa)
      const addressData = await reverseGeocode(latitude, longitude);
      
      if (addressData) {
        // Preencher campos separados (SEM preencher número - usuário deve preencher manualmente)
        if (streetInput) streetInput.value = addressData.street || "";
        if (numberInput) numberInput.value = ""; // Sempre deixar vazio para usuário preencher
        if (complementInput) complementInput.value = addressData.complement || "";
        if (neighborhoodInput) neighborhoodInput.value = addressData.neighborhood || "";
        if (cityInput) cityInput.value = addressData.city || "";
        if (stateInput) stateInput.value = addressData.state || "";
        if (cepInput) cepInput.value = addressData.cep || "";
        
        // Atualizar campo oculto para WhatsApp (sem número ainda)
        if (addressInput) {
          addressInput.value = addressData.fullAddress;
        }
        
        // Focar no campo de número para o usuário preencher manualmente
        if (numberInput) {
          numberInput.focus();
        }
        
        // Feedback visual
        locationBtn.classList.add("success");
        setTimeout(() => {
          locationBtn.classList.remove("success");
        }, 2000);
      } else {
        // Se não conseguir o endereço, usar coordenadas
        if (streetInput) streetInput.focus();
      }
      
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      
      let errorMsg = "❌ Erro ao obter localização.";
      
      if (error.code === 1) {
        errorMsg = "❌ Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.";
      } else if (error.code === 2) {
        errorMsg = "❌ Localização indisponível. Verifique se o GPS está ativado.";
      } else if (error.code === 3) {
        errorMsg = "❌ Tempo esgotado ao obter localização. Tente novamente.";
      }
      
      alert(errorMsg);
      
      // Feedback visual de erro
      locationBtn.classList.add("error");
      setTimeout(() => {
        locationBtn.classList.remove("error");
      }, 2000);
    } finally {
      // Reabilitar botão
      locationBtn.disabled = false;
      locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
      locationBtn.classList.remove("loading");
    }
  };

  // Função auxiliar para limpar erros de um campo
  function clearFieldError(field) {
    if (field) {
      field.classList.remove('error');
      clearFieldValidation(field);
    }
  }
  
  // Função para atualizar validação visual do campo
  function updateFieldValidation(field, isValid, message) {
    if (!field) return;
    
    // Remover estados anteriores
    field.classList.remove('error', 'valid');
    
    // Remover ícone anterior se existir
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      const existingIcon = formGroup.querySelector('.field-validation-icon');
      if (existingIcon) {
        existingIcon.remove();
      }
    }
    
    if (isValid) {
      // Campo válido - adicionar classe e ícone de sucesso
      field.classList.add('valid');
      
      // Criar ícone de check verde
      const icon = document.createElement('i');
      icon.className = 'field-validation-icon fa-solid fa-circle-check';
      icon.title = message || 'Válido';
      
      // Adicionar padding direito para o ícone
      const currentPadding = window.getComputedStyle(field).paddingRight;
      field.style.paddingRight = '40px';
      
      // Adicionar ícone ao form-group (pai do campo)
      if (formGroup) {
        formGroup.style.position = 'relative';
        formGroup.appendChild(icon);
      }
    } else {
      // Campo inválido - adicionar classe de erro
      field.classList.add('error');
      field.style.paddingRight = '';
    }
  }
  
  // Função para limpar validação visual
  function clearFieldValidation(field) {
    if (!field) return;
    
    field.classList.remove('error', 'valid');
    field.style.paddingRight = '';
    
    const existingIcon = field.parentElement.querySelector('.field-validation-icon');
    if (existingIcon) {
      existingIcon.remove();
    }
  }

  // Submeter dados do cliente e finalizar pedido
  function submitCustomerData() {
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('customerEmail');
    const typeSelect = document.getElementById('customerType');
    const cpfInput = document.getElementById('customerCPF');
    const cnpjInput = document.getElementById('customerCNPJ');
    const lgpdConsent = document.getElementById('lgpdConsent');
    const errorMsg = document.getElementById('customerDataError');
    
    // Limpar erros anteriores
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.style.color = '';
      errorMsg.style.fontWeight = '';
    }
    [nameInput, emailInput, typeSelect, cpfInput, cnpjInput, lgpdConsent].forEach(clearFieldError);
    
    // Validar consentimento LGPD no checkbox do formulário
    if (!lgpdConsent || !lgpdConsent.checked) {
      if (errorMsg) errorMsg.textContent = '⚠️ É necessário concordar com a Política de Privacidade para continuar.';
      if (lgpdConsent) {
        lgpdConsent.focus();
        lgpdConsent.parentElement.style.color = '#dc2626';
        lgpdConsent.addEventListener('change', function clearError() {
          if (lgpdConsent.checked) {
            lgpdConsent.parentElement.style.color = '';
          }
          lgpdConsent.removeEventListener('change', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Validar nome completo
    if (!nameInput || !nameInput.value || nameInput.value.trim() === '') {
      if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha o nome completo.';
      if (nameInput) {
        nameInput.focus();
        nameInput.classList.add('error');
        nameInput.addEventListener('input', function clearError() {
          clearFieldError(nameInput);
          nameInput.removeEventListener('input', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Validar formato do nome
    const nameValidation = validateName(nameInput.value.trim());
    if (!nameValidation.valid) {
      if (errorMsg) errorMsg.textContent = `⚠️ ${nameValidation.message}`;
      if (nameInput) {
        nameInput.focus();
        nameInput.classList.add('error');
        updateFieldValidation(nameInput, false, nameValidation.message);
        nameInput.addEventListener('input', function clearError() {
          clearFieldError(nameInput);
          nameInput.removeEventListener('input', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Nome válido - mostrar feedback positivo
    updateFieldValidation(nameInput, true, 'Nome válido');
    
    // Validar email - apenas verificar se está preenchido
    if (!emailInput || !emailInput.value || emailInput.value.trim() === '') {
      if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha o e-mail.';
      if (emailInput) {
        emailInput.focus();
        emailInput.classList.add('error');
        emailInput.addEventListener('input', function clearError() {
          clearFieldError(emailInput);
          emailInput.removeEventListener('input', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Validar tipo de pessoa
    if (!typeSelect || !typeSelect.value) {
      if (errorMsg) errorMsg.textContent = '⚠️ Por favor, selecione o tipo de pessoa.';
      if (typeSelect) {
        typeSelect.focus();
        typeSelect.classList.add('error');
        typeSelect.addEventListener('change', function clearError() {
          clearFieldError(typeSelect);
          typeSelect.removeEventListener('change', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Validar CPF ou CNPJ
    let documentValue = '';
    let documentType = '';
    
    if (typeSelect.value === 'fisica') {
      if (!cpfInput || !cpfInput.value || cpfInput.value.trim() === '') {
        if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha o CPF.';
        if (cpfInput) {
          cpfInput.focus();
          cpfInput.classList.add('error');
          cpfInput.addEventListener('input', function clearError() {
            clearFieldError(cpfInput);
            cpfInput.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
      
      if (!validateCPF(cpfInput.value)) {
        if (errorMsg) errorMsg.textContent = '⚠️ CPF inválido. Verifique se todos os dígitos estão corretos. A validação verifica a estrutura matemática do documento.';
        if (cpfInput) {
          cpfInput.focus();
          updateFieldValidation(cpfInput, false, 'CPF inválido');
          cpfInput.addEventListener('input', function clearError() {
            clearFieldError(cpfInput);
            cpfInput.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
      
      // CPF válido - mostrar feedback positivo
      updateFieldValidation(cpfInput, true, 'CPF com estrutura válida');
      
      documentValue = cpfInput.value;
      documentType = 'CPF';
    } else if (typeSelect.value === 'juridica') {
      if (!cnpjInput || !cnpjInput.value || cnpjInput.value.trim() === '') {
        if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha o CNPJ.';
        if (cnpjInput) {
          cnpjInput.focus();
          cnpjInput.classList.add('error');
          cnpjInput.addEventListener('input', function clearError() {
            clearFieldError(cnpjInput);
            cnpjInput.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
      
      if (!validateCNPJ(cnpjInput.value)) {
        if (errorMsg) errorMsg.textContent = '⚠️ CNPJ inválido. Verifique se todos os dígitos estão corretos. A validação verifica a estrutura matemática do documento.';
        if (cnpjInput) {
          cnpjInput.focus();
          updateFieldValidation(cnpjInput, false, 'CNPJ inválido');
          cnpjInput.addEventListener('input', function clearError() {
            clearFieldError(cnpjInput);
            cnpjInput.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
      
      // CNPJ válido - mostrar feedback positivo
      updateFieldValidation(cnpjInput, true, 'CNPJ com estrutura válida');
      
      documentValue = cnpjInput.value;
      documentType = 'CNPJ';
    }
    
    // Validar tipo de entrega
    const deliveryType = document.getElementById('modalDeliveryType');
    if (!deliveryType || !deliveryType.value) {
      if (errorMsg) errorMsg.textContent = '⚠️ Por favor, selecione o tipo de entrega.';
      if (deliveryType) {
        deliveryType.focus();
        deliveryType.classList.add('error');
        deliveryType.addEventListener('change', function clearError() {
          clearFieldError(deliveryType);
          deliveryType.removeEventListener('change', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Obter elemento de forma de pagamento antes de usar
    const paymentMethod = document.getElementById('modalPaymentMethod');
    
    // Validar que pagamento em dinheiro só é permitido para retirada em loja
    if (deliveryType && deliveryType.value === 'delivery' && paymentMethod && paymentMethod.value === 'dinheiro') {
      if (errorMsg) errorMsg.textContent = '⚠️ Pagamento em dinheiro só é permitido para retirada em loja.';
      if (paymentMethod) {
        paymentMethod.focus();
        paymentMethod.classList.add('error');
        paymentMethod.addEventListener('change', function clearError() {
          clearFieldError(paymentMethod);
          paymentMethod.removeEventListener('change', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Validar endereço se for entrega
    if (deliveryType.value === 'delivery') {
      const deliveryStreet = document.getElementById('modalDeliveryStreet');
      const deliveryNumber = document.getElementById('modalDeliveryNumber');
      
      if (!deliveryStreet || !deliveryStreet.value || deliveryStreet.value.trim() === '') {
        if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha a rua/avenida.';
        if (deliveryStreet) {
          deliveryStreet.focus();
          deliveryStreet.classList.add('error');
          deliveryStreet.addEventListener('input', function clearError() {
            clearFieldError(deliveryStreet);
            deliveryStreet.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
      
      if (!deliveryNumber || !deliveryNumber.value || deliveryNumber.value.trim() === '') {
        if (errorMsg) errorMsg.textContent = '⚠️ Por favor, preencha o número da casa.';
        if (deliveryNumber) {
          deliveryNumber.focus();
          deliveryNumber.classList.add('error');
          deliveryNumber.addEventListener('input', function clearError() {
            clearFieldError(deliveryNumber);
            deliveryNumber.removeEventListener('input', clearError);
          }, { once: true });
        }
        return;
      }
    }
    
    // Validar forma de pagamento (paymentMethod já foi declarado acima)
    if (!paymentMethod || !paymentMethod.value) {
      if (errorMsg) errorMsg.textContent = '⚠️ Por favor, selecione a forma de pagamento.';
      if (paymentMethod) {
        paymentMethod.focus();
        paymentMethod.classList.add('error');
        paymentMethod.addEventListener('change', function clearError() {
          clearFieldError(paymentMethod);
          paymentMethod.removeEventListener('change', clearError);
        }, { once: true });
      }
      return;
    }
    
    // Se chegou aqui, dados estão válidos - finalizar pedido com dados do cliente
    const customerName = nameInput.value.trim();
    const customerEmail = emailInput ? emailInput.value.trim() : '';
    const customerType = typeSelect.value === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica';
    
    // Fechar modal
    closeCustomerDataModal();
    
    // Finalizar pedido com dados do cliente
    finalizeOrderWithCustomerData(customerName, customerEmail, customerType, documentType, documentValue);
  }

  // Finalizar pedido incluindo dados do cliente na mensagem do WhatsApp
  async function finalizeOrderWithCustomerData(customerName, customerEmail, customerType, documentType, documentValue) {
    const finalizeBtn = document.getElementById("finalizeOrder");
    if (!finalizeBtn || cart.length === 0) return;

    // Montar mensagem completa (cliente não vê no site, só quando WhatsApp abrir)
    let message = "Olá! Gostaria de finalizar minha compra:%0A%0A";
    
    // Adicionar dados do cliente
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `*📋 DADOS DO CLIENTE*%0A`;
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `👤 *Nome:* ${encodeURIComponent(customerName)}%0A`;
    message += `📧 *E-mail:* ${encodeURIComponent(customerEmail)}%0A`;
    message += `🏢 *Tipo:* ${encodeURIComponent(customerType)}%0A`;
    message += `📄 *${documentType}:* ${encodeURIComponent(documentValue)}%0A`;
    message += `%0A`;
    
    // Adicionar produtos
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `*🛒 ITENS DO PEDIDO*%0A`;
    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    let totalCash = 0;
    let totalNonCash = 0;

    cart.forEach((item, index) => {
      const quantity = item.quantity || 1;
      const itemCashPrice = getCashPrice(item);
      const itemNonCashPrice = getNonCashPrice(item);
      const itemTotalCash = itemCashPrice * quantity;
      const itemTotalNonCash = itemNonCashPrice * quantity;
      totalCash += itemTotalCash;
      totalNonCash += itemTotalNonCash;
      
      // Incluir código do produto se existir
      const productCode = item.product_code || item.code || '';
      
      message += `%0A*Produto ${index + 1}:*%0A`;
      message += `📦 *Nome:* ${encodeURIComponent(item.name)}%0A`;
      
      if (productCode) {
        message += `🔢 *Código:* ${productCode}%0A`;
      }
      
      // Mostrar informações de preço e parcelas
      const priceCash = item.price_cash || item.price || 0;
      const priceInstallment = item.price_installment || 0;
      const maxInstallments = item.max_installments || null;
      
      if (priceInstallment && priceInstallment > 0 && maxInstallments && maxInstallments > 0) {
        const installmentValue = priceInstallment / maxInstallments;
        message += `💰 *Preço:* ${formatPrice(itemCashPrice)} à vista ou ${formatPrice(priceInstallment)} em até ${maxInstallments}x de ${formatPrice(installmentValue)}%0A`;
      } else {
        message += `💰 *Preço:* ${formatPrice(itemCashPrice)} à vista`;
        if (itemNonCashPrice !== itemCashPrice) message += ` | parcelado: ${formatPrice(itemNonCashPrice)}`;
        message += `%0A`;
      }
      
      message += `📊 *Quantidade:* ${quantity}%0A`;
      message += `💵 *Subtotal à vista:* ${formatPrice(itemTotalCash)}%0A`;
      if (itemTotalNonCash !== itemTotalCash) {
        message += `💳 *Subtotal parcelado:* ${formatPrice(itemTotalNonCash)}%0A`;
      }
      
      // Adicionar informação sobre número máximo de parcelas disponível
      if (priceInstallment && priceInstallment > 0 && maxInstallments && maxInstallments > 0) {
        message += `📋 *Parcelamento:* Disponível em até ${maxInstallments}x%0A`;
      }
    });

    const itemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    message += `%0A━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `*TOTAL GERAL:*%0A`;
    message += `📦 *Itens:* ${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}%0A`;
    message += `💵 *Total à vista:* ${formatPrice(totalCash)}%0A`;
    message += `💳 *Total parcelado:* ${formatPrice(totalNonCash)}%0A`;
    
    // Adicionar informações de pagamento (do modal)
    const paymentMethod = document.getElementById("modalPaymentMethod");
    const installments = document.getElementById("modalInstallments");
    
    if (paymentMethod && paymentMethod.value) {
      message += `%0A━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*💳 FORMA DE PAGAMENTO*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      
      const paymentMethods = {
        'dinheiro': '💵 Dinheiro',
        'pix': '📱 PIX',
        'debito': '💳 Débito',
        'credito': '💳 Crédito'
      };
      
      const methodName = paymentMethods[paymentMethod.value] || paymentMethod.value;
      message += `${methodName}`;
      
      // Se for crédito, adicionar informações de parcelamento
      if (paymentMethod.value === 'credito' && installments && installments.value) {
        const installmentsCount = parseInt(installments.value);
        const installmentValue = totalNonCash / installmentsCount;
        message += `%0A📊 *Parcelado em ${installmentsCount}x de ${formatPrice(installmentValue)}*`;
      }
    }
    
    // Adicionar tipo de entrega e endereço (do modal)
    const deliveryTypeMsg = document.getElementById("modalDeliveryType");
    const deliveryAddress = document.getElementById("modalDeliveryAddress");
          
    if (deliveryTypeMsg && deliveryTypeMsg.value === "pickup") {
      message += `%0A%0A━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*🚚 ENTREGA*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `🏪 *Retirada em Loja*`;
    } else if (deliveryAddress && deliveryAddress.value && deliveryAddress.value.trim() !== "") {
      message += `%0A%0A━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*🚚 ENTREGA*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `📍 *Endereço:*%0A${encodeURIComponent(deliveryAddress.value.trim())}`;
      
    } else if (deliveryTypeMsg && deliveryTypeMsg.value === "delivery") {
      message += `%0A%0A━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `*🚚 ENTREGA*%0A`;
      message += `━━━━━━━━━━━━━━━━━━━━%0A`;
      message += `📍 *Entrega* (endereço não informado)`;
    }
    
    // Registrar compra finalizada no banco de dados
    try {
      if (typeof supabase !== "undefined" && supabase.from) {
        const sid = getSessionId();
        const itemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // Preparar dados do pedido para JSON
        const orderItems = cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          product_code: item.product_code || null,
          product_id: item.product_id || null
        }));
        
        const orderData = {
          session_id: sid,
          customer_name: customerName,
          customer_email: customerEmail || null,
          customer_type: customerType || null,
          customer_document: documentValue || null,
          total_amount: totalCash,
          items_count: itemsCount,
          payment_method: paymentMethod ? paymentMethod.value : null,
          delivery_type: deliveryTypeMsg ? deliveryTypeMsg.value : null,
          order_data: {
            items: orderItems,
            payment_method: paymentMethod ? paymentMethod.value : null,
            installments: installments ? installments.value : null,
            delivery_type: deliveryTypeMsg ? deliveryTypeMsg.value : null,
            delivery_address: deliveryAddress ? deliveryAddress.value : null
          }
        };
        
        await supabase.from("completed_orders").insert(orderData);
        console.log("✅ Compra finalizada registrada no banco de dados");
      }
    } catch (err) {
      console.error("Erro ao registrar compra finalizada:", err);
      // Não bloquear o fluxo se houver erro ao registrar
    }
    
    // Abrir WhatsApp com mensagem pré-preenchida
    // Cliente não vê a mensagem no site, só quando WhatsApp abrir
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    
    // Mostrar mensagem de confirmação discreta
    showWhatsAppConfirmation();

    // Limpar carrinho após um delay (para dar tempo do cliente enviar no WhatsApp)
    setTimeout(async () => {
      try {
        // Limpar no Supabase
        if (typeof supabase !== "undefined" && supabase.from) {
          const sid = getSessionId();
          await supabase.from("cart_items").delete().eq("session_id", sid);
        }
      } catch (err) {
        console.error("Erro ao limpar carrinho no Supabase:", err);
      } finally {
        // Limpar localmente
        cart = [];
        updateCart();

        // Fechar carrinho se estiver aberto
        if (cartBox) cartBox.classList.remove("open");
        if (cartOverlay) cartOverlay.classList.add("hidden");
      }
    }, 2000); // Aumentado para 2 segundos para dar tempo do cliente enviar
  }

  // Função para mostrar confirmação do WhatsApp
  function showWhatsAppConfirmation() {
    // Criar elemento de toast se não existir
    let toast = document.getElementById('whatsappConfirmationToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'whatsappConfirmationToast';
      toast.className = 'whatsapp-confirmation-toast';
      document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
      <div class="whatsapp-confirmation-content">
        <i class="fa-brands fa-whatsapp"></i>
        <div>
          <strong>WhatsApp aberto!</strong>
          <p>A mensagem está pronta. Clique em "Enviar" no WhatsApp.</p>
        </div>
      </div>
    `;
    
    toast.classList.add('show');
    
    // Remover após 5 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }


  // Expor funções globalmente
  window.openCustomerDataModal = openCustomerDataModal;
  window.closeCustomerDataModal = closeCustomerDataModal;
  window.submitCustomerData = submitCustomerData;

  // ==============================
  // FINALIZAR WHATSAPP
  // ==============================
  function updateWhatsAppLink() {
    const finalizeBtn = document.getElementById("finalizeOrder");
    if (!finalizeBtn) {
      console.warn('⚠️ Botão finalizeOrder não encontrado');
      return;
    }
    
    // Habilitar/desabilitar botão baseado apenas se há itens no carrinho
    // Toda validação de pagamento e endereço será feita no modal
    if (cart.length === 0) {
      finalizeBtn.style.opacity = "0.5";
      finalizeBtn.style.pointerEvents = "none";
      finalizeBtn.style.cursor = "not-allowed";
      finalizeBtn.href = "#";
      finalizeBtn.classList.add("disabled-payment");
      return;
    }
    
    // Habilitar botão quando há itens no carrinho
    finalizeBtn.style.opacity = "1";
    finalizeBtn.style.pointerEvents = "auto";
    finalizeBtn.style.cursor = "pointer";
    finalizeBtn.classList.remove("disabled-payment");
    finalizeBtn.href = "#"; // O link será tratado no evento de clique

    // Ao clicar para finalizar, mostrar modal de dados do cliente primeiro
    // Remover listener anterior se existir para evitar duplicação
    const existingHandler = finalizeBtn._clickHandler;
    if (existingHandler) {
      finalizeBtn.removeEventListener("click", existingHandler);
    }

    // Criar novo handler
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🔘 Botão finalizar clicado. Carrinho tem', cart.length, 'itens');
      
      // Se por algum motivo o carrinho já estiver vazio, não faz nada
      if (!cart || cart.length === 0) {
        alert("⚠️ Seu carrinho está vazio. Adicione produtos antes de finalizar.");
        return;
      }

      // Verificar se a função existe
      if (typeof openCustomerDataModal !== 'function') {
        console.error('❌ Função openCustomerDataModal não encontrada');
        alert('Erro: Função não disponível. Recarregue a página.');
        return;
      }

      // Mostrar modal de dados do cliente (toda validação será feita no modal)
      openCustomerDataModal();
    };

    // Salvar referência do handler
    finalizeBtn._clickHandler = clickHandler;
    
    // Adicionar listener
    finalizeBtn.addEventListener("click", clickHandler);
    
    console.log('✅ Event listener adicionado ao botão finalizar');
  }

  // ==============================
  // INIT
  // Função para gerar Schema.org Product dinamicamente (SEO)
  async function generateProductSchema(productsList) {
    if (!productsList || productsList.length === 0) return;
    
    // Remover schemas antigos de produtos
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-product-schema]');
    existingSchemas.forEach(s => s.remove());
    
    // Gerar schema para TODOS os produtos disponíveis (incluindo futuros)
    // O Google pode processar múltiplos schemas, e isso garante que todos os produtos tenham schema
    const productsToSchema = productsList.filter(p => p.available);
    
    // Buscar todas as avaliações de uma vez (mais eficiente)
    let allReviews = {};
    if (typeof supabase !== 'undefined' && supabase.from && productsToSchema.length > 0) {
      try {
        const productIds = productsToSchema.map(p => p.id).filter(Boolean);
        if (productIds.length > 0) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('product_reviews')
            .select('product_id, rating, comment, customer_name, created_at')
            .in('product_id', productIds)
            .order('created_at', { ascending: false });
          
          if (!reviewsError && reviewsData) {
            // Agrupar avaliações por product_id
            reviewsData.forEach(review => {
              if (!allReviews[review.product_id]) {
                allReviews[review.product_id] = [];
              }
              allReviews[review.product_id].push(review);
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ Erro ao carregar avaliações para Schema.org:', err);
      }
    }
    
    productsToSchema.forEach((product) => {
      // Garantir que o preço seja válido (não 0)
      const productPrice = product.price_cash && product.price_cash > 0 
        ? product.price_cash 
        : (product.price && product.price > 0 ? product.price : null);
      
      // Pular produtos sem preço válido
      if (!productPrice || productPrice <= 0) {
        return;
      }
      
      // Garantir que a imagem seja sempre uma URL absoluta válida
      let productImage = 'https://cefeqsc.net.br/img/sem-imagem.jpg';
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        productImage = firstImage.startsWith('http') ? firstImage : `https://cefeqsc.net.br/${firstImage}`;
      }
      
      // Garantir que o produto tenha nome válido
      const productName = (product.name && product.name.trim()) ? product.name.trim() : null;
      if (!productName) {
        console.warn(`⚠️ Produto ID ${product.id} sem nome válido, pulando schema`);
        return;
      }
      
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productName,
        "description": (product.description || `${productName} - Ferramenta profissional`).trim(),
        "image": productImage,
        "offers": {
          "@type": "Offer",
          "url": `https://cefeqsc.net.br/produtos.html#produto-${product.id}`,
          "priceCurrency": "BRL",
          "price": Number(productPrice).toFixed(2),
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Cefeq Ferramentas"
          }
        },
        "url": `https://cefeqsc.net.br/produtos.html#produto-${product.id}`
      };
      
      // Adicionar brand apenas se existir
      const brandName = product.brand || product.marca;
      if (brandName && brandName.trim()) {
        productSchema.brand = {
          "@type": "Brand",
          "name": brandName.trim()
        };
      }
      
      // Adicionar category apenas se existir
      if (product.category && product.category.trim()) {
        productSchema.category = product.category.trim();
      }
      
      // Adicionar SKU apenas se existir
      if (product.product_code && product.product_code.trim()) {
        productSchema.sku = product.product_code.trim();
      } else if (product.id) {
        productSchema.sku = product.id.toString();
      }
      
      // Adicionar MPN apenas se existir e for diferente do SKU
      if (product.product_code && product.product_code.trim()) {
        productSchema.mpn = product.product_code.trim();
      }
      
      // Adicionar aggregateRating e review se houver avaliações
      const productReviews = allReviews[product.id] || [];
      if (productReviews.length > 0) {
        const reviewCount = productReviews.length;
        const averageRating = productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount;
        
        if (averageRating > 0) {
          productSchema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": averageRating.toFixed(1),
            "reviewCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
          };
          
          // Adicionar reviews individuais (máximo 10)
          const reviewsToInclude = productReviews.slice(0, 10);
          productSchema.review = reviewsToInclude
            .filter(r => r.rating > 0)
            .map(review => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": review.customer_name || "Anônimo"
              },
              "datePublished": review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : undefined,
              "reviewBody": review.comment || undefined,
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating || 0,
                "bestRating": "5",
                "worstRating": "1"
              }
            }))
            .filter(r => r.reviewRating.ratingValue > 0 && r.datePublished);
        }
      }
      
      // Função para remover campos undefined, null, strings vazias e arrays vazios recursivamente
      // IMPORTANTE: NUNCA remover campos obrigatórios (name, price, priceCurrency, availability)
      function removeUndefined(obj) {
        if (Array.isArray(obj)) {
          const cleaned = obj.map(item => removeUndefined(item)).filter(item => {
            return item !== undefined && item !== null && item !== '';
          });
          return cleaned.length > 0 ? cleaned : undefined;
        } else if (obj !== null && typeof obj === 'object') {
          const cleaned = {};
          Object.keys(obj).forEach(key => {
            const value = removeUndefined(obj[key]);
            // Campos obrigatórios nunca devem ser removidos
            const requiredFields = ['name', 'price', 'priceCurrency', 'availability', '@type', '@context'];
            if (requiredFields.includes(key) || (value !== undefined && value !== null && value !== '')) {
              cleaned[key] = value;
            }
          });
          return Object.keys(cleaned).length > 0 ? cleaned : undefined;
        }
        // Remover strings vazias (exceto se for campo obrigatório)
        if (typeof obj === 'string' && obj.trim() === '') {
          return undefined;
        }
        return obj;
      }
      
      // Limpar schema antes de serializar (mas manter campos obrigatórios)
      const cleanedSchema = removeUndefined(productSchema);
      
      // Validação final: garantir que campos obrigatórios existam
      if (!cleanedSchema || !cleanedSchema.name || !cleanedSchema.offers || !cleanedSchema.offers.price) {
        console.warn(`⚠️ Schema inválido para produto ${productName}: campos obrigatórios faltando`);
        return;
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-product-schema', 'true');
      script.textContent = JSON.stringify(cleanedSchema);
      document.head.appendChild(script);
    });
    
    console.log(`✅ Schema.org gerado para ${productsToSchema.length} produtos${Object.keys(allReviews).length > 0 ? ` (com avaliações)` : ''}`);
  }

  // ==============================
  // Aguardar o carregamento do Supabase antes de carregar dados
  function initApp() {
    // Não inicializar na página de produto individual
    if (isProductPage) {
      // Apenas carregar carrinho na página de produto
      loadCart().catch(err => console.error('Erro ao carregar carrinho:', err));
      return;
    }
    
    // Verificar se supabase está disponível
    if (typeof supabase === 'undefined' || !supabase.from) {
      setTimeout(initApp, 100);
      return;
    }
    
    // Gerar sessionId primeiro para garantir consistência
    const sid = getSessionId();
    
    // Carregar carrinho PRIMEIRO (antes dos produtos) para garantir que está disponível
    loadCart()
      .then(() => {
        // Depois carregar produtos
        return loadSiteData();
      })
      .then(() => {
        // Configurar busca e filtros com debounce
        setupSearchAndFilters();
        // Renderizar produtos com reset (prioridade)
        renderProducts(true);
        
        // Configurar eventos de pagamento após DOM estar pronto (lazy load)
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            setupPaymentEvents();
            setupCustomerDataModal();
          }, { timeout: 2000 });
        } else {
          setTimeout(() => {
            setupPaymentEvents();
            setupCustomerDataModal();
          }, 100);
        }
      })
      .catch(err => {
        // Tentar renderizar produtos mesmo com erro
        if (products.length > 0) {
          renderProducts(true);
        }
      });
  }
  
  // Registrar visita quando o site carregar
  if (typeof registerVisit === 'function') {
    registerVisit();
  } else {
    // Se a função não estiver disponível, criar uma versão simples
    async function registerVisitSimple() {
      try {
        if (typeof supabase === 'undefined' || !supabase.from) {
          return;
        }

        let sessionId = sessionStorage.getItem('site_session_id');
        if (!sessionId) {
          sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('site_session_id', sessionId);
        }

        const pageUrl = window.location.href;
        const userAgent = navigator.userAgent;
        
        await supabase
          .from('site_visitors')
          .insert({
            session_id: sessionId,
            page_url: pageUrl,
            user_agent: userAgent,
            visited_at: new Date().toISOString()
          });
      } catch (err) {
        // Silenciosamente ignorar erros (pode ser que a tabela não exista ainda)
        console.log('ℹ️ Não foi possível registrar visita:', err.message);
      }
    }
    
    registerVisitSimple();
  }

  // Iniciar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // ==============================
  // NAVEGAÇÃO (MENU COM SCROLL)
  // ==============================

  // INÍCIO
  // ==============================
  // SISTEMA DE LOGIN ADMIN
  // ==============================
  
  // CONFIGURE SUA SENHA AQUI
  const ADMIN_PASSWORD = 'Sitedacefeq@2026'; // ⚠️ ALTERE ESTA SENHA!
  
  function openAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('adminPassword');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }
  
  function closeAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    const error = document.getElementById('adminLoginError');
    if (error) {
      error.textContent = '';
    }
  }
  
  function loginAdmin() {
    const input = document.getElementById('adminPassword');
    const error = document.getElementById('adminLoginError');
    
    if (!input) return;
    
    const password = input.value;
    
    if (password === ADMIN_PASSWORD) {
      // Senha correta - salvar autenticação
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      
      // Redirecionar para Admin.html
      window.location.href = 'Admin.html';
    } else {
      // Senha incorreta
      if (error) {
        error.textContent = '❌ Senha incorreta! Tente novamente.';
      }
      input.value = '';
      input.focus();
      
      // Adicionar animação de erro
      input.style.borderColor = '#dc2626';
      setTimeout(() => {
        input.style.borderColor = '#e5e7eb';
      }, 2000);
    }
  }
  
  // Permitir login com Enter
  document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
      passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          loginAdmin();
        }
      });
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeAdminLogin();
        }
      });
    }
  });
  
  // Expor funções globalmente
  window.openAdminLogin = openAdminLogin;
  window.closeAdminLogin = closeAdminLogin;
  window.loginAdmin = loginAdmin;

  // ==============================
  // NAVEGAÇÃO (MENU COM SCROLL)
  // ==============================

  window.goHome = function() {
    // Forçar scroll para o topo, cancelando qualquer scroll em andamento
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Também tentar scroll do documento caso window não funcione
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    // Se ainda não funcionar, usar scroll instantâneo após um pequeno delay
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }, 100);
    
    console.log('🏠 Navegando para o início');
  };

  // SOBRE NÓS
  window.showAbout = function() {
    const about = document.getElementById("aboutSection");
    if (!about) {
      console.error("Seção aboutSection não encontrada!");
      return;
    }
    
    const scrollToSection = () => {
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 180;
      
      // Calcular posição usando getBoundingClientRect
      const rect = about.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const targetPosition = Math.max(0, rect.top + scrollTop - headerHeight);
      
      console.log("Scroll para Sobre Nós:", targetPosition);
      
      // Usar requestAnimationFrame para garantir que o scroll aconteça
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        // Fallback para navegadores antigos
        if (document.documentElement) {
          document.documentElement.scrollTop = targetPosition;
        }
        if (document.body) {
          document.body.scrollTop = targetPosition;
        }
      });
    };
    
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(scrollToSection, 50);
  };

  // DESTAQUES / PRODUTOS
  window.showProducts = function() {
    const products = document.getElementById("productsSection");
    if (!products) {
      console.error("Seção productsSection não encontrada!");
      return;
    }
    
    const scrollToSection = () => {
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 180;
      
      // Calcular posição usando getBoundingClientRect
      const rect = products.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const targetPosition = Math.max(0, rect.top + scrollTop - headerHeight);
      
      console.log("Scroll para Destaques:", targetPosition);
      
      // Usar requestAnimationFrame para garantir que o scroll aconteça
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        // Fallback para navegadores antigos
        if (document.documentElement) {
          document.documentElement.scrollTop = targetPosition;
        }
        if (document.body) {
          document.body.scrollTop = targetPosition;
        }
      });
    };
    
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(scrollToSection, 50);
  };



  //adicionar categorias pelo admin
  function filterByCategory(cat) {
    currentCategory = cat || 'all';
    currentPage = 0;
    renderCategorySelect();
    renderProducts(true);
}

  function filterByBrand(brand) {
    currentBrand = brand || 'all';
    currentPage = 0;
    renderBrandSelect();
    renderProducts(true);
  }


// fechar carrinho ao clicar fora
if (cartOverlay) {
  cartOverlay.addEventListener("click", () => {
    cartBox.classList.remove("open");
    cartOverlay.classList.add("hidden");
  });
}

// ==============================
// BANNER DE CONSENTIMENTO LGPD
// ==============================

// Verificar se o usuário já deu consentimento
function checkLGPDConsent() {
  const consent = sessionStorage.getItem('lgpd_consent');
  if (!consent) {
    // Mostrar banner após 1 segundo
    setTimeout(() => {
      const banner = document.getElementById('lgpdBanner');
      if (banner) {
        banner.classList.remove('hidden');
      }
    }, 1000);
  }
}

// Aceitar LGPD
function acceptLGPD() {
  sessionStorage.setItem('lgpd_consent', 'accepted');
  sessionStorage.setItem('lgpd_consent_date', new Date().toISOString());
  const banner = document.getElementById('lgpdBanner');
  if (banner) {
    banner.classList.add('hidden');
  }
  console.log('✅ Consentimento LGPD aceito');
}

// Recusar LGPD
function rejectLGPD() {
  sessionStorage.setItem('lgpd_consent', 'rejected');
  const banner = document.getElementById('lgpdBanner');
  if (banner) {
    banner.classList.add('hidden');
  }
  console.log('⚠️ Consentimento LGPD recusado');
}

// Verificar consentimento ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkLGPDConsent);
} else {
  checkLGPDConsent();
}



// Cache para evitar recarregar dados desnecessariamente
let siteDataCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function loadSiteData() {
  // Verificar se supabase está disponível
  if (typeof supabase === 'undefined' || !supabase.from) {
    console.error('❌ Supabase não está disponível!');
    console.error('Verifique se supabase.js foi carregado corretamente.');
    if (productsList) {
      productsList.innerHTML = "<p>Erro: Supabase não está configurado. Verifique o console do navegador.</p>";
    }
    return;
  }

  // Verificar cache
  const now = Date.now();
  if (siteDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Usando dados do cache');
    products = siteDataCache.products || [];
    categories = siteDataCache.categories || [];
    brands = siteDataCache.brands || [];
    renderCategorySelect();
    renderBrandSelect();
    // Gerar Schema.org mesmo quando usar cache
    await generateProductSchema(products);
    return;
  }

  try {
    // Mostrar indicador de carregamento
    if (productsList) {
      productsList.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: #13d40d;"></i><p style="margin-top: 15px;">Carregando produtos...</p></div>';
    }
    
    // Carregar categorias e produtos em paralelo para mais velocidade
    const [catsResult, prodsResult] = await Promise.all([
    supabase
    .from("categories")
      .select("id, name")
      .order("name"),
    supabase
      .from("products")
    .select("*")
      .order("name")
  ]);
  
  const { data: cats, error: err1 } = catsResult;

    if (!err1 && cats) {
    categories = cats.map(c => c.name);
    renderCategorySelect();
      console.log('✅ Categorias carregadas:', categories.length);
    } else if (err1) {
      console.error('❌ Erro ao carregar categorias:', err1);
  }

  const { data: prods, error: err2 } = prodsResult;

    if (!err2 && prods) {
      console.log('📦 Produtos carregados do banco:', prods.length);
      
      // Normalizar dados dos produtos (otimizado para performance)
      products = prods.map(p => {
        const featured = p.featured === true || p.featured === "true" || p.featured === 1 || p.featured === "1";
        const available = p.available === true || p.available === "true" || p.available === 1 || p.available === "1";
        const views = p.views !== undefined && p.views !== null ? Number(p.views) : 0;
        
        return {
          ...p,
          featured: Boolean(featured),
          available: Boolean(available),
          promotional_price: p.promotional_price ? Number(p.promotional_price) : null,
          views: views
        };
      });

      // Carregar marcas do banco de dados (apenas nome)
      const { data: brs, error: brandError } = await supabase
        .from("brands")
        .select("id, name")
        .order("name");
      
      if (brandError) {
        console.warn('⚠️ Erro ao carregar marcas do banco:', brandError);
        // Fallback: detectar marcas dos produtos se a tabela brands não existir
      const brandSet = new Set();
      products.forEach(p => {
        const b = normalizeBrandValue(p.brand || p.marca || p.brand_name);
        if (b) brandSet.add(b);
      });
      brands = Array.from(brandSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      } else {
        // Usar marcas do banco
        brands = (brs || []).map(b => b.name).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      }
      renderBrandSelect();
      
      const featuredProducts = products.filter(p => p.featured === true);
      console.log('⭐ Produtos em destaque encontrados:', featuredProducts.length);
      
      // Gerar Schema.org para produtos (SEO para Google)
      await generateProductSchema(products);
      
      // Salvar no cache
      siteDataCache = {
        products: products,
        categories: categories,
        brands: brands
      };
      cacheTimestamp = Date.now();
      
      // Não renderizar aqui - será renderizado pelo initApp após carregar tudo
      console.log('✅ Dados carregados, aguardando renderização...');
    } else if (err2) {
      console.error('❌ Erro ao carregar produtos:', err2);
      if (productsList) {
        productsList.innerHTML = `<p>Erro ao carregar produtos: ${err2.message}</p>`;
      }
    }
  } catch (err) {
    console.error('❌ Erro geral ao carregar dados:', err);
    if (productsList) {
      productsList.innerHTML = "<p>Erro ao carregar dados. Verifique a configuração do Supabase.</p>";
    }
  }
}

// ==============================
// SISTEMA DE AVALIAÇÕES
// ==============================

let currentReviewProductId = null;

// Carregar avaliações de um produto
async function loadProductReviews(productId) {
  if (!productId || typeof supabase === 'undefined') {
    console.warn('⚠️ Não é possível carregar avaliações: productId ou supabase não disponível');
    return;
  }
  
  console.log('📥 Carregando avaliações para o produto:', productId);
  
  try {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
      return;
    }
    
    console.log('✅ Avaliações carregadas:', reviews?.length || 0, 'avaliações encontradas');
    displayReviews(reviews || [], productId);
  } catch (err) {
    console.error('❌ Erro ao carregar avaliações:', err);
  }
}

// Exibir avaliações no modal de visualização
function displayReviews(reviews, productId) {
  const reviewsList = document.getElementById('reviewsViewList');
  const ratingAverage = document.getElementById('reviewsViewRatingAverage');
  
  if (!reviewsList || !ratingAverage) return;
  
  // Calcular média
  const average = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  // Exibir média
  const starsHtml = generateStars(average, true);
  ratingAverage.innerHTML = `
    ${starsHtml}
    <span class="rating-text">(${reviews.length} ${reviews.length === 1 ? 'avaliação' : 'avaliações'})</span>
  `;
  
  // Exibir lista de avaliações
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p class="no-reviews">Ainda não há avaliações para este produto. Seja o primeiro a avaliar!</p>';
  } else {
    reviewsList.innerHTML = reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <strong>${review.customer_name || 'Anônimo'}</strong>
          <div class="review-stars">${generateStars(review.rating, false)}</div>
        </div>
        ${review.comment ? `<p class="review-comment">${escapeHtml(review.comment)}</p>` : ''}
        <small class="review-date">${formatDate(review.created_at)}</small>
      </div>
    `).join('');
  }
  
  // Salvar ID do produto atual
  currentReviewProductId = productId;
}

// Gerar HTML das estrelas
function generateStars(rating, showAverage = false) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += '<i class="fa-solid fa-star star-filled"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      html += '<i class="fa-solid fa-star-half star-half"></i>';
    } else {
      html += '<i class="fa-regular fa-star star-empty"></i>';
    }
  }
  
  if (showAverage && rating > 0) {
    html += ` <span class="rating-number">${rating.toFixed(1)}</span>`;
  }
  
  return html;
}

// Abrir formulário de avaliação
function openReviewForm() {
  const reviewModal = document.getElementById('reviewModal');
  const productName = document.getElementById('reviewProductName');
  const modalTitle = document.getElementById('modalTitle');
  
  if (!reviewModal) {
    console.error('Modal de avaliação não encontrado');
    return;
  }
  
  if (productName && modalTitle) {
    productName.textContent = modalTitle.textContent;
  }
  
  // Limpar formulário
  const nameInput = document.getElementById('reviewName');
  const emailInput = document.getElementById('reviewEmail');
  const commentInput = document.getElementById('reviewComment');
  const errorDiv = document.getElementById('reviewError');
  
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (commentInput) commentInput.value = '';
  if (errorDiv) errorDiv.textContent = '';
  
  document.querySelectorAll('input[name="rating"], input[name="rating-prod"]').forEach(r => r.checked = false);
  
  reviewModal.classList.remove('hidden');
}

// Abrir modal de visualização de avaliações a partir do card
function openReviewFormFromCard(button) {
  console.log('🔍 openReviewFormFromCard chamado', button);
  
  if (!button) {
    console.error('❌ Botão não fornecido');
    alert('Erro: Botão não encontrado.');
    return;
  }
  
  const productId = button.getAttribute('data-id');
  console.log('📦 Product ID:', productId);
  
  if (!productId) {
    console.error('❌ Product ID não encontrado');
    alert('Erro: Produto não identificado.');
    return;
  }
  
  // Encontrar o produto nos dados carregados
  const product = products.find(p => p.id == productId || String(p.id) === String(productId));
  console.log('🔍 Produto encontrado:', product);
  
  if (!product) {
    console.error('❌ Produto não encontrado na lista');
    alert('Erro: Produto não encontrado.');
    return;
  }
  
  // Salvar ID do produto (converter para número)
  const productIdNum = typeof productId === 'string' ? parseInt(productId) : productId;
  currentReviewProductId = productIdNum;
  console.log('💾 Current Review Product ID:', currentReviewProductId);
  
  // Abrir modal de visualização de avaliações
  const reviewsViewModal = document.getElementById('reviewsViewModal');
  const productNameElement = document.getElementById('reviewsViewProductName');
  
  console.log('🔍 Modal encontrado:', reviewsViewModal);
  console.log('🔍 Product Name element:', productNameElement);
  
  if (!reviewsViewModal) {
    console.error('❌ Modal de avaliações não encontrado no DOM');
    alert('Erro: Modal de avaliações não encontrado. Verifique se o HTML está correto.');
    return;
  }
  
  if (productNameElement) {
    productNameElement.textContent = product.name || 'Produto';
  }
  
  // Carregar e exibir avaliações
  loadProductReviews(productIdNum).then(() => {
    reviewsViewModal.classList.remove('hidden');
    console.log('✅ Modal de avaliações aberto');
  }).catch(err => {
    console.error('❌ Erro ao carregar avaliações:', err);
    reviewsViewModal.classList.remove('hidden');
  });
}

// Fechar modal de visualização de avaliações
function closeReviewsView() {
  const reviewsViewModal = document.getElementById('reviewsViewModal');
  if (reviewsViewModal) {
    reviewsViewModal.classList.add('hidden');
  }
}

// Abrir formulário de avaliação a partir do modal de visualização
function openReviewFormFromReviewsView() {
  closeReviewsView();
  
  // Encontrar o produto
  const product = products.find(p => p.id == currentReviewProductId || String(p.id) === String(currentReviewProductId));
  
  if (!product) {
    alert('Erro: Produto não encontrado.');
    return;
  }
  
  // Abrir modal de avaliação
  const reviewModal = document.getElementById('reviewModal');
  const productName = document.getElementById('reviewProductName');
  
  if (!reviewModal) {
    alert('Erro: Modal de avaliação não encontrado.');
    return;
  }
  
  if (productName) {
    productName.textContent = product.name || 'Produto';
  }
  
  // Limpar formulário
  const nameInput = document.getElementById('reviewName');
  const emailInput = document.getElementById('reviewEmail');
  const commentInput = document.getElementById('reviewComment');
  const errorDiv = document.getElementById('reviewError');
  
  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (commentInput) commentInput.value = '';
  if (errorDiv) errorDiv.textContent = '';
  
  document.querySelectorAll('input[name="rating"], input[name="rating-prod"]').forEach(r => r.checked = false);
  
  reviewModal.classList.remove('hidden');
}

// Fechar formulário de avaliação
function closeReviewForm() {
  const reviewModal = document.getElementById('reviewModal');
  if (reviewModal) {
    reviewModal.classList.add('hidden');
  }
}

// Enviar avaliação
async function submitReview() {
  if (!currentReviewProductId || typeof supabase === 'undefined') {
    alert('Erro: Produto não identificado.');
    return;
  }
  
  const name = document.getElementById('reviewName').value.trim();
  const email = document.getElementById('reviewEmail').value.trim();
  const comment = document.getElementById('reviewComment').value.trim();
  const ratingInput = document.querySelector('input[name="rating"]:checked, input[name="rating-prod"]:checked');
  const errorDiv = document.getElementById('reviewError');
  
  // Validação
  if (!name) {
    errorDiv.textContent = 'Por favor, informe seu nome.';
    return;
  }
  
  if (!ratingInput) {
    errorDiv.textContent = 'Por favor, selecione uma avaliação (estrelas).';
    return;
  }
  
  const rating = parseInt(ratingInput.value);
  
  // Converter product_id para bigint (número)
  const productId = typeof currentReviewProductId === 'string' 
    ? parseInt(currentReviewProductId) 
    : Number(currentReviewProductId);
  
  if (isNaN(productId)) {
    errorDiv.textContent = 'Erro: ID do produto inválido.';
    console.error('ID do produto inválido:', currentReviewProductId);
    return;
  }
  
  try {
    console.log('💾 Salvando avaliação:', {
      product_id: productId,
      customer_name: name,
      rating: rating,
      has_comment: !!comment
    });
    
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        customer_name: name,
        customer_email: email || null,
        rating: rating,
        comment: comment || null
      })
      .select();
    
    if (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
      errorDiv.textContent = `Erro ao enviar avaliação: ${error.message || 'Tente novamente.'}`;
      return;
    }
  
    console.log('✅ Avaliação salva com sucesso:', data);
    
    // Sucesso
    closeReviewForm();
    
    // Mostrar aviso simples e elegante
    showReviewSuccessMessage();
    
    // Recarregar avaliações e reabrir modal de visualização
    await loadProductReviews(productId);
    
    // Reabrir modal de visualização de avaliações
    const reviewsViewModal = document.getElementById('reviewsViewModal');
    if (reviewsViewModal) {
      reviewsViewModal.classList.remove('hidden');
    }
    
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err);
    errorDiv.textContent = 'Erro ao enviar avaliação. Tente novamente.';
  }
}

// Funções auxiliares
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

// Mostrar mensagem de sucesso simples
function showReviewSuccessMessage() {
  // Remover mensagem anterior se existir
  const existingMsg = document.getElementById('reviewSuccessToast');
  if (existingMsg) {
    existingMsg.remove();
  }
  
  // Criar elemento de mensagem
  const toast = document.createElement('div');
  toast.id = 'reviewSuccessToast';
  toast.className = 'review-success-toast';
  toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> Avaliação feita!';
  
  // Adicionar ao body
  document.body.appendChild(toast);
  
  // Mostrar com animação
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remover após 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Tornar funções globais
window.openReviewForm = openReviewForm;
window.openReviewFormFromCard = openReviewFormFromCard;
window.openReviewFormFromReviewsView = openReviewFormFromReviewsView;
window.closeReviewForm = closeReviewForm;
window.closeReviewsView = closeReviewsView;
window.submitReview = submitReview;
