import { useState, useEffect, useCallback } from 'react';
import { ManagerHeader } from '../components/ManagerHeader';
import { axiosClient as apiClient } from '@shared/lib/api/axiosClient';

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));

export function ManagerProductsPage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ownerVariants, setOwnerVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('new'); // 'new' | 'existing'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    variant_id: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const storeRes = await apiClient.get('/stores');
      const stores = storeRes?.data?.data || [];
      const myStore = stores[0] || null;
      setStore(myStore);

      const [stockRes, catRes, varRes] = await Promise.all([
        myStore
          ? apiClient.get('/stocks', { params: { store_id: myStore.id } })
          : Promise.resolve({ data: { data: [] } }),
        apiClient.get('/categories').catch(() => ({ data: { data: [] } })),
        apiClient.get('/variants').catch(() => ({ data: { data: [] } })),
      ]);

      const rawStocks = stockRes?.data?.data || [];
      const mapped = rawStocks.map((item) => {
        const stockNum = Number(item.stock ?? 0);
        const minStockNum = Number(item.min_stock ?? 5);
        const status =
          stockNum <= 0 ? 'Habis' : stockNum <= minStockNum ? 'Menipis' : 'Tersedia';
        return {
          id: `${item.store_id}-${item.variant_id}`,
          store_id: item.store_id,
          variant_id: item.variant_id,
          product_id: item.product_id,
          name: item.product_name
            ? item.variant_name && item.variant_name !== item.product_name
              ? `${item.product_name} (${item.variant_name})`
              : item.product_name
            : item.variant_name || `Varian #${item.variant_id}`,
          product_name: item.product_name || item.variant_name || '',
          variant_name: item.variant_name || 'Reguler',
          sku: item.sku || '-',
          category: item.category_name || 'Umum',
          category_id: item.category_id || null,
          price: Number(item.base_price ?? 0),
          stock: stockNum,
          min_stock: minStockNum,
          status,
        };
      });

      setProducts(mapped);
      setCategoriesList(catRes?.data?.data || []);
      setOwnerVariants(varRes?.data?.data || []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Gagal memuat data produk toko.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = [
    'Semua',
    ...Array.from(
      new Set([
        ...categoriesList.map((c) => c.category_name).filter(Boolean),
        ...products.map((p) => p.category).filter(Boolean),
      ])
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resolveCategoryId = async (categoryName) => {
    if (!categoryName || !categoryName.trim()) return null;
    const found = categoriesList.find(
      (c) => c.category_name?.toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (found) return found.id;
    const created = await apiClient.post('/categories', {
      category_name: categoryName.trim(),
    });
    return created?.data?.data?.id || null;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!store) {
      alert('Anda belum ditugaskan ke toko manapun.');
      return;
    }
    setSubmitting(true);
    try {
      let targetVariantId = Number(formData.variant_id);

      if (addMode === 'new') {
        const categoryId = await resolveCategoryId(formData.category);
        const prodRes = await apiClient.post('/products', {
          product_name: formData.name.trim(),
          category_id: categoryId,
          is_active: 1,
        });
        const newProduct = prodRes?.data?.data;

        const varRes = await apiClient.post('/variants', {
          product_id: newProduct.id,
          variant_name: formData.name.trim(),
          sku: formData.sku.trim(),
          cost_price: Math.round(Number(formData.price || 0) * 0.8),
          is_active: 1,
        });
        targetVariantId = varRes?.data?.data?.id;
      }

      await apiClient.post('/stocks', {
        store_id: store.id,
        variant_id: targetVariantId,
        base_price: parseInt(formData.price, 10) || 0,
        min_stock: 5,
      });

      const initialQty = parseInt(formData.stock, 10) || 0;
      if (initialQty > 0) {
        await apiClient.post('/stock-movements', {
          store_id: store.id,
          variant_id: targetVariantId,
          movement_type: 'IN',
          qty: initialQty,
          reference_type: 'INITIAL',
          note: 'Stok awal produk',
        });
      }

      setFormData({ name: '', sku: '', category: '', price: '', stock: '', variant_id: '' });
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menambahkan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !store) return;
    setSubmitting(true);
    try {
      const categoryId = await resolveCategoryId(formData.category);

      if (selectedProduct.product_id) {
        await apiClient.put(`/products/${selectedProduct.product_id}`, {
          product_name: formData.name.trim(),
          category_id: categoryId,
          is_active: 1,
        });
      }

      if (selectedProduct.variant_id) {
        await apiClient.put(`/variants/${selectedProduct.variant_id}`, {
          variant_name: formData.name.trim(),
          sku: formData.sku.trim(),
          is_active: 1,
        });
      }

      await apiClient.put(
        `/stocks/${selectedProduct.store_id}/${selectedProduct.variant_id}`,
        {
          base_price: parseInt(formData.price, 10) || 0,
          min_stock: selectedProduct.min_stock || 5,
        }
      );

      const newStock = parseInt(formData.stock, 10);
      const diff = newStock - Number(selectedProduct.stock || 0);
      if (!Number.isNaN(newStock) && diff !== 0) {
        await apiClient.post('/stock-movements', {
          store_id: selectedProduct.store_id,
          variant_id: selectedProduct.variant_id,
          movement_type: diff > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
          qty: Math.abs(diff),
          reference_type: 'ADJUSTMENT',
          note: 'Penyesuaian stok via Edit Produk Manager',
        });
      }

      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setFormData({ name: '', sku: '', category: '', price: '', stock: '', variant_id: '' });
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal memperbarui produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini dari toko?')) return;
    try {
      await apiClient.delete(`/stocks/${product.store_id}/${product.variant_id}`);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menghapus produk dari toko.');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.product_name || product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      variant_id: String(product.variant_id),
    });
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Menipis':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Habis':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <ManagerHeader
        title="Manajemen Produk"
        subtitle={
          store
            ? `Kelola produk dan harga toko ${store.store_name}`
            : 'Kelola produk dan harga toko'
        }
      />

      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Top Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari produk atau SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  sku: '',
                  category: '',
                  price: '',
                  stock: '',
                  variant_id: '',
                });
                setAddMode('new');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Produk
            </button>
          </div>
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Memuat data produk...
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {formatRupiah(product.price)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{product.stock} unit</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-xs transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Kategori</p>
                  <p className="font-medium text-gray-900">{product.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Stok</p>
                  <p className="font-semibold text-gray-900">{product.stock} unit</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-0.5">Harga</p>
                  <p className="font-bold text-gray-900 text-base">
                    {formatRupiah(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          {!loading && filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tambah Produk Baru</h3>

            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAddMode('new')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  addMode === 'new'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Buat Produk Baru
              </button>
              <button
                type="button"
                onClick={() => setAddMode('existing')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  addMode === 'existing'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pilih dari Katalog Owner
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {addMode === 'existing' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Produk / Varian
                  </label>
                  <select
                    required
                    value={formData.variant_id}
                    onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Pilih Varian Produk --</option>
                    {ownerVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.product_name} - {v.variant_name} ({v.sku})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Beras Premium 5kg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: BRS-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <input
                      type="text"
                      required
                      list="manager-category-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Sembako"
                    />
                    <datalist id="manager-category-list">
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.category_name} />
                      ))}
                    </datalist>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="75000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Stok Awal
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData({
                      name: '',
                      sku: '',
                      category: '',
                      price: '',
                      stock: '',
                      variant_id: '',
                    });
                  }}
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

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Produk</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  list="manager-edit-category-list"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="manager-edit-category-list">
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.category_name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                    setFormData({
                      name: '',
                      sku: '',
                      category: '',
                      price: '',
                      stock: '',
                      variant_id: '',
                    });
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerProductsPage;
