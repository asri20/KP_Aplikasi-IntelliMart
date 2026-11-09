import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@features/auth/hooks';
import {
  OwnerSidebar,
  OwnerHeader,
  SalesChart,
  CategoryChart,
} from '@features/owner/components/organisms';
import {
  DashboardCard,
  ProductList,
  TransactionTable,
} from '@features/owner/components/molecules';
import { useStores } from '@features/owner/hooks';

import {
  getDashboardSummary,
  getProductCatalog,
  getRecentTransactions,
  getSalesTrend,
  getTopProducts,
} from '../services/dashboardService';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: stores = [], isLoading: storesLoading } = useStores();

  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!selectedStoreId && stores.length > 0) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const activeStore = stores.find((s) => Number(s.id) === Number(selectedStoreId)) || stores[0];
  const storeId = activeStore?.id ?? null;

  const summaryQuery = useQuery({
    queryKey: ['owner-dashboard-summary', storeId],
    queryFn: () => getDashboardSummary(storeId),
    enabled: Boolean(storeId),
  });

  const topProductsQuery = useQuery({
    queryKey: ['owner-dashboard-top-products', storeId],
    queryFn: () => getTopProducts(storeId, 5),
    enabled: Boolean(storeId),
  });

  const recentTrxQuery = useQuery({
    queryKey: ['owner-dashboard-recent-trx', storeId],
    queryFn: () => getRecentTransactions(storeId, 5),
    enabled: Boolean(storeId),
  });

  const trendQuery = useQuery({
    queryKey: ['owner-dashboard-sales-trend', storeId, days],
    queryFn: () => getSalesTrend(storeId, days),
    enabled: Boolean(storeId),
  });

  const catalogQuery = useQuery({
    queryKey: ['owner-dashboard-catalog', storeId],
    queryFn: () => getProductCatalog(storeId),
    enabled: Boolean(storeId),
  });

  const summary = summaryQuery.data;
  const catalog = catalogQuery.data ?? [];
  const totalProductsInStore = activeStore?.totalProduk ?? catalog.length;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            {/* Greeting & Pemilih Toko */}
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                  👋 Selamat datang, {user?.name || 'Owner'}!
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {activeStore
                    ? `Ringkasan aktivitas toko "${activeStore.name}" milik Anda.`
                    : 'Berikut ringkasan aktivitas toko Anda hari ini.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {stores.length > 0 && (
                  <select
                    value={storeId ?? ''}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        🏪 {s.name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                  📅 {todayFormatted}
                </div>
              </div>
            </div>

            {!storesLoading && stores.length === 0 && (
              <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/60 p-6 text-sm text-slate-700">
                Anda belum memiliki toko terdaftar. Silakan buat toko pertama Anda di menu{' '}
                <a href="/toko-saya" className="font-bold text-orange-600 underline">
                  Toko Saya
                </a>{' '}
                agar statistik penjualan dan stok tampil di sini.
              </div>
            )}

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                icon="🛒"
                title="Penjualan Hari Ini"
                value={formatRupiah(summary?.today_revenue ?? 0)}
                description={`Total pendapatan: ${formatRupiah(summary?.total_revenue ?? 0)}`}
                variant="orange"
              />

              <DashboardCard
                icon="📦"
                title="Total Produk Toko"
                value={String(totalProductsInStore)}
                description={`${summary?.total_products_sold ?? 0} item terjual`}
                variant="yellow"
              />

              <DashboardCard
                icon="⚠️"
                title="Stok Menipis"
                value={String(summary?.low_stock_count ?? 0)}
                description={
                  (summary?.low_stock_count ?? 0) > 0
                    ? 'Perlu perhatian'
                    : 'Stok aman'
                }
                variant="red"
              />

              <DashboardCard
                icon="👥"
                title="Total Transaksi"
                value={String(summary?.total_transactions_lunas ?? 0)}
                description={`Hari ini: ${summary?.today_transactions ?? 0} transaksi`}
                variant="purple"
              />
            </div>

            {/* Dashboard Content */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <SalesChart
                trend={trendQuery.data ?? []}
                days={days}
                onChangeDays={setDays}
              />
              <CategoryChart catalog={catalog} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <ProductList products={topProductsQuery.data ?? []} />
              <TransactionTable transactions={recentTrxQuery.data ?? []} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
