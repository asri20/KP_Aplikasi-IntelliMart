/**
 * IntelliMart - POS & Inventory Management
 * Frontend Logic for Modul 10 Dashboard & Analytics
 */

// Global State
const state = {
  currentStoreId: 1,
  currentStoreName: 'Toko Testing Modul 1',
  stores: [],
  activeNav: 'dashboard',
  salesChartInstance: null,
  categoryChartInstance: null,
  catalogSearchDebounce: null,
};

// Utilities
const formatRupiah = (number) => {
  if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatTimeIndo = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3200);
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

// Navigation Switcher
function switchNav(navId, event) {
  if (event) event.preventDefault();
  state.activeNav = navId;

  // Update nav item active classes
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('data-nav') === navId) {
      el.classList.add('active', 'bg-brand-500', 'text-white');
      el.classList.remove('text-slate-600', 'hover:bg-orange-50', 'hover:text-brand-500');
    } else {
      el.classList.remove('active', 'bg-brand-500', 'text-white');
      el.classList.add('text-slate-600', 'hover:bg-orange-50', 'hover:text-brand-500');
    }
  });

  // Switch visible section
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`view-${navId}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  // Load relevant data for the tab
  if (navId === 'stores') {
    renderStoresGrid();
  } else if (navId === 'catalog') {
    loadCatalog(state.currentStoreId);
  } else if (navId === 'inventory') {
    loadLowStock(state.currentStoreId);
  } else if (navId === 'profit') {
    loadProfit(state.currentStoreId);
  } else if (navId === 'trend') {
    loadTrendTable(state.currentStoreId);
  } else if (navId === 'customers') {
    loadCustomerSegments();
  } else if (navId === 'transactions') {
    loadAllTransactions(state.currentStoreId);
  } else if (navId === 'dashboard') {
    loadDashboard(state.currentStoreId);
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
    toggleSidebar();
  }

  // Refresh lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Set date badge
  const dateBadge = document.getElementById('current-date-badge');
  if (dateBadge) {
    dateBadge.textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Set default profit filter dates (last 30 days to today)
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const pStart = document.getElementById('profit-start-date');
  const pEnd = document.getElementById('profit-end-date');
  if (pStart) pStart.value = thirtyDaysAgo;
  if (pEnd) pEnd.value = today;

  // Initialize Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Fetch stores
  await fetchStores();

  // Load Initial Dashboard
  await loadDashboard(state.currentStoreId);
});

// Fetch Stores List
async function fetchStores() {
  try {
    const res = await fetch('/api/dashboard/stores');
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      state.stores = json.data;
      const select = document.getElementById('store-select');
      if (select) {
        select.innerHTML = json.data.map(store => `
          <option value="${store.id}" ${store.id === state.currentStoreId ? 'selected' : ''}>
            ${store.store_name}
          </option>
        `).join('');
      }

      // Set initial store name
      const cur = json.data.find(s => s.id === state.currentStoreId);
      if (cur) {
        state.currentStoreName = cur.store_name;
        updateStoreNameLabels();
      }
    }
  } catch (err) {
    console.error('Failed to load stores:', err);
    showToast('Gagal memuat daftar toko', 'error');
  }
}

function updateStoreNameLabels() {
  const bannerLabel = document.getElementById('banner-store-name');
  if (bannerLabel) {
    bannerLabel.textContent = state.currentStoreName;
  }
}

// Store Change Event
async function handleStoreChange(storeId) {
  state.currentStoreId = parseInt(storeId);
  const cur = state.stores.find(s => s.id === state.currentStoreId);
  if (cur) {
    state.currentStoreName = cur.store_name;
    updateStoreNameLabels();
  }

  showToast(`Beralih ke toko: ${state.currentStoreName}`);

  // Refresh currently active tab
  refreshCurrentView();
}

function refreshCurrentView() {
  const icon = document.getElementById('refresh-icon');
  if (icon) icon.classList.add('animate-spin');

  setTimeout(() => {
    if (icon) icon.classList.remove('animate-spin');
  }, 700);

  if (state.activeNav === 'dashboard') {
    loadDashboard(state.currentStoreId);
  } else if (state.activeNav === 'stores') {
    renderStoresGrid();
  } else if (state.activeNav === 'catalog') {
    loadCatalog(state.currentStoreId);
  } else if (state.activeNav === 'inventory') {
    loadLowStock(state.currentStoreId);
  } else if (state.activeNav === 'profit') {
    loadProfit(state.currentStoreId);
  } else if (state.activeNav === 'trend') {
    loadTrendTable(state.currentStoreId);
  } else if (state.activeNav === 'customers') {
    loadCustomerSegments();
  } else if (state.activeNav === 'transactions') {
    loadAllTransactions(state.currentStoreId);
  }
}

// ================= LOAD DASHBOARD =================
async function loadDashboard(storeId) {
  await Promise.all([
    loadSummary(storeId),
    loadTopProducts(storeId),
    loadRecentTransactions(storeId),
    loadSalesTrendChart(document.getElementById('trend-period-select')?.value || '30')
  ]);
}

// Load Summary Metrics
async function loadSummary(storeId) {
  try {
    const res = await fetch(`/api/dashboard/summary?store_id=${storeId}`);
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      document.getElementById('stat-revenue').textContent = formatRupiah(d.total_revenue);
      document.getElementById('stat-today-revenue').textContent = `Hari ini: ${formatRupiah(d.today_revenue)}`;
      document.getElementById('stat-lunas').textContent = d.total_transactions_lunas.toLocaleString();
      document.getElementById('stat-unpaid').textContent = d.total_transactions_unpaid.toLocaleString();
      document.getElementById('stat-lowstock').textContent = d.low_stock_count.toLocaleString();

      // Badge in sidebar
      const navBadge = document.getElementById('nav-lowstock-badge');
      if (navBadge) {
        if (d.low_stock_count > 0) {
          navBadge.textContent = d.low_stock_count;
          navBadge.classList.remove('hidden');
        } else {
          navBadge.classList.add('hidden');
        }
      }
    }
  } catch (err) {
    console.error('Error loadSummary:', err);
  }
}

// Load Top Products
async function loadTopProducts(storeId) {
  const container = document.getElementById('top-products-container');
  if (!container) return;

  try {
    const res = await fetch(`/api/analytics/top-products?store_id=${storeId}&limit=5`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      container.innerHTML = json.data.map((item, idx) => `
        <div class="flex items-center gap-3 py-3">
          <span class="w-6 text-center text-xs font-bold text-brand-500 font-display">${idx + 1}</span>
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-500 font-bold">
            <i data-lucide="package" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs sm:text-sm font-bold text-slate-800">${item.product_name}</p>
            <p class="text-xs text-slate-400">Varian: ${item.variant_name || '-'} • Terjual <span class="font-semibold text-slate-700">${item.total_qty_sold} pcs</span></p>
          </div>
          <p class="text-xs sm:text-sm font-bold text-brand-500 whitespace-nowrap">${formatRupiah(item.total_revenue)}</p>
        </div>
      `).join('');

      // Render category donut chart
      renderCategoryChart(json.data);
    } else {
      container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Belum ada riwayat produk terjual di toko ini.</div>`;
      renderCategoryChart([]);
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Error loadTopProducts:', err);
    container.innerHTML = `<div class="py-6 text-center text-xs text-red-500">Gagal memuat produk terlaris.</div>`;
  }
}

