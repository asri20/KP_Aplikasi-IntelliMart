import { useState, useEffect, useCallback } from 'react';
import { ManagerHeader } from '../components/ManagerHeader';
import { axiosClient as apiClient } from '@shared/lib/api/axiosClient';

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));

export function ManagerReportsPage() {
  const [store, setStore] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7hari');
  const [searchProduct, setSearchProduct] = useState('');
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    totalItemsSold: 0,
  });

  const loadReports = useCallback(async () => {
    try {
      const storeRes = await apiClient.get('/stores');
      const stores = storeRes?.data?.data || [];
      const myStore = stores[0] || null;
      setStore(myStore);
      if (!myStore) return;

      const [sumRes, trendRes, topRes, stockRes] = await Promise.all([
        apiClient.get('/dashboard/summary', { params: { store_id: myStore.id } }),
        apiClient.get('/analytics/sales-trend', {
          params: { store_id: myStore.id, period: 'daily' },
        }),
        apiClient.get('/analytics/best-selling', {
          params: { store_id: myStore.id, limit: 20 },
        }),
        apiClient
          .get('/stocks', { params: { store_id: myStore.id } })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const sumData = sumRes?.data?.data || {};
      const trendData = trendRes?.data?.data || [];
      const topData = topRes?.data?.data || [];
      const stocks = stockRes?.data?.data || [];

      const stockMetaByVariant = new Map();
      for (const s of stocks) {
        stockMetaByVariant.set(Number(s.variant_id), {
          sku: s.sku || '-',
          category: s.category_name || 'Umum',
        });
      }

      const limitDays = selectedPeriod === '7hari' ? 7 : selectedPeriod === '30hari' ? 30 : 31;
      const slicedTrend = trendData.slice(-limitDays).map((d) => ({
        date: d.period
          ? new Date(d.period).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
          : '-',
        transactions: Number(d.total_transactions || 0),
        revenue: Number(d.total_revenue || 0),
      }));

      const mappedTop = topData.map((p) => {
        const meta = stockMetaByVariant.get(Number(p.variant_id)) || {};
        return {
          name: p.product_name
            ? p.variant_name && p.variant_name !== p.product_name
              ? `${p.product_name} (${p.variant_name})`
              : p.product_name
            : p.variant_name || `Varian #${p.variant_id}`,
          sku: p.sku || meta.sku || '-',
          category: meta.category || 'Umum',
          sold: Number(p.total_qty_sold || 0),
          revenue: Number(p.total_revenue || 0),
        };
      });

      const totalRevenue = Number(sumData.total_revenue || 0);
      const totalTransactions = Number(sumData.total_transactions || 0);
      const avgTransaction =
        totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
      const totalItemsSold = mappedTop.reduce((acc, item) => acc + item.sold, 0);

      setDailySales(slicedTrend);
      setTopProducts(mappedTop);
      setSummary({
        totalRevenue,
        totalTransactions,
        avgTransaction,
        totalItemsSold,
      });
    } catch {
      // ignore
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredTopProducts = topProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const maxRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

  const exportReport = () => {
    const csvContent = [
      ['LAPORAN PENJUALAN TOKO'],
      ['Toko', store?.store_name || '-'],
      [
        'Periode',
        selectedPeriod === '7hari'
          ? '7 Hari Terakhir'
          : selectedPeriod === '30hari'
          ? '30 Hari Terakhir'
          : 'Bulan Ini',
      ],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
      [''],
      ['RINGKASAN'],
      ['Total Pendapatan', summary.totalRevenue],
      ['Total Transaksi', summary.totalTransactions],
      ['Rata-rata Transaksi', summary.avgTransaction],
      [''],
      ['PENJUALAN HARIAN'],
      ['Tanggal', 'Transaksi', 'Pendapatan'],
      ...dailySales.map((d) => [d.date, d.transactions, d.revenue]),
      [''],
      ['PRODUK TERLARIS'],
      ['Peringkat', 'Nama Produk', 'SKU', 'Kategori', 'Terjual', 'Pendapatan'],
      ...topProducts.map((p, i) => [i + 1, p.name, p.sku, p.category, p.sold, p.revenue]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <ManagerHeader
        title="Laporan & Analitik"
        subtitle={
          store
            ? `Analisis performa penjualan toko ${store.store_name}`
            : 'Analisis performa penjualan toko'
        }
      />

      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Top Filter & Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Periode Laporan</h3>
              <p className="text-xs text-gray-500">Pilih rentang waktu untuk melihat data</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="7hari">7 Hari Terakhir</option>
                <option value="30hari">30 Hari Terakhir</option>
                <option value="bulan">Bulan Ini</option>
              </select>
              <button
                onClick={exportReport}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Laporan
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Pendapatan</p>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatRupiah(summary.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-1">Akumulasi pendapatan toko</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</p>
            <p className="text-xs text-blue-600 mt-1">Transaksi selesai</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Rata-rata Transaksi</p>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatRupiah(summary.avgTransaction)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per transaksi</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Produk Terjual</p>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalItemsSold}</p>
            <p className="text-xs text-orange-600 mt-1">Unit terjual</p>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm mb-6">
          <h3 className="font-bold text-gray-900 mb-1">Penjualan Harian</h3>
          <p className="text-xs text-gray-500 mb-6">Tren pendapatan toko</p>

          {dailySales.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada data penjualan harian.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 px-2">
              {dailySales.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-48">
                    <div className="text-xs font-semibold text-blue-600 mb-1 text-center">
                      {formatRupiah(day.revenue).replace('Rp', '')}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500 min-h-[20px]"
                      style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 10)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700">{day.date}</p>
                    <p className="text-xs text-gray-500">{day.transactions} trx</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Produk Terlaris</h3>
                <p className="text-xs text-gray-500">Daftar produk berdasarkan jumlah penjualan</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari produk atau SKU..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Peringkat</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Terjual</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTopProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                          idx === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : idx === 1
                            ? 'bg-gray-200 text-gray-700'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-gray-900 text-sm">{product.sold} unit</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-blue-600 text-sm">{formatRupiah(product.revenue)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTopProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerReportsPage;
