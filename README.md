# 🛒 IntelliMart — Modul 4: Purchase Order & Management Stok Masuk

> Solusi Pengadaan Barang (Purchase Order) dan Manajemen Penerimaan Stok Fisik Real-time untuk InteliMart Multi-POS System.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-Node.js-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Daftar Isi

* [Tentang Modul 4](#-tentang-modul-4)
* [Fitur Utama](#-fitur-utama)
* [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
* [Struktur Proyek](#-struktur-proyek)
* [Dokumentasi API Endpoints](#-dokumentasi-api-endpoints)
* [Alur Kerja (Workflow)](#-alur-kerja-workflow)
* [Cara Menjalankan Proyek](#-cara-menjalankan-proyek)

---

## 📦 Tentang Modul 4

**Modul 4 (Purchase Order & Stok Masuk)** adalah bagian dari sistem InteliMart yang menangani alur bisnis pengadaan barang dari *supplier* hingga penerimaan fisik di gudang/toko. Modul ini memastikan pencatatan pemesanan barang terintegrasi secara otomatis dengan pembaruan stok varian produk via *database triggers*.

---

## ✨ Fitur Utama

* **Pembuatan Purchase Order (Multi-Item):** Membuat dokumen PO baru dengan dukungan pemesanan banyak varian barang sekaligus dalam satu transaksi.
* **Integrasi Master Supplier & Varian:** Menghubungkan PO dengan data supplier (`tm_supplier`) dan varian produk (`ms_product_variant`).
* **Penerimaan Barang Fisik (Receiving):** Pencatatan penerimaan fisik barang per item (`tt_purchase_order_detail`).
* **Pembaruan Stok Otomatis:** Integrasi dengan *database trigger* MySQL yang langsung mengupdate stok produk begitu penerimaan dikonfirmasi.
* **Monitoring & Filter Status:** Visualisasi status PO (`DRAFT`, `PARTIALLY_RECEIVED`, `RECEIVED`) dengan tampilan responsif.

---

## 🛠️ Arsitektur & Tech Stack

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | Antarmuka pengguna responsif & dinamis |
| **HTTP Client** | Axios | Komunikasi data dengan backend REST API |
| **Backend** | Node.js, Express.js | Server penangan logika bisnis & routing REST API |
| **Database** | MySQL | Database relasional (`tt_purchase_order`, `tt_purchase_order_detail`, `tm_supplier`, `ms_product_variant`) |

---

## 📁 Struktur Proyek

```text
├── routes/
│   └── purchaseOrder.js          # Express Router untuk endpoint /api/po
├── src/
│   ├── api/
│   │   └── poApi.js               # Service handler API Axios untuk Modul 4
│   └── pages/
│       └── PurchaseOrderPage.jsx  # Tampilan Komponen Utama Modul 4
├── server.js                      # Entry point Express backend server
└── package.json                   # Dependensi proyek

---

## 🔄 Workflow & Alur Kerja Modul 4

Berikut adalah diagram alur kerja (*workflow*) dari proses pengadaan barang (Purchase Order) hingga pembaruan stok fisik secara otomatis di sistem **InteliMart**:

### 📊 Diagram Alur Sistem (Mermaid Flowchart)

```mermaid
flowchart TD
    %% Subgraph 1: Pembuatan PO
    subgraph S1 [1. Pembuatan Purchase Order]
        A[User / Admin] -->|1. Pilih Supplier & Varian Produk| B[Input Qty Pesan & Harga Beli]
        B -->|2. Klik 'Kirim & Terbitkan PO'| C[POST /api/po]
        C --> D[(Database MySQL)]
        D -->|3a. Insert tt_purchase_order| E[Status PO: DRAFT]
        D -->|3b. Insert tt_purchase_order_detail| E
    end

    %% Subgraph 2: Monitoring & Kedatangan
    subgraph S2 [2. Monitoring & Kedatangan Barang]
        E --> F[Monitoring di Tabel Riwayat PO]
        F -->|4. Barang Tiba di Gudang/Toko| G[Klik 'Lihat Item / Terima']
        G --> H[GET /api/po/:id]
        H --> I[Tampil List Item Pesanan]
    end

    %% Subgraph 3: Penerimaan & Auto Update
    subgraph S3 [3. Penerimaan Fisik & Update Stok]
        I -->|5. Klik 'Terima Item' & Input Qty| J[POST /api/po/receive]
        J --> K[Update tt_purchase_order_detail]
        K --> L{Trigger Database / Auto Update}
        L -->|6a. Tambah Stok Varian| M[(Tabel Stock Product)]
        L -->|6b. Evaluasi Qty Diterima| N{Penerimaan Lengkap?}
        N -->|Sebagian| O[Status PO: PARTIALLY_RECEIVED]
        N -->|Lengkap| P[Status PO: RECEIVED]
    end

    %% Styling Warna Node
    style S1 fill:#f9f9f9,stroke:#333,stroke-width:1px
    style S2 fill:#f0f7ff,stroke:#0066cc,stroke-width:1px
    style S3 fill:#f0fff4,stroke:#28a745,stroke-width:1px
    style E fill:#fff3cd,stroke:#ffeba0,color:#856404
    style O fill:#ffe8cc,stroke:#fd7e14,color:#d9480f
    style P fill:#d4edda,stroke:#28a745,color:#155724