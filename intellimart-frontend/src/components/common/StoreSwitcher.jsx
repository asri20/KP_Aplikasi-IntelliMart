import { useState } from "react";
import { useStore } from "../../hooks/useStore";

export default function StoreSwitcher() {
  const { stores, activeStore, setActiveStore } = useStore();
  const [open, setOpen] = useState(false);

  const handleSwitch = async (store) => {
    await setActiveStore(store);
    setOpen(false);
  };

  return (
    <div className="store-switcher" style={{ position: "relative" }}>
      <button
        className="store-switcher__btn"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="store-dot" />
        <span>{activeStore?.name || "Pilih Toko"}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="store-switcher__dropdown">
          <div className="store-switcher__label">Ganti Toko</div>
          {stores.map((store) => (
            <button
              key={store.id}
              className={`store-switcher__item ${activeStore?.id === store.id ? "active" : ""}`}
              onClick={() => handleSwitch(store)}
            >
              <span className="store-avatar">{store.name[0]}</span>
              <div>
                <div className="store-name">{store.name}</div>
                <div className="store-addr">{store.address}</div>
              </div>
              {activeStore?.id === store.id && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: "auto" }}>
                  <path d="M2 7l3.5 3.5L12 3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
