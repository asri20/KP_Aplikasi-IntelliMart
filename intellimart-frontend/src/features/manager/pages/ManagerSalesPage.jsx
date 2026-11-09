import { useState, useEffect, useCallback } from 'react';
import { ManagerHeader } from '../components/ManagerHeader';
import { axiosClient as apiClient } from '@shared/lib/api/axiosClient';

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));

export function ManagerSalesPage() {
  const [store, setStore] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedSale, setSelectedSale] = useState(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const storeRes = await apiClient.get('/stores');
      const stores = storeRes?.data?.data || [];
      const myStore = stores[0] || null;
      setStore(myStore);

      const txRes = await apiClient.get('/transactions', {
        params: myStore ? { store_id: myStore.id } : {},
      });
      const raw = txRes?.data?.data || [];

      const mapped = raw.map((tx) => {
        const dt = tx.created_at ? new Date(tx.created_at) : null;
        const dateStr = dt
          ? dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-';
        const timeStr = dt
          ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-';
        const isPaid = String(tx.status || '').toUpperCase() === 'PAID';
        const itemsList = Array.isArray(tx.items) ? tx.items : [];

        return {
          id: tx.id,
          invoice: `INV-${String(tx.id).padStart(5, '0')}`,
          customer: tx.customer_name || 'Pelanggan Umum',
          cashier: tx.cashier_name || '-',
          date: dateStr,
          time: timeStr,
          items: Number(tx.total_items || itemsList.length || 0),
          total: Number(tx.total_price || 0),
          payment: tx.sale_type || 'RETAIL',
          status: isPaid ? 'Lunas' : 'Belum Lunas',
          products: itemsList,
        };
      });

      setSales(mapped);
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.cashier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || sale.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const paidSales = sales.filter((s) => s.status === 'Lunas').length;
  const unpaidSales = sales.filter((s) => s.status === 'Belum Lunas').length;

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <ManagerHeader
        title="Data Penjualan"
        subtitle={
          store
            ? `Monitor dan kelola transaksi penjualan ${store.store_name}`
            : 'Monitor dan kelola transaksi penjualan'
        }
      />

      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            <p className="text-xs text-gray-500 mt-1">Transaksi tercatat</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Pendapatan</p>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatRupiah(totalSales)}</p>
            <p className="text-xs text-green-600 mt-1">Total omzet toko</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Transaksi Lunas</p>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{paidSales}</p>
            <p className="text-xs text-gray-500 mt-1">Pembayaran selesai</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Belum Lunas</p>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{unpaidSales}</p>
            <p className="text-xs text-orange-600 mt-1">Menunggu pembayaran</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari invoice, pelanggan, atau kasir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
        </div>

        {/* Sales Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kasir</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                      Memuat data transaksi...
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono font-semibold text-blue-600 text-sm">{sale.invoice}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-sm">{sale.customer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{sale.cashier}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{sale.date}</p>
                        <p className="text-xs text-gray-500">{sale.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{sale.items} item</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{formatRupiah(sale.total)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {sale.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            sale.status === 'Lunas'
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-orange-100 text-orange-700 border-orange-300'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-xs transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredSales.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
            </div>
          )}
        </div>

        {/* Sales Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-blue-600 text-sm mb-1">{sale.invoice}</p>
                  <p className="font-semibold text-gray-900">{sale.customer}</p>
                  <p className="text-xs text-gray-500">Kasir: {sale.cashier}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    sale.status === 'Lunas'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-orange-100 text-orange-700 border-orange-300'
                  }`}
                >
                  {sale.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm pt-3 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Waktu</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {sale.date} {sale.time}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Tipe</p>
                  <p className="font-medium text-gray-900">{sale.payment}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Jumlah Item</p>
                  <p className="font-semibold text-gray-900">{sale.items} item</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Total</p>
                  <p className="font-bold text-gray-900">{formatRupiah(sale.total)}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSale(sale)}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
              >
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detail Transaksi</h3>
                <p className="text-sm text-blue-600 font-mono">{selectedSale.invoice}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Pelanggan</p>
                  <p className="font-semibold text-gray-900">{selectedSale.customer}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Kasir</p>
                  <p className="font-semibold text-gray-900">{selectedSale.cashier}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Tanggal & Waktu</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSale.date} {selectedSale.time}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Tipe Penjualan</p>
                  <p className="font-semibold text-gray-900">{selectedSale.payment}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900 mb-3">Produk Dibeli</p>
                {selectedSale.products.length === 0 ? (
                  <p className="text-sm text-gray-500">Rincian item tidak tersedia.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSale.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.qty} x {formatRupiah(product.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatRupiah(product.subtotal ?? product.qty * product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">Total Item</p>
                  <p className="font-semibold text-gray-900">{selectedSale.items} item</p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="font-bold text-gray-900">Total Pembayaran</p>
                  <p className="font-bold text-blue-600">{formatRupiah(selectedSale.total)}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerSalesPage;
