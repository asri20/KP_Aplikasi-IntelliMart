import { useCallback, useEffect, useMemo, useState } from 'react';
import { axiosClient } from '@shared/lib/api/axiosClient';
import useAuthStore from '@core/auth/authStore';

const EMPTY_FORM = { category_name: '', is_active: 1 };

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const KategoriPage = () => {
  const user = useAuthStore((state) => state.user);
  const ownerId = Number(user?.id ?? user?.user_id ?? user?.owner_id);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyDeleteId, setBusyDeleteId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await axiosClient.get('/categories');
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      // Endpoint mengirim kategori global dan milik Owner. Halaman ini hanya
      // menampilkan kategori yang dibuat oleh Owner yang sedang login.
      setCategories(
        Number.isSafeInteger(ownerId) && ownerId > 0
          ? rows.filter((item) => Number(item.owner_id) === ownerId)
          : []
      );
    } catch (error) {
      setPageError(getErrorMessage(error, 'Gagal memuat kategori.'));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('id');
    if (!keyword) return categories;
    return categories.filter((category) =>
      String(category.category_name ?? '').toLocaleLowerCase('id').includes(keyword)
    );
  }, [categories, search]);

  const openCreateForm = () => {
    setPageError('');
    setSuccessMessage('');
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setPageError('');
    setSuccessMessage('');
    setEditingCategory(category);
    setForm({
      category_name: category.category_name ?? '',
      is_active: Number(category.is_active) === 1 ? 1 : 0,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPageError('');
    setSuccessMessage('');

    const categoryName = form.category_name.trim();
    if (!categoryName) {
      setPageError('Nama kategori wajib diisi.');
      return;
    }
    if (categoryName.length > 100) {
      setPageError('Nama kategori maksimal 100 karakter.');
      return;
    }
    if (!Number.isSafeInteger(ownerId) || ownerId <= 0) {
      setPageError('Identitas Owner tidak ditemukan. Silakan login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category_name: categoryName,
        parent_id: null,
        is_active: Number(form.is_active),
      };

      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory.id}`, payload);
        setSuccessMessage('Kategori berhasil diperbarui.');
      } else {
        await axiosClient.post('/categories', payload);
        setSuccessMessage('Kategori berhasil ditambahkan.');
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
      await loadCategories();
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          editingCategory ? 'Gagal memperbarui kategori.' : 'Gagal menambahkan kategori.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${category.category_name}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setPageError('');
    setSuccessMessage('');
    setBusyDeleteId(category.id);
    try {
      await axiosClient.delete(`/categories/${category.id}`);
      setSuccessMessage('Kategori berhasil dihapus.');
      await loadCategories();
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          'Gagal menghapus kategori. Pastikan kategori tidak sedang digunakan produk.'
        )
      );
    } finally {
      setBusyDeleteId(null);
    }
  };

  return (
    <main className="min-h-full bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-2xl" aria-hidden="true">
              🗂️
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Kategori</h1>
              <p className="mt-1 text-sm text-slate-500">Kelola kategori produk milik Owner yang sedang login.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadCategories} disabled={isLoading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? 'Memuat...' : 'Muat ulang'}
            </button>
            <button type="button" onClick={openCreateForm} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
              + Tambah kategori
            </button>
          </div>
        </header>

        {pageError && (
          <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{pageError}</span>
            <button type="button" onClick={() => setPageError('')} className="font-bold" aria-label="Tutup pesan error">×</button>
          </div>
        )}
        {successMessage && (
          <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage('')} className="font-bold" aria-label="Tutup pesan sukses">×</button>
          </div>
        )}

        {isFormOpen && (
          <section className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingCategory ? 'Edit kategori' : 'Tambah kategori'}</h2>
                <p className="mt-1 text-sm text-slate-500">Kategori akan tersimpan dan dapat digunakan di semua toko milik Owner ini.</p>
              </div>
              <button type="button" onClick={closeForm} disabled={isSubmitting} className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Tutup form">×</button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
              <div>
                <label htmlFor="category_name" className="mb-1.5 block text-sm font-medium text-slate-700">Nama kategori <span className="text-red-500">*</span></label>
                <input id="category_name" name="category_name" value={form.category_name} onChange={(event) => setForm((old) => ({ ...old, category_name: event.target.value }))} maxLength={100} required autoFocus placeholder="Contoh: Perawatan Wajah" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label htmlFor="is_active" className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select id="is_active" name="is_active" value={form.is_active} onChange={(event) => setForm((old) => ({ ...old, is_active: Number(event.target.value) }))} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                  <option value={1}>Aktif</option>
                  <option value={0}>Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeForm} disabled={isSubmitting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Menyimpan...' : editingCategory ? 'Simpan perubahan' : 'Simpan kategori'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Daftar kategori</h2>
              <p className="mt-1 text-sm text-slate-500">{isLoading ? 'Sedang mengambil data dari API...' : `${filteredCategories.length} kategori ditemukan`}</p>
            </div>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="search-category" className="sr-only">Cari kategori</label>
              <input id="search-category" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama kategori..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5" aria-live="polite">
              {[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl" aria-hidden="true">🗂️</div>
              <h3 className="font-semibold text-slate-900">{search ? 'Kategori tidak ditemukan' : 'Belum ada kategori milikmu'}</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{search ? 'Coba gunakan kata kunci lain.' : 'Tambahkan kategori pertama. Kategori global tidak ditampilkan di halaman ini.'}</p>
              {!search && <button type="button" onClick={openCreateForm} className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">+ Tambah kategori</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Nama kategori</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Kategori induk</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-orange-50/40">
                      <td className="px-5 py-4 font-medium text-slate-900">{category.category_name}</td>
                      <td className="px-5 py-4 text-slate-500">—</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${Number(category.is_active) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {Number(category.is_active) === 1 ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditForm(category)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:bg-orange-50">Edit</button>
                          <button type="button" onClick={() => handleDelete(category)} disabled={busyDeleteId === category.id} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                            {busyDeleteId === category.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Data diambil dari API. Kategori global dan kategori Owner lain tidak ditampilkan.</div>
        </section>
      </div>
    </main>
  );
};

export default KategoriPage;
