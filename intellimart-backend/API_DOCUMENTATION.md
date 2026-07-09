# IntelliMart Backend API Documentation

**Project** : IntelliMart - Inventory & Point of Sales System
**Module** : Module 1 - Product & Inventory Management
**Version** : 1.0
**Backend** : Node.js + Express.js
**Database** : PostgreSQL
**Author** : Modul 1 (Backend Product & Inventory)

> **Catatan**: Dokumentasi ini memberikan contoh dan panduan penggunaan API. Untuk struktur database terbaru, silakan lihat file `database.sql` yang disertakan pada repository. Apabila terdapat perbedaan kecil antara contoh di dokumentasi ini dengan hasil sebenarnya, **source code backend dan skema database (`database.sql`) merupakan acuan utama (source of truth)**, sedangkan dokumen ini berfungsi sebagai panduan pemakaian API bagi tim frontend.

---

## Daftar Isi

1. [Informasi API](#1-informasi-api)
2. [Base URL](#2-base-url)
3. [Health Check](#3-health-check)
4. [Daftar Endpoint](#4-daftar-endpoint)
5. [Format Response](#5-format-response)
6. [Authentication](#6-authentication)
7. [Category API](#7-category-api)
8. [Brand API](#8-brand-api)
9. [Unit API](#9-unit-api)
10. [Product API](#10-product-api)
11. [Variant API](#11-variant-api)
12. [Stock API](#12-stock-api)
13. [HTTP Status Code](#13-http-status-code)
14. [Error Response](#14-error-response)
15. [Database Design](#15-database-design)
16. [Database Flow](#16-database-flow)
17. [Testing Status](#17-testing-status)
18. [Integrasi Frontend](#18-integrasi-frontend)
19. [Menjalankan Backend di Komputer Lain](#19-menjalankan-backend-di-komputer-lain)

---

## 1. Informasi API

Backend IntelliMart menggunakan REST API dengan format JSON.

**Content-Type** untuk semua request:

```
application/json
```

Semua response juga dikembalikan dalam format JSON.

---

## 2. Base URL

**Local Development**

```
http://localhost:5000/api
```

Contoh:

```
GET http://localhost:5000/api/products
```

---

## 3. Health Check

Digunakan untuk memastikan server backend berjalan dengan baik.

```
GET /
```

**Response**

```json
{
  "success": true,
  "message": "IntelliMart API berjalan dengan baik"
}
```

Selain itu, tersedia juga:

```
GET /api
```

untuk memastikan base route `/api` aktif dan dapat diakses.

---

## 4. Daftar Endpoint

Ringkasan seluruh endpoint yang tersedia pada Module 1 (Product & Inventory).

| Method | Endpoint             | Fungsi                  |
|--------|-----------------------|--------------------------|
| GET    | /categories            | List kategori            |
| GET    | /categories/:id        | Detail kategori          |
| POST   | /categories            | Tambah kategori          |
| PUT    | /categories/:id        | Update kategori          |
| DELETE | /categories/:id        | Hapus kategori           |
| GET    | /brands                | List brand               |
| GET    | /brands/:id            | Detail brand             |
| POST   | /brands                | Tambah brand             |
| PUT    | /brands/:id            | Update brand             |
| DELETE | /brands/:id            | Hapus brand              |
| GET    | /units                 | List satuan              |
| GET    | /units/:id             | Detail satuan            |
| POST   | /units                 | Tambah satuan            |
| PUT    | /units/:id             | Update satuan            |
| DELETE | /units/:id             | Hapus satuan             |
| GET    | /products              | List produk              |
| GET    | /products/:id          | Detail produk            |
| POST   | /products              | Tambah produk            |
| PUT    | /products/:id          | Update produk            |
| DELETE | /products/:id          | Hapus produk             |
| GET    | /variants              | List varian              |
| GET    | /variants/:id          | Detail varian            |
| POST   | /variants              | Tambah varian            |
| PUT    | /variants/:id          | Update varian            |
| DELETE | /variants/:id          | Hapus varian             |
| POST   | /stocks/in             | Stock Masuk               |
| POST   | /stocks/out            | Stock Keluar              |
| GET    | /stocks/low-stock      | Daftar stok minimum       |

---

## 5. Format Response

### Success Response

```json
{
    "success": true,
    "message": "...",
    "data": {}
}
```

### Error Response

```json
{
    "success": false,
    "message": "...",
    "error": "..."
}
```

---

## 6. Authentication

Saat ini seluruh endpoint **belum** menggunakan JWT Authentication. Semua endpoint masih dapat diakses secara langsung tanpa token. Authentication akan ditambahkan pada modul berikutnya.

---

## 7. Category API

> **Category Hierarchy**: Tabel `tm_categories` mendukung struktur **parent-child** melalui field `parent_id`. Kategori dengan `parent_id = null` adalah kategori induk (root), sedangkan kategori dengan `parent_id` terisi adalah sub-kategori. Contoh:
> ```
> Elektronik (parent_id: null)
>     ├── Smartphone (parent_id: 1)
>     ├── Laptop (parent_id: 1)
>     └── TV (parent_id: 1)
> ```

### 7.1 Get All Category

```
GET /api/categories
```

Mengambil seluruh data kategori.

**Response**

```json
{
    "success": true,
    "data": [
        {
            "category_id": 1,
            "category_name": "Smartphone",
            "parent_id": null
        }
    ]
}
```

### 7.2 Get Category by ID

```
GET /api/categories/{id}
```

### 7.3 Create Category

```
POST /api/categories
```

**Body**

```json
{
    "category_name": "Elektronik",
    "parent_id": null
}
```

> `parent_id` bersifat opsional. Isi dengan `category_id` induk jika kategori ini merupakan sub-kategori, atau `null` jika kategori ini adalah kategori utama (root).

### 7.4 Update Category

```
PUT /api/categories/{id}
```

**Body**

```json
{
    "category_name": "Elektronik Baru",
    "parent_id": null
}
```

### 7.5 Delete Category

```
DELETE /api/categories/{id}
```

---

## 8. Brand API

### 8.1 Get All Brand

```
GET /api/brands
```

Mengambil seluruh data brand.

### 8.2 Get Brand by ID

```
GET /api/brands/{id}
```

### 8.3 Create Brand

```
POST /api/brands
```

**Body**

```json
{
    "brand_name": "Samsung"
}
```

### 8.4 Update Brand

```
PUT /api/brands/{id}
```

### 8.5 Delete Brand

```
DELETE /api/brands/{id}
```

---

## 9. Unit API

### 9.1 Get All Unit

```
GET /api/units
```

### 9.2 Get Unit by ID

```
GET /api/units/{id}
```

### 9.3 Create Unit

```
POST /api/units
```

**Body**

```json
{
    "unit_name": "Pcs"
}
```

### 9.4 Update Unit

```
PUT /api/units/{id}
```

### 9.5 Delete Unit

```
DELETE /api/units/{id}
```

---

## 10. Product API

### 10.1 Get All Products

**Endpoint**

```
GET /api/products
```

**Query Parameter**

| Parameter | Type    | Keterangan                              |
|-----------|---------|------------------------------------------|
| search    | string  | Cari nama produk                        |
| category  | integer | Filter kategori                         |
| brand     | integer | Filter brand                            |
| page      | integer | Halaman / pagination                    |
| limit     | integer | Jumlah data                             |
| sort      | string  | product_id, product_name, created_at    |
| order     | string  | ASC atau DESC                           |

**Contoh**

```
GET /api/products?page=1&limit=10
GET /api/products?search=samsung&page=1&limit=10
```

**Response**

```json
{
  "success": true,
  "message": "Data produk berhasil diambil",
  "page": 1,
  "limit": 10,
  "count": 7,
  "data": [
    {
      "product_id": 1,
      "product_name": "Samsung Galaxy A54",
      "category_name": "Smartphone",
      "brand_name": "Samsung",
      "unit_name": "Pcs"
    }
  ]
}
```

### 10.2 Get Product by ID

**Endpoint**

```
GET /api/products/{id}
```

Mengambil satu produk beserta seluruh variannya.

**Contoh**

```
GET /api/products/1
```

**Response**

```json
{
    "success": true,
    "message": "Data produk berhasil diambil",
    "data": {
        "product_id": 1,
        "product_name": "Samsung Galaxy A54",
        "description": "...",
        "category_id": 1,
        "category_name": "Smartphone",
        "brand_id": 1,
        "brand_name": "Samsung",
        "unit_id": 1,
        "unit_name": "Pcs",
        "is_active": true,
        "created_at": "2026-06-06T07:37:05.360Z",
        "updated_at": "2026-06-06T07:37:05.360Z",
        "variants": [
            {
                "variant_id": 1,
                "product_id": 1,
                "sku": "SKU-SAM-A54-128-BLK",
                "barcode": "8801643938826",
                "variant_name": "Samsung Galaxy A54 128GB Hitam",
                "cost_price": "4200000.00",
                "selling_price": "5099000.00",
                "weight": null,
                "is_active": true,
                "created_at": "2026-06-06T07:37:05.360Z",
                "updated_at": "2026-06-06T07:37:05.360Z"
            }
        ]
    }
}
```

> **Catatan**: Endpoint `GET /products/:id` mengembalikan seluruh informasi produk dan varian secara lengkap, termasuk `sku`, `barcode`, `is_active`, dan timestamp (`created_at`, `updated_at`) pada setiap objek variant. Data stok (`stock`, `minimum_stock`) tidak disertakan karena stok dikelola sepenuhnya melalui `tm_stock_balances`.

### 10.3 Create Product

**Endpoint**

```
POST /api/products
```

**Request**

```json
{
    "product_name": "Samsung A56",
    "description": "Android",
    "category_id": 5,
    "brand_id": 1,
    "unit_id": 1,
    "is_active": true
}
```

**Response**

```json
{
    "success": true,
    "message": "Produk berhasil dibuat",
    "data": {
        "product_id": 20
    }
}
```

### 10.4 Update Product

**Endpoint**

```
PUT /api/products/{id}
```

**Contoh**

```
PUT /api/products/20
```

**Request** (sama seperti POST)

```json
{
    "product_name": "Samsung A56 Update",
    "description": "Update",
    "category_id": 5,
    "brand_id": 1,
    "unit_id": 1,
    "is_active": true
}
```

**Response**

```json
{
    "success": true,
    "message": "Produk berhasil diperbarui"
}
```

### 10.5 Delete Product

**Endpoint**

```
DELETE /api/products/{id}
```

**Contoh**

```
DELETE /api/products/20
```

**Response (sukses)**

```json
{
    "success": true,
    "message": "Produk berhasil dihapus"
}
```

**Response (gagal — masih memiliki varian)**

```json
{
    "success": false,
    "message": "Produk ini memiliki varian. Hapus semua varian terlebih dahulu."
}
```

> **Catatan**: Produk tidak dapat dihapus apabila masih memiliki varian.

---

## 11. Variant API

### 11.1 Get All Variant

```
GET /api/variants
```

**Response**

```json
{
    "success": true,
    "message": "Data varian berhasil diambil",
    "total": 16,
    "data": []
}
```

### 11.2 Get Variant by ID

```
GET /api/variants/{id}
```

**Contoh**

```
GET /api/variants/1
```

**Response**

```json
{
    "success": true,
    "data": {
        "variant_id": 1,
        "product_id": 1,
        "product_name": "Samsung Galaxy A54",
        "sku": "SKU001",
        "barcode": "880123456789",
        "variant_name": "Samsung 128GB",
        "cost_price": "4200000.00",
        "selling_price": "5099000.00",
        "weight": null,
        "is_active": true
    }
}
```

### 11.3 Create Variant

```
POST /api/variants
```

**Request**

```json
{
    "product_id": 1,
    "sku": "SKU-001",
    "barcode": "1234567890",
    "variant_name": "Samsung A54 128GB",
    "cost_price": 4000000,
    "selling_price": 5000000,
    "weight": 500
}
```

> **Penting**: Body request **tidak** boleh mengirimkan field `stock` atau `minimum_stock`, karena kedua field tersebut sudah dihapus dari tabel `tm_product_variants`. Stok sekarang dikelola sepenuhnya melalui Stock API (lihat [Stock API](#12-stock-api)).

**Response**

```json
{
    "success": true,
    "message": "Varian berhasil dibuat"
}
```

### 11.4 Update Variant

```
PUT /api/variants/{id}
```

**Contoh**

```
PUT /api/variants/16
```

**Request**

```json
{
    "product_id": 1,
    "sku": "SKU-TEST-001",
    "barcode": "999999999999",
    "variant_name": "Variant Test Update",
    "cost_price": 12000,
    "selling_price": 18000,
    "weight": 300,
    "is_active": true
}
```

**Response**

```json
{
    "success": true,
    "message": "Varian berhasil diperbarui"
}
```

### 11.5 Delete Variant

```
DELETE /api/variants/{id}
```

**Response**

```json
{
    "success": true,
    "message": "Varian berhasil dihapus"
}
```

> **Catatan**: Varian tidak dapat dihapus apabila masih memiliki transaksi stok.

---

## 12. Stock API

Sistem stok telah dipisahkan dari tabel varian:

- `tm_stock_balances` → menyimpan saldo stok terkini per toko.
- `tt_stock_movements` → menyimpan seluruh histori pergerakan stok (dicatat otomatis oleh Stock In / Stock Out). Setiap baris memiliki field `movement_type` untuk membedakan jenis transaksi.

> Field `stock` dan `minimum_stock` **sudah tidak ada lagi** di tabel `tm_product_variants`.

**Supported `movement_type`**

| Value      | Keterangan                          | Status                |
|------------|---------------------------------------|------------------------|
| `in`       | Penambahan stok (pembelian, stok awal) | ✅ Sudah diimplementasikan |
| `out`      | Pengurangan stok (penjualan)          | ✅ Sudah diimplementasikan |
| `adjustment` | Penyesuaian stok (stock opname)     | 🔜 Coming soon (belum ada endpoint) |

> **Catatan**: Sesuai `stockRoutes.js` saat ini, hanya tiga endpoint berikut yang tersedia pada Stock API: Stock In, Stock Out, dan Low Stock. Endpoint untuk melihat saldo stok (`GET /stocks`), histori pergerakan (`GET /stocks/movements`), dan penyesuaian stok (`POST /stocks/adjustment`) **belum diimplementasikan** dan akan ditambahkan pada modul berikutnya.

### 12.1 Stock In

```
POST /api/stocks/in
```

**Request**

```json
{
    "store_id": 1,
    "variant_id": 1,
    "quantity": 10,
    "notes": "Stock awal"
}
```

**Response**

```json
{
    "success": true,
    "message": "Stock In berhasil.",
    "data": {
        "store_id": 1,
        "store_name": "Gudang Utama",
        "variant_id": 1,
        "variant_name": "Samsung Galaxy A54 128GB Hitam",
        "quantity": 10,
        "stock_before": 0,
        "stock_after": 10
    }
}
```

### 12.2 Stock Out

```
POST /api/stocks/out
```

**Request**

```json
{
    "store_id": 1,
    "variant_id": 1,
    "quantity": 5,
    "notes": "Penjualan"
}
```

**Response**

```json
{
    "success": true,
    "message": "Stock Out berhasil.",
    "data": {
        "store_id": 1,
        "variant_id": 1,
        "quantity": 5,
        "stock_before": 10,
        "stock_after": 5
    }
}
```

### 12.3 Low Stock

```
GET /api/stocks/low-stock
```

Mengambil seluruh produk yang stoknya berada di bawah minimum.

**Response**

```json
{
  "success": true,
  "message": "Data low stock berhasil diambil.",
  "data": [
    {
      "store_name": "Gudang Utama",
      "product_name": "Samsung Galaxy A54",
      "variant_name": "Samsung Galaxy A54 128GB Hitam",
      "quantity_available": 2,
      "min_stock": 5
    }
  ]
}
```

---

## 13. HTTP Status Code

| Code | Keterangan            |
|------|------------------------|
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request            |
| 404  | Not Found              |
| 409  | Conflict               |
| 500  | Internal Server Error  |

---

## 14. Error Response

### 400 - Bad Request

```json
{
    "success": false,
    "message": "Data tidak valid"
}
```

### 404 - Not Found

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

### 409 - Conflict

```json
{
    "success": false,
    "message": "SKU sudah digunakan"
}
```

### 500 - Internal Server Error

```json
{
    "success": false,
    "message": "Internal Server Error"
}
```

---

## 15. Database Design

### Master Table

- `tm_products`
- `tm_product_variants`
- `tm_categories`
- `tm_brand`
- `tm_unit`
- `tm_toko`

### Transaction Table

- `tm_stock_balances` — Saldo stok setiap varian pada setiap toko.
- `tt_stock_movements` — Riwayat seluruh transaksi stok (stock in, stock out, adjustment).

### Future Module (Belum Diimplementasikan)

Tabel berikut **strukturnya sudah tersedia lengkap di database, termasuk foreign key-nya**, namun endpoint API-nya **belum dibuat** pada Module 1. Disebutkan di sini agar tim backend/frontend lain tahu bahwa tabel ini bukan sekadar rencana, melainkan sudah menjadi bagian aktif dari skema database.

**`tm_product_images`**
Digunakan untuk menyimpan gambar produk (misalnya banyak foto per produk/varian), sudah memiliki foreign key ke `tm_products` dengan `ON DELETE CASCADE`. Struktur database sudah tersedia, hanya endpoint API yang belum diimplementasikan pada Module 1.

**`tm_unit_conversions`**
Digunakan untuk menyimpan konversi antar satuan, misalnya `Dus → Box → Pcs`, sudah memiliki foreign key ke `tm_products` dengan `ON DELETE CASCADE`. Modul ini nantinya akan dipakai oleh modul Pembelian (Purchasing). Struktur database sudah tersedia, hanya endpoint API yang belum diimplementasikan pada Module 1.

### Database Views

Selain tabel, database juga menyediakan dua **view** yang mempercepat query pada beberapa endpoint:

**`v_products_full`**
Berisi data produk hasil join antara Product, Category, Brand, dan Unit (dengan agregasi jumlah/GROUP BY untuk ringkasan). Digunakan untuk mempercepat query pada endpoint daftar produk (`GET /products`). Endpoint `GET /products/:id` **tidak** menggunakan view ini — endpoint tersebut mengambil data produk beserta daftar variannya melalui query join langsung ke `tm_products` dan `tm_product_variants`, karena view berbasis `GROUP BY` tidak dapat menghasilkan array `variants` bertingkat.

**`v_low_stock`**
Menampilkan seluruh produk dengan stok di bawah minimum. Digunakan langsung oleh endpoint `GET /stocks/low-stock`.

### Foreign Key & Relasi Antar Tabel

```
Category
     │
     ▼
Product

Brand
     │
     ▼
Product

Unit
     │
     ▼
Product

Product
     │
     ▼
Variant

Toko (tm_toko)
     │
     ▼
Stock Balance

Variant
     │
     ▼
Stock Balance

Stock Balance
     │
     ▼
Stock Movement
```

### Constraint

**Primary Key**

Setiap tabel master dan transaksi memiliki `PRIMARY KEY` standar berbasis kolom `*_id`, kecuali `tm_stock_balances` yang menggunakan **Composite Primary Key**:

| Tabel                | Primary Key                     |
|-----------------------|-----------------------------------|
| `tm_stock_balances`    | Composite: `(store_id, variant_id)` — kombinasi toko dan varian harus unik, tidak boleh ada baris duplikat untuk toko & varian yang sama. |

**Foreign Key**

Seluruh relasi antar tabel pada bagian [Foreign Key & Relasi Antar Tabel](#foreign-key--relasi-antar-tabel) di atas diberlakukan sebagai `FOREIGN KEY` constraint di level database.

**Unique Constraint**

| Field       | Constraint |
|-------------|------------|
| SKU         | Unique     |
| Barcode     | Unique     |
| Brand Name  | Unique     |
| Unit Name   | Unique     |

### CHECK Constraint

- `cost_price >= 0` — harga modal tidak boleh negatif.
- `selling_price >= 0` — harga jual tidak boleh negatif.

### ON DELETE Behavior

| Relasi                        | Behavior    | Arti                                                                       |
|---------------------------------|-------------|-------------------------------------------------------------------------------|
| Product → Variant                | `RESTRICT`  | Produk tidak dapat dihapus jika masih memiliki varian.                        |
| Brand → Product                   | `SET NULL`  | Jika brand dihapus, produk tetap ada (`brand_id` menjadi `null`).             |
| Category → Product                | `SET NULL`  | Jika kategori dihapus, produk tetap ada (`category_id` menjadi `null`).       |
| Unit → Product                     | `SET NULL`  | Jika satuan dihapus, produk tetap ada (`unit_id` menjadi `null`).             |
| Variant → Stock Balance            | `CASCADE`   | Jika varian dihapus, seluruh saldo stok varian tersebut ikut terhapus.        |
| Variant → Stock Movement            | `CASCADE`   | Jika varian dihapus, seluruh riwayat transaksi stok varian tersebut ikut terhapus. |
| Toko (`tm_toko`) → Stock Balance    | `CASCADE`   | Jika toko dihapus, seluruh saldo stok pada toko tersebut ikut terhapus.       |
| Toko (`tm_toko`) → Stock Movement    | `CASCADE`   | Jika toko dihapus, seluruh riwayat transaksi stok pada toko tersebut ikut terhapus. |
| Product → Unit Conversion          | `CASCADE`   | Jika produk dihapus, data konversi satuan terkait ikut terhapus.              |
| Product → Images                   | `CASCADE`   | Jika produk dihapus, seluruh gambar produk terkait ikut terhapus.             |

> **Catatan**: Baris terakhir (`Product → Unit Conversion` dan `Product → Images`) berlaku untuk tabel `tm_unit_conversions` dan `tm_product_images` yang skemanya sudah tersedia lengkap di database beserta relasinya, meskipun API-nya belum diimplementasikan pada Module 1 (lihat [Future Module](#future-module-belum-diimplementasikan)).

### Arsitektur Database (Alur Data)

Karena backend sekarang memakai sistem stok yang baru (terpisah dari tabel varian), berikut alur relasi antar tabel agar tim frontend memahami sumber data pada tiap endpoint:

```
tm_products
      │
      │ 1:N
      ▼
tm_product_variants
      │
      ├──────────────► tm_stock_balances
      │
      └──────────────► tt_stock_movements
```

**Keterangan**

- `tm_products` menyimpan data produk.
- `tm_product_variants` menyimpan varian dari setiap produk.
- `tm_stock_balances` menyimpan stok terkini per toko untuk setiap varian (primary key komposit: `store_id` + `variant_id`).
- `tt_stock_movements` menyimpan riwayat setiap transaksi stok (Stock In, Stock Out, dan Adjustment).
- **Penting**: `tm_stock_balances` dan `tt_stock_movements` **tidak saling berelasi langsung** (tidak ada foreign key di antara keduanya). Keduanya sama-sama bergantung langsung pada `tm_product_variants` (melalui `variant_id`) dan `tm_toko` (melalui `store_id`). Setiap transaksi stok (Stock In/Out) akan memperbarui `tm_stock_balances` **dan** menambahkan satu record baru ke `tt_stock_movements` secara bersamaan dalam satu operasi, bukan berurutan.

### Ringkasan Relasi

- Satu **Product** dapat memiliki banyak **Variant**.
- Satu **Variant** dapat memiliki saldo stok pada beberapa **Toko** (`tm_toko`), dan juga memiliki banyak riwayat transaksi stok.
- Setiap transaksi stok (in/out/adjustment) akan **memperbarui** saldo pada `tm_stock_balances` dan **sekaligus menambahkan** satu baris riwayat baru pada `tt_stock_movements` — keduanya di-update dalam satu operasi yang sama, bukan salah satu bergantung pada yang lain.

---

## 16. Database Flow

```
Product
    │
    ▼
Variant
    │
    ├──────────────► Stock Balance
    │
    └──────────────► Stock Movement
```

**Keterangan**

- Product memiliki banyak Variant.
- Variant memiliki stok pada setiap toko (`tm_toko`) melalui Stock Balance, dan juga memiliki riwayat transaksi melalui Stock Movement.
- Stock Balance dan Stock Movement **tidak berelasi langsung satu sama lain** — keduanya sama-sama berelasi ke Variant (dan ke Toko). Setiap transaksi stok akan memperbarui `tm_stock_balances` dan sekaligus menambahkan satu record baru ke `tt_stock_movements` dalam operasi yang sama.

---

## 17. Testing Status

| Module                   | Status      |
|---------------------------|-------------|
| Category CRUD             | ✅ Tested   |
| Brand CRUD                 | ✅ Tested   |
| Unit CRUD                  | ✅ Tested   |
| Product CRUD               | ✅ Tested   |
| Variant CRUD                | ✅ Tested   |
| Stock Balance              | ✅ Tested   |
| Stock Movement             | ✅ Tested   |
| Product-Variant Relation   | ✅ Tested   |
| Validation                 | ✅ Tested   |
| Foreign Key                | ✅ Tested   |

Semua endpoint di atas telah diuji menggunakan Postman.

---

## 18. Integrasi Frontend

### Urutan Penggunaan API (disarankan)

1. Ambil Category → `GET /categories`
2. Ambil Brand → `GET /brands`
3. Ambil Unit → `GET /units`
4. Ambil Product → `GET /products`
5. Ambil Variant → `GET /variants`
6. Stock In → `POST /stocks/in`
7. Stock Out → `POST /stocks/out`
8. Low Stock → `GET /stocks/low-stock`

### Catatan Penting untuk Tim Frontend

- Semua response menggunakan format JSON.
- Backend menggunakan REST API dengan metode `GET`, `POST`, `PUT`, dan `DELETE`.
- Semua request body harus menggunakan header `Content-Type: application/json`.
- Endpoint `GET /products/:id` sudah mengembalikan daftar varian dalam satu response, sehingga frontend **tidak perlu** melakukan request tambahan untuk menampilkan detail produk beserta variannya.
- Modul stok menggunakan arsitektur terpisah (saldo stok dan histori pergerakan), sehingga frontend dapat menampilkan stok terkini dan riwayat transaksi secara independen.
- Produk tidak bisa dihapus jika masih ada varian aktif — tampilkan pesan error dari response `message` ke user.
- Varian tidak bisa dihapus jika masih memiliki transaksi stok — tampilkan pesan error dari response `message` ke user.

---

## 19. Menjalankan Backend di Komputer Lain

1. Clone repository:
   ```
   git clone <repository-url>
   cd intellimart-backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Buat file `.env` berdasarkan `.env.example`, isi konfigurasi database PostgreSQL (host, port, user, password, database name).
4. Buat database PostgreSQL dan jalankan migration/seed (sesuaikan dengan script yang tersedia di project, mis. `npm run migrate` dan `npm run seed`).
5. Jalankan server:
   ```
   npm run dev
   ```
6. Server berjalan di:
   ```
   http://localhost:5000/api
   ```
7. Uji endpoint menggunakan Postman atau tools sejenis untuk memastikan koneksi database berhasil.

---

# Catatan Akhir

- Semua endpoint menggunakan JSON.
- Semua endpoint telah diuji menggunakan Postman.
- Dokumentasi ini merupakan implementasi Backend IntelliMart untuk Master Data dan Inventory Management (Module 1), dan sudah selaras dengan implementasi backend yang telah dikerjakan (Product, Variant, dan Stock Management).
