import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@features/auth/hooks';
import { getDashboardStores } from '@features/owner/services/dashboardService';
import {
  createInventoryMovement,
  getInventoryMovements,
  getInventoryStocks,
} from '@features/owner/services/inventoryService';

import ManagerSidebar from '../components/organisms/ManagerSidebar';
import ManagerHeader from '../components/organisms/ManagerHeader';

const ManagerInventoryPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [modalItem, setModalItem] = useState(null);
  const [movementForm, setMovementForm] = useState({
    movement_type: 'IN',
    qty: '',
    reference_type: 'PURCHASE',
    note: '',
  });
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const storesQuery = useQuery({
    queryKey: ['manager-stores', user?.id],
    queryFn: getDashboardStores,
  });

  const activeStore = storesQuery.data?.[0] ?? null;
  const storeId = activeStore?.id ?? null;

  const stocksQuery = useQuery({
    queryKey: ['manager-inventory-stocks', storeId],
    queryFn: () => getInventoryStocks({ store_id: storeId }),
    enabled: Boolean(storeId),
  });

  const movementsQuery = useQuery({
    queryKey: ['manager-inventory-movements', storeId],
    queryFn: () => getInventoryMovements({ store_id: storeId }),
    enabled: Boolean(storeId),
  });

  const inventory = useMemo(() => {
    const stocks = stocksQuery.data ?? [];
    const movements = movementsQuery.data ?? [];

    return stocks.map((s) => {
      const lastMov = movements.find(
        (m) => Number(m.variant_id) === Number(s.variant_id)
      );
      return {
        id: `${s.store_id}-${s.variant_id}`,
        storeId: s.store_id,
        variantId: s.variant_id,
        name: s.variant_name
          ? `${s.product_name} (${s.variant_name})`
          : s.product_name || 'Produk',
        sku: s.sku || '-',
        stock: Number(s.stock ?? 0),
        minStock: Number(s.min_stock ?? 0),
        lastMovement: lastMov
          ? `${lastMov.movement_type} (${lastMov.qty})`
          : 'Belum ada pergerakan',
      };
    });
  }, [stocksQuery.data, movementsQuery.data]);

  const getStockStatus = (item) => {
    if (item.stock === 0) return 'Habis';
    if (item.stock <= item.minStock) return 'Menipis';
    return 'Aman';
  };

  const filteredInventory = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);
      const status = getStockStatus(item);
      const matchesStatus =
        selectedStatus === 'Semua' || status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, selectedStatus]);

  const handleSubmitMovement = async (e) => {
    e.preventDefault();
    if (!modalItem) return;
    setFeedback({ error: '', success: '' });

    try {
      await createInventoryMovement({
        store_id: Number(modalItem.storeId),
        variant_id: Number(modalItem.variantId),
        movement_type: movementForm.movement_type,
        qty: Number(movementForm.qty),
        reference_type: movementForm.reference_type,
        note: movementForm.note || 'Update stok oleh Manager',
      });
      setFeedback({
        error: '',
        success: `Pergerakan stok untuk "${modalItem.name}" berhasil dicatat.`,
      });
      setModalItem(null);
      setMovementForm({
        movement_type: 'IN',
        qty: '',
        reference_type: 'PURCHASE',
        note: '',
      });
      queryClient.invalidateQueries({ queryKey: ['manager-inventory-stocks', storeId] });
      queryClient.invalidateQueries({ queryKey: ['manager-inventory-movements', storeId] });
    } catch (err) {
      setFeedback({
        error: err?.message || 'Gagal mencatat pergerakan stok.',
        success: '',
      });
    }
  };

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.minStock
  ).length;
  const outOfStockItems = inventory.filter((item) => item.stock === 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerSidebar />

      <div className="lg:pl-64">
        <ManagerHeader onSearch={setSearchQuery} />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Inventory Toko {activeStore ? `— ${activeStore.store_name}` : ''}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Pantau stok varian dan catat stok masuk / keluar pada toko Anda.
            </p>
          </div>

          {feedback.success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {feedback.success}
            </div>
          )}
          {feedback.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {feedback.error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Item</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">{totalItems}</h2>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Menipis</p>
              <h2 className="mt-2 text-2xl font-bold text-orange-600">{lowStockItems}</h2>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Stok Habis</p>
              <h2 className="mt-2 text-2xl font-bold text-red-600">{outOfStockItems}</h2>
            </div>
          </div>

          {/* Filter Status */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['Semua', 'Aman', 'Menipis', 'Habis'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  selectedStatus === st
                    ? 'bg-brand-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-orange-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Min. Stok</th>
                    <th className="px-6 py-4">Pergerakan Terakhir</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocksQuery.isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        Memuat data inventory...
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        Tidak ada data inventory yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{item.sku}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {item.stock}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{item.minStock}</td>
                          <td className="px-6 py-4 text-gray-500">{item.lastMovement}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status === 'Habis'
                                  ? 'bg-red-50 text-red-600'
                                  : status === 'Menipis'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'bg-emerald-50 text-emerald-600'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setModalItem(item)}
                              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                            >
                              + Pergerakan Stok
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {modalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900">
                  Catat Pergerakan Stok
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {modalItem.name} (Stok saat ini: {modalItem.stock})
                </p>

                <form onSubmit={handleSubmitMovement} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Tipe Pergerakan
                    </label>
                    <select
                      value={movementForm.movement_type}
                      onChange={(e) =>
                        setMovementForm((p) => ({
                          ...p,
                          movement_type: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="IN">IN (Stok Masuk)</option>
                      <option value="OUT">OUT (Stok Keluar)</option>
                      <option value="ADJUSTMENT_IN">ADJUSTMENT_IN (Penyesuaian +)</option>
                      <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT (Penyesuaian -)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Jumlah (Qty)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={movementForm.qty}
                      onChange={(e) =>
                        setMovementForm((p) => ({ ...p, qty: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Referensi
                    </label>
                    <select
                      value={movementForm.reference_type}
                      onChange={(e) =>
                        setMovementForm((p) => ({
                          ...p,
                          reference_type: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="PURCHASE">PURCHASE (Pembelian)</option>
                      <option value="ADJUSTMENT">ADJUSTMENT (Penyesuaian)</option>
                      <option value="RETURN">RETURN (Retur)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Catatan
                    </label>
                    <input
                      type="text"
                      value={movementForm.note}
                      onChange={(e) =>
                        setMovementForm((p) => ({ ...p, note: e.target.value }))
                      }
                      placeholder="Opsional..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalItem(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerInventoryPage;
