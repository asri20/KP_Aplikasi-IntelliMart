import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
      {/* 1. Sidebar Navigasi */}
      <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 p-4 space-y-4 hidden md:block">
        <h2 className="text-xl font-bold text-brand-600">IntelliMart</h2>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
            Dashboard
          </Link>
          <Link to="/purchase-order" className="block px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
            Purchase Order
          </Link>
        </nav>
      </aside>

      {/* 2. Area Konten Utama */}
      <div className="flex-1 flex flex-col">
        {/* Header Atas */}
        <header className="p-4 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
          <span className="font-semibold">Sistem Kasir & POS</span>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet /> {/* Halaman seperti PurchaseOrderPage akan dirender otomatis di sini */}
        </main>
      </div>
    </div>
  );
}