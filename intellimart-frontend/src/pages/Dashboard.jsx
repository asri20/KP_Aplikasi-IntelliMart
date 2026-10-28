import { useAuth } from "../hooks/useAuth";
import { useStore } from "../hooks/useStore";
import RoleGuard from "../components/common/RoleGuard";

const STATS = [
  { label: "Total Penjualan", value: "Rp 12.450.000", change: "+18%", icon: "📈", color: "#22c55e" },
  { label: "Transaksi Hari Ini", value: "47", change: "+5", icon: "🧾", color: "#0ea5e9" },
  { label: "Produk Stok Rendah", value: "12", change: "⚠️ Perlu restock", icon: "📦", color: "#f59e0b" },
  { label: "Pelanggan Aktif", value: "234", change: "+8 minggu ini", icon: "👥", color: "#a855f7" },
];

const RECENT_SALES = [
  { id: "#TRX-001", customer: "Ahmad S.", total: "Rp 85.000", time: "10:23", status: "paid" },
  { id: "#TRX-002", customer: "Budi R.", total: "Rp 250.000", time: "10:45", status: "paid" },
  { id: "#TRX-003", customer: "Umum", total: "Rp 35.000", time: "11:02", status: "paid" },
  { id: "#TRX-004", customer: "Siti M.", total: "Rp 120.000", time: "11:30", status: "pending" },
  { id: "#TRX-005", customer: "Dewi L.", total: "Rp 67.000", time: "11:55", status: "paid" },
];

const AI_INSIGHTS = [
  { text: "Produk Indomie Goreng naik 30% minggu ini — siapkan restock!", type: "up" },
  { text: "Penjualan turun 12% di hari Senin — pertimbangkan promo khusus.", type: "down" },
  { text: "3 pelanggan loyal belum transaksi 14+ hari — kirim reminder!", type: "warn" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { activeStore } = useStore();

  return (
    <div className="page-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">Halo, {user?.name?.split(" ")[0]} 👋</h2>
          <p className="page-sub">
            {activeStore?.name} · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label} style={{ "--accent": s.color }}>
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__change" style={{ color: s.color }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent transactions */}
        <div className="dash-card">
          <div className="dash-card__header">
            <h3>Transaksi Terbaru</h3>
            <button className="dash-link">Lihat semua →</button>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SALES.map((s) => (
                <tr key={s.id}>
                  <td className="trx-id">{s.id}</td>
                  <td>{s.customer}</td>
                  <td className="trx-total">{s.total}</td>
                  <td className="trx-time">{s.time}</td>
                  <td>
                    <span className={`badge badge--${s.status}`}>
                      {s.status === "paid" ? "Lunas" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Insights */}
        <RoleGuard module="ai">
          <div className="dash-card">
            <div className="dash-card__header">
              <h3>🤖 AI Insights</h3>
              <span className="ai-badge">Powered by ML</span>
            </div>
            <div className="ai-insights-list">
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} className={`ai-insight ai-insight--${ins.type}`}>
                  <span className="ai-insight__icon">
                    {ins.type === "up" ? "📈" : ins.type === "down" ? "📉" : "⚡"}
                  </span>
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
            <div className="ai-footer">
              <button className="btn-primary btn-sm">Lihat Semua Insight →</button>
            </div>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
