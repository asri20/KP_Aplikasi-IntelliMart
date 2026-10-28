import { useState } from "react";

const MOCK_PRODUCTS = [
  { id: 1, name: "Indomie Goreng", sku: "IND-GRG-500", stock: 150, price: "Rp 3.500", category: "Mie Instan", status: "active" },
  { id: 2, name: "Aqua 600ml", sku: "AQU-600ML", stock: 8, price: "Rp 4.000", category: "Minuman", status: "low" },
  { id: 3, name: "Beras Premium 5kg", sku: "BRS-PRE-5K", stock: 45, price: "Rp 72.000", category: "Bahan Pokok", status: "active" },
  { id: 4, name: "Minyak Goreng 2L", sku: "MYK-GRG-2L", stock: 3, price: "Rp 35.000", category: "Bahan Pokok", status: "low" },
  { id: 5, name: "Sabun Lifebuoy", sku: "SAB-LFB-90", stock: 60, price: "Rp 8.000", category: "Perawatan", status: "active" },
];

export default function Products() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">Produk & Stok</h2>
        <button className="btn-primary">+ Tambah Produk</button>
      </div>
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-card">
        <table className="dash-table">
          <thead>
            <tr><th>Produk</th><th>SKU</th><th>Kategori</th><th>Stok</th><th>Harga</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td className="trx-id">{p.sku}</td>
                <td>{p.category}</td>
                <td>
                  <span style={{ color: p.status === "low" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                    {p.stock}
                  </span>
                  {p.status === "low" && <span style={{ marginLeft: 6, fontSize: 12 }}>⚠️</span>}
                </td>
                <td>{p.price}</td>
                <td>
                  <span className={`badge badge--${p.status === "active" ? "paid" : "pending"}`}>
                    {p.status === "active" ? "Normal" : "Stok Rendah"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
