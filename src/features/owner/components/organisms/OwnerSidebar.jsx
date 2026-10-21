import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    label: 'Dashboard',
    icon: '⌂',
    path: '/dashboard',
  },
  {
    label: 'Toko Saya',
    icon: '⌘',
    path: '/toko-saya',
  },
  {
    label: 'Produk',
    icon: '□',
    path: '/produk',
  },
  {
    label: 'Inventory',
    icon: '▣',
    path: '/inventory',
  },
  {
    label: 'Kategori',
    icon: '◇',
    path: '/kategori',
  },
  {
    label: 'Penjualan',
    icon: '🛒',
    path: '/penjualan',
  },
  {
    label: 'Laporan',
    icon: '⌁',
    path: '/laporan',
  },
];

const OwnerSidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-orange-100 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-orange-100 px-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Intelli<span className="text-orange-500">Mart</span>
          </h1>

          <p className="text-xs text-slate-400">
            POS & Inventory Management
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-500'
              }`
            }
          >
            <span className="w-5 text-center text-lg">{item.icon}</span>

            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Owner */}
      <div className="m-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg text-white">
            👑
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">Owner</p>

            <p className="text-xs text-slate-500">
              Akses penuh ke seluruh fitur
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OwnerSidebar;
