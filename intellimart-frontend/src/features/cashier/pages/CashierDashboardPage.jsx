import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@features/auth/hooks';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const CashierDashboardPage = () => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPosOpen, setIsPosOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [cart, setCart] = useState([]);
  const [saleType, setSaleType] = useState('RETAIL');
  const [submitting, setSubmitting] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ['cashier-my-transactions', user?.id],
    queryFn: async () => {
      const { data } = await axiosClient.get('/transactions');
      return data?.data ?? [];
    },
  });

  const stocksQuery = useQuery({
    queryKey: ['cashier-pos-stocks'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/stocks');
      return data?.data ?? [];
    },
  });

  const transactions = transactionsQuery.data ?? [];
  const stocks = stocksQuery.data ?? [];

  const stats = useMemo(() => {
    const settled = transactions.filter((t) =>
      ['LUNAS', 'PAID', 'SUCCESS'].includes(String(t.status || '').toUpperCase())
    );
    const totalSales = settled.reduce((s, t) => s + Number(t.total_price ?? 0), 0);
    return {
      totalCount: transactions.length,
      settledCount: settled.length,
      totalSales,
    };
  }, [transactions]);

  const addToCart = (stockItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.variant_id === stockItem.variant_id && c.store_id === stockItem.store_id
      );
      if (existing) {
        return prev.map((c) =>
          c.variant_id === stockItem.variant_id && c.store_id === stockItem.store_id
            ? { ...c, qty: Math.min(c.qty + 1, Number(stockItem.stock || 99)) }
            : c
        );
      }
      return [
        ...prev,
        {
          store_id: stockItem.store_id,
          store_name: stockItem.store_name,
          variant_id: stockItem.variant_id,
          name: stockItem.product_name
            ? stockItem.variant_name && stockItem.variant_name !== stockItem.product_name
              ? `${stockItem.product_name} (${stockItem.variant_name})`
              : stockItem.product_name
            : stockItem.variant_name || `Varian #${stockItem.variant_id}`,
          price: Number(stockItem.base_price || 0),
          qty: 1,
          maxStock: Number(stockItem.stock || 0),
        },
      ];
    });
  };

  const updateCartQty = (variantId, storeId, qty) => {
    if (qty <= 0) {
      setCart((prev) =>
        prev.filter((c) => !(c.variant_id === variantId && c.store_id === storeId))
      );
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.variant_id === variantId && c.store_id === storeId ? { ...c, qty } : c
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    try {
      const storeId = cart[0].store_id || 1;
      await axiosClient.post('/transactions/checkout', {
        cashier_id: user?.id,
        store_id: storeId,
        sale_type: saleType,
        total_price: cartTotal,
        status: 'PAID',
        items: cart.map((c) => ({
          product_id: c.variant_id,
          qty: c.qty,
          price: c.price,
        })),
      });
      setCart([]);
      setIsPosOpen(false);
      queryClient.invalidateQueries({ queryKey: ['cashier-my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-pos-stocks'] });
    } catch (err) {
      alert(err?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Kasir — {user?.name || 'Kasir'}
            </h1>
            <p className="text-sm text-slate-500">
              Menampilkan hanya transaksi yang Anda layani.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPosOpen(true)}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              + Transaksi Baru (POS)
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
            >
              Keluar
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Transaksi Saya</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {stats.totalCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Transaksi Lunas</p>
            <h2 className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.settledCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Penjualan Saya</p>
            <h2 className="mt-1 text-2xl font-bold text-orange-600">
              {formatRupiah(stats.totalSales)}
            </h2>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">Riwayat Transaksi Saya</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-50/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">No. Transaksi</th>
                  <th className="px-6 py-3">Toko</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactionsQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Memuat transaksi...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Belum ada transaksi yang Anda layani.
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
                        {t.customer_name || 'Umum'}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {formatRupiah(t.total_price)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTx(t)}
                          className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100"
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
        </section>
      </div>

      {/* POS Modal */}
      {isPosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Kasir POS — Transaksi Baru</h3>
              <button
                type="button"
                onClick={() => setIsPosOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-700">Pilih Produk Tersedia</h4>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {stocks
                    .filter((s) => Number(s.stock || 0) > 0)
                    .map((s) => (
                      <div
                        key={`${s.store_id}-${s.variant_id}`}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-orange-50/40"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {s.product_name || s.variant_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.store_name} • Stok: {s.stock} • {formatRupiah(s.base_price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(s)}
                          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                        >
                          + Tambah
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <form onSubmit={handleCheckout} className="flex flex-col justify-between">
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-700">Keranjang Belanja</h4>
                  {cart.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      Keranjang masih kosong.
                    </p>
                  ) : (
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={`${item.store_id}-${item.variant_id}`}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {formatRupiah(item.price)} x {item.qty}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQty(item.variant_id, item.store_id, item.qty - 1)
                              }
                              className="h-7 w-7 rounded-lg bg-white font-bold text-slate-700 shadow-sm"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-semibold">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQty(
                                  item.variant_id,
                                  item.store_id,
                                  Math.min(item.qty + 1, item.maxStock)
                                )
                              }
                              className="h-7 w-7 rounded-lg bg-white font-bold text-slate-700 shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tipe Penjualan</span>
                    <select
                      value={saleType}
                      onChange={(e) => setSaleType(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    >
                      <option value="RETAIL">RETAIL</option>
                      <option value="WHOLESALE">GROSIR (WHOLESALE)</option>
                    </select>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-lg font-bold">
                    <span>Total Bayar</span>
                    <span className="text-orange-600">{formatRupiah(cartTotal)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {submitting ? 'Memproses...' : 'Bayar & Simpan Transaksi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
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

            <div className="space-y-2">
              {(selectedTx.items || []).map((item, idx) => (
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

export default CashierDashboardPage;