// Load Recent Transactions
async function loadRecentTransactions(storeId) {
  const container = document.getElementById('recent-transactions-container');
  if (!container) return;

  try {
    const res = await fetch(`/api/dashboard/recent-transactions?store_id=${storeId}&limit=5`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      container.innerHTML = json.data.map(t => {
        const isPaid = ['LUNAS', 'PAID', 'SUCCESS'].includes(t.status?.toUpperCase());
        const statusBadge = isPaid
          ? `<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${t.status}</span>`
          : `<span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${t.status}</span>`;

        return `
          <tr class="hover:bg-orange-50/20 transition-colors">
            <td class="px-4 py-3 font-semibold text-slate-700 font-mono text-[11px]">${t.invoice_no || '#' + t.id}</td>
            <td class="px-4 py-3 text-slate-400">${formatTimeIndo(t.created_at)}</td>
            <td class="px-4 py-3 text-slate-600">${t.total_items || 1} item</td>
            <td class="px-4 py-3 font-bold text-slate-800">${formatRupiah(t.total_price)}</td>
            <td class="px-4 py-3">${statusBadge}</td>
          </tr>
        `;
      }).join('');
    } else {
      container.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">Belum ada transaksi di toko ini.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadRecentTransactions:', err);
    container.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-500">Gagal memuat transaksi.</td></tr>`;
  }
}

// Render Sales Trend Chart with Chart.js
async function loadSalesTrendChart(days = 30) {
  const canvas = document.getElementById('salesTrendChart');
  if (!canvas) return;

  try {
    const res = await fetch(`/api/analytics/sales-trend?store_id=${state.currentStoreId}&days=${days}`);
    const json = await res.json();

    const dataPoints = (json.success && json.data.length > 0)
      ? json.data
      : [{ sales_date: new Date().toISOString(), total_revenue: 0, total_transactions: 0 }];

    const labels = dataPoints.map(d => formatDateIndo(d.sales_date));
    const values = dataPoints.map(d => parseFloat(d.total_revenue || 0));

    if (state.salesChartInstance) {
      state.salesChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

    state.salesChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Omzet Harian (Rp)',
          data: values,
          borderColor: '#f97316',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#f97316',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Plus Jakarta Sans', size: 12 },
            bodyFont: { family: 'Inter', size: 11 },
            callbacks: {
              label: (item) => 'Omzet: ' + formatRupiah(item.raw)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 10 }, color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(241, 245, 249, 0.8)' },
            ticks: {
              font: { family: 'Inter', size: 10 },
              color: '#94a3b8',
              callback: (val) => 'Rp ' + (val >= 1000 ? (val / 1000) + 'k' : val)
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error loadSalesTrendChart:', err);
  }
}

// Render Category Donut Chart with Chart.js
function renderCategoryChart(topProducts) {
  const canvas = document.getElementById('categoryDonutChart');
  const legend = document.getElementById('category-legend');
  if (!canvas || !legend) return;

  if (state.categoryChartInstance) {
    state.categoryChartInstance.destroy();
  }

  const labels = topProducts.length > 0 ? topProducts.map(p => p.product_name) : ['Tidak Ada Data'];
  const values = topProducts.length > 0 ? topProducts.map(p => parseInt(p.total_qty_sold || 1)) : [1];
  const colors = ['#f97316', '#fb923c', '#facc15', '#38bdf8', '#818cf8', '#cbd5e1'];

  const ctx = canvas.getContext('2d');
  state.categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false }
      }
    }
  });

  legend.innerHTML = labels.slice(0, 4).map((label, i) => `
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2 truncate">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${colors[i % colors.length]}"></span>
        <span class="truncate text-slate-600">${label}</span>
      </div>
      <span class="font-bold text-slate-800 ml-2">${values[i]} pcs</span>
    </div>
  `).join('');
}

