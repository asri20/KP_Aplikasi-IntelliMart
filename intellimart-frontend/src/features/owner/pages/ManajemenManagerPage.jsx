
import { useCallback, useEffect, useState } from 'react';
import { axiosClient } from '@shared/lib/api/axiosClient';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  store_id: '',
};

const ManajemenManagerPage = () => {
  const [managers, setManagers] = useState([]);
  const [stores, setStores] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const [managerResponse, storeResponse] = await Promise.all([
        axiosClient.get('/users'),
        axiosClient.get('/stores'),
    ]);

      setManagers(managerResponse.data.data ?? []);
      setStores(storeResponse.data.data ?? []);
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          'Gagal memuat data Manager dan toko.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openForm = () => {
    setForm(initialForm);
    setPageError('');
    setSuccessMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPageError('');
    setSuccessMessage('');

    if (!form.store_id) {
      setPageError('Silakan pilih toko untuk Manager.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosClient.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role_name: 'Manager',
        store_id: Number(form.store_id),
      });

      setSuccessMessage(
        response.data.message || 'Akun Manager berhasil dibuat.'
      );
      setShowForm(false);
      setForm(initialForm);

      await loadData();
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          'Gagal membuat akun Manager. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (manager) => {
    const nextStatus = Number(manager.is_active) === 1 ? 0 : 1;

    const confirmed = window.confirm(
      `Yakin ingin ${
        nextStatus === 1 ? 'mengaktifkan' : 'menonaktifkan'
      } Manager ${manager.name}?`
    );

    if (!confirmed) return;

    setPageError('');
    setSuccessMessage('');
    setStatusLoadingId(manager.id);

    try {
      const response = await axiosClient.patch(`/users/${manager.id}/status`, {
        is_active: nextStatus,
    });

      setSuccessMessage(
        response.data.message || 'Status Manager berhasil diperbarui.'
      );

      await loadData();
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          'Gagal mengubah status Manager.'
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  const availableStores = stores.filter(
    (store) => store.manager_id == null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Manajemen Manager
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola akun Manager dan penempatan toko.
        </p>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Daftar Manager
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manager hanya dapat ditugaskan ke satu toko.
            </p>
          </div>

          <button
            type="button"
            onClick={openForm}
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + Tambah Manager
          </button>
        </div>

        {pageError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {pageError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 py-10 text-center text-sm text-slate-500">
            Memuat data Manager...
          </div>
        ) : managers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-orange-200 px-4 py-10 text-center">
            <p className="font-medium text-slate-700">
              Belum ada data Manager
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan Manager dan pilih toko untuk mulai mengelolanya.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-orange-100">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-orange-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Manager</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Toko</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {managers.map((manager) => {
                  const isActive = Number(manager.is_active) === 1;

                  return (
                    <tr key={manager.id} className="text-slate-700">
                      <td className="px-4 py-4 font-medium">
                        {manager.name}
                      </td>
                      <td className="px-4 py-4">{manager.email}</td>
                      <td className="px-4 py-4">
                        {manager.store_name || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={statusLoadingId === manager.id}
                          onClick={() => handleToggleStatus(manager)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {statusLoadingId === manager.id
                            ? 'Memproses...'
                            : isActive
                              ? 'Nonaktifkan'
                              : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <p className="mt-4 text-xs text-slate-400">
            Total Manager: {managers.length}
          </p>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manager-form-title"
            className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-orange-100 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="manager-form-title"
                  className="text-xl font-bold text-slate-800"
                >
                  Tambah Manager
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Buat akun dan tempatkan Manager di toko milik Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Tutup formulir"
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="manager-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nama Manager
                </label>
                <input
                  id="manager-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  autoComplete="name"
                  placeholder="Masukkan nama Manager"
                  className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="manager-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="manager-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoComplete="email"
                  placeholder="manager@contoh.com"
                  className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="manager-phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nomor Telepon
                </label>
                <input
                  id="manager-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="Masukkan nomor telepon"
                  className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="manager-password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="manager-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="manager-store"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Pilih Toko
                </label>
                <select
                  id="manager-store"
                  name="store_id"
                  value={form.store_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">-- Pilih toko --</option>
                  {availableStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.store_name}
                    </option>
                  ))}
                </select>

                {availableStores.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Semua toko Anda sudah memiliki Manager atau belum ada toko.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="rounded-xl border border-orange-100 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableStores.length === 0}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenManagerPage;
