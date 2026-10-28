import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Indomie Goreng", price: 3500, stock: 150 },
  { id: 2, name: "Aqua 600ml", price: 4000, stock: 8 },
  { id: 3, name: "Beras 5kg", price: 72000, stock: 45 },
  { id: 4, name: "Minyak 2L", price: 35000, stock: 3 },
  { id: 5, name: "Sabun Lifebuoy", price: 8000, stock: 60 },
  { id: 6, name: "Kopi Kapal Api", price: 6500, stock: 30 },
];

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function POS() {
  const [cart, setCart] = useState([]);
  const [paid, setPaid] = useState(false);

  const addItem = (product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const checkout = () => {
    if (!cart.length) return;
    setPaid(true);
    setTimeout(() => { setCart([]); setPaid(false); }, 2500);
  };

  return (
    <div className="pos-layout">
      {/* Product grid */}
      <div className="pos-products">
        <div className="page-header">
          <h2 className="page-title">Point of Sale</h2>
        </div>
        <div className="pos-grid">
          {PRODUCTS.map((p) => (
            <button key={p.id} className="pos-item" onClick={() => addItem(p)}>
              <div className="pos-item__name">{p.name}</div>
              <div className="pos-item__price">{fmt(p.price)}</div>
              <div className="pos-item__stock">Stok: {p.stock}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="pos-cart">
        <div className="pos-cart__header">🛒 Keranjang</div>
        {cart.length === 0 ? (
          <div className="pos-empty">Belum ada produk</div>
        ) : (
          <div className="pos-cart__items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__info">
                  <div className="cart-item__name">{item.name}</div>
                  <div className="cart-item__price">{fmt(item.price)} × {item.qty}</div>
                </div>
                <div className="cart-item__subtotal">{fmt(item.price * item.qty)}</div>
                <button className="cart-item__remove" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="pos-cart__footer">
          <div className="pos-total">
            <span>Total</span>
            <strong>{fmt(total)}</strong>
          </div>
          <button
            className={`btn-primary pos-pay-btn ${paid ? "paid" : ""}`}
            onClick={checkout}
            disabled={!cart.length}
          >
            {paid ? "✓ Berhasil Bayar!" : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
