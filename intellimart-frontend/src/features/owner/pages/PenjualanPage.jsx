import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { OwnerSidebar, OwnerHeader } from '@features/owner/components/organisms';
import { useStores } from '@features/owner/hooks';
import { axiosClient } from '@shared/lib/api/axiosClient';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const PenjualanPage = () => {
  const { data: stores = [] } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const transactionsQuery = useQuery({
    queryKey: ['owner-transactions', selectedStoreId],
    queryFn: async () => {
      const params = selectedStoreId ? { store_id: selectedStoreId } : {};
      const { data } = await axiosClient.get('/transactions', { params });
      return data?.data ?? [];
    },
  });

  const transactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (transactionsQuery.data ?? []).filter((t) => {
      if (!q) return true;
      const code = (t.invoice_no || `TRX-${t.id}`).toLowerCase();
      return (
        code.includes(q) ||
        String(t.store_name || '').toLowerCase().includes(q) ||
        String(t.cashier_name || '').toLowerCase().includes(q) ||
        String(t.customer_name || '').toLowerCase().includes(q)
      );
    });
  }, [transactionsQuery.data, search]);

  const totalRevenue = transactions
    .filter((t) =>
      ['LUNAS', 'PAID', 'SUCCESS'].includes(String(t.status || '').toUpperCase())
    )
    .reduce((sum, t) => sum + Number(t.total_price ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                  Transaksi Penjualan Toko Saya
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Menampilkan transaksi hanya dari toko-toko milik Anda.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari transaksi / kasir..."
                  className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm outline-none"
                />

                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="">Semua Toko Saya</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Jumlah Transaksi</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {transactions.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Pendapatan Lunas</p>
                <h2 className="mt-1 text-2xl font-bold text-emerald-600">
                  {formatRupiah(totalRevenue)}
                </h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-orange-50/50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">No. Transaksi</th>
                      <th className="px-6 py-4">Toko</th>
                      <th className="px-6 py-4">Waktu</th>
                      <th className="px-6 py-4">Kasir</th>
                      <th className="px-6 py-4">Pelanggan</th>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactionsQuery.isLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                          Memuat transaksi...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                          Belum ada transaksi pada toko Anda.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => {
                        const code =
                          t.invoice_no || `TRX-${String(t.id).padStart(4, '0')}`;
                        const status = String(t.status || 'PAID').toUpperCase();
                        return (
                          <tr key={t.id} className="hover:bg-orange-50/30">
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {code}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {t.store_name || `Toko #${t.store_id}`}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {t.created_at
                                ? new Date(t.created_at).toLocaleString('id-ID')
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {t.cashier_name || '-'}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {t.customer_name || 'Umum'}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {t.total_items ?? (t.items ? t.items.length : 1)} item
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {formatRupiah(t.total_price)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  ['LUNAS', 'PAID', 'SUCCESS'].includes(status)
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-amber-50 text-amber-600'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTx(t)}
                                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Detail Transaksi</h3>
                <p className="font-mono text-sm text-orange-600">
                  {selectedTx.invoice_no || `TRX-${String(selectedTx.id).padStart(4, '0')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Toko</p>
                <p className="font-semibold text-slate-900">
                  {selectedTx.store_name || `Toko #${selectedTx.store_id}`}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Waktu</p>
                <p className="font-semibold text-slate-900">
                  {selectedTx.created_at
                    ? new Date(selectedTx.created_at).toLocaleString('id-ID')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Kasir</p>
                <p className="font-semibold text-slate-900">{selectedTx.cashier_name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Pelanggan</p>
                <p className="font-semibold text-slate-900">
                  {selectedTx.customer_name || 'Umum'}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-3 font-semibold text-slate-900">Produk Dibeli</p>
              {!selectedTx.items || selectedTx.items.length === 0 ? (
                <p className="text-sm text-slate-500">Rincian item tidak tersedia.</p>
              ) : (
                <div className="space-y-2">
                  {selectedTx.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.qty} x {formatRupiah(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatRupiah(item.subtotal ?? item.qty * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-600">{formatRupiah(selectedTx.total_price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenjualanPage;
