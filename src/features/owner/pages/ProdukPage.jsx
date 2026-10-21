import { useMemo, useState } from 'react';

import {
  OwnerSidebar,
  OwnerHeader,
  ProductTable,
  CreateProductModal,
} from '@features/owner/components/organisms';
import { StatCard } from '@features/owner/components/molecules';
import {
  useProducts,
  useDeleteProduct,
} from '@features/owner/hooks';
import { Button } from '@shared/components/atoms';
import { ErrorState } from '@shared/components/feedback';

const ProdukPage = () => {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

  const deleteMutation = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchText =
        !q ||
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q);

      const matchCategory =
        category === 'all' || p.category === category;

      const matchStatus =
        status === 'all' ||
        (status === 'active' ? p.isActive : !p.isActive);

      return matchText && matchCategory && matchStatus;
    });
  }, [products, search, category, status]);

  const totalActive = products.filter((p) => p.isActive).length;

  const handleCreateProduct = () => {
    setActionMessage('');
    setActionError('');
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setActionMessage('');
    setActionError('');
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (product) => {
    if (product?.ownerId == null) {
      setActionError('Produk bawaan tidak dapat dihapus.');
      setActionMessage('');
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setActionMessage('');
    setActionError('');

    try {
      await deleteMutation.mutateAsync(product.id);
      setActionMessage(`Produk "${product.name}" berhasil dihapus.`);
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          'Produk gagal dihapus. Silakan coba lagi.'
      );
    }
  };

  const handleViewProduct = (product) => {
    setDetailProduct(product);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  📦
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                    Produk
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola semua produk di toko Anda. Tambah, edit, dan atur stok dengan mudah.
                  </p>
                </div>
              </div>

              <Button variant="primary" onClick={handleCreateProduct}>
                + Tambah Produk
              </Button>
            </div>

            {actionMessage && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {actionMessage}
              </div>
            )}

            {actionError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {actionError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="📦"
                tone="orange"
                title="Total Produk"
                value={isLoading ? '...' : totalActive}
                description="Produk aktif milik Anda"
              />

              <StatCard
                icon="🏷️"
                tone="green"
                title="Kategori"
                value={isLoading ? '...' : categories.length}
                description="Kategori produk"
              />

              <StatCard
                icon="📊"
                tone="blue"
                title="Stok Total"
                value="-"
                description="Menunggu data stok"
              />

              <StatCard
                icon="💎"
                tone="purple"
                title="Nilai Produk"
                value="-"
                description="Menunggu data stok"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama produk atau kategori..."
                  className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50"
              >
                🔧 Filter
              </button>
            </div>

            <div className="mt-6">
              {isLoading && (
                <p className="py-10 text-center text-sm text-slate-400">
                  Memuat produk...
                </p>
              )}

              {isError && (
                <ErrorState
                  title="Gagal memuat produk"
                  message={error?.message}
                  onRetry={refetch}
                />
              )}

              {!isLoading && !isError && (
                <ProductTable
                  products={filtered}
                  total={products.length}
                  onEdit={handleEditProduct}
                  onView={handleViewProduct}
                  onDelete={handleDeleteProduct}
                />
              )}
            </div>
          </main>

          <CreateProductModal
            isOpen={showProductModal}
            onClose={handleCloseProductModal}
            product={selectedProduct}
            mode={selectedProduct ? 'edit' : 'create'}
          />

          {detailProduct && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setDetailProduct(null)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-detail-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="product-detail-title"
                      className="text-xl font-bold text-slate-900"
                    >
                      Detail Produk
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Informasi produk yang dipilih.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailProduct(null)}
                    className="rounded-lg px-3 py-1 text-slate-500 hover:bg-orange-50"
                    aria-label="Tutup detail"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Nama produk</p>
                    <p className="font-semibold text-slate-800">
                      {detailProduct.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Kategori</p>
                    <p className="font-medium text-slate-800">
                      {detailProduct.category ?? '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Merek</p>
                    <p className="font-medium text-slate-800">
                      {detailProduct.brand ?? '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Satuan</p>
                    <p className="font-medium text-slate-800">
                      {detailProduct.unit ?? '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Deskripsi</p>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {detailProduct.description || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-medium text-slate-800">
                      {detailProduct.isActive ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setDetailProduct(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;