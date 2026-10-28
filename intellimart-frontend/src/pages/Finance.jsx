export default function Finance() {
  const RECORDS = [
    { id: 1, desc: "Penjualan harian", amount: "Rp 4.250.000", type: "in", date: "14 Mei 2026" },
    { id: 2, desc: "Pembelian stok Indofood", amount: "Rp 1.800.000", type: "out", date: "13 Mei 2026" },
    { id: 3, desc: "Penjualan harian", amount: "Rp 3.900.000", type: "in", date: "13 Mei 2026" },
    { id: 4, desc: "Listrik & operasional", amount: "Rp 450.000", type: "out", date: "12 Mei 2026" },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">Keuangan</h2>
        <button className="btn-primary">+ Catat Transaksi</button>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "1.5rem" }}>
        {[
          { label: "Kas Masuk (Bulan Ini)", value: "Rp 48.200.000", color: "#22c55e" },
          { label: "Kas Keluar (Bulan Ini)", value: "Rp 31.500.000", color: "#ef4444" },
          { label: "Saldo Bersih", value: "Rp 16.700.000", color: "#0ea5e9" },
        ].map((s) => (
          <div className="stat-card" key={s.label} style={{ "--accent": s.color }}>
            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="table-card">
        <table className="dash-table">
          <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th><th>Tipe</th></tr></thead>
          <tbody>
            {RECORDS.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.desc}</td>
                <td style={{ color: r.type === "in" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                  {r.type === "in" ? "+" : "-"}{r.amount}
                </td>
                <td><span className={`badge badge--${r.type === "in" ? "paid" : "pending"}`}>{r.type === "in" ? "Masuk" : "Keluar"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