// ================= SECTION 2: TOKO SAYA =================
function renderStoresGrid() {
  const container = document.getElementById('stores-grid');
  if (!container) return;

  if (state.stores.length === 0) {
    container.innerHTML = `<div class="col-span-3 py-12 text-center text-sm text-slate-400">Tidak ada data toko.</div>`;
    return;
  }

  container.innerHTML = state.stores.map(store => {
    const isSelected = store.id === state.currentStoreId;
    return `
      <div class="rounded-2xl border ${isSelected ? 'border-brand-500 bg-orange-50/20 ring-2 ring-brand-500/20' : 'border-slate-100 bg-white'} p-6 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl ${isSelected ? 'bg-brand-500 text-white' : 'bg-orange-50 text-brand-500'} flex items-center justify-center font-bold">
              <i data-lucide="store" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base leading-snug">${store.store_name}</h3>
              <p class="text-xs text-slate-400">ID Toko: #${store.id}</p>
            </div>
          </div>
          ${isSelected ? `<span class="px-2.5 py-1 rounded-full bg-brand-500 text-white text-[10px] font-bold">Aktif</span>` : ''}
        </div>

        <div class="space-y-2 text-xs text-slate-600 my-4 border-t border-b border-slate-100 py-3">
          <div class="flex items-center gap-2">
            <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 shrink-0"></i>
            <span class="truncate">${store.location || 'Lokasi belum disetel'}</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="phone" class="w-4 h-4 text-slate-400 shrink-0"></i>
            <span>${store.phone || 'Nomor telepon -'}</span>
          </div>
        </div>

        <button onclick="handleStoreChange(${store.id}); switchNav('dashboard');" class="w-full py-2.5 rounded-xl font-bold text-xs transition ${isSelected ? 'bg-orange-100 text-brand-700 hover:bg-orange-200' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'}">
          ${isSelected ? 'Sedang Ditampilkan' : 'Pilih Toko Ini'}
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ================= SECTION 3: KATALOG PRODUK =================
async function loadCatalog(storeId, search = '') {
  const tbody = document.getElementById('catalog-table-body');
  if (!tbody) return;

  try {
    const url = `/api/analytics/product-catalog?store_id=${storeId}${search ? '&search=' + encodeURIComponent(search) : ''}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      tbody.innerHTML = json.data.map(p => `
        <tr class="hover:bg-orange-50/20 transition-colors">
          <td class="px-5 py-3.5">
            <p class="font-bold text-slate-800">${p.product_name}</p>
            <p class="text-slate-400 text-[11px]">Varian: ${p.variant_name || 'Standard'}</p>
          </td>
          <td class="px-5 py-3.5 font-mono text-slate-500 text-[11px]">${p.sku || '-'} ${p.barcode ? '• ' + p.barcode : ''}</td>
          <td class="px-5 py-3.5"><span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">${p.category_name || 'Umum'}</span></td>
          <td class="px-5 py-3.5 text-slate-600">${p.brand_name || '-'}</td>
          <td class="px-5 py-3.5 font-bold text-slate-800">${formatRupiah(p.base_price)}</td>
          <td class="px-5 py-3.5 text-slate-500">${p.discount_store ? p.discount_store + '%' : '0%'}</td>
          <td class="px-5 py-3.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${p.stock <= p.min_stock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}">
              <span class="w-1.5 h-1.5 rounded-full ${p.stock <= p.min_stock ? 'bg-red-500' : 'bg-emerald-500'}"></span>
              ${p.stock} pcs
            </span>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada produk ditemukan.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadCatalog:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-500">Gagal memuat katalog.</td></tr>`;
  }
}

function handleCatalogSearch(val) {
  clearTimeout(state.catalogSearchDebounce);
  state.catalogSearchDebounce = setTimeout(() => {
    loadCatalog(state.currentStoreId, val);
  }, 350);
}

function handleGlobalSearch(val) {
  if (state.activeNav !== 'catalog') {
    switchNav('catalog');
  }
  const input = document.getElementById('catalog-search-input');
  if (input) input.value = val;
  handleCatalogSearch(val);
}

// ================= SECTION 4: STOK MENIPIS =================
async function loadLowStock(storeId) {
  const tbody = document.getElementById('lowstock-table-body');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/dashboard/low-stock?store_id=${storeId}`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      tbody.innerHTML = json.data.map(item => {
        const defisit = item.min_stock - item.stock;
        return `
          <tr class="hover:bg-red-50/30 transition-colors">
            <td class="px-5 py-3.5 font-bold text-slate-800">${item.store_name}</td>
            <td class="px-5 py-3.5 font-semibold text-slate-700">${item.product_name}</td>
            <td class="px-5 py-3.5 text-slate-500">${item.variant_name || '-'}</td>
            <td class="px-5 py-3.5 font-mono text-[11px] text-slate-500">${item.sku || '-'}</td>
            <td class="px-5 py-3.5 font-bold text-red-600">${item.stock} pcs</td>
            <td class="px-5 py-3.5 text-slate-600">${item.min_stock} pcs</td>
            <td class="px-5 py-3.5">
              <span class="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                -${defisit} pcs
              </span>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-500">
            <div class="flex flex-col items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <p class="font-bold text-slate-700">Semua Stok Aman!</p>
              <p class="text-xs text-slate-400">Tidak ada varian yang berada di bawah stok minimum saat ini.</p>
            </div>
          </td>
        </tr>
      `;
    }
  } catch (err) {
    console.error('Error loadLowStock:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-500">Gagal memuat data stok rendah.</td></tr>`;
  }
}

// ================= SECTION 5: PROFIT REPORT =================
async function loadProfit(storeId) {
  const pStart = document.getElementById('profit-start-date')?.value;
  const pEnd = document.getElementById('profit-end-date')?.value;

  try {
    let url = `/api/analytics/profit?store_id=${storeId}`;
    if (pStart) url += `&start_date=${pStart}`;
    if (pEnd) url += `&end_date=${pEnd}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.success && json.data) {
      const d = json.data;
      document.getElementById('profit-val-revenue').textContent = formatRupiah(d.total_revenue);
      document.getElementById('profit-val-cost').textContent = formatRupiah(d.total_cost);
      document.getElementById('profit-val-net').textContent = formatRupiah(d.total_profit);
      document.getElementById('profit-val-margin').textContent = d.profit_margin || '0%';
    }
  } catch (err) {
    console.error('Error loadProfit:', err);
  }
}

function handleProfitFilter() {
  loadProfit(state.currentStoreId);
  showToast('Filter tanggal keuntungan diterapkan');
}

// ================= SECTION 6: TREN PENJUALAN TABLE =================
async function loadTrendTable(storeId) {
  const tbody = document.getElementById('trend-table-body');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/analytics/sales-trend?store_id=${storeId}&days=90`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      tbody.innerHTML = json.data.map(item => `
        <tr class="hover:bg-orange-50/20 transition-colors">
          <td class="px-5 py-3.5 font-semibold text-slate-800">${formatDateIndo(item.sales_date)}</td>
          <td class="px-5 py-3.5 font-bold text-brand-600">${item.total_transactions} transaksi</td>
          <td class="px-5 py-3.5 font-bold text-slate-900">${formatRupiah(item.total_revenue)}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-slate-400">Belum ada data tren penjualan.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadTrendTable:', err);
    tbody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-red-500">Gagal memuat tren penjualan.</td></tr>`;
  }
}

// ================= SECTION 7: SEGMEN PELANGGAN =================
async function loadCustomerSegments() {
  const tbody = document.getElementById('customers-table-body');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/analytics/customer-segments`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      tbody.innerHTML = json.data.map(c => `
        <tr class="hover:bg-orange-50/20 transition-colors">
          <td class="px-5 py-3.5 font-mono text-slate-400 font-bold">#${c.customer_id}</td>
          <td class="px-5 py-3.5 font-bold text-slate-800">${c.customer_name || 'Customer #' + c.customer_id}</td>
          <td class="px-5 py-3.5 text-slate-500">${c.email || '-'}</td>
          <td class="px-5 py-3.5">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
              ${c.customer_type || 'RETAIL'}
            </span>
          </td>
          <td class="px-5 py-3.5">
            <span class="px-2.5 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-bold">
              ${c.segment_name}
            </span>
          </td>
          <td class="px-5 py-3.5 text-slate-400 text-xs">${formatDateIndo(c.created_at)}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data segmentasi pelanggan.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadCustomerSegments:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-red-500">Gagal memuat data pelanggan.</td></tr>`;
  }
}

// ================= SECTION 8: ALL TRANSACTIONS =================
async function loadAllTransactions(storeId) {
  const tbody = document.getElementById('all-transactions-body');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/dashboard/recent-transactions?store_id=${storeId}&limit=50`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      tbody.innerHTML = json.data.map(t => {
        const isPaid = ['LUNAS', 'PAID', 'SUCCESS'].includes(t.status?.toUpperCase());
        const statusBadge = isPaid
          ? `<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${t.status}</span>`
          : `<span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${t.status}</span>`;

        return `
          <tr class="hover:bg-orange-50/20 transition-colors">
            <td class="px-5 py-3.5 font-bold font-mono text-slate-800 text-xs">${t.invoice_no || '#' + t.id}</td>
            <td class="px-5 py-3.5 text-slate-400 text-xs">${formatDateIndo(t.created_at)} ${formatTimeIndo(t.created_at)}</td>
            <td class="px-5 py-3.5 text-slate-600 font-semibold">${t.sale_type || 'RETAIL'}</td>
            <td class="px-5 py-3.5 text-slate-700">${t.cashier_name || 'Kasir'}</td>
            <td class="px-5 py-3.5 text-slate-700">${t.customer_name || 'Pelanggan Umum'}</td>
            <td class="px-5 py-3.5 text-slate-600">${t.total_items || 1} item</td>
            <td class="px-5 py-3.5 font-bold text-slate-900">${formatRupiah(t.total_price)}</td>
            <td class="px-5 py-3.5">${statusBadge}</td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">Belum ada riwayat transaksi.</td></tr>`;
    }
  } catch (err) {
    console.error('Error loadAllTransactions:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-red-500">Gagal memuat transaksi.</td></tr>`;
  }
}
