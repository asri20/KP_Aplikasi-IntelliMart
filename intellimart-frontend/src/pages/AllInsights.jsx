export default function AllInsights() {
  const INSIGHTS = [
    { title: "Indomie Goreng naik 30%", desc: "Penjualan minggu ini meningkat drastis. Segera restock sebelum kehabisan.", type: "up", confidence: 94 },
    { title: "Prediksi penjualan minggu depan", desc: "Perkiraan Rp 52.000.000 berdasarkan tren 4 minggu terakhir.", type: "forecast", confidence: 87 },
    { title: "3 pelanggan loyal tidak aktif", desc: "Ahmad, Dewi, dan Rina belum transaksi 14+ hari. Kirim promo!", type: "warn", confidence: 91 },
    { title: "Minyak Goreng stok kritis", desc: "Perkiraan habis dalam 3 hari. Reorder point sudah terlampaui.", type: "alert", confidence: 98 },
    { title: "Penjualan Senin lebih rendah", desc: "Rata-rata turun 15% setiap Senin. Pertimbangkan promo hari Senin.", type: "down", confidence: 82 },
  ];

  const TYPE_ICON = { up: "📈", forecast: "🔮", warn: "⚡", alert: "🚨", down: "📉" };
  const TYPE_COLOR = { up: "#22c55e", forecast: "#6366f1", warn: "#f59e0b", alert: "#ef4444", down: "#f97316" };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">🤖 AI Insights</h2>
        <span className="ai-badge">Powered by ML Engine</span>
      </div>
      <div className="insights-grid">
        {INSIGHTS.map((ins, i) => (
          <div key={i} className="insight-card" style={{ "--c": TYPE_COLOR[ins.type] }}>
            <div className="insight-card__icon">{TYPE_ICON[ins.type]}</div>
            <div className="insight-card__content">
              <div className="insight-card__title">{ins.title}</div>
              <div className="insight-card__desc">{ins.desc}</div>
              <div className="insight-card__conf">
                <div className="conf-bar">
                  <div className="conf-fill" style={{ width: ins.confidence + "%", background: TYPE_COLOR[ins.type] }} />
                </div>
                <span>{ins.confidence}% confidence</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
