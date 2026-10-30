import { NavLink } from 'react-router-dom';

import { Icon } from '@shared/components/atoms';

import { managerMenu } from '../../constants/navigation';

const ICONS = {
  dashboard: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 10 9-7 9 7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 9v11h14V9"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 20v-7h6v7"
      />
    </>
  ),

  products: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 9 5-9 5-9-5 9-5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 8 9 5 9-5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8v8l9 5 9-5V8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 13v8"
      />
    </>
  ),

  inventory: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7h18l-2 14H5L3 7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7a4 4 0 0 1 8 0"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6"
      />
    </>
  ),

  sales: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"
      />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),

  reports: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3v18h18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m7 14 4-4 4 3 6-7"
      />
    </>
  ),

  staff: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      />
      <circle cx="10" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21v-2a4 4 0 0 0-3-3.87"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 3.13a4 4 0 0 1 0 7.75"
      />
    </>
  ),

  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-2 .9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-2-.9l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 2-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 2 .9l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z"
      />
    </>
  ),
};

const ManagerSidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-zinc-100 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <Icon size="lg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8h18l-2 11H5L3 8Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8V6a5 5 0 0 1 10 0v2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h8"
              />
            </Icon>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Intelli<span className="text-brand-500">Mart</span>
            </h1>

            <p className="text-[10px] text-zinc-500">
              POS & Inventory Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Navigasi Manager"
        className="flex-1 space-y-2 px-4 py-6"
      >
        {managerMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-4 py-3',
                'text-sm font-medium transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-orange-50 hover:text-brand-600',
              ].join(' ')
            }
          >
            <Icon size="md" className="shrink-0">
              {ICONS[item.icon]}
            </Icon>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-zinc-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
            M
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-800">
              Manager
            </p>

            <p className="text-xs text-zinc-500">
              Manajemen Toko
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ManagerSidebar;