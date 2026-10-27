import { useMemo, useState } from 'react';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleSales = [
  {
    id: 1,
    transactionNumber: 'TRX-20261003-001',
    date: '03 Okt 2026, 09:15',
    cashier: 'Budi',
    total: 125000,
    status: 'LUNAS',
    paymentMethod: 'Cash',
    items: [
      {
        id: 1,
        name: 'Aqua 600ml',
        sku: 'PRD-001',
        qty: 5,
        price: 4000,
      },
      {
        id: 2,
        name: 'Indomie Goreng',
        sku: 'PRD-002',
        qty: 10,
        price: 3500,
      },
      {
        id: 3,
        name: 'Chitato',
        sku: 'PRD-004',
        qty: 2,
        price: 10000,
      },
    ],
  },
  {
    id: 2,
    transactionNumber: 'TRX-20261003-002',
    date: '03 Okt 2026, 10:30',
    cashier: 'Siti',
    total: 78500,
    status: 'LUNAS',
    paymentMethod: 'QRIS',
    items: [
      {
        id: 1,
        name: 'Kopi Kapal Api',
        sku: 'PRD-003',
        qty: 10,
        price: 2000,
      },
      {
        id: 2,
        name: 'Teh Botol Sosro',
        sku: 'PRD-005',
        qty: 7,
        price: 5000,
      },
      {
        id: 3,
        name: 'Chitato',
        sku: 'PRD-004',
        qty: 3,
        price: 10000,
      },
    ],
  },
  {
    id: 3,
    transactionNumber: 'TRX-20261003-003',
    date: '03 Okt 2026, 11:45',
    cashier: 'Budi',
    total: 210000,
    status: 'UNPAID',
    paymentMethod: '-',
    items: [
      {
        id: 1,
        name: 'Aqua 600ml',
        sku: 'PRD-001',
        qty: 10,
        price: 4000,
      },
      {
        id: 2,
        name: 'Indomie Goreng',
        sku: 'PRD-002',
        qty: 20,
        price: 3500,
      },
      {
        id: 3,
        name: 'Teh Botol Sosro',
        sku: 'PRD-005',
        qty: 28,
        price: 5000,
      },
    ],
  },
  {
    id: 4,
    transactionNumber: 'TRX-20261003-004',
    date: '03 Okt 2026, 13:20',
    cashier: 'Siti',
    total: 56000,
    status: 'LUNAS',
    paymentMethod: 'Debit',
    items: [
      {
        id: 1,
        name: 'Indomie Goreng',
        sku: 'PRD-002',
        qty: 8,
        price: 3500,
      },
      {
        id: 2,
        name: 'Aqua 600ml',
        sku: 'PRD-001',
        qty: 7,
        price: 4000,
      },
    ],
  },
  {
    id: 5,
    transactionNumber: 'TRX-20261003-005',
    date: '03 Okt 2026, 14:10',
    cashier: 'Budi',
    total: 142500,
    status: 'LUNAS',
    paymentMethod: 'QRIS',
    items: [
      {
        id: 1,
        name: 'Teh Botol Sosro',
        sku: 'PRD-005',
        qty: 15,
        price: 5000,
      },
      {
        id: 2,
        name: 'Kopi Kapal Api',
        sku: 'PRD-003',
        qty: 10,
        price: 2000,
      },
      {
        id: 3,
        name: 'Chitato',
        sku: 'PRD-004',
        qty: 5,
        price: 10000,
      },
    ],
  },
  {
    id: 6,
    transactionNumber: 'TRX-20261003-006',
    date: '03 Okt 2026, 15:05',
    cashier: 'Siti',
    total: 92500,
    status: 'UNPAID',
    paymentMethod: '-',
    items: [
      {
        id: 1,
        name: 'Aqua 600ml',
        sku: 'PRD-001',
        qty: 10,
        price: 4000,
      },
      {
        id: 2,
        name: 'Chitato',
        sku: 'PRD-004',
        qty: 5,
        price: 10000,
      },
      {
        id: 3,
        name: 'Indomie Goreng',
        sku: 'PRD-002',
        qty: 8,
        price: 3500,
      },
    ],
  },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const ManagerSalesPage = () => {
  const [sales] = useState(sampleSales);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Menyimpan transaksi yang sedang dilihat detailnya
  const [selectedSale, setSelectedSale] = useState(null);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        sale.transactionNumber.toLowerCase().includes(query) ||
        sale.cashier.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === 'Semua' || sale.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sales, searchQuery, selectedStatus]);

  const totalTransactions = sales.length;

  const paidTransactions = sales.filter(
    (sale) => sale.status === 'LUNAS'
  ).length;

  const unpaidTransactions = sales.filter(
    (sale) => sale.status === 'UNPAID'
  ).length;

  const totalRevenue = sales
    .filter((sale) => sale.status === 'LUNAS')
    .reduce((total, sale) => total + sale.total, 0);

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
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Penjualan
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Pantau transaksi dan penjualan toko kamu.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Transaksi */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Transaksi</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalTransactions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Transaksi hari ini
              </p>
            </div>

            {/* Pendapatan */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pendapatan</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatRupiah(totalRevenue)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Dari transaksi lunas
              </p>
            </div>

            {/* Lunas */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Transaksi Lunas</p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {paidTransactions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Pembayaran berhasil
              </p>
            </div>

            {/* Belum Lunas */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Belum Lunas</p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {unpaidTransactions}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Menunggu pembayaran
              </p>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Transaksi
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Riwayat transaksi penjualan toko.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                  {['Semua', 'LUNAS', 'UNPAID'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        selectedStatus === status
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'UNPAID'
                        ? 'Belum Lunas'
                        : status === 'LUNAS'
                          ? 'Lunas'
                          : 'Semua'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      No. Transaksi
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tanggal
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kasir
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {sale.transactionNumber}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {sale.date}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {sale.cashier}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatRupiah(sale.total)}
                        </td>

                        <td className="px-5 py-4">
                          {sale.status === 'LUNAS' ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Lunas
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                              Belum Lunas
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedSale(sale)}
                            className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center"
                      >
                        <p className="text-sm font-medium text-gray-500">
                          Tidak ada transaksi ditemukan.
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Coba ubah kata pencarian atau filter status.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Result Info */}
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="text-sm text-gray-500">
                Menampilkan{' '}
                <span className="font-semibold text-gray-900">
                  {filteredSales.length}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-gray-900">
                  {sales.length}
                </span>{' '}
                transaksi
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* ============================= */}
      {/* DETAIL TRANSACTION MODAL */}
      {/* ============================= */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-sm text-gray-500">
                  Detail Transaksi
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedSale.transactionNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Tutup detail transaksi"
              >
                ├ù
              </button>
            </div>

            {/* Transaction Information */}
            <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Tanggal
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSale.date}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Kasir
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSale.cashier}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Metode Pembayaran
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSale.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status
                </p>

                <div className="mt-1">
                  {selectedSale.status === 'LUNAS' ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Lunas
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Belum Lunas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="p-5 sm:p-6">
              <h3 className="text-base font-semibold text-gray-900">
                Produk Dibeli
              </h3>

              <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Produk
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Harga
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {selectedSale.items.map((item) => {
                        const subtotal = item.qty * item.price;

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {item.sku}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-600">
                              {item.qty}
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-600">
                              {formatRupiah(item.price)}
                            </td>

                            <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                              {formatRupiah(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-700">
                    Total Transaksi
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    {formatRupiah(selectedSale.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSalesPage;
