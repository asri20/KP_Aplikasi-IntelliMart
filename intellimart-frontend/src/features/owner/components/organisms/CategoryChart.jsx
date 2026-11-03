const categories = [
  { name: 'Makanan & Minuman', value: '42', percent: '32%' },
  { name: 'Snack', value: '28', percent: '22%' },
  { name: 'Minuman', value: '20', percent: '16%' },
  { name: 'Perlengkapan Rumah', value: '16', percent: '12%' },
  { name: 'Lainnya', value: '22', percent: '18%' },
];

const CategoryChart = () => {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-900">
        🥧 Kategori Produk
      </h3>

      <div className="mt-5 flex items-center gap-6">
        {/* Donut */}
        <div
          className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
          style={{
            background:
              'conic-gradient(#f97316 0 32%, #fb923c 32% 54%, #facc15 54% 70%, #fde047 70% 82%, #cbd5e1 82% 100%)',
          }}
        >
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-slate-900">
              128
            </span>

            <span className="text-xs text-slate-400">
              Produk
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === 0
                      ? 'bg-orange-500'
                      : index === 1
                        ? 'bg-orange-400'
                        : index === 2
                          ? 'bg-yellow-400'
                          : index === 3
                            ? 'bg-yellow-300'
                            : 'bg-slate-300'
                  }`}
                />

                <span className="text-slate-600">
                  {category.name}
                </span>
              </div>

              <span className="font-semibold text-slate-500">
                {category.value} ({category.percent})
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryChart;