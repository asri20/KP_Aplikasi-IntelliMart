import { useState } from 'react';
import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleCashiers = [
  {
    id: 1,
    name: 'Siti',
    username: 'siti.kasir',
    shift: '08:00 - 16:00',
    status: 'Aktif',
  },
  {
    id: 2,
    name: 'Budi',
    username: 'budi.kasir',
    shift: '16:00 - 00:00',
    status: 'Terjadwal',
  },
];

const sampleCashierActivities = [
  {
    id: 1,
    cashier: 'Siti',
    activity: 'Menyelesaikan transaksi',
    reference: 'TRX-20261003-025',
    time: '2 menit lalu',
  },
  {
    id: 2,
    cashier: 'Budi',
    activity: 'Login ke sistem',
    reference: null,
    time: '15 menit lalu',
  },
  {
    id: 3,
    cashier: 'Siti',
    activity: 'Menyelesaikan transaksi',
    reference: 'TRX-20261003-024',
    time: '21 menit lalu',
  },
  {
    id: 4,
    cashier: 'Budi',
    activity: 'Logout dari sistem',
    reference: null,
    time: '1 jam lalu',
  },
];

const ManagerDashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Statistik kasir
  const activeCashiers = sampleCashiers.filter(
    (cashier) => cashier.status === 'Aktif'
  ).length;

  const totalCashiers = sampleCashiers.length;

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

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard Manager
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Selamat datang kembali! Berikut ringkasan aktivitas toko hari ini.
            </p>
          </div>

          {/* Search Info */}
          {searchQuery && (
            <div className="mb-6 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              Kata pencarian: <strong>{searchQuery}</strong>
            </div>
          )}

          {/* ============================== */}
          {/* SUMMARY CARDS */}
          {/* ============================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Penjualan */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Penjualan Hari Ini</p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Rp 2.450.000
              </h2>

              <p className="mt-2 text-xs font-medium text-green-600">
                +12,5% dari kemarin
              </p>
            </div>

            {/* Transaksi */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Transaksi Hari Ini</p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">48</h2>

              <p className="mt-2 text-xs font-medium text-green-600">
                +8 transaksi
              </p>
            </div>

            {/* Produk Terjual */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Produk Terjual</p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">126</h2>

              <p className="mt-2 text-xs font-medium text-gray-500">
                Hari ini
              </p>
            </div>

            {/* Stok Menipis */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Menipis</p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">4</h2>

              <p className="mt-2 text-xs font-medium text-orange-600">
                Perlu diperhatikan
              </p>
            </div>
          </div>

          {/* ============================== */}
          {/* SALES CHART */}
          {/* ============================== */}

          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Penjualan Minggu Ini
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Ringkasan penjualan toko selama 7 hari terakhir.
              </p>
            </div>

            <div className="flex h-64 items-end justify-between gap-3 border-b border-gray-100 px-2">
              {[
                { day: 'Sen', value: 45 },
                { day: 'Sel', value: 60 },
                { day: 'Rab', value: 50 },
                { day: 'Kam', value: 72 },
                { day: 'Jum', value: 65 },
                { day: 'Sab', value: 90 },
                { day: 'Min', value: 78 },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-12 rounded-t-lg bg-brand-500 transition hover:bg-brand-600"
                    style={{ height: `${item.value}%` }}
                  />

                  <span className="text-xs text-gray-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ============================== */}
          {/* STAFF KASIR */}
          {/* ============================== */}

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Kasir Hari Ini */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Kasir Hari Ini
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Status kasir yang bertugas di toko.
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 px-3 py-2">
                  <p className="text-xs font-medium text-brand-500">
                    Aktif
                  </p>

                  <p className="text-lg font-bold text-brand-500">
                    {activeCashiers}/{totalCashiers}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {sampleCashiers.map((cashier) => (
                  <div
                    key={cashier.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-brand-500">
                        {cashier.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {cashier.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Shift {cashier.shift}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          cashier.status === 'Aktif'
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />

                      <span
                        className={`text-xs font-semibold ${
                          cashier.status === 'Aktif'
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {cashier.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Link ke Staff */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <a
                  href="/manager/staff"
                  className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
                >
                  Lihat semua kasir →
                </a>
              </div>
            </section>

            {/* Aktivitas Kasir */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Aktivitas Kasir Terbaru
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Aktivitas terbaru kasir di toko.
                </p>
              </div>

              <div className="space-y-4">
                {sampleCashierActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />

                      {activity.id !== sampleCashierActivities.length && (
                        <div className="mt-1 h-full w-px bg-gray-200" />
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="min-w-0 flex-1 pb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">
                          {activity.cashier}
                        </span>{' '}
                        {activity.activity}
                      </p>

                      {activity.reference && (
                        <p className="mt-1 text-xs font-medium text-brand-500">
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
            </section>
          </div>

          {/* ============================== */}
          {/* LOW STOCK */}
          {/* ============================== */}

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Stok Menipis
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Produk yang perlu segera diperhatikan.
                </p>
              </div>

              <a
                href="/manager/inventory"
                className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
              >
                Lihat inventory →
              </a>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Aqua 600ml',
                  stock: 5,
                  minimum: 5,
                  unit: 'botol',
                },
                {
                  name: 'Chitato',
                  stock: 4,
                  minimum: 5,
                  unit: 'pcs',
                },
                {
                  name: 'Indomie Goreng',
                  stock: 8,
                  minimum: 5,
                  unit: 'pcs',
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Minimum stok: {product.minimum} {product.unit}
                    </p>
                  </div>

                  <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                    {product.stock} {product.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;

