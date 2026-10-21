import { useMemo, useState } from 'react';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleDailySales = [
  {
    date: '28 Sep',
    transactions: 18,
    revenue: 1250000,
  },
  {
    date: '29 Sep',
    transactions: 24,
    revenue: 1680000,
  },
  {
    date: '30 Sep',
    transactions: 21,
    revenue: 1450000,
  },
  {
    date: '01 Okt',
    transactions: 29,
    revenue: 2135000,
  },
  {
    date: '02 Okt',
    transactions: 32,
    revenue: 2480000,
  },
  {
    date: '03 Okt',
    transactions: 38,
    revenue: 3125000,
  },
];

const sampleBestSellingProducts = [
  {
    id: 1,
    name: 'Indomie Goreng',
    sku: 'PRD-002',
    category: 'Makanan',
    quantity: 86,
    revenue: 301000,
  },
  {
    id: 2,
    name: 'Aqua 600ml',
    sku: 'PRD-001',
    category: 'Minuman',
    quantity: 72,
    revenue: 288000,
  },
  {
    id: 3,
    name: 'Teh Botol Sosro',
    sku: 'PRD-005',
    category: 'Minuman',
    quantity: 64,
    revenue: 320000,
  },
  {
    id: 4,
    name: 'Chitato',
    sku: 'PRD-004',
    category: 'Snack',
    quantity: 51,
    revenue: 510000,
  },
  {
    id: 5,
    name: 'Kopi Kapal Api',
    sku: 'PRD-003',
    category: 'Minuman',
    quantity: 45,
    revenue: 90000,
  },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const exportReport = ({
  dailySales,
  bestSellingProducts,
  totalRevenue,
  totalTransactions,
  averageTransaction,
  totalProductsSold,
}) => {
  const rows = [];

  // =========================
  // RINGKASAN
  // =========================
  rows.push(['LAPORAN PENJUALAN INTELLIMART']);
  rows.push([]);

  rows.push(['RINGKASAN']);
  rows.push(['Total Pendapatan', formatRupiah(totalRevenue)]);
  rows.push(['Total Transaksi', totalTransactions]);
  rows.push(['Rata-rata Transaksi', formatRupiah(averageTransaction)]);
  rows.push(['Produk Terjual', totalProductsSold]);
  rows.push([]);

  // =========================
  // PENJUALAN HARIAN
  // =========================
  rows.push(['PENJUALAN HARIAN']);
  rows.push(['Tanggal', 'Jumlah Transaksi', 'Pendapatan']);

  dailySales.forEach((item) => {
    rows.push([item.date, item.transactions, item.revenue]);
  });

  rows.push([]);

  // =========================
  // PRODUK TERLARIS
  // =========================
  rows.push(['PRODUK TERLARIS']);
  rows.push(['Produk', 'SKU', 'Kategori', 'Terjual', 'Pendapatan']);

  bestSellingProducts.forEach((product) => {
    rows.push([
      product.name,
      product.sku,
      product.category,
      product.quantity,
      product.revenue,
    ]);
  });

  // =========================
  // CSV GENERATOR
  // =========================
  const csvContent = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? '');

          // Escape tanda kutip agar CSV aman
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  // BOM supaya Excel membaca UTF-8 dengan benar
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `laporan-penjualan-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ManagerReportsPage = () => {
  const [dailySales] = useState(sampleDailySales);
  const [bestSellingProducts] = useState(sampleBestSellingProducts);

  const [period, setPeriod] = useState('7hari');
  const [searchQuery, setSearchQuery] = useState('');

  const totalRevenue = dailySales.reduce(
    (total, item) => total + item.revenue,
    0
  );

  const totalTransactions = dailySales.reduce(
    (total, item) => total + item.transactions,
    0
  );

  const totalProductsSold = bestSellingProducts.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const averageTransaction =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const maxRevenue = Math.max(...dailySales.map((item) => item.revenue));

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return bestSellingProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [bestSellingProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <ManagerHeader
          onSearch={setSearchQuery}
          onNotificationClick={() => {
            console.log('Notification clicked');
          }}
          onProfileClick={() => {
            console.log('Profile clicked');
          }}
          onLogout={() => {
            console.log('Logout clicked');
          }}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Laporan
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Pantau performa penjualan dan produk toko.
                </p>
              </div>

              {/* Filter & Export */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-brand-500"
                >
                  <option value="7hari">7 Hari Terakhir</option>
                  <option value="30hari">30 Hari Terakhir</option>
                  <option value="bulan">Bulan Ini</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    exportReport({
                      dailySales,
                      bestSellingProducts,
                      totalRevenue,
                      totalTransactions,
                      averageTransaction,
                      totalProductsSold,
                    })
                  }
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Export Laporan
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Revenue */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Pendapatan</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatRupiah(totalRevenue)}
              </p>

              <p className="mt-1 text-xs text-gray-400">Dari transaksi LUNAS</p>
            </div>

            {/* Transactions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Transaksi</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalTransactions}
              </p>

              <p className="mt-1 text-xs text-gray-400">Transaksi penjualan</p>
            </div>

            {/* Average */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Rata-rata Transaksi</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatRupiah(averageTransaction)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Nilai rata-rata per transaksi
              </p>
            </div>

            {/* Products Sold */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Produk Terjual</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalProductsSold}
              </p>

              <p className="mt-1 text-xs text-gray-400">Total unit terjual</p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Penjualan Harian
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pendapatan penjualan berdasarkan hari.
              </p>
            </div>

            <div className="flex h-72 items-end gap-3 overflow-x-auto pb-8 sm:gap-5">
              {dailySales.map((item) => {
                const height =
                  maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                return (
                  <div
                    key={item.date}
                    className="flex h-full min-w-[52px] flex-1 flex-col items-center justify-end"
                  >
                    {/* Revenue Label */}
                    <span className="mb-2 whitespace-nowrap text-[10px] font-medium text-gray-500 sm:text-xs">
                      {formatRupiah(item.revenue).replace('Rp', 'Rp ')}
                    </span>

                    {/* Bar */}
                    <div className="flex h-52 w-full items-end justify-center">
                      <div
                        className="w-8 rounded-t-xl bg-brand-500 transition-all hover:bg-brand-600 sm:w-12"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${item.date}: ${formatRupiah(item.revenue)}`}
                      />
                    </div>

                    {/* Date */}
                    <span className="mt-3 text-xs font-medium text-gray-500">
                      {item.date}
                    </span>

                    {/* Transactions */}
                    <span className="mt-1 text-[10px] text-gray-400">
                      {item.transactions} transaksi
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Produk Terlaris
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Produk dengan jumlah penjualan tertinggi.
                  </p>
                </div>

                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari produk..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-500 sm:w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Produk
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      SKU
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kategori
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Terjual
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Pendapatan
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-brand-500">
                              {index + 1}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Produk terlaris
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.sku}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {product.quantity} unit
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatRupiah(product.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center">
                        <p className="text-sm font-medium text-gray-500">
                          Produk tidak ditemukan.
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Coba gunakan kata pencarian lain.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="text-sm text-gray-500">
                Menampilkan{' '}
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{' '}
                produk
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerReportsPage;
