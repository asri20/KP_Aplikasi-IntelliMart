import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { OwnerSidebar, OwnerHeader } from '@features/owner/components/organisms';
import { useStores } from '@features/owner/hooks';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

import {
  getDashboardSummary,
  getLowStock,
  getSalesTrend,
  getTopProducts,
} from '../services/dashboardService';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const LaporanPage = () => {
  const { data: stores = [] } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!selectedStoreId && stores.length > 0) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const activeStore =
    stores.find((s) => Number(s.id) === Number(selectedStoreId)) || stores[0];
  const storeId = activeStore?.id ?? null;

  const summaryQuery = useQuery({
    queryKey: ['owner-report-summary', storeId],
    queryFn: () => getDashboardSummary(storeId),
    enabled: Boolean(storeId),
  });

  const profitQuery = useQuery({
    queryKey: ['owner-report-profit', storeId],
    queryFn: async () => {
      const { data } = await axiosClient.get(ENDPOINTS.ANALYTICS.PROFIT(storeId));
      return data?.data ?? null;
    },
    enabled: Boolean(storeId),
  });

  const topProductsQuery = useQuery({
    queryKey: ['owner-report-top-products', storeId],
    queryFn: () => getTopProducts(storeId, 10),
    enabled: Boolean(storeId),
  });

  const lowStockQuery = useQuery({
    queryKey: ['owner-report-low-stock', storeId],
    queryFn: () => getLowStock(storeId),
    enabled: Boolean(storeId),
  });

  const trendQuery = useQuery({
    queryKey: ['owner-report-sales-trend', storeId, days],
    queryFn: () => getSalesTrend(storeId, days),
    enabled: Boolean(storeId),
  });

  const summary = summaryQuery.data;
  const profit = profitQuery.data;
  const topProducts = topProductsQuery.data ?? [];
  const lowStocks = lowStockQuery.data ?? [];
  const salesDaily = trendQuery.data ?? [];

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
                  Laporan & Analitik Toko
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Laporan pendapatan, laba kotor, produk terlaris, dan stok menipis per toko Anda.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {stores.length > 0 && (
                  <select
                    value={storeId ?? ''}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        🏪 {s.name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
                >
                  <option value={7}>7 Hari Terakhir</option>
                  <option value={30}>30 Hari Terakhir</option>
                  <option value={90}>90 Hari Terakhir</option>
                </select>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Pendapatan</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {formatRupiah(summary?.total_revenue ?? 0)}
                </h2>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Estimasi Laba (Margin)</p>
                <h2 className="mt-1 text-2xl font-bold text-emerald-600">
                  {formatRupiah(profit?.total_profit ?? 0)}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Margin: {profit?.profit_margin ?? '0%'}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Transaksi Lunas</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {summary?.total_transactions_lunas ?? 0}
                </h2>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Varian Stok Menipis</p>
                <h2 className="mt-1 text-2xl font-bold text-orange-600">
                  {lowStocks.length}
                </h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Penjualan Harian */}
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="font-bold text-slate-900">Rekap Penjualan Harian</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-orange-50/50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3">Transaksi</th>
                        <th className="px-6 py-3">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesDaily.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                            Belum ada data penjualan harian.
                          </td>
                        </tr>
                      ) : (
                        salesDaily.map((d, i) => (
                          <tr key={i}>
                            <td className="px-6 py-3 font-medium text-slate-800">
                              {d.sales_date
                                ? new Date(d.sales_date).toLocaleDateString('id-ID')
                                : '-'}
                            </td>
                            <td className="px-6 py-3 text-slate-600">
                              {d.total_transactions}
                            </td>
                            <td className="px-6 py-3 font-semibold text-slate-800">
                              {formatRupiah(d.total_revenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Produk Terlaris */}
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="font-bold text-slate-900">10 Produk Terlaris</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-orange-50/50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Produk</th>
                        <th className="px-6 py-3">Terjual</th>
                        <th className="px-6 py-3">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                            Belum ada data produk terlaris.
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((p, i) => (
                          <tr key={i}>
                            <td className="px-6 py-3 font-medium text-slate-800">
                              {p.product_name} ({p.variant_name})
                            </td>
                            <td className="px-6 py-3 text-slate-600">
                              {p.total_qty_sold} item
                            </td>
                            <td className="px-6 py-3 font-semibold text-slate-800">
                              {formatRupiah(p.total_revenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;

