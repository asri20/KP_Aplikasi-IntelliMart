import { OwnerSidebar, OwnerHeader, SalesChart, CategoryChart } from '@features/owner/components/organisms';
import { DashboardCard, ProductList, TransactionTable } from '@features/owner/components/molecules';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            {/* Greeting */}
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                  👋 Selamat datang, Owner!
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Berikut ringkasan aktivitas toko Anda hari ini.
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                📅 Sab, 23 Sep 2026
              </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                icon="🛒"
                title="Penjualan Hari Ini"
                value="Rp 4.850.000"
                description="↑ 12% dari kemarin"
                variant="orange"
              />

              <DashboardCard
                icon="📦"
                title="Total Produk"
                value="128"
                description="↑ 5 produk baru"
                variant="yellow"
              />

              <DashboardCard
                icon="⚠️"
                title="Stok Menipis"
                value="7"
                description="Perlu perhatian"
                variant="red"
              />

              <DashboardCard
                icon="👥"
                title="Total Transaksi"
                value="23"
                description="↑ 15% dari kemarin"
                variant="purple"
              />
            </div>

            {/* Dashboard Content */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <SalesChart />
              <CategoryChart />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <ProductList />
              <TransactionTable />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
