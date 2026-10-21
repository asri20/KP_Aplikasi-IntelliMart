
import { useEffect, useMemo, useState } from 'react';
import { useStores } from '../hooks/useStores';
import {
  getInventoryVariants,
  getInventoryStocks,
  getInventoryMovements,
  createInventoryMovement,
} from '../services/inventoryService';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';
import useAuthStore from '@core/auth/authStore';

const tabs = [
  'Stok Produk',
  'Stok Masuk',
  'Stok Keluar',
  'Riwayat Pergerakan',
];

const getArray = (value) => (Array.isArray(value) ? value : []);

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapProduct = (variant, stockRows) => {
  const variantId = variant.id ?? variant.variant_id;

  const stockRow = stockRows.find(
    (row) => String(row.variant_id) === String(variantId)
  );

  return {
    id: String(variantId),
    variantId,
    stockRowExists: Boolean(stockRow),
    stockRowId: stockRow?.id ?? null,
    name:
      stockRow?.product_name ||
      variant.product_name ||
      variant.name ||
      'Produk tanpa nama',
    variantName:
      stockRow?.variant_name ||
      variant.variant_name ||
      variant.name ||
      '',
    sku: stockRow?.sku || variant.sku || '-',
    category:
      variant.category_name ||
      variant.category ||
      stockRow?.category_name ||
      'Umum',
    unit:
      variant.unit_name ||
      variant.unit ||
      stockRow?.unit_name ||
      'Unit',
    stock: Number(stockRow?.stock ?? 0),
    basePrice: Number(stockRow?.base_price ?? 0),
  };
};

const mapMovement = (movement, products) => {
  const product = products.find(
    (item) => String(item.variantId) === String(movement.variant_id)
  );

  const incoming = ['IN', 'ADJUSTMENT_IN'].includes(
    String(movement.movement_type).toUpperCase()
  );

  return {
    id: movement.id,
    type: incoming ? 'Masuk' : 'Keluar',
    movementType: movement.movement_type,
    variantId: movement.variant_id,
    product:
      movement.product_name ||
      movement.variant_name ||
      product?.name ||
      'Produk',
    qty: Number(movement.qty || 0),
    date: formatDate(movement.created_at),
    note: movement.note || '',
  };
};

const InventoryPage = () => {
  const {
    data: stores = [],
    isLoading: storesLoading,
    isError: storesError,
  } = useStores();

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [variants, setVariants] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [rawMovements, setRawMovements] = useState([]);
  const [activeTab, setActiveTab] = useState('Stok Produk');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua Kategori');
  const [modalType, setModalType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notice, setNotice] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  useEffect(() => {
    if (!stores.length) {
      setSelectedStoreId('');
      return;
    }

    setSelectedStoreId((currentId) => {
      const exists = stores.some(
        (store) => String(store.id) === String(currentId)
      );

      return exists ? currentId : String(stores[0].id);
    });
  }, [stores]);

  const loadInventory = async (storeId) => {
    if (!storeId) {
      setVariants([]);
      setStockRows([]);
      setRawMovements([]);
      return;
    }

    setLoadingInventory(true);
    setInventoryError('');

    try {
      const [variantResult, stockResult, movementResult] =
        await Promise.all([
          getInventoryVariants(),
          getInventoryStocks({ store_id: storeId }),
          getInventoryMovements({ store_id: storeId }),
        ]);

      setVariants(getArray(variantResult));
      setStockRows(getArray(stockResult));
      setRawMovements(getArray(movementResult));
    } catch (error) {
      console.error('Gagal memuat inventaris:', error);
      setVariants([]);
      setStockRows([]);
      setRawMovements([]);
      setInventoryError(
        error.response?.data?.message ||
          error.message ||
          'Gagal mengambil data inventaris dari server.'
      );
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (!selectedStoreId) {
      setVariants([]);
      setStockRows([]);
      setRawMovements([]);
      return;
    }

    setSearch('');
    setCategory('Semua Kategori');
    setActiveTab('Stok Produk');
    setModalType('');
    setSelectedProduct('');
    setQuantity('');
    setNotice('');

    loadInventory(selectedStoreId);
  }, [selectedStoreId]);

  const products = useMemo(() => {
    return variants.map((variant) => mapProduct(variant, stockRows));
  }, [variants, stockRows]);

  const movements = useMemo(() => {
    return rawMovements.map((movement) =>
      mapMovement(movement, products)
    );
  }, [rawMovements, products]);

  const selectedStore = stores.find(
    (store) => String(store.id) === String(selectedStoreId)
  );

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const incomingTotal = movements
    .filter((item) => item.type === 'Masuk')
    .reduce((sum, item) => sum + item.qty, 0);

  const outgoingTotal = movements
    .filter((item) => item.type === 'Keluar')
    .reduce((sum, item) => sum + item.qty, 0);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.variantName.toLowerCase().includes(query) ||
        String(product.sku).toLowerCase().includes(query);

      const matchesCategory =
        category === 'Semua Kategori' ||
        product.category === category;

      const productMovements = movements.filter(
        (movement) =>
          String(movement.variantId) === String(product.variantId)
      );

      const matchesTab =
        activeTab === 'Stok Produk' ||
        (activeTab === 'Stok Masuk' &&
          productMovements.some((movement) => movement.type === 'Masuk')) ||
        (activeTab === 'Stok Keluar' &&
          productMovements.some((movement) => movement.type === 'Keluar')) ||
        activeTab === 'Riwayat Pergerakan';

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [products, movements, search, category, activeTab]);

  const categories = useMemo(
    () => [
      'Semua Kategori',
      ...new Set(products.map((product) => product.category)),
    ],
    [products]
  );

  const openModal = (type, productId = '') => {
    if (!selectedStoreId) {
      setNotice('Pilih toko terlebih dahulu.');
      return;
    }

    if (products.length === 0) {
      setNotice('Belum ada varian produk yang tersedia.');
      return;
    }

    setModalType(type);
    setSelectedProduct(
      String(productId || products[0]?.variantId || '')
    );
    setQuantity('');
    setNotice('');
  };

  const closeModal = () => {
    if (saving) return;
    setModalType('');
    setNotice('');
  };

  const saveMovement = async (event) => {
    event.preventDefault();

    const qty = Number(quantity);
    const product = products.find(
      (item) => String(item.variantId) === String(selectedProduct)
    );

    const user = useAuthStore.getState().user;
    const createdBy = user?.id;

    if (!selectedStoreId) {
      setNotice('Pilih toko terlebih dahulu.');
      return;
    }

    if (!product || !Number.isInteger(qty) || qty <= 0) {
      setNotice('Pilih produk dan masukkan jumlah bilangan bulat yang valid.');
      return;
    }

    if (!createdBy) {
      setNotice('ID pengguna login tidak ditemukan. Silakan login kembali.');
      return;
    }

    if (modalType === 'Keluar' && qty > product.stock) {
      setNotice('Stok tidak mencukupi untuk transaksi ini.');
      return;
    }

    setSaving(true);
    setNotice('');

    try {
      // Baris stok harus ada sebelum movement dapat dibuat.
      if (!product.stockRowExists) {
        await axiosClient.post(ENDPOINTS.STOCK.CREATE, {
          store_id: Number(selectedStoreId),
          variant_id: Number(product.variantId),
          base_price: product.basePrice,
        });
      }

      await createInventoryMovement({
        store_id: Number(selectedStoreId),
        variant_id: Number(product.variantId),
        movement_type: modalType === 'Masuk' ? 'IN' : 'OUT',
        qty,
        reference_type: modalType === 'Masuk' ? 'INITIAL' : 'ADJUSTMENT',
        note: `Pencatatan stok ${modalType.toLowerCase()} melalui halaman inventaris`,
        created_by: Number(createdBy),
      });

      await loadInventory(selectedStoreId);

      setActiveTab(
        modalType === 'Masuk' ? 'Stok Masuk' : 'Stok Keluar'
      );
      setModalType('');
      setQuantity('');
      setNotice('');
    } catch (error) {
      console.error('Gagal mencatat pergerakan stok:', error);

      setNotice(
        error.response?.data?.message ||
          error.message ||
          'Gagal menyimpan pergerakan stok.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                📦
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Manajemen Stok
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Kelola persediaan dan pantau pergerakan stok toko.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <label
                htmlFor="inventory-store"
                className="mb-2 block font-semibold text-slate-700"
              >
                🏪 Pilih Toko
              </label>
              <select
                id="inventory-store"
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                disabled={storesLoading || stores.length === 0}
                className="w-full min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                {storesLoading ? (
                  <option value="">Memuat toko...</option>
                ) : stores.length === 0 ? (
                  <option value="">Belum ada toko</option>
                ) : (
                  stores.map((store) => (
                    <option key={store.id} value={String(store.id)}>
                      {store.name}
                    </option>
                  ))
                )}
              </select>
              {storesError && (
                <p className="mt-2 text-xs text-red-600">
                  Gagal memuat daftar toko.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="font-semibold text-slate-700">
                📅{' '}
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ringkasan persediaan
              </p>
            </div>
          </div>
        </div>

        {selectedStore && (
          <p className="text-sm text-slate-500">
            Toko yang dipilih:{' '}
            <span className="font-semibold text-slate-700">
              {selectedStore.name}
            </span>
          </p>
        )}

        {inventoryError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {inventoryError}
            <button
              type="button"
              onClick={() => loadInventory(selectedStoreId)}
              className="ml-3 font-semibold underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon="🛍️"
            label="Total Produk"
            value={products.length}
            detail="Jenis produk"
            color="blue"
          />
          <SummaryCard
            icon="📦"
            label="Total Stok"
            value={totalStock.toLocaleString('id-ID')}
            detail="Total unit tersedia"
            color="green"
          />
          <SummaryCard
            icon="↗️"
            label="Stok Masuk"
            value={incomingTotal.toLocaleString('id-ID')}
            detail="Unit dalam riwayat"
            color="orange"
          />
          <SummaryCard
            icon="↘️"
            label="Stok Keluar"
            value={outgoingTotal.toLocaleString('id-ID')}
            detail="Unit dalam riwayat"
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 sm:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 border-b-2 px-3 py-4 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeTab === 'Stok Produk'
                      ? 'Daftar Stok Produk'
                      : activeTab}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeTab === 'Stok Produk'
                      ? 'Lihat jumlah persediaan produk di toko Anda.'
                      : 'Pantau catatan pergerakan persediaan.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari produk atau SKU..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-56"
                  />
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingInventory && (
                <p className="mb-4 text-sm text-slate-500">
                  Memuat data inventaris...
                </p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="rounded-l-lg px-4 py-4 font-semibold">No</th>
                      <th className="px-4 py-4 font-semibold">Produk</th>
                      <th className="px-4 py-4 font-semibold">SKU</th>
                      <th className="px-4 py-4 font-semibold">Kategori</th>
                      <th className="px-4 py-4 font-semibold">Stok</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="rounded-r-lg px-4 py-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product, index) => (
                      <tr
                        key={product.variantId}
                        className="transition hover:bg-orange-50/40"
                      >
                        <td className="px-4 py-4 text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg">
                              🛒
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {product.name}
                              </p>
                              {product.variantName &&
                                product.variantName !== product.name && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    {product.variantName}
                                  </p>
                                )}
                              <p className="mt-1 text-xs text-slate-400">
                                Satuan: {product.unit}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {product.sku}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`font-bold ${
                              product.stock <= 10
                                ? 'text-red-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <span className="ml-1 text-xs text-slate-400">
                            {product.unit}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.stock <= 10
                                ? 'bg-red-50 text-red-600'
                                : product.stock <= 20
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {product.stock <= 10
                              ? 'Stok Rendah'
                              : product.stock <= 20
                                ? 'Perlu Dipantau'
                                : 'Tersedia'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openModal('Masuk', product.variantId)
                              }
                              className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                            >
                              + Masuk
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openModal('Keluar', product.variantId)
                              }
                              className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                            >
                              − Keluar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loadingInventory && filteredProducts.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="text-3xl">🔎</div>
                    <p className="mt-3 font-semibold text-slate-700">
                      {selectedStoreId
                        ? 'Belum ada data stok untuk ditampilkan'
                        : 'Pilih toko terlebih dahulu'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Produk akan muncul setelah data varian tersedia di database.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col justify-between gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center">
                <span>
                  Menampilkan {filteredProducts.length} dari {products.length} produk
                </span>
                <span className="text-xs">
                  {selectedStore
                    ? `Toko: ${selectedStore.name}`
                    : 'Belum ada toko dipilih'}
                </span>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">
                Catat Pergerakan Stok
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Perbarui jumlah persediaan dengan cepat.
              </p>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => openModal('Masuk')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  <span className="text-lg">＋</span>
                  Catat Stok Masuk
                </button>
                <button
                  type="button"
                  onClick={() => openModal('Keluar')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  <span className="text-lg">↓</span>
                  Catat Stok Keluar
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold text-slate-900">
                  Pergerakan Terbaru
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('Riwayat Pergerakan')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {movements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex gap-3 py-4 first:pt-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                        movement.type === 'Masuk'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {movement.type === 'Masuk' ? '↑' : '↓'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        Stok {movement.type} · {movement.product}
                      </p>
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          movement.type === 'Masuk'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {movement.type === 'Masuk' ? '+' : '-'}
                        {movement.qty} unit
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {movement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {movements.length === 0 && (
                <p className="py-6 text-sm text-slate-500">
                  Belum ada pergerakan stok.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <div className="flex gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-bold text-orange-900">
                    Tips pengelolaan stok
                  </p>
                  <p className="mt-1 text-sm leading-6 text-orange-800">
                    Periksa produk dengan stok rendah secara berkala dan
                    pastikan setiap pergerakan tercatat dengan benar.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="stock-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Catat Stok {modalType}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalType === 'Masuk'
                    ? 'Tambahkan jumlah persediaan produk.'
                    : 'Kurangi persediaan untuk barang keluar.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup"
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveMovement} className="space-y-4">
              <div>
                <label
                  htmlFor="stock-product"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Pilih Produk
                </label>
                <select
                  id="stock-product"
                  value={selectedProduct}
                  onChange={(event) =>
                    setSelectedProduct(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                >
                  {products.map((product) => (
                    <option
                      key={product.variantId}
                      value={String(product.variantId)}
                    >
                      {product.name}
                      {product.variantName &&
                      product.variantName !== product.name
                        ? ` - ${product.variantName}`
                        : ''}{' '}
                      — stok {product.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="stock-quantity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Jumlah Unit
                </label>
                <input
                  id="stock-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Masukkan jumlah unit"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {notice && (
                <p role="alert" className="text-sm text-red-600">
                  {notice}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || loadingInventory || products.length === 0}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Perubahan disimpan melalui API backend dan riwayat stok
                dimuat ulang setelah server mengonfirmasi transaksi.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, detail, color }) => {
  const colors = {
    blue: 'border-blue-100 bg-blue-50/70 text-blue-700',
    green: 'border-green-100 bg-green-50/70 text-green-700',
    orange: 'border-orange-100 bg-orange-50/70 text-orange-700',
    red: 'border-red-100 bg-red-50/70 text-red-700',
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colors[color]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs opacity-75">{detail}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
