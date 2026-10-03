import { OwnerSidebar, OwnerHeader } from '@features/owner/components/organisms';
import { StatCard, StoreCard } from '@features/owner/components/molecules';
import { Button } from '@shared/components/atoms';

// TODO: ganti dummy data ini dengan data dari tm_store (via storeService) pas tahap integrasi API
const stores = [
  {
    id: 1,
    name: 'IntelliMart Cibaduyut',
    location: 'Jl. Cibaduyut Raya No. 25, Bandung',
    manager: 'Andi Setiawan',
    totalProduk: 128,
    totalTransaksi: 245,
  },
  {
    id: 2,
    name: 'IntelliMart Dago',
    location: 'Jl. Ir. H. Djuanda No. 88, Bandung',
    manager: 'Siti Rahma',
    totalProduk: 96,
    totalTransaksi: 187,
  },
  {
    id: 3,
    name: 'IntelliMart Antapani',
    location: 'Jl. Terusan Jakarta No. 45, Bandung',
    manager: null,
    totalProduk: 74,
    totalTransaksi: 103,
  },
];

const TokoSayaPage = () => {
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
                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                    Toko Saya
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola semua toko yang Anda miliki dan terhubung dengan akun Owner.
                  </p>
                </div>
              </div>

              <Button variant="primary">+ Tambah Toko Baru</Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-3">
              <StatCard
                icon="🏬"
                tone="orange"
                title="Total Toko"
                value={stores.length}
                description="Toko yang Anda miliki"
              />

              <StatCard
                icon="✅"
                tone="green"
                title="Toko Aktif"
                value={stores.filter((s) => s.manager).length}
                description="Toko sedang beroperasi"
              />

              <StatCard
                icon="👥"
                tone="purple"
                title="Belum Ada Manager"
                value={stores.filter((s) => !s.manager).length}
                description="Perlu assign manager"
              />
            </div>

            {/* Search + Filter */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Cari nama toko atau lokasi..."
                  className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none">
                <option>Semua Status</option>
                <option>Aktif</option>
                <option>Tanpa Manager</option>
              </select>
            </div>

            {/* Store Grid */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TokoSayaPage;
