-- =============================================================
-- database.sql
-- IntelliMart - Sistem Manajemen Produk & Stok
-- Database: PostgreSQL
-- =============================================================

-- Buat database (jalankan sebagai superuser di psql jika perlu)
-- CREATE DATABASE intellimart_db;
-- \c intellimart_db;

-- =============================================================
-- HAPUS TABEL LAMA (Urutan penting karena foreign key!)
-- =============================================================
DROP TABLE IF EXISTS tm_product_variants CASCADE;
DROP TABLE IF EXISTS tm_products CASCADE;
DROP TABLE IF EXISTS tm_categories CASCADE;
DROP TABLE IF EXISTS tm_brand CASCADE;
DROP TABLE IF EXISTS tm_unit CASCADE;


-- =============================================================
-- 1. TABEL tm_categories
-- Menyimpan kategori produk (mendukung hierarki parent-child)
-- =============================================================
CREATE TABLE tm_categories (
    category_id   SERIAL PRIMARY KEY,
    parent_id     INTEGER         DEFAULT NULL,
    category_name VARCHAR(100)    NOT NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- Self-referencing FK untuk parent kategori
    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES tm_categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Index untuk pencarian cepat berdasarkan parent
CREATE INDEX idx_categories_parent_id ON tm_categories(parent_id);
CREATE INDEX idx_categories_is_active ON tm_categories(is_active);

COMMENT ON TABLE tm_categories IS 'Master data kategori produk dengan dukungan hierarki';
COMMENT ON COLUMN tm_categories.parent_id IS 'NULL jika kategori utama, diisi jika sub-kategori';


-- =============================================================
-- 2. TABEL tm_brand
-- Menyimpan data merek/brand produk
-- =============================================================
CREATE TABLE tm_brand (
    brand_id    SERIAL PRIMARY KEY,
    brand_name  VARCHAR(100) NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_brand_name UNIQUE (brand_name)
);

CREATE INDEX idx_brand_is_active ON tm_brand(is_active);

COMMENT ON TABLE tm_brand IS 'Master data merek/brand produk';


-- =============================================================
-- 3. TABEL tm_unit
-- Menyimpan data satuan produk (pcs, kg, liter, dll)
-- =============================================================
CREATE TABLE tm_unit (
    unit_id    SERIAL PRIMARY KEY,
    unit_name  VARCHAR(50)  NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_unit_name UNIQUE (unit_name)
);

CREATE INDEX idx_unit_is_active ON tm_unit(is_active);

COMMENT ON TABLE tm_unit IS 'Master data satuan produk';


-- =============================================================
-- 4. TABEL tm_products
-- Menyimpan data produk utama
-- =============================================================
CREATE TABLE tm_products (
    product_id   SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    description  TEXT         DEFAULT NULL,
    category_id  INTEGER      DEFAULT NULL,
    brand_id     INTEGER      DEFAULT NULL,
    unit_id      INTEGER      DEFAULT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES tm_categories(category_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id)
        REFERENCES tm_brand(brand_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_products_unit
        FOREIGN KEY (unit_id)
        REFERENCES tm_unit(unit_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_products_category_id ON tm_products(category_id);
CREATE INDEX idx_products_brand_id    ON tm_products(brand_id);
CREATE INDEX idx_products_unit_id     ON tm_products(unit_id);
CREATE INDEX idx_products_is_active   ON tm_products(is_active);

COMMENT ON TABLE tm_products IS 'Master data produk utama';
COMMENT ON COLUMN tm_products.description IS 'Deskripsi detail produk (opsional)';


-- =============================================================
-- 5. TABEL tm_product_variants
-- Menyimpan varian dari setiap produk (ukuran, warna, dll)
-- dengan informasi harga dan stok
-- =============================================================
CREATE TABLE tm_product_variants (
    variant_id    SERIAL PRIMARY KEY,
    product_id    INTEGER         NOT NULL,
    sku           VARCHAR(100)    NOT NULL,
    barcode       VARCHAR(100)    DEFAULT NULL,
    variant_name  VARCHAR(200)    NOT NULL,
    cost_price    NUMERIC(15, 2)  NOT NULL DEFAULT 0   CHECK (cost_price >= 0),
    selling_price NUMERIC(15, 2)  NOT NULL DEFAULT 0   CHECK (selling_price >= 0),
    stock         INTEGER         NOT NULL DEFAULT 0   CHECK (stock >= 0),
    minimum_stock INTEGER         NOT NULL DEFAULT 0   CHECK (minimum_stock >= 0),
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- Foreign Key ke produk
    CONSTRAINT fk_variants_product
        FOREIGN KEY (product_id)
        REFERENCES tm_products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- SKU harus unik di seluruh sistem
    CONSTRAINT uq_variant_sku UNIQUE (sku),

    -- Barcode unik (jika diisi)
    CONSTRAINT uq_variant_barcode UNIQUE (barcode)
);

CREATE INDEX idx_variants_product_id ON tm_product_variants(product_id);
CREATE INDEX idx_variants_sku        ON tm_product_variants(sku);
CREATE INDEX idx_variants_barcode    ON tm_product_variants(barcode);
CREATE INDEX idx_variants_is_active  ON tm_product_variants(is_active);
-- Index untuk query low-stock
CREATE INDEX idx_variants_stock_minimum ON tm_product_variants(stock, minimum_stock);

COMMENT ON TABLE tm_product_variants IS 'Varian produk dengan informasi harga dan stok';
COMMENT ON COLUMN tm_product_variants.sku IS 'Stock Keeping Unit - kode unik setiap varian';
COMMENT ON COLUMN tm_product_variants.barcode IS 'Kode barcode (opsional, harus unik jika diisi)';
COMMENT ON COLUMN tm_product_variants.cost_price IS 'Harga modal/beli produk';
COMMENT ON COLUMN tm_product_variants.selling_price IS 'Harga jual produk';
COMMENT ON COLUMN tm_product_variants.stock IS 'Jumlah stok saat ini (tidak boleh negatif)';
COMMENT ON COLUMN tm_product_variants.minimum_stock IS 'Batas minimum stok untuk peringatan restock';


-- =============================================================
-- VIEWS (Opsional - untuk kemudahan query)
-- =============================================================

-- View produk lengkap dengan semua relasi
CREATE OR REPLACE VIEW v_products_full AS
SELECT
    p.product_id,
    p.product_name,
    p.description,
    p.category_id,
    c.category_name,
    p.brand_id,
    b.brand_name,
    p.unit_id,
    u.unit_name,
    p.is_active,
    COUNT(v.variant_id)  AS total_variants,
    SUM(v.stock)         AS total_stock,
    p.created_at,
    p.updated_at
FROM tm_products p
LEFT JOIN tm_categories      c ON p.category_id = c.category_id
LEFT JOIN tm_brand           b ON p.brand_id     = b.brand_id
LEFT JOIN tm_unit            u ON p.unit_id      = u.unit_id
LEFT JOIN tm_product_variants v ON p.product_id  = v.product_id
GROUP BY p.product_id, c.category_name, b.brand_name, u.unit_name;

-- View produk dengan stok rendah
CREATE OR REPLACE VIEW v_low_stock AS
SELECT
    v.variant_id,
    v.product_id,
    p.product_name,
    v.sku,
    v.barcode,
    v.variant_name,
    v.stock,
    v.minimum_stock,
    (v.minimum_stock - v.stock) AS kekurangan_stok,
    v.selling_price,
    v.is_active
FROM tm_product_variants v
LEFT JOIN tm_products p ON v.product_id = p.product_id
WHERE v.stock <= v.minimum_stock
  AND v.is_active = TRUE
ORDER BY kekurangan_stok DESC;


-- =============================================================
-- DATA DUMMY - INSERT
-- =============================================================

-- Kategori (dengan hierarki)
INSERT INTO tm_categories (parent_id, category_name, is_active) VALUES
    (NULL, 'Elektronik',             TRUE),
    (NULL, 'Makanan & Minuman',      TRUE),
    (NULL, 'Peralatan Rumah Tangga', TRUE),
    (NULL, 'Pakaian',                TRUE),
    (1,    'Smartphone',             TRUE),
    (1,    'Laptop & Komputer',      TRUE),
    (1,    'Aksesori Elektronik',    TRUE),
    (2,    'Minuman',                TRUE),
    (2,    'Makanan Ringan',         TRUE),
    (3,    'Peralatan Dapur',        TRUE);

-- Brand
INSERT INTO tm_brand (brand_name, is_active) VALUES
    ('Samsung',    TRUE),
    ('Apple',      TRUE),
    ('Xiaomi',     TRUE),
    ('Indomie',    TRUE),
    ('Aqua',       TRUE),
    ('Tupperware',  TRUE),
    ('Unilever',   TRUE),
    ('Nike',       TRUE),
    ('Adidas',     TRUE),
    ('Generic',    TRUE);

-- Satuan
INSERT INTO tm_unit (unit_name, is_active) VALUES
    ('Pcs',    TRUE),
    ('Unit',   TRUE),
    ('Kg',     TRUE),
    ('Gram',   TRUE),
    ('Liter',  TRUE),
    ('Botol',  TRUE),
    ('Karton', TRUE),
    ('Lusin',  TRUE),
    ('Pack',   TRUE),
    ('Box',    TRUE);

-- Produk
INSERT INTO tm_products (product_name, description, category_id, brand_id, unit_id, is_active) VALUES
    ('Samsung Galaxy A54',
     'Smartphone Android Samsung seri A dengan layar Super AMOLED 6.4 inci',
     5, 1, 1, TRUE),

    ('iPhone 15',
     'Smartphone Apple dengan chip A16 Bionic dan kamera 48MP',
     5, 2, 1, TRUE),

    ('Xiaomi Redmi Note 12',
     'Smartphone Xiaomi dengan baterai 5000mAh dan layar AMOLED 120Hz',
     5, 3, 1, TRUE),

    ('Laptop Asus VivoBook 14',
     'Laptop ringan dengan prosesor Intel Core i5 generasi ke-12',
     6, 10, 1, TRUE),

    ('Indomie Goreng Original',
     'Mi instan goreng dengan bumbu khas Indonesia',
     9, 4, 9, TRUE),

    ('Aqua Air Mineral 600ml',
     'Air mineral murni dalam kemasan botol 600ml',
     8, 5, 6, TRUE),

    ('Tupperware Kotak Makan 1L',
     'Kotak makan kedap udara kapasitas 1 liter, BPA free',
     10, 6, 1, TRUE),

    ('Kabel USB-C Fast Charging',
     'Kabel USB-C dengan dukungan fast charging 65W, panjang 1 meter',
     7, 10, 1, TRUE);

-- Varian Produk
INSERT INTO tm_product_variants
    (product_id, sku, barcode, variant_name, cost_price, selling_price, stock, minimum_stock, is_active)
VALUES
    -- Samsung Galaxy A54 variants
    (1, 'SKU-SAM-A54-128-BLK', '8801643938826', 'Samsung Galaxy A54 128GB Hitam',
     4200000, 5099000, 15, 5, TRUE),
    (1, 'SKU-SAM-A54-256-BLK', '8801643938827', 'Samsung Galaxy A54 256GB Hitam',
     4800000, 5799000, 10, 5, TRUE),
    (1, 'SKU-SAM-A54-128-WHT', '8801643938828', 'Samsung Galaxy A54 128GB Putih',
     4200000, 5099000, 8, 5, TRUE),

    -- iPhone 15 variants
    (2, 'SKU-IPH-15-128-BLK', '194253400981', 'iPhone 15 128GB Hitam',
     13000000, 15999000, 5, 3, TRUE),
    (2, 'SKU-IPH-15-256-BLK', '194253400982', 'iPhone 15 256GB Hitam',
     15000000, 18499000, 3, 3, TRUE),
    (2, 'SKU-IPH-15-512-BLK', '194253400983', 'iPhone 15 512GB Hitam',
     19000000, 23499000, 2, 2, TRUE),

    -- Xiaomi Redmi Note 12 variants
    (3, 'SKU-XMI-RN12-4-BLK', '6934177779039', 'Xiaomi Redmi Note 12 4/128GB Hitam',
     1800000, 2299000, 20, 8, TRUE),
    (3, 'SKU-XMI-RN12-8-BLK', '6934177779040', 'Xiaomi Redmi Note 12 8/256GB Hitam',
     2200000, 2799000, 12, 5, TRUE),

    -- Laptop Asus variants
    (4, 'SKU-ASUS-VB14-I5-8', '4718017614801', 'Asus VivoBook 14 i5 8GB/512GB',
     6500000, 8499000, 7, 3, TRUE),

    -- Indomie variants
    (5, 'SKU-INDO-GOR-1', '089686010086', 'Indomie Goreng Original 1 Pack (5 bungkus)',
     12000, 15000, 200, 50, TRUE),
    (5, 'SKU-INDO-GOR-40', '089686010087', 'Indomie Goreng Original 1 Karton (40 bungkus)',
     85000, 110000, 50, 20, TRUE),

    -- Aqua variants
    (6, 'SKU-AQUA-600', '8993077010050', 'Aqua 600ml per Botol',
     2500, 4000, 300, 100, TRUE),
    (6, 'SKU-AQUA-600-DUS', '8993077010051', 'Aqua 600ml 1 Dus (24 botol)',
     55000, 75000, 60, 20, TRUE),

    -- Tupperware variants
    (7, 'SKU-TPW-KM1L-RED', NULL, 'Tupperware Kotak Makan 1L Merah',
     85000, 125000, 25, 10, TRUE),
    (7, 'SKU-TPW-KM1L-BLU', NULL, 'Tupperware Kotak Makan 1L Biru',
     85000, 125000, 18, 10, TRUE),

    -- Kabel USB-C variants
    (8, 'SKU-USB-C-1M-BLK', NULL, 'Kabel USB-C 1M Hitam',
     25000, 45000, 4, 10, TRUE),  -- Sengaja stok rendah untuk demo low-stock
    (8, 'SKU-USB-C-2M-BLK', NULL, 'Kabel USB-C 2M Hitam',
     35000, 60000, 2, 10, TRUE);  -- Sengaja stok rendah untuk demo low-stock


-- =============================================================
-- VERIFIKASI - Jalankan setelah INSERT untuk mengecek data
-- =============================================================

-- Cek jumlah data per tabel
SELECT 'tm_categories'       AS tabel, COUNT(*) AS jumlah FROM tm_categories
UNION ALL
SELECT 'tm_brand',                     COUNT(*) FROM tm_brand
UNION ALL
SELECT 'tm_unit',                      COUNT(*) FROM tm_unit
UNION ALL
SELECT 'tm_products',                  COUNT(*) FROM tm_products
UNION ALL
SELECT 'tm_product_variants',          COUNT(*) FROM tm_product_variants;

-- Cek produk dengan stok rendah
SELECT * FROM v_low_stock;
