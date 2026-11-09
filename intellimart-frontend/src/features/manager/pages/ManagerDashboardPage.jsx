import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@features/auth/hooks';
import {
  getDashboardStores,
  getDashboardSummary,
  getLowStock,
  getRecentTransactions,
  getSalesTrend,
} from '@features/owner/services/dashboardService';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const ManagerDashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const storesQuery = useQuery({
    queryKey: ['manager-stores', user?.id],
    queryFn: getDashboardStores,
  });

  const stores = storesQuery.data ?? [];

  useEffect(() => {
    if (!selectedStoreId && stores.length > 0) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const activeStore =
    stores.find((s) => Number(s.id) === Number(selectedStoreId)) || stores[0];
  const storeId = activeStore?.id ?? null;

  const summaryQuery = useQuery({
    queryKey: ['manager-summary', storeId],
    queryFn: () => getDashboardSummary(storeId),
    enabled: Boolean(storeId),
  });

  const trendQuery = useQuery({
    queryKey: ['manager-sales-trend', storeId],
    queryFn: () => getSalesTrend(storeId, 7),
    enabled: Boolean(storeId),
  });

  const lowStockQuery = useQuery({
    queryKey: ['manager-low-stock', storeId],
    queryFn: () => getLowStock(storeId),
    enabled: Boolean(storeId),
  });

  const recentTrxQuery = useQuery({
    queryKey: ['manager-recent-trx', storeId],
    queryFn: () => getRecentTransactions(storeId, 6),
    enabled: Boolean(storeId),
  });

  const summary = summaryQuery.data;
  const trend = trendQuery.data ?? [];
  const lowStocks = lowStockQuery.data ?? [];
  const recentTransactions = recentTrxQuery.data ?? [];

  const maxRev = Math.max(...trend.map((d) => Number(d.total_revenue || 0)), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerSidebar />

      <div className="lg:pl-64">
        <ManagerHeader onSearch={(value) => setSearchQuery(value)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Dashboard Manager — {user?.name || 'Manager'}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {activeStore
                  ? `Ringkasan operasional toko "${activeStore.store_name || activeStore.name}" hari ini.`
                  : 'Akun Manager Anda belum ditugaskan ke toko mana pun oleh Owner.'}
              </p>
            </div>
          </div>

          {searchQuery && (
            <div className="mb-6 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              Kata pencarian: <strong>{searchQuery}</strong>
            </div>
          )}

          {!storesQuery.isLoading && !activeStore && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Anda belum ditugaskan ke toko mana pun. Minta Owner untuk menugaskan Anda melalui menu{' '}
              <strong>Manajemen Manager</strong> atau <strong>Toko Saya</strong>.
            </div>
          )}

          {/* SUMMARY CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Penjualan Hari Ini</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatRupiah(summary?.today_revenue ?? 0)}
              </h2>
              <p className="mt-2 text-xs font-medium text-green-600">
                Total akumulasi: {formatRupiah(summary?.total_revenue ?? 0)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Transaksi Hari Ini</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {summary?.today_transactions ?? 0}
              </h2>
              <p className="mt-2 text-xs font-medium text-green-600">
                Total lunas: {summary?.total_transactions_lunas ?? 0} transaksi
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Produk Terjual</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {summary?.total_products_sold ?? 0}
              </h2>
              <p className="mt-2 text-xs font-medium text-gray-500">
                Item terjual di toko ini
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Menipis</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {summary?.low_stock_count ?? 0}
              </h2>
              <p className="mt-2 text-xs font-medium text-orange-600">
                {(summary?.low_stock_count ?? 0) > 0
                  ? 'Perlu diperhatikan'
                  : 'Semua stok aman'}
              </p>
            </div>
          </div>

          {/* SALES CHART */}
          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Penjualan 7 Hari Terakhir
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ringkasan penjualan harian toko yang Anda kelola.
              </p>
            </div>

            {trend.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                Belum ada riwayat penjualan dalam 7 hari terakhir.
              </p>
            ) : (
              <div className="flex h-64 items-end justify-between gap-3 border-b border-gray-100 px-2">
                {trend.map((item, idx) => {
                  const pct = Math.max(
                    8,
                    Math.round((Number(item.total_revenue || 0) / maxRev) * 100)
                  );
                  const label = item.sales_date
                    ? new Date(item.sales_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : `#${idx + 1}`;
                  return (
                    <div
                      key={`${label}-${idx}`}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        title={`${label}: ${formatRupiah(item.total_revenue)}`}
                        className="w-full max-w-12 rounded-t-lg bg-brand-500 transition hover:bg-brand-600"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-xs text-gray-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* TRANSAKSI TERBARU & STOK MENIPIS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Transaksi Terbaru Toko
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Aktivitas transaksi kasir terbaru di toko ini.
                  </p>
                </div>

                <Link
                  to="/manager/sales"
                  className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
                >
                  Lihat semua →
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Belum ada transaksi di toko ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((trx) => {
                    const code =
                      trx.invoice_no || `TRX-${String(trx.id).padStart(4, '0')}`;
                    return (
                      <div
                        key={trx.id || code}
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {code}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Kasir: {trx.cashier_name || '-'} • {trx.total_items ?? 1} item
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatRupiah(trx.total_price)}
                          </p>
                          <span className="text-xs font-medium text-green-600">
                            {trx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* LOW STOCK */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Stok Menipis
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Varian produk toko yang berada di bawah batas minimum.
                  </p>
                </div>

                <Link
                  to="/manager/inventory"
                  className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
                >
                  Lihat inventory →
                </Link>
              </div>

              {lowStocks.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Tidak ada produk dengan stok menipis.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStocks.slice(0, 6).map((item, idx) => (
                    <div
                      key={`${item.sku || idx}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.product_name} — {item.variant_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Minimum stok: {item.min_stock}
                        </p>
                      </div>

                      <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                        Sisa: {item.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
