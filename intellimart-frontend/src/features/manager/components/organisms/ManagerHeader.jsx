import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '@shared/components/atoms';
import { useAuth } from '@features/auth/hooks/useAuth';

const ManagerHeader = ({
  notificationCount = 3,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onLogout,
}) => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const managerName = user?.name || 'Manager';
  const managerRole =
    user?.role === 'manager' ? 'Manajemen Toko' : user?.role || 'Pengguna';

  const initial = managerName.charAt(0).toUpperCase();

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);

    // Bersihkan sesi autentikasi
    clearAuth();

    // Kembali ke halaman login
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-zinc-100 bg-white px-4 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="relative hidden w-full max-w-xl md:block">
        <Icon
          size="md"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-4-4" />
        </Icon>

        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari produk, kategori, atau transaksi..."
          aria-label="Cari produk, kategori, atau transaksi"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        {/* Notification */}
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label={`Notifikasi, ${notificationCount} pemberitahuan`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-orange-50 hover:text-brand-600"
        >
          <Icon size="lg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
          </Icon>

          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <div className="hidden h-9 w-px bg-zinc-200 sm:block" />

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              onProfileClick?.();
            }}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-orange-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-zinc-800">
                {managerName}
              </p>
              <p className="text-xs text-zinc-500">{managerRole}</p>
            </div>

            <Icon
              size="sm"
              className={`hidden text-zinc-400 transition-transform sm:block ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 9 6 6 6-6"
              />
            </Icon>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-zinc-100 bg-white py-2 shadow-lg"
            >
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-zinc-800">
                  {managerName}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {user?.email || managerRole}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsProfileOpen(false);
                  onProfileClick?.();
                }}
                className="w-full px-4 py-3 text-left text-sm text-zinc-600 transition hover:bg-orange-50 hover:text-brand-600"
              >
                Profil Saya
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ManagerHeader;
