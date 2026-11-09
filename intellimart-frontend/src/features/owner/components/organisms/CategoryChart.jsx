const COLORS = ['#f97316', '#fb923c', '#facc15', '#fde047', '#cbd5e1'];
const DOT_CLASSES = [
  'bg-orange-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-yellow-300',
  'bg-slate-300',
];

const CategoryChart = ({ catalog = [] }) => {
  const totalProducts = catalog.length;

  // Hitung distribusi kategori dari katalog produk toko aktif
  const counts = {};
  catalog.forEach((item) => {
    const cat = item.category_name || item.category || 'Lainnya';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categories = sorted.length
    ? sorted.map(([name, value]) => ({
        name,
        value: String(value),
        percentNumber: totalProducts > 0 ? Math.round((value / totalProducts) * 100) : 0,
        percent: totalProducts > 0 ? `${Math.round((value / totalProducts) * 100)}%` : '0%',
      }))
    : [{ name: 'Belum ada produk', value: '0', percentNumber: 100, percent: '0%' }];

  let acc = 0;
  const gradientStops = categories
    .map((c, idx) => {
      const start = acc;
      acc = Math.min(100, acc + (c.percentNumber || 20));
      return `${COLORS[idx % COLORS.length]} ${start}% ${idx === categories.length - 1 ? 100 : acc}%`;
    })
    .join(', ');

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-900">🥧 Kategori Produk</h3>

      <div className="mt-5 flex items-center gap-6">
        {/* Donut */}
        <div
          className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${gradientStops})`,
          }}
        >
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-slate-900">{totalProducts}</span>
            <span className="text-xs text-slate-400">Varian</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    DOT_CLASSES[index % DOT_CLASSES.length]
                  }`}
                />
                <span className="text-slate-600">{category.name}</span>
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
