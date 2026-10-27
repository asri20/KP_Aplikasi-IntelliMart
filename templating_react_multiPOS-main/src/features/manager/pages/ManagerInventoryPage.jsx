import { useMemo, useState } from 'react';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const sampleInventory = [
  {
    id: 1,
    name: 'Aqua 600ml',
    sku: 'PRD-001',
    category: 'Minuman',
    stock: 5,
    minStock: 5,
    unit: 'botol',
    lastMovement: 'Stok masuk',
  },
  {
    id: 2,
    name: 'Indomie Goreng',
    sku: 'PRD-002',
    category: 'Makanan',
    stock: 8,
    minStock: 5,
    unit: 'pcs',
    lastMovement: 'Stok masuk',
  },
  {
    id: 3,
    name: 'Kopi Kapal Api',
    sku: 'PRD-003',
    category: 'Minuman',
    stock: 25,
    minStock: 10,
    unit: 'pcs',
    lastMovement: 'Penjualan',
  },
  {
    id: 4,
    name: 'Chitato',
    sku: 'PRD-004',
    category: 'Snack',
    stock: 4,
    minStock: 5,
    unit: 'pcs',
    lastMovement: 'Penjualan',
  },
  {
    id: 5,
    name: 'Teh Botol Sosro',
    sku: 'PRD-005',
    category: 'Minuman',
    stock: 30,
    minStock: 10,
    unit: 'botol',
    lastMovement: 'Stok masuk',
  },
];

const ManagerInventoryPage = () => {
  const [inventory] = useState(sampleInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  const getStockStatus = (item) => {
    if (item.stock === 0) {
      return 'Habis';
    }

    if (item.stock <= item.minStock) {
      return 'Menipis';
    }

    return 'Aman';
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);

      const status = getStockStatus(item);

      const matchesStatus =
        selectedStatus === 'Semua' || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, selectedStatus]);

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.minStock,
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => item.stock === 0,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerSidebar />

      <div className="lg:pl-64">
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Inventory
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Pantau ketersediaan stok produk di toko kamu.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Produk</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalItems}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Produk dalam inventory
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Menipis</p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {lowStockItems}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Perlu segera diperhatikan
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Habis</p>

              <p className="mt-2 text-2xl font-bold text-red-500">
                {outOfStockItems}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Produk tidak tersedia
              </p>
            </div>
          </div>

          {/* Inventory Table */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Inventory
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Menampilkan {filteredInventory.length} produk
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nama atau SKU..."
                  aria-label="Cari inventory"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                />

                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  aria-label="Filter status stok"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aman">Aman</option>
                  <option value="Menipis">Menipis</option>
                  <option value="Habis">Habis</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Produk</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Stok</th>
                    <th className="px-6 py-4 font-semibold">
                      Minimum Stok
                    </th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">
                      Pergerakan Terakhir
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => {
                      const status = getStockStatus(item);

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-orange-50/40"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {item.sku}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-800">
                              {item.stock} {item.unit}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {item.minStock} {item.unit}
                          </td>

                          <td className="px-6 py-4">
                            {status === 'Aman' && (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                Aman
                              </span>
                            )}

                            {status === 'Menipis' && (
                              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                                Menipis
                              </span>
                            )}

                            {status === 'Habis' && (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                Habis
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {item.lastMovement}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Inventory tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ManagerInventoryPage;
