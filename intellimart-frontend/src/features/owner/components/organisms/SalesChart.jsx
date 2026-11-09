const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const SalesChart = ({ trend = [], days = 7, onChangeDays }) => {
  const maxRevenue = Math.max(
    ...trend.map((d) => Number(d.total_revenue || 0)),
    1
  );

  // Bangun koordinat grafik SVG dari data real (atau garis datar jika belum ada penjualan)
  const points =
    trend.length > 0
      ? trend.map((item, idx) => {
          const x =
            trend.length === 1
              ? 350
              : Math.round((idx / (trend.length - 1)) * 660) + 20;
          const ratio = Number(item.total_revenue || 0) / maxRevenue;
          const y = Math.round(215 - ratio * 170);
          const dateLabel = item.sales_date
            ? new Date(item.sales_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
              })
            : `#${idx + 1}`;
          return {
            x,
            y,
            label: dateLabel,
            revenue: Number(item.total_revenue || 0),
          };
        })
      : [
          { x: 20, y: 215, label: '-', revenue: 0 },
          { x: 680, y: 215, label: 'Hari ini', revenue: 0 },
        ];

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x} 245 L${points[0].x} 245 Z`;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">📈 Grafik Penjualan</h3>
          <p className="text-sm text-slate-400">{days} Hari Terakhir</p>
        </div>

        <select
          value={days}
          onChange={(e) => onChangeDays?.(Number(e.target.value))}
          className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none"
        >
          <option value={7}>7 Hari Terakhir</option>
          <option value={30}>30 Hari Terakhir</option>
        </select>
      </div>

      <div className="h-64">
        <svg
          viewBox="0 0 700 250"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#salesGradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, idx) => (
            <circle
              key={`${p.x}-${idx}`}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#fff"
              stroke="#f97316"
              strokeWidth="3"
            >
              <title>{`${p.label}: ${formatRupiah(p.revenue)}`}</title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {points.map((p, idx) => (
          <span key={`${p.label}-${idx}`}>{p.label}</span>
        ))}
      </div>
    </section>
  );
};

export default SalesChart;
