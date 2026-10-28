# IntelliMart Backend API

Backend REST API untuk sistem manajemen produk & stok IntelliMart, dibangun menggunakan **Node.js + Express.js + PostgreSQL** dengan arsitektur **MVC**.

---

## Struktur Folder

```
intellimart-backend/
│
├── src/
│   ├── config/
│   │   └── db.js                  ← Konfigurasi koneksi PostgreSQL (Pool)
│   │
│   ├── controllers/
│   │   ├── categoryController.js  ← Logic handler kategori
│   │   ├── brandController.js     ← Logic handler brand
│   │   ├── unitController.js      ← Logic handler satuan
│   │   ├── productController.js   ← Logic handler produk
│   │   ├── variantController.js   ← Logic handler varian produk
│   │   └── stockController.js     ← Logic handler stok masuk/keluar
│   │
│   ├── models/
│   │   ├── categoryModel.js       ← Query SQL kategori
│   │   ├── brandModel.js          ← Query SQL brand
│   │   ├── unitModel.js           ← Query SQL satuan
│   │   ├── productModel.js        ← Query SQL produk
│   │   ├── variantModel.js        ← Query SQL varian
│   │   └── stockModel.js          ← Query SQL stok
│   │
│   ├── routes/
│   │   ├── categoryRoutes.js      ← Route /api/categories
│   │   ├── brandRoutes.js         ← Route /api/brands
│   │   ├── unitRoutes.js          ← Route /api/units
│   │   ├── productRoutes.js       ← Route /api/products
│   │   ├── variantRoutes.js       ← Route /api/variants
│   │   └── stockRoutes.js         ← Route /api/stocks
│   │
│   └── app.js                     ← Entry point, konfigurasi Express
│
├── .env                           ← Variabel environment (tidak di-commit)
├── .env.example                   ← Contoh file .env
├── .gitignore
├── database.sql                   ← DDL + Data dummy PostgreSQL
├── package.json
└── README.md
```

---

## Prasyarat

- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **PostgreSQL** v14+ ([postgresql.org](https://www.postgresql.org))
- **npm** v9+
- **Postman** (untuk testing API)

---

## Cara Menjalankan Project

### Langkah 1: Clone / Buka folder project

```bash
cd intellimart-backend
```

### Langkah 2: Install dependencies

```bash
npm install
```

### Langkah 3: Setup Database PostgreSQL

Buka terminal PostgreSQL (psql) atau pgAdmin, lalu:

```sql
-- Buat database baru
CREATE DATABASE intellimart_db;

-- Hubungkan ke database
\c intellimart_db

-- Jalankan file SQL (dari terminal OS, bukan psql)
psql -U postgres -d intellimart_db -f database.sql
```

Atau jalankan langsung dari terminal:
```bash
psql -U postgres -d intellimart_db -f database.sql
```

### Langkah 4: Konfigurasi file .env

Salin file contoh dan sesuaikan:
```bash
cp .env.example .env
```

Edit file `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=intellimart_db
DB_USER=postgres
DB_PASSWORD=password_anda_di_sini

CORS_ORIGIN=http://localhost:3000
```

### Langkah 5: Jalankan Server

**Mode Development** (dengan auto-reload nodemon):
```bash
npm run dev
```

**Mode Production**:
```bash
npm start
```

Output yang diharapkan:
```
================================================
🚀 IntelliMart Backend berjalan di port 5000
   Mode: development
   URL:  http://localhost:5000
   API:  http://localhost:5000/api
================================================
✅ Berhasil terhubung ke PostgreSQL
   Database: intellimart_db
   Host: localhost:5432
```

---

## Daftar REST API Endpoint

### Base URL: `http://localhost:5000`

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/`                         | Health check server              |
| GET    | `/api`                      | Info API                         |

### 📁 KATEGORI (`/api/categories`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/categories`           | Ambil semua kategori             |
| GET    | `/api/categories/:id`       | Ambil kategori by ID             |
| POST   | `/api/categories`           | Buat kategori baru               |
| PUT    | `/api/categories/:id`       | Update kategori                  |
| DELETE | `/api/categories/:id`       | Hapus kategori                   |

### 🏷️ BRAND (`/api/brands`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/brands`               | Ambil semua brand                |
| GET    | `/api/brands/:id`           | Ambil brand by ID                |
| POST   | `/api/brands`               | Buat brand baru                  |
| PUT    | `/api/brands/:id`           | Update brand                     |
| DELETE | `/api/brands/:id`           | Hapus brand                      |

### 📏 SATUAN (`/api/units`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/units`                | Ambil semua satuan               |
| GET    | `/api/units/:id`            | Ambil satuan by ID               |
| POST   | `/api/units`                | Buat satuan baru                 |
| PUT    | `/api/units/:id`            | Update satuan                    |
| DELETE | `/api/units/:id`            | Hapus satuan                     |

### 📦 PRODUK (`/api/products`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/products`             | Ambil semua produk               |
| GET    | `/api/products/:id`         | Ambil produk + varian by ID      |
| POST   | `/api/products`             | Buat produk baru                 |
| PUT    | `/api/products/:id`         | Update produk                    |
| DELETE | `/api/products/:id`         | Hapus produk                     |

### 🔀 VARIAN (`/api/variants`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| GET    | `/api/variants`             | Ambil semua varian               |
| GET    | `/api/variants/:id`         | Ambil varian by ID               |
| POST   | `/api/variants`             | Buat varian baru                 |
| PUT    | `/api/variants/:id`         | Update varian                    |
| DELETE | `/api/variants/:id`         | Hapus varian                     |

### 📊 STOK (`/api/stocks`)

| Method | Endpoint                    | Deskripsi                        |
|--------|-----------------------------|----------------------------------|
| POST   | `/api/stocks/in`            | Catat stok masuk                 |
| POST   | `/api/stocks/out`           | Catat stok keluar                |
| GET    | `/api/stocks/low-stock`     | Produk dengan stok rendah        |

---

## Cara Test Menggunakan Postman

### Setup Postman

1. Buka Postman → **New Collection** → Nama: `IntelliMart API`
2. Set Base URL sebagai variabel: `{{base_url}}` = `http://localhost:5000`
3. Set Header default: `Content-Type: application/json`

---

### Contoh Request & Response

#### ✅ GET Semua Kategori
```
GET http://localhost:5000/api/categories
```
Response:
```json
{
  "success": true,
  "message": "Data kategori berhasil diambil",
  "count": 10,
  "data": [
    {
      "category_id": 1,
      "parent_id": null,
      "parent_name": null,
      "category_name": "Elektronik",
      "is_active": true,
      "created_at": "2024-01-15T08:00:00.000Z",
      "updated_at": "2024-01-15T08:00:00.000Z"
    },
    {
      "category_id": 5,
      "parent_id": 1,
      "parent_name": "Elektronik",
      "category_name": "Smartphone",
      "is_active": true,
      "created_at": "2024-01-15T08:00:00.000Z",
      "updated_at": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```

#### ✅ POST Buat Kategori Baru
```
POST http://localhost:5000/api/categories
Content-Type: application/json

{
  "parent_id": 1,
  "category_name": "Tablet",
  "is_active": true
}
```
Response (201 Created):
```json
{
  "success": true,
  "message": "Kategori berhasil dibuat",
  "data": {
    "category_id": 11,
    "parent_id": 1,
    "category_name": "Tablet",
    "is_active": true,
    "created_at": "2024-01-15T09:00:00.000Z",
    "updated_at": "2024-01-15T09:00:00.000Z"
  }
}
```

#### ✅ POST Buat Varian Baru
```
POST http://localhost:5000/api/variants
Content-Type: application/json

{
  "product_id": 1,
  "sku": "SKU-SAM-A54-512-GRN",
  "barcode": "8801643938830",
  "variant_name": "Samsung Galaxy A54 512GB Hijau",
  "cost_price": 5500000,
  "selling_price": 6499000,
  "stock": 10,
  "minimum_stock": 3,
  "is_active": true
}
```
Response (201 Created):
```json
{
  "success": true,
  "message": "Varian produk berhasil dibuat",
  "data": {
    "variant_id": 18,
    "product_id": 1,
    "sku": "SKU-SAM-A54-512-GRN",
    "barcode": "8801643938830",
    "variant_name": "Samsung Galaxy A54 512GB Hijau",
    "cost_price": "5500000.00",
    "selling_price": "6499000.00",
    "stock": 10,
    "minimum_stock": 3,
    "is_active": true,
    "created_at": "2024-01-15T09:30:00.000Z",
    "updated_at": "2024-01-15T09:30:00.000Z"
  }
}
```

#### ✅ POST Stok Masuk
```
POST http://localhost:5000/api/stocks/in
Content-Type: application/json

{
  "variant_id": 1,
  "qty": 50,
  "keterangan": "Restock dari supplier"
}
```
Response:
```json
{
  "success": true,
  "message": "Stok masuk berhasil dicatat. Samsung Galaxy A54 - Samsung Galaxy A54 128GB Hitam",
  "data": {
    "variant_id": 1,
    "product_name": "Samsung Galaxy A54",
    "variant_name": "Samsung Galaxy A54 128GB Hitam",
    "sku": "SKU-SAM-A54-128-BLK",
    "qty_masuk": 50,
    "stok_sebelum": 15,
    "stok_sesudah": 65,
    "keterangan": "Restock dari supplier",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

#### ✅ POST Stok Keluar
```
POST http://localhost:5000/api/stocks/out
Content-Type: application/json

{
  "variant_id": 1,
  "qty": 3,
  "keterangan": "Penjualan offline"
}
```
Response:
```json
{
  "success": true,
  "message": "Stok keluar berhasil dicatat. Samsung Galaxy A54 - Samsung Galaxy A54 128GB Hitam",
  "data": {
    "variant_id": 1,
    "product_name": "Samsung Galaxy A54",
    "variant_name": "Samsung Galaxy A54 128GB Hitam",
    "sku": "SKU-SAM-A54-128-BLK",
    "qty_keluar": 3,
    "stok_sebelum": 65,
    "stok_sesudah": 62,
    "minimum_stock": 5,
    "keterangan": "Penjualan offline",
    "warning": null,
    "updated_at": "2024-01-15T10:05:00.000Z"
  }
}
```

#### ❌ POST Stok Keluar - Stok Tidak Mencukupi
```
POST http://localhost:5000/api/stocks/out
Content-Type: application/json

{
  "variant_id": 1,
  "qty": 999
}
```
Response (400 Bad Request):
```json
{
  "success": false,
  "message": "Stok tidak mencukupi. Stok tersedia: 62, Jumlah diminta: 999",
  "error": "INSUFFICIENT_STOCK"
}
```

#### ✅ GET Stok Rendah
```
GET http://localhost:5000/api/stocks/low-stock
```
Response:
```json
{
  "success": true,
  "message": "Ditemukan 2 varian dengan stok rendah",
  "count": 2,
  "data": [
    {
      "variant_id": 17,
      "product_id": 8,
      "product_name": "Kabel USB-C Fast Charging",
      "sku": "SKU-USB-C-2M-BLK",
      "barcode": null,
      "variant_name": "Kabel USB-C 2M Hitam",
      "stock": 2,
      "minimum_stock": 10,
      "kekurangan_stok": 8,
      "selling_price": "60000.00",
      "is_active": true
    },
    {
      "variant_id": 16,
      "product_id": 8,
      "product_name": "Kabel USB-C Fast Charging",
      "sku": "SKU-USB-C-1M-BLK",
      "barcode": null,
      "variant_name": "Kabel USB-C 1M Hitam",
      "stock": 4,
      "minimum_stock": 10,
      "kekurangan_stok": 6,
      "selling_price": "45000.00",
      "is_active": true
    }
  ]
}
```

#### ❌ POST Duplikat SKU
```
POST http://localhost:5000/api/variants
Content-Type: application/json

{
  "product_id": 1,
  "sku": "SKU-SAM-A54-128-BLK",
  "variant_name": "Varian duplikat",
  "cost_price": 0,
  "selling_price": 0
}
```
Response (409 Conflict):
```json
{
  "success": false,
  "message": "SKU 'SKU-SAM-A54-128-BLK' sudah digunakan"
}
```

---

## Validasi yang Diterapkan

| Field | Validasi |
|-------|----------|
| `sku` | Wajib diisi, harus unik di seluruh sistem |
| `barcode` | Opsional, tapi harus unik jika diisi |
| `cost_price` | Tidak boleh negatif |
| `selling_price` | Tidak boleh negatif |
| `stock` | Tidak boleh negatif |
| `minimum_stock` | Tidak boleh negatif |
| Stok keluar | Tidak boleh melebihi stok yang tersedia |
| `category_name` | Wajib diisi |
| `brand_name` | Wajib diisi, unik (case-insensitive) |
| `unit_name` | Wajib diisi, unik (case-insensitive) |
| `product_name` | Wajib diisi |
| `variant_name` | Wajib diisi |
| `qty` stok | Harus angka positif (>0) |

---

## HTTP Status Code yang Digunakan

| Code | Keterangan |
|------|------------|
| 200 | OK - Request berhasil |
| 201 | Created - Data berhasil dibuat |
| 400 | Bad Request - Input tidak valid |
| 404 | Not Found - Data tidak ditemukan |
| 409 | Conflict - Duplikat data atau constraint violation |
| 500 | Internal Server Error - Error pada server |

---

## Teknologi yang Digunakan

| Package | Versi | Kegunaan |
|---------|-------|----------|
| express | ^4.19 | Web framework |
| pg | ^8.12 | PostgreSQL client (dengan connection pool) |
| cors | ^2.8 | Cross-Origin Resource Sharing |
| dotenv | ^16.4 | Manajemen environment variables |
| nodemon | ^3.1 | Auto-restart server saat development |
