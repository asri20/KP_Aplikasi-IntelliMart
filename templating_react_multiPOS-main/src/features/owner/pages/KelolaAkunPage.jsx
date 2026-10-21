
import { useCallback, useEffect, useState } from 'react';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

import {
  OwnerSidebar,
  OwnerHeader,
} from '@features/owner/components/organisms';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role_name: 'Manager',
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  'Terjadi kesalahan. Silakan coba lagi.';

const KelolaAkunPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState({
    type: '',
    message: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axiosClient.get(
        ENDPOINTS.OWNER_USERS.LIST
      );

      const result = response.data?.data;
      setUsers(Array.isArray(result) ? result : []);
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({ type: '', message: '' });

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      const response = await axiosClient.post(
        ENDPOINTS.OWNER_USERS.CREATE,
        payload
      );

      setNotice({
        type: 'success',
        message:
          response.data?.message || 'Akun berhasil dibuat.',
      });

      setForm(initialForm);
      setShowForm(false);
      await loadUsers();
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isActive = Number(user.is_active) === 1;
    const nextStatus = isActive ? 0 : 1;

    const confirmed = window.confirm(
      `Yakin ingin ${
        isActive ? 'menonaktifkan' : 'mengaktifkan'
      } akun ${user.name}?`
    );

    if (!confirmed) return;

    setNotice({ type: '', message: '' });

    try {
      const response = await axiosClient.patch(
        ENDPOINTS.OWNER_USERS.UPDATE_STATUS(user.id),
        { is_active: nextStatus }
      );

      setNotice({
        type: 'success',
        message:
          response.data?.message ||
          'Status akun berhasil diperbarui.',
      });

      await loadUsers();
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const role = String(
      user.role_name || user.role || ''
    ).toLowerCase();

    if (!['manager', 'cashier', 'kasir'].includes(role)) {
      return false;
    }

    const keyword = search.trim().toLowerCase();

    return (
      String(user.name || '').toLowerCase().includes(keyword) ||
      String(user.email || '').toLowerCase().includes(keyword) ||
      role.includes(keyword)
    );
  });

  const activeCount = filteredUsers.filter(
    (user) => Number(user.is_active) === 1
  ).length;

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        {/* SIDEBAR DI KIRI */}
        <OwnerSidebar />

        {/* HEADER DAN KONTEN DI KANAN */}
        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {/* Judul halaman */}
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="mb-2 text-sm font-medium text-orange-500">
                    Dashboard Owner / Kelola Akun
                  </p>

                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                    Kelola Akun
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Kelola akun Manager dan Kasir toko kamu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm((current) => !current);
                    setNotice({ type: '', message: '' });
                  }}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {showForm ? 'Tutup Form' : '+ Tambah Akun'}
                </button>
              </div>

              {/* Notifikasi */}
              {notice.message && (
                <div
                  role="status"
                  className={`mb-5 rounded-xl border p-4 text-sm ${
                    notice.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {notice.message}
                </div>
              )}

              {/* Form tambah akun */}
              {showForm && (
                <form
                  onSubmit={handleCreate}
                  className="mb-7 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:p-7"
                >
                  <h2 className="mb-5 text-lg font-bold text-slate-900">
                    Tambah Akun Baru
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                      Nama Lengkap
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
                        placeholder="Masukkan nama"
                      />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                      Email
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
                        placeholder="nama@email.com"
                      />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                      Nomor Telepon
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        autoComplete="tel"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
                        placeholder="08xxxxxxxxxx"
                      />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                      Role
                      <select
                        name="role_name"
                        value={form.role_name}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-400"
                      >
                        <option value="Manager">Manager</option>
                        <option value="Cashier">Kasir</option>
                      </select>
                    </label>

                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                      Password Awal
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
                        placeholder="Minimal 6 karakter"
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm(initialForm);
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Akun'}
                    </button>
                  </div>
                </form>
              )}

              {/* Statistik akun */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-white p-5">
                  <p className="text-sm text-slate-500">
                    Total Akun Manager & Kasir
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {filteredUsers.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-white p-5">
                  <p className="text-sm text-slate-500">Akun Aktif</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {activeCount}
                  </p>
                </div>
              </div>

              {/* Tabel akun */}
              <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Daftar Akun
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Data akun diambil dari backend.
                    </p>
                  </div>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama, email, atau role..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 sm:max-w-xs"
                  />
                </div>

                {loading ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Memuat data akun...
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-orange-50 text-slate-600">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Nama</th>
                          <th className="px-5 py-4 font-semibold">Email</th>
                          <th className="px-5 py-4 font-semibold">Telepon</th>
                          <th className="px-5 py-4 font-semibold">Role</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Aksi</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => {
                          const isActive = Number(user.is_active) === 1;
                          const role = String(
                            user.role_name || user.role || ''
                          ).toLowerCase();

                          return (
                            <tr
                              key={user.id}
                              className="hover:bg-orange-50/40"
                            >
                              <td className="px-5 py-4 font-medium text-slate-800">
                                {user.name}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {user.email}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {user.phone || '-'}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {['cashier', 'kasir'].includes(role)
                                  ? 'Kasir'
                                  : user.role_name || user.role || '-'}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isActive
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {isActive ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(user)}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                    isActive
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredUsers.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-10 text-center text-slate-500"
                            >
                              {search
                                ? 'Tidak ada akun yang cocok dengan pencarian.'
                                : 'Belum ada akun Manager atau Kasir.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default KelolaAkunPage;
