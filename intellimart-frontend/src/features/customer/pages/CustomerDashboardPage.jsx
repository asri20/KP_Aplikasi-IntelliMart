import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@features/auth/hooks';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const CustomerDashboardPage = () => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const transactionsQuery = useQuery({
    queryKey: ['customer-my-transactions', user?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get('/transactions');
      return data?.data ?? [];
    },
  });

  const transactions = transactionsQuery.data ?? [];

  const stats = useMemo(() => {
    const totalSpent = transactions.reduce(
      (s, t) => s + Number(t.total_price ?? 0),
      0
    );
    return {
      totalOrders: transactions.length,
      totalSpent,
      points: Math.floor(totalSpent / 10000),
    };
  }, [transactions]);

  const handleLogout = async () => {
    try {
      await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      /* ignore */
    }
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFFDFC] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Kustomer — {user?.name || 'Kustomer'}
            </h1>
            <p className="text-sm text-slate-500">
              Menampilkan riwayat belanja khusus akun Anda ({user?.email}).
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            Keluar
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Transaksi Belanja</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {stats.totalOrders}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Belanja Saya</p>
            <h2 className="mt-1 text-2xl font-bold text-orange-600">
              {formatRupiah(stats.totalSpent)}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Estimasi Poin Loyalitas</p>
            <h2 className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.points} poin
            </h2>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">Riwayat Belanja Saya</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-50/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">No. Transaksi</th>
                  <th className="px-6 py-3">Toko</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Jumlah Item</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactionsQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Memuat riwayat belanja...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Anda belum memiliki riwayat transaksi belanja.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {t.invoice_no || `TRX-${String(t.id).padStart(4, '0')}`}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {t.store_name || `Toko #${t.store_id}`}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {t.total_items ?? 1} item
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {formatRupiah(t.total_price)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
