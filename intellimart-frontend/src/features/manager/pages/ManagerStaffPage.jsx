import { useState, useEffect, useCallback } from 'react';
import { ManagerHeader } from '../components/ManagerHeader';
import { axiosClient as apiClient } from '@shared/lib/api/axiosClient';

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));

export function ManagerStaffPage() {
  const [store, setStore] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const storeRes = await apiClient.get('/stores');
      const stores = storeRes?.data?.data || [];
      const myStore = stores[0] || null;
      setStore(myStore);

      const [txRes, cashierRes] = await Promise.all([
        apiClient.get('/transactions', {
          params: myStore ? { store_id: myStore.id } : {},
        }),
        apiClient.get('/users/cashiers').catch(() => ({ data: { data: [] } })),
      ]);

      const txs = txRes?.data?.data || [];
      const userCashiers = cashierRes?.data?.data || [];

      const byCashier = new Map();

      for (const c of userCashiers) {
        byCashier.set(Number(c.id), {
          id: c.id,
          name: c.name || `Kasir #${c.id}`,
          email: c.email || '-',
          phone: c.phone || '-',
          shift: Number(c.id) % 2 === 1 ? 'Pagi (08:00 - 16:00)' : 'Siang (14:00 - 22:00)',
          status: Number(c.is_active) === 1 ? 'Aktif' : 'Offline',
          todayTransactions: 0,
          todaySales: 0,
          lastActive: 'Belum ada transaksi',
          activities: [],
        });
      }

      for (const tx of txs) {
        const cId = Number(tx.cashier_id || 0);
        if (!cId) continue;
        const dt = tx.created_at ? new Date(tx.created_at) : null;
        const timeStr = dt
          ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-';
        const dateTimeStr = dt ? dt.toLocaleString('id-ID') : '-';

        const existing = byCashier.get(cId) || {
          id: cId,
          name: tx.cashier_name || `Kasir #${cId}`,
          email: `kasir${cId}@intellimart.com`,
          phone: '-',
          shift: cId % 2 === 1 ? 'Pagi (08:00 - 16:00)' : 'Siang (14:00 - 22:00)',
          status: 'Aktif',
          todayTransactions: 0,
          todaySales: 0,
          lastActive: dateTimeStr,
          activities: [],
        };

        existing.todayTransactions += 1;
        existing.todaySales += Number(tx.total_price || 0);
        if (existing.lastActive === 'Belum ada transaksi') {
          existing.lastActive = dateTimeStr;
        }
        if (existing.activities.length < 8) {
          existing.activities.push({
            time: timeStr,
            action: `Transaksi INV-${String(tx.id).padStart(5, '0')} - ${formatRupiah(tx.total_price)}`,
            type: 'sale',
          });
        }
        byCashier.set(cId, existing);
      }

      setCashiers(Array.from(byCashier.values()));
    } catch {
      setCashiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handleAddCashier = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role_name: 'Cashier',
      });
      setForm({ name: '', email: '', phone: '', password: '' });
      setIsAddModalOpen(false);
      await loadStaffData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal membuat akun Kasir.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCashiers = cashiers.filter((cashier) => {
    const matchesSearch =
      cashier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashier.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || cashier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = cashiers.filter((c) => c.status === 'Aktif').length;
  const scheduledCount = cashiers.filter((c) => c.status === 'Terjadwal').length;
  const offlineCount = cashiers.filter((c) => c.status === 'Offline').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Terjadwal':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Offline':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'login':
        return '🔓';
      case 'logout':
        return '🔒';
      case 'break':
        return '☕';
      default:
        return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <ManagerHeader
        title="Monitor Kasir"
        subtitle={
          store
            ? `Pantau aktivitas dan performa kasir toko ${store.store_name}`
            : 'Pantau aktivitas dan performa kasir toko'
        }
      />

      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Kasir</p>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{cashiers.length}</p>
            <p className="text-xs text-gray-500 mt-1">Staff kasir</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Sedang Aktif</p>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-green-600 mt-1">Bertugas sekarang</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Terjadwal</p>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
            <p className="text-xs text-blue-600 mt-1">Shift berikutnya</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Offline</p>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{offlineCount}</p>
            <p className="text-xs text-gray-500 mt-1">Tidak bertugas</p>
          </div>
        </div>

        {/* Filters + Add Cashier */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama atau email kasir..."
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
              <option value="Aktif">Aktif</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Offline">Offline</option>
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kasir
            </button>
          </div>
        </div>

        {/* Cashiers Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kasir</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaksi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Penjualan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Memuat data kasir...
                    </td>
                  </tr>
                ) : (
                  filteredCashiers.map((cashier) => (
                    <tr key={cashier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {cashier.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cashier.name}</p>
                            <p className="text-xs text-gray-500">{cashier.lastActive}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{cashier.email}</p>
                        <p className="text-xs text-gray-500">{cashier.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{cashier.shift}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{cashier.todayTransactions} transaksi</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{formatRupiah(cashier.todaySales)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            cashier.status
                          )}`}
                        >
                          {cashier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCashier(cashier)}
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
          {!loading && filteredCashiers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada kasir ditemukan</p>
            </div>
          )}
        </div>

        {/* Cashiers Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredCashiers.map((cashier) => (
            <div key={cashier.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {cashier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{cashier.name}</h3>
                    <p className="text-xs text-gray-500">{cashier.lastActive}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    cashier.status
                  )}`}
                >
                  {cashier.status}
                </span>
              </div>

              <div className="space-y-2 mb-3 text-sm pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Shift:</span>
                  <span className="font-medium text-gray-900">{cashier.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaksi:</span>
                  <span className="font-semibold text-gray-900">{cashier.todayTransactions} transaksi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Penjualan:</span>
                  <span className="font-bold text-blue-600">{formatRupiah(cashier.todaySales)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCashier(cashier)}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
              >
                Lihat Aktivitas
              </button>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Add Cashier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tambah Kasir Baru</h3>
            <form onSubmit={handleAddCashier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kasir</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Siti Rahma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="siti@intellimart.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCashier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {selectedCashier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedCashier.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCashier.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCashier(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      selectedCashier.status
                    )}`}
                  >
                    {selectedCashier.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Shift</p>
                  <p className="font-semibold text-gray-900">{selectedCashier.shift}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Transaksi</p>
                  <p className="font-bold text-gray-900">{selectedCashier.todayTransactions} transaksi</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Penjualan</p>
                  <p className="font-bold text-blue-600">{formatRupiah(selectedCashier.todaySales)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Aktivitas Terbaru</h4>
                {selectedCashier.activities.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada aktivitas transaksi tercatat.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCashier.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedCashier(null)}
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

export default ManagerStaffPage;
