import { useMemo, useState } from 'react';

import { Button } from '@shared/components/atoms';
import { StatCard, StoreCard } from '@features/owner/components/molecules';
import {
  OwnerSidebar,
  OwnerHeader,
  CreateStoreModal,
} from '@features/owner/components/organisms';
import { useStores } from '@features/owner/hooks';

const TokoSayaPage = () => {
  const { data: stores = [], isLoading, isError, error, refetch } = useStores();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [showCreateStore, setShowCreateStore] = useState(false);

  const totalActive = stores.filter((s) => s.isActive && s.manager).length;
  const withoutManager = stores.filter((s) => !s.manager).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter((s) => {
      const matchText = !q || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
      const matchStatus =
        status === 'all' ||
        (status === 'active' && s.isActive && s.manager) ||
        (status === 'nomanager' && !s.manager);
      return matchText && matchStatus;
    });
  }, [stores, search, status]);

  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            {/* Title + CTA */}
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  🏬
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Toko Saya</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Kelola semua toko yang Anda miliki dan terhubung dengan akun Owner.
                  </p>
                </div>
              </div>

              <Button variant="primary" onClick={() => setShowCreateStore(true)}>
                + Tambah Toko Baru
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-3">
              <StatCard icon="🏬" tone="orange" title="Total Toko" value={stores.length} description="Toko yang Anda miliki" />
              <StatCard icon="✅" tone="green" title="Toko Aktif" value={totalActive} description="Toko sedang beroperasi" />
              <StatCard icon="👥" tone="purple" title="Belum Ada Manager" value={withoutManager} description="Perlu assign manager" />
            </div>

            {/* Search + Filter */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama toko atau lokasi..."
                  className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="nomanager">Tanpa Manager</option>
              </select>
            </div>

            {/* Content */}
            {isLoading && <p className="mt-10 text-center text-sm text-slate-500">Memuat toko...</p>}

            {isError && (
              <div className="mt-10 text-center">
                <p className="text-sm text-red-600">{error?.message ?? 'Gagal memuat toko.'}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                  Coba lagi
                </Button>
              </div>
            )}

            {!isLoading && !isError && stores.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                <p className="text-lg font-semibold text-slate-800">Belum ada toko</p>
                <p className="mt-1 text-sm text-slate-500">
                  Mulai dengan membuat toko pertama Anda, lalu tambahkan manager dan kasir.
                </p>
                <Button className="mt-4" onClick={() => setShowCreateStore(true)}>
                  + Tambah Toko Baru
                </Button>
              </div>
            )}

            {!isLoading && !isError && stores.length > 0 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-slate-500">
                    Tidak ada toko yang cocok dengan pencarian.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <CreateStoreModal isOpen={showCreateStore} onClose={() => setShowCreateStore(false)} />
    </div>
  );
};

export default TokoSayaPage;
