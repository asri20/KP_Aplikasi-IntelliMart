import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const ROLE_LABEL = { owner: 'Owner', manager: 'Manager', cashier: 'Kasir', admin: 'Owner' };

const getInitial = (name = '') => name.trim().charAt(0).toUpperCase() || '?';

const OwnerHeader = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name ?? 'Pengguna';
  const role = String(user?.role ?? user?.role_name ?? '').toLowerCase();
  const roleLabel = ROLE_LABEL[role] ?? 'Pengguna';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Hapus sesi di server (kalau gagal, tetap logout di browser)
      await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      /* abaikan */
    }
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-orange-100 bg-white px-6 lg:px-8">
      {/* Search */}
      <div className="relative hidden w-full max-w-xl md:block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        <input
          type="text"
          placeholder="Cari produk, kategori, atau transaksi..."
          className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          className="relative text-xl text-slate-500 hover:text-orange-500"
        >
          🔔

          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Profil user yang login */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {getInitial(displayName)}
          </div>

          <div className="hidden sm:block">
            <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true">⎋</span>
          {isLoggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </header>
  );
};

export default OwnerHeader;
