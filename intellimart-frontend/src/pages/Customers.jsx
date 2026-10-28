export default function Customers() {
  const CUSTOMERS = [
    { id: 1, name: "Ahmad Surya", phone: "08123456789", type: "Loyal", total: "Rp 2.400.000", segment: "loyal" },
    { id: 2, name: "Budi Raharjo", phone: "08234567890", type: "Aktif", total: "Rp 850.000", segment: "active" },
    { id: 3, name: "Siti Maharani", phone: "08345678901", type: "Pasif", total: "Rp 120.000", segment: "passive" },
    { id: 4, name: "Dewi Lestari", phone: "08456789012", type: "Loyal", total: "Rp 3.100.000", segment: "loyal" },
  ];
  const SEG_COLOR = { loyal: "#22c55e", active: "#0ea5e9", passive: "#94a3b8" };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">Pelanggan</h2>
        <button className="btn-primary">+ Tambah Pelanggan</button>
      </div>
      <div className="table-card">
        <table className="dash-table">
          <thead><tr><th>Nama</th><th>Telepon</th><th>Segmen</th><th>Total Belanja</th><th>Aksi</th></tr></thead>
          <tbody>
            {CUSTOMERS.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td><span className="badge" style={{ background: SEG_COLOR[c.segment] + "22", color: SEG_COLOR[c.segment] }}>{c.type}</span></td>
                <td>{c.total}</td>
                <td><button className="btn-ghost btn-sm">Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
