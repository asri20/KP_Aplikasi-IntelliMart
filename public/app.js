const API_BASE = ''; // Karena frontend disajikan dari server yang sama

// Format angka ke Rupiah
function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// Navigasi sidebar
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('section-' + item.dataset.section).classList.add('active');
    });
});

// Load semua data
async function loadAll() {
    const storeId = document.getElementById('storeId').value;
    loadSummary(storeId);
    loadTopProducts(storeId);
    loadProfit(storeId);
    loadTrend(storeId);
}

// 1. Dashboard Summary
async function loadSummary(storeId) {
    try {
        const res = await fetch(`${API_BASE}/api/dashboard/summary?store_id=${storeId}`);
        const json = await res.json();
        if (json.success) {
            document.getElementById('total-revenue').textContent = formatRupiah(json.data.total_revenue);
            document.getElementById('total-lunas').textContent = json.data.total_transactions_lunas;
            document.getElementById('total-unpaid').textContent = json.data.total_transactions_unpaid;
            document.getElementById('total-sold').textContent = json.data.total_products_sold;
        } else {
            document.getElementById('total-revenue').textContent = 'Error';
        }
    } catch (err) {
        document.getElementById('total-revenue').textContent = 'Gagal memuat';
        console.error('Summary error:', err);
    }
}

// 2. Top Products
async function loadTopProducts(storeId) {
    const tbody = document.getElementById('top-products-body');
    try {
        const res = await fetch(`${API_BASE}/api/analytics/top-products?store_id=${storeId}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
            tbody.innerHTML = json.data.map((item, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${item.variant?.product?.name || '-'}</td>
                    <td>${item.variant?.variant_name || '-'}</td>
                    <td>${item.dataValues?.total_qty_sold || item.total_qty_sold || 0}</td>
                    <td>${formatRupiah(item.dataValues?.total_revenue || item.total_revenue || 0)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Belum ada data transaksi LUNAS</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="loading">Error: ${err.message}</td></tr>`;
    }
}

// 3. Profit
async function loadProfit(storeId) {
    try {
        const res = await fetch(`${API_BASE}/api/analytics/profit?store_id=${storeId}`);
        const json = await res.json();
        if (json.success) {
            document.getElementById('profit-revenue').textContent = formatRupiah(json.data.total_revenue);
            document.getElementById('profit-cost').textContent = formatRupiah(json.data.total_cost);
            document.getElementById('profit-net').textContent = formatRupiah(json.data.total_profit);
            document.getElementById('profit-margin').textContent = json.data.profit_margin;
        }
    } catch (err) {
        document.getElementById('profit-revenue').textContent = 'Gagal memuat';
    }
}

// 4. Sales Trend
async function loadTrend(storeId) {
    const tbody = document.getElementById('trend-body');
    try {
        const res = await fetch(`${API_BASE}/api/analytics/sales-trend?store_id=${storeId}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
            tbody.innerHTML = json.data.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.total_transactions}</td>
                    <td>${formatRupiah(item.total_revenue)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">Belum ada data tren penjualan</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" class="loading">Error: ${err.message}</td></tr>`;
    }
}

// Auto-load saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => loadAll());
