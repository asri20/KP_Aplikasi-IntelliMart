import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { OwnerSidebar, OwnerHeader } from '@features/owner/components/organisms';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const KategoriPage = () => {
  const queryClient = useQueryClient();

  const [newCategory, setNewCategory] = useState({ category_name: '', description: '' });
  const [newBrand, setNewBrand] = useState({ brand_name: '' });
  const [newUnit, setNewUnit] = useState({ unit_name: '' });

  const [editItem, setEditItem] = useState(null); // { type: 'category'|'brand'|'unit', id, name }
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const categoriesQuery = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data } = await axiosClient.get(ENDPOINTS.CATEGORY.LIST, {
        params: { limit: 100 },
      });
      return data?.data ?? [];
    },
  });

  const brandsQuery = useQuery({
    queryKey: ['brands-list'],
    queryFn: async () => {
      const { data } = await axiosClient.get(ENDPOINTS.BRAND.LIST, {
        params: { limit: 100 },
      });
      return data?.data ?? [];
    },
  });

  const unitsQuery = useQuery({
    queryKey: ['units-list'],
    queryFn: async () => {
      const { data } = await axiosClient.get(ENDPOINTS.UNIT.LIST, {
        params: { limit: 100 },
      });
      return data?.data ?? [];
    },
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories-list'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['brands-list'] });
    queryClient.invalidateQueries({ queryKey: ['brands'] });
    queryClient.invalidateQueries({ queryKey: ['units-list'] });
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });
    try {
      await axiosClient.post(ENDPOINTS.CATEGORY.LIST, {
        category_name: newCategory.category_name.trim(),
        description: newCategory.description.trim() || null,
      });
      setNewCategory({ category_name: '', description: '' });
      setFeedback({ error: '', success: 'Kategori berhasil ditambahkan.' });
      refreshAll();
    } catch (err) {
      setFeedback({ error: err?.message || 'Gagal menambahkan kategori.', success: '' });
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });
    try {
      await axiosClient.post(ENDPOINTS.BRAND.LIST, {
        brand_name: newBrand.brand_name.trim(),
      });
      setNewBrand({ brand_name: '' });
      setFeedback({ error: '', success: 'Merek berhasil ditambahkan.' });
      refreshAll();
    } catch (err) {
      setFeedback({ error: err?.message || 'Gagal menambahkan merek.', success: '' });
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });
    try {
      await axiosClient.post(ENDPOINTS.UNIT.LIST, {
        unit_name: newUnit.unit_name.trim(),
      });
      setNewUnit({ unit_name: '' });
      setFeedback({ error: '', success: 'Satuan berhasil ditambahkan.' });
      refreshAll();
    } catch (err) {
      setFeedback({ error: err?.message || 'Gagal menambahkan satuan.', success: '' });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem || !editItem.name.trim()) return;
    setFeedback({ error: '', success: '' });
    try {
      if (editItem.type === 'category') {
        await axiosClient.put(`${ENDPOINTS.CATEGORY.LIST}/${editItem.id}`, {
          category_name: editItem.name.trim(),
        });
      } else if (editItem.type === 'brand') {
        await axiosClient.put(`${ENDPOINTS.BRAND.LIST}/${editItem.id}`, {
          brand_name: editItem.name.trim(),
        });
      } else if (editItem.type === 'unit') {
        await axiosClient.put(`${ENDPOINTS.UNIT.LIST}/${editItem.id}`, {
          unit_name: editItem.name.trim(),
        });
      }
      setEditItem(null);
      setFeedback({ error: '', success: 'Data berhasil diperbarui.' });
      refreshAll();
    } catch (err) {
      setFeedback({ error: err?.message || 'Gagal memperbarui data.', success: '' });
    }
  };

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Hapus "${name}"?`)) return;
    setFeedback({ error: '', success: '' });
    try {
      const base =
        type === 'category'
          ? ENDPOINTS.CATEGORY.LIST
          : type === 'brand'
          ? ENDPOINTS.BRAND.LIST
          : ENDPOINTS.UNIT.LIST;
      await axiosClient.delete(`${base}/${id}`);
      setFeedback({ error: '', success: `"${name}" berhasil dihapus.` });
      refreshAll();
    } catch (err) {
      setFeedback({ error: err?.message || 'Gagal menghapus data.', success: '' });
    }
  };

  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];
  const units = unitsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                Master Kategori, Merek & Satuan
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Kelola data referensi produk yang digunakan pada katalog produk.
              </p>
            </div>

            {feedback.success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {feedback.success}
              </div>
            )}
            {feedback.error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {feedback.error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* KATEGORI */}
              <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Kategori ({categories.length})
                </h2>

                <form onSubmit={handleAddCategory} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCategory.category_name}
                    onChange={(e) =>
                      setNewCategory((p) => ({ ...p, category_name: e.target.value }))
                    }
                    placeholder="Nama kategori baru..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                  >
                    + Tambah
                  </button>
                </form>

                <div className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <span>{c.category_name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditItem({
                              type: 'category',
                              id: c.id,
                              name: c.category_name,
                            })
                          }
                          className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete('category', c.id, c.category_name)
                          }
                          className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* MEREK */}
              <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Merek / Brand ({brands.length})
                </h2>

                <form onSubmit={handleAddBrand} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newBrand.brand_name}
                    onChange={(e) => setNewBrand({ brand_name: e.target.value })}
                    placeholder="Nama merek baru..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                  >
                    + Tambah
                  </button>
                </form>

                <div className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <span>{b.brand_name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditItem({
                              type: 'brand',
                              id: b.id,
                              name: b.brand_name,
                            })
                          }
                          className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('brand', b.id, b.brand_name)}
                          className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SATUAN */}
              <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Satuan / Unit ({units.length})
                </h2>

                <form onSubmit={handleAddUnit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newUnit.unit_name}
                    onChange={(e) => setNewUnit({ unit_name: e.target.value })}
                    placeholder="Contoh: pcs, botol, box..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                  >
                    + Tambah
                  </button>
                </form>

                <div className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {units.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <span>{u.unit_name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditItem({
                              type: 'unit',
                              id: u.id,
                              name: u.unit_name,
                            })
                          }
                          className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('unit', u.id, u.unit_name)}
                          className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Edit{' '}
              {editItem.type === 'category'
                ? 'Kategori'
                : editItem.type === 'brand'
                ? 'Merek'
                : 'Satuan'}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input
                type="text"
                required
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KategoriPage;
