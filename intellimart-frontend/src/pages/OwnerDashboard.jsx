import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CalendarDays, ChevronDown, CircleUserRound, FileBarChart2,
  Home, LogOut, Menu, Plus, Search, Settings, Store, UsersRound, X
} from "lucide-react";
import { getSession, logout } from "../services/auth";
import { addStore, getStores } from "../services/store";

function Sidebar({ mobile, close, active, onLogout }) {
  const items = [
    [Home, "Owner Dashboard"],
    [Store, "Manage Stores"],
    [UsersRound, "Users & Managers"],
    [FileBarChart2, "Reports"],
    [Settings, "Settings"]
  ];

  return (
    <aside className={`${mobile ? "fixed inset-y-0 left-0 z-50 w-72" : "hidden lg:flex lg:w-64"} flex-col bg-[#112d62] text-white`}>
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <Store className="text-[#16ddd0]" size={29} />
          <div>
            <div className="text-xl font-extrabold tracking-tight">IntelliMart</div>
            <div className="text-[7px] font-medium text-white/80">Smart Retail, Smarter Decisions</div>
          </div>
        </div>
        {mobile && (
          <button onClick={close} className="ml-auto text-white/80"><X size={20} /></button>
        )}
      </div>

      <nav className="flex-1 space-y-2 p-3">
        {items.map(([Icon, label]) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${
              active === label ? "bg-[#14b9b5] font-semibold" : "text-white/85 hover:bg-white/10"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20bdb7]">
            <CircleUserRound size={21} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold">John Doe</div>
            <div className="text-[10px] text-white/60">Owner</div>
          </div>
          <ChevronDown size={14} className="ml-auto text-white/60" />
        </div>

        <button
          onClick={onLogout}
          className="mt-5 flex items-center gap-3 text-xs text-white/80 hover:text-white"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

function StoreCard({ store }) {
  return (
    <article className="rounded-xl border border-[#e2eaf2] bg-white p-3 shadow-[0_3px_15px_rgba(28,59,99,.04)]">
      <div className="flex gap-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-[#dcecf0]">
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1c416e] to-[#55b4bc] text-[10px] font-bold text-white">
            STORE
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-bold text-[#183567]">{store.name}</h3>
            <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-bold ${
              store.manager === "Not Assigned"
                ? "bg-[#fff0f0] text-[#ef5b68]"
                : "bg-[#e9fbf7] text-[#0aa986]"
            }`}>
              {store.manager === "Not Assigned" ? "No Manager Assigned" : "Manager Assigned"}
            </span>
          </div>
          <p className="mt-1 text-[9px] text-[#6d7e98]">{store.address}</p>
          <p className="mt-1 text-[9px] text-[#6d7e98]">{store.phone} · {store.email}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-2 text-[9px]">
        <span className="text-[#536987]">
          Manager: <b>{store.manager}</b> ·{" "}
          <span className={store.active ? "text-[#10a984]" : "text-[#8491a5]"}>
            {store.active ? "Active" : "Inactive"}
          </span>
        </span>
        <button className="font-semibold text-[#219fc0]">View Details ›</button>
      </div>
    </article>
  );
}

function CreateStoreModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await addStore(form);
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Gagal membuat toko.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d2147]/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-[#132d63] px-6 py-5 text-white">
          <h2 className="text-lg font-bold">Create New Store</h2>
          <p className="mt-1 text-[10px] text-white/65">Set up a new store under your Owner account.</p>
        </div>

        <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
          <input
            required name="name" value={form.name} onChange={change}
            placeholder="Store Name"
            className="h-12 rounded-lg border border-[#dce6ef] px-4 text-sm outline-none focus:border-[#19b6b4]"
          />
          <input
            name="phone" value={form.phone} onChange={change}
            placeholder="Phone Number"
            className="h-12 rounded-lg border border-[#dce6ef] px-4 text-sm outline-none focus:border-[#19b6b4]"
          />
          <input
            required name="address" value={form.address} onChange={change}
            placeholder="Store Address"
            className="h-12 rounded-lg border border-[#dce6ef] px-4 text-sm outline-none focus:border-[#19b6b4] sm:col-span-2"
          />
          {error && (
            <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button" onClick={onClose}
            className="h-12 rounded-lg border border-[#dce6ef] font-semibold text-[#647792]"
          >
            Cancel
          </button>
          <button disabled={saving} className="h-12 rounded-lg bg-[#19b6b4] font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Store"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [mobile, setMobile] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadStores() {
    setLoadingStores(true);
    setPageError("");

    try {
      const data = await getStores();
      setStores(data);
    } catch (error) {
      setPageError(error.message || "Gagal mengambil data toko.");
    } finally {
      setLoadingStores(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleSaved() {
    await loadStores();
  }

  const displayName = session?.fullName || "John Doe";

  return (
    <div className="flex min-h-screen bg-[#f9fbfd]">
      {mobile && (
        <div onClick={() => setMobile(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />
      )}

      <Sidebar
        mobile={mobile}
        close={() => setMobile(false)}
        active="Owner Dashboard"
        onLogout={handleLogout}
      />

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center gap-4 border-b border-[#e7edf3] bg-white px-4 sm:px-6">
          <button onClick={() => setMobile(true)} className="text-[#183567] lg:hidden">
            <Menu />
          </button>

          <div className="flex h-9 max-w-[520px] flex-1 items-center gap-2 rounded-md border border-[#dce6ef] px-3 text-[#7c8da7]">
            <Search size={15} />
            <input className="w-full text-xs outline-none" placeholder="Search stores, managers, or anything..." />
          </div>

          <Bell size={18} className="text-[#6e809d]" />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27bcb8] text-white">
              <CircleUserRound size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#183567]">{displayName}</div>
              <div className="text-[9px] text-[#7c8da7]">Owner</div>
            </div>
            <ChevronDown size={13} className="text-[#7890ad]" />
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-[#183567]">Owner Dashboard</h1>
              <p className="mt-1 text-[10px] text-[#71839e]">
                Manage your stores, teams, and business performance — all in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#7486a1]">
              <CalendarDays size={15} /> {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              }).format(new Date())}
            </div>
          </div>

          <section className="relative mt-5 overflow-hidden rounded-lg bg-[#edfafa] p-5">
            <div className="absolute right-8 top-2 opacity-20">
              <Store size={130} className="text-[#20bdb7]" />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6f6f3] text-[#11aaa7]">
                  <Store />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#183567]">Create New Store</h2>
                  <p className="text-[9px] text-[#6d819e]">
                    Expand your business by creating a new store. Set up details, assign a manager,
                    and get your store running in no time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpenCreate(true)}
                className="mt-3 flex items-center gap-2 rounded-md bg-[#13b5b2] px-4 py-2 text-[10px] font-bold text-white"
              >
                <Plus size={15} /> Create New Store
              </button>
            </div>
          </section>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#183567]">Your Stores</h2>
              <p className="text-[9px] text-[#7a8ca6]">
                Here is the list of all stores you own and manage.
              </p>
            </div>
            <span className="text-[10px] text-[#687c9b]">
              Total Stores: <b className="text-[#219fc0]">{stores.length}</b>
            </span>
          </div>

          {pageError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {pageError}
            </div>
          )}

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            {loadingStores ? (
              <div className="rounded-xl border border-[#e2eaf2] bg-white p-6 text-sm text-[#71839e] md:col-span-2">
                Loading stores...
              </div>
            ) : stores.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#cfdce8] bg-white p-8 text-center text-sm text-[#71839e] md:col-span-2">
                Belum ada toko. Klik <b>Create New Store</b> untuk membuat toko pertama.
              </div>
            ) : (
              stores.map(store => <StoreCard key={store.id} store={store} />)
            )}
          </section>
        </main>
      </div>

      {openCreate && (
  <CreateStoreModal
    onClose={() => setOpenCreate(false)}
    onSaved={handleSaved}
  />
)}
    </div>
  );
}
