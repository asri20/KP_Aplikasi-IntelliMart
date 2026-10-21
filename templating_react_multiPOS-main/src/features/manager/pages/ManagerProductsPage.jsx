import { useMemo, useState } from 'react';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleProducts = [
  {
    id: 1,
    name: 'Aqua 600ml',
    sku: 'PRD-001',
    category: 'Minuman',
    price: 4000,
    stock: 5,
  },
  {
    id: 2,
    name: 'Indomie Goreng',
    sku: 'PRD-002',
    category: 'Makanan',
    price: 3500,
    stock: 8,
  },
  {
    id: 3,
    name: 'Kopi Kapal Api',
    sku: 'PRD-003',
    category: 'Minuman',
    price: 2000,
    stock: 25,
  },
  {
    id: 4,
    name: 'Chitato',
    sku: 'PRD-004',
    category: 'Snack',
    price: 10000,
    stock: 4,
  },
  {
    id: 5,
    name: 'Teh Botol Sosro',
    sku: 'PRD-005',
    category: 'Minuman',
    price: 5000,
    stock: 30,
  },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const ManagerProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const categories = [
    'Semua',
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'Semua' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddProduct = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.category.trim() ||
      formData.price === '' ||
      formData.stock === ''
    ) {
      alert('Semua kolom wajib diisi!');
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      alert('Harga dan stok tidak boleh negatif!');
      return;
    }

    const isSkuExists = products.some(
      (product) =>
        product.sku.toLowerCase() === formData.sku.trim().toLowerCase()
    );

    if (isSkuExists) {
      alert('SKU sudah digunakan. Gunakan SKU lain!');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    setProducts((prevProducts) => [...prevProducts, newProduct]);

    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
    });

    setIsAddModalOpen(false);
    setSelectedCategory('Semua');
    setSearchQuery('');
  };

  // Membuka form edit dengan data produk yang dipilih
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);

    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });

    setIsEditModalOpen(true);
  };

  // Menyimpan perubahan produk
  const handleUpdateProduct = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.category.trim() ||
      formData.price === '' ||
      formData.stock === ''
    ) {
      alert('Semua kolom wajib diisi!');
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      alert('Harga dan stok tidak boleh negatif!');
      return;
    }

    const isSkuExists = products.some(
      (product) =>
        product.sku.toLowerCase() === formData.sku.trim().toLowerCase() &&
        product.id !== editingProductId
    );

    if (isSkuExists) {
      alert('SKU sudah digunakan. Gunakan SKU lain!');
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              name: formData.name.trim(),
              sku: formData.sku.trim(),
              category: formData.category.trim(),
              price: Number(formData.price),
              stock: Number(formData.stock),
            }
          : product
      )
    );

    setIsEditModalOpen(false);
    setEditingProductId(null);

    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
    });
  };

  const handleCloseModal = () => {
  setIsAddModalOpen(false);
  setIsEditModalOpen(false);
  setEditingProductId(null);

  setFormData({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
  });
};

  // Menghapus produk
  const handleDeleteProduct = (product) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus produk "${product.name}"?`
    );

    if (!confirmed) return;

    setProducts((prevProducts) =>
      prevProducts.filter((item) => item.id !== product.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <ManagerHeader
          onSearch={setSearchQuery}
          onNotificationClick={() => {
            console.log('Notification clicked');
          }}
          onProfileClick={() => {
            console.log('Profile clicked');
          }}
          onLogout={() => {
            console.log('Logout clicked');
          }}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Manajemen Produk
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Kelola produk dan informasi barang di toko kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              <span className="text-lg">+</span>
              Tambah Produk
            </button>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Produk</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {categories.length - 1}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Menipis</p>
              <p className="mt-2 text-2xl font-bold text-orange-500">
                {products.filter((product) => product.stock <= 5).length}
              </p>
            </div>
          </div>

          {/* Product Table */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Produk
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Menampilkan {filteredProducts.length} produk
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nama atau SKU..."
                  aria-label="Cari produk"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                />

                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  aria-label="Filter kategori"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Produk</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Harga</th>
                    <th className="px-6 py-4 font-semibold">Stok</th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-orange-50/40"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {product.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {product.sku}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-800">
                          {formatRupiah(product.price)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              product.stock <= 5
                                ? 'bg-red-50 text-red-600'
                                : 'bg-green-50 text-green-600'
                            }`}
                          >
                            {product.stock} unit
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-orange-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Produk tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Add Product Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditModalOpen ? 'Edit Produk' : 'Tambah Produk'}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={
                isEditModalOpen ? handleUpdateProduct : handleAddProduct
              }
              className="space-y-4"
            >
              {/* Nama Produk */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Contoh: Aqua 600ml"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU / Kode Produk
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(event) =>
                    setFormData({ ...formData, sku: event.target.value })
                  }
                  placeholder="Contoh: PRD-006"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({ ...formData, category: event.target.value })
                  }
                  placeholder="Contoh: Minuman"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {/* Harga */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(event) =>
                    setFormData({ ...formData, price: event.target.value })
                  }
                  placeholder="Contoh: 5000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {/* Stok */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(event) =>
                    setFormData({ ...formData, stock: event.target.value })
                  }
                  placeholder="Contoh: 20"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {isEditModalOpen ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default ManagerProductsPage;
