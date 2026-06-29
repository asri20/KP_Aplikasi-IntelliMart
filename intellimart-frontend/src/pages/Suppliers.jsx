export default function Suppliers() {
  const SUPPLIERS = [
    { id: 1, name: "PT Indofood Sukses", contact: "021-5000111", category: "Sembako", rating: 5 },
    { id: 2, name: "CV Maju Bersama", contact: "022-3001234", category: "Minuman", rating: 4 },
    { id: 3, name: "UD Sejahtera", contact: "024-6006789", category: "Snack", rating: 3 },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">Supplier</h2>
        <button className="btn-primary">+ Tambah Supplier</button>
      </div>
      <div className="table-card">
        <table className="dash-table">
          <thead><tr><th>Nama Supplier</th><th>Kontak</th><th>Kategori</th><th>Rating</th><th>Aksi</th></tr></thead>
          <tbody>
            {SUPPLIERS.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.contact}</td>
                <td>{s.category}</td>
                <td>{"⭐".repeat(s.rating)}</td>
                <td><button className="btn-ghost btn-sm">Order</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
