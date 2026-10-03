const SalesChart = () => {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            📈 Grafik Penjualan
          </h3>

          <p className="text-sm text-slate-400">
            7 Hari Terakhir
          </p>
        </div>

        <select className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none">
          <option>7 Hari Terakhir</option>
          <option>30 Hari Terakhir</option>
        </select>
      </div>

      <div className="h-64">
        <svg
          viewBox="0 0 700 250"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="salesGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#f97316"
                stopOpacity="0.25"
              />

              <stop
                offset="100%"
                stopColor="#f97316"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d="M0 205
               C60 180 90 150 150 170
               C210 190 245 125 300 145
               C355 165 400 115 450 130
               C505 145 550 85 600 105
               C640 120 665 65 700 45
               L700 250
               L0 250 Z"
            fill="url(#salesGradient)"
          />

          <path
            d="M0 205
               C60 180 90 150 150 170
               C210 190 245 125 300 145
               C355 165 400 115 450 130
               C505 145 550 85 600 105
               C640 120 665 65 700 45"
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {[
            [0, 205],
            [150, 170],
            [300, 145],
            [450, 130],
            [600, 105],
            [700, 45],
          ].map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="5"
              fill="#fff"
              stroke="#f97316"
              strokeWidth="3"
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>17 Sep</span>
        <span>18 Sep</span>
        <span>19 Sep</span>
        <span>20 Sep</span>
        <span>21 Sep</span>
        <span>22 Sep</span>
        <span>23 Sep</span>
      </div>
    </section>
  );
};

export default SalesChart;