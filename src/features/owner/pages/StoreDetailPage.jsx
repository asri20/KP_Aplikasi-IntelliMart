import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@shared/components/atoms';
import {
  OwnerSidebar,
  OwnerHeader,
} from '@features/owner/components/organisms';
import AddProductToStoreModal from '@features/owner/components/organisms/AddProductToStoreModal';
import { useStores } from '../hooks/useStores';
import { getInventoryStocks } from '../services/inventoryService';

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const StoreDetailPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const {
    data: stores = [],
    isLoading: storesLoading,
    isError: storesError,
    error: storesErrorDetail,
    refetch: refetchStores,
  } = useStores();

  const [stockRows, setStockRows] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const selectedStore = useMemo(
    () => stores.find((store) => String(store.id) === String(storeId)),
    [stores, storeId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadStocks = async () => {
      setStocksLoading(true);
      setStocksError('');
      setStockRows([]);

      if (!storeId || !/^\d+$/.test(storeId)) {
        setStocksError('ID toko tidak valid.');
        setStocksLoading(false);
        return;
      }

      try {
        const rows = await getInventoryStocks({ store_id: storeId });

        if (!cancelled) {
          // Hanya tampilkan baris stok milik toko yang sedang dibuka.
          const storeRows = (Array.isArray(rows) ? rows : []).filter(
            (row) => String(row.store_id) === String(storeId)
          );

          setStockRows(storeRows);
        }
      } catch (error) {
        if (!cancelled) {
          setStocksError(
            error?.response?.data?.message ||
              error?.message ||
              'Gagal mengambil data stok toko.'
          );
        }
      } finally {
        if (!cancelled) {
          setStocksLoading(false);
        }
      }
    };

    loadStocks();

    return () => {
      cancelled = true;
    };
  }, [storeId, reloadKey]);

  const retryStocks = () => {
    // Perubahan storeId tidak diperlukan; trigger ulang melalui state.
    setStocksError('');
    setStocksLoading(true);

    getInventoryStocks({ store_id: storeId })
      .then((rows) => {
        const storeRows = (Array.isArray(rows) ? rows : []).filter(
          (row) => String(row.store_id) === String(storeId)
        );
        setStockRows(storeRows);
      })
      .catch((error) => {
        setStocksError(
          error?.response?.data?.message ||
            error?.message ||
            'Gagal mengambil data stok toko.'
        );
      })
      .finally(() => setStocksLoading(false));
  };

  const totalStock = stockRows.reduce(
    (total, row) => total + Number(row.stock ?? 0),
    0
  );

  const totalValue = stockRows.reduce(
    (total, row) =>
      total + Number(row.stock ?? 0) * Number(row.base_price ?? 0),
    0
  );

  const pageLoading = storesLoading || stocksLoading;

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            <Button
              variant="outline"
              onClick={() => navigate('/toko-saya')}
            >
              ← Kembali ke Toko Saya
            </Button>

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  🏬
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedStore?.name ?? 'Detail Toko'}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedStore?.location || `ID Toko: ${storeId}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  + Tambah Produk ke Toko
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/inventory')}
                >
                  Kelola Inventaris →
                </Button>
              </div>
            </div>

            {storesError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {storesErrorDetail?.message || 'Gagal memuat informasi toko.'}
                <button
                  type="button"
                  onClick={() => refetchStores()}
                  className="ml-2 font-semibold underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {!storesLoading && !storesError && !selectedStore && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Toko tidak ditemukan pada daftar toko akun ini. Pastikan ID toko benar.
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                icon="📦"
                label="Jenis Produk di Toko"
                value={stockRows.length}
              />
              <SummaryCard
                icon="🧮"
                label="Total Unit Stok"
                value={totalStock.toLocaleString('id-ID')}
              />
              <SummaryCard
                icon="💰"
                label="Nilai Stok Berdasarkan Harga"
                value={formatRupiah(totalValue)}
              />
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
              <div className="border-b border-orange-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Produk dan Stok Toko
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Daftar hanya mencakup varian yang memiliki catatan stok di toko ini.
                </p>
              </div>

              {stocksError && (
                <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {stocksError}
                  <button
                    type="button"
                    onClick={retryStocks}
                    className="ml-2 font-semibold underline"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {pageLoading && (
                <p className="p-8 text-center text-sm text-slate-500">
                  Memuat data toko dan stok...
                </p>
              )}

              {!pageLoading && !stocksError && stockRows.length === 0 && (
                <div className="p-10 text-center">
                  <div className="text-4xl">📦</div>
                  <h3 className="mt-3 font-semibold text-slate-800">
                    Belum ada produk di toko ini
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tambahkan produk dari katalog Anda ke toko ini, atau kelola stok melalui inventaris.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      + Tambah Produk ke Toko
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/inventory')}
                    >
                      Buka Inventaris
                    </Button>
                  </div>
                </div>
              )}

              {!pageLoading && !stocksError && stockRows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="bg-orange-50/60 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4 font-semibold">No.</th>
                        <th className="px-5 py-4 font-semibold">Produk</th>
                        <th className="px-5 py-4 font-semibold">SKU</th>
                        <th className="px-5 py-4 font-semibold">Stok</th>
                        <th className="px-5 py-4 font-semibold">Harga Jual</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {stockRows.map((row, index) => (
                        <tr
                          key={`${row.store_id}-${row.variant_id}`}
                          className="transition hover:bg-orange-50/40"
                        >
                          <td className="px-5 py-4 text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">
                              {row.product_name || 'Produk tanpa nama'}
                            </p>
                            {row.variant_name && (
                              <p className="mt-1 text-xs text-slate-500">
                                {row.variant_name}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {row.sku || '-'}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`font-bold ${
                                Number(row.stock ?? 0) <= 10
                                  ? 'text-red-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {Number(row.stock ?? 0).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">
                            {formatRupiah(row.base_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>

          <AddProductToStoreModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            storeId={storeId}
            existingVariantIds={stockRows.map((row) => row.variant_id)}
            onSuccess={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
        {icon}
      </div>
    </div>
  </div>
);

export default StoreDetailPage;