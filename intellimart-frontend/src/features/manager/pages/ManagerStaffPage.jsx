import { useMemo, useState } from 'react';
import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleCashiers = [
  {
    id: 1,
    name: 'Siti',
    username: 'siti.kasir',
    shift: '08:00 - 16:00',
    status: 'Aktif',
    transactions: 24,
    totalSales: 1250000,
    lastActivity: '2 menit lalu',
    activities: [
      {
        id: 1,
        activity: 'Menyelesaikan transaksi',
        reference: 'TRX-20261003-025',
        time: '2 menit lalu',
      },
      {
        id: 2,
        activity: 'Menyelesaikan transaksi',
        reference: 'TRX-20261003-024',
        time: '21 menit lalu',
      },
      {
        id: 3,
        activity: 'Login ke sistem',
        reference: null,
        time: '5 jam lalu',
      },
    ],
  },
  {
    id: 2,
    name: 'Budi',
    username: 'budi.kasir',
    shift: '16:00 - 00:00',
    status: 'Terjadwal',
    transactions: 18,
    totalSales: 980000,
    lastActivity: '15 menit lalu',
    activities: [
      {
        id: 1,
        activity: 'Login ke sistem',
        reference: null,
        time: '15 menit lalu',
      },
      {
        id: 2,
        activity: 'Logout dari sistem',
        reference: null,
        time: '1 jam lalu',
      },
      {
        id: 3,
        activity: 'Menyelesaikan transaksi',
        reference: 'TRX-20261003-018',
        time: '2 jam lalu',
      },
    ],
  },
  {
    id: 3,
    name: 'Andi',
    username: 'andi.kasir',
    shift: '08:00 - 16:00',
    status: 'Offline',
    transactions: 31,
    totalSales: 1675000,
    lastActivity: '2 jam lalu',
    activities: [
      {
        id: 1,
        activity: 'Logout dari sistem',
        reference: null,
        time: '2 jam lalu',
      },
      {
        id: 2,
        activity: 'Menyelesaikan transaksi',
        reference: 'TRX-20261003-012',
        time: '2 jam lalu',
      },
      {
        id: 3,
        activity: 'Login ke sistem',
        reference: null,
        time: '8 jam lalu',
      },
    ],
  },
];

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const statusClass = {
  Aktif: 'bg-green-50 text-green-600',
  Terjadwal: 'bg-blue-50 text-blue-600',
  Offline: 'bg-gray-100 text-gray-500',
};

const statusDotClass = {
  Aktif: 'bg-green-500',
  Terjadwal: 'bg-blue-500',
  Offline: 'bg-gray-400',
};

const ManagerStaffPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedCashier, setSelectedCashier] = useState(null);

  const filteredCashiers = useMemo(() => {
    return sampleCashiers.filter((cashier) => {
      const keyword = searchQuery.toLowerCase().trim();

      const matchesSearch =
        cashier.name.toLowerCase().includes(keyword) ||
        cashier.username.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || cashier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalCashiers = sampleCashiers.length;

  const activeCashiers = sampleCashiers.filter(
    (cashier) => cashier.status === 'Aktif'
  ).length;

  const scheduledCashiers = sampleCashiers.filter(
    (cashier) => cashier.status === 'Terjadwal'
  ).length;

  const offlineCashiers = sampleCashiers.filter(
    (cashier) => cashier.status === 'Offline'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <ManagerHeader
          onSearch={(value) => setSearchQuery(value)}
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

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Staff Kasir
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Daftar kasir yang bekerja di toko Anda.
            </p>
          </div>

          {/* ============================== */}
          {/* SUMMARY CARDS */}
          {/* ============================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Kasir</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalCashiers}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Kasir di toko
              </p>
            </div>

            {/* Aktif */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Sedang Aktif</p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {activeCashiers}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Sedang bertugas
              </p>
            </div>

            {/* Terjadwal */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Terjadwal</p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {scheduledCashiers}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Shift berikutnya
              </p>
            </div>

            {/* Offline */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Offline</p>

              <p className="mt-2 text-2xl font-bold text-gray-700">
                {offlineCashiers}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Tidak sedang aktif
              </p>
            </div>
          </div>

          {/* ============================== */}
          {/* FILTER */}
          {/* ============================== */}

          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nama atau username kasir..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {['Semua', 'Aktif', 'Terjadwal', 'Offline'].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        statusFilter === status
                          ? 'bg-brand-500 text-white'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          {/* ============================== */}
          {/* CASHIER TABLE */}
          {/* ============================== */}

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Kasir
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {filteredCashiers.length} kasir ditampilkan
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kasir
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Shift
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Transaksi
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Penjualan
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCashiers.map((cashier) => (
                    <tr
                      key={cashier.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      {/* Kasir */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-brand-500">
                            {cashier.name.charAt(0)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {cashier.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              @{cashier.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {cashier.shift}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusClass[cashier.status]
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              statusDotClass[cashier.status]
                            }`}
                          />

                          {cashier.status}
                        </span>
                      </td>

                      {/* Transactions */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">
                          {cashier.transactions}
                        </p>
                      </td>

                      {/* Sales */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">
                          {formatRupiah(cashier.totalSales)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCashier(cashier)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-500"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredCashiers.map((cashier) => (
                <div key={cashier.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-brand-500">
                        {cashier.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {cashier.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          @{cashier.username}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusClass[cashier.status]
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          statusDotClass[cashier.status]
                        }`}
                      />

                      {cashier.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">Shift</p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {cashier.shift}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">Transaksi</p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {cashier.transactions}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Total penjualan
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatRupiah(cashier.totalSales)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCashier(cashier)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-500"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCashiers.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  🔍
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  Kasir tidak ditemukan
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Coba ubah kata pencarian atau filter status.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ============================== */}
      {/* DETAIL MODAL */}
      {/* ============================== */}

      {selectedCashier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedCashier(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-brand-500">
                  {selectedCashier.name.charAt(0)}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedCashier.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    @{selectedCashier.username}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCashier(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">
              {/* Status + Shift */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Status</p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusClass[selectedCashier.status]
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          statusDotClass[selectedCashier.status]
                        }`}
                      />

                      {selectedCashier.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Shift</p>

                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {selectedCashier.shift}
                  </p>
                </div>
              </div>

              {/* Performance */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400">
                    Transaksi Hari Ini
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {selectedCashier.transactions}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400">
                    Total Penjualan
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatRupiah(selectedCashier.totalSales)}
                  </p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Aktivitas Terbaru
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Aktivitas terakhir dilakukan oleh kasir.
                </p>

                <div className="mt-4 space-y-4">
                  {selectedCashier.activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />

                        {index !==
                          selectedCashier.activities.length - 1 && (
                          <div className="mt-1 h-full w-px bg-gray-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-3">
                        <p className="text-sm text-gray-700">
                          {activity.activity}
                        </p>

                        {activity.reference && (
                          <p className="mt-1 text-xs font-semibold text-brand-500">
                            {activity.reference}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-5 py-4 text-right sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedCashier(null)}
                className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
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

export default ManagerStaffPage;
