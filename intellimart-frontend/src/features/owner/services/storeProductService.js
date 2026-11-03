
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

/** Bentuk DB (snake_case) -> bentuk UI */
const mapVariant = (v) => ({
  id: v.id,
  productId: v.product_id,
  name: v.variant_name,
  sku: v.sku,
  barcode: v.barcode ?? null,
  costPrice: Number(v.cost_price ?? 0),
  isActive: Number(v.is_active) === 1,
});

/**
 * GET: daftar varian milik satu produk.
 */
export async function getProductVariants(productId) {
  const { data } = await axiosClient.get(ENDPOINTS.VARIANT.LIST, {
    params: { product_id: productId },
  });

  return (data.data ?? []).map(mapVariant);
}

/**
 * CREATE: membuat varian baru untuk sebuah produk.
 * SKU dan barcode harus unik di seluruh database.
 */
export async function createVariant({
  productId,
  name,
  sku,
  barcode,
  costPrice,
}) {
  const { data } = await axiosClient.post(ENDPOINTS.VARIANT.LIST, {
    product_id: Number(productId),
    variant_name: name.trim(),
    sku: sku.trim(),
    barcode: barcode?.trim() || null,
    cost_price: Number(costPrice) || 0,
  });

  return mapVariant(data.data);
}

/**
 * CREATE: menempatkan varian ke toko beserta harga jual toko.
 * Stok selalu mulai dari 0.
 * Stok awal dicatat melalui endpoint stock-movements.
 */
export async function createStoreStock({
  storeId,
  variantId,
  sellPrice,
  minStock,
}) {
  const { data } = await axiosClient.post(ENDPOINTS.STOCK.CREATE, {
    store_id: Number(storeId),
    variant_id: Number(variantId),
    base_price: Number(sellPrice),
    min_stock: Number(minStock) || 0,
  });

  return data.data;
}

/**
 * CREATE: mencatat stok awal melalui pergerakan stok.
 */
export async function createInitialStock({
  storeId,
  variantId,
  qty,
  note,
}) {
  const { data } = await axiosClient.post(
    ENDPOINTS.STOCK_MOVEMENT.CREATE,
    {
      store_id: Number(storeId),
      variant_id: Number(variantId),
      movement_type: 'IN',
      qty: Number(qty),
      reference_type: 'INITIAL',
      note: note || 'Stok awal penempatan produk ke toko',
    }
  );

  return data.data;
}

/**
 * Alur lengkap: tambah produk ke toko.
 *
 * 1. Gunakan varian yang sudah ada atau buat varian baru.
 * 2. Buat data stok dan harga jual untuk toko tujuan.
 * 3. Catat stok awal jika jumlahnya lebih dari 0.
 *
 * Penting:
 * - Satu varian boleh digunakan di beberapa toko.
 * - Kombinasi toko dan varian yang sama hanya boleh didaftarkan sekali.
 * - Buat data stok toko sebelum mencatat pergerakan stok.
 */
export async function addProductToStore({
  storeId,
  productId,
  variantId,
  newVariant,
  sellPrice,
  minStock,
  initialStock,
}) {
  let finalVariantId = variantId;

  // Gunakan varian yang dipilih atau buat varian baru.
  if (!finalVariantId) {
    if (!newVariant) {
      throw new Error('Data varian baru belum diisi.');
    }

    const created = await createVariant({
      productId,
      ...newVariant,
    });

    finalVariantId = created.id;
  }

  // Daftarkan varian ke toko dan tangani duplikasi.
  try {
    await createStoreStock({
      storeId,
      variantId: finalVariantId,
      sellPrice,
      minStock,
    });
  } catch (err) {
    if (
      err?.response?.status === 409 ||
      err?.response?.data?.error === 'ALREADY_EXISTS'
    ) {
      throw new Error(
        'Varian ini sudah terdaftar di toko ini. Pilih varian lain atau periksa daftar produk toko.'
      );
    }

    throw err;
  }

  // Catat stok awal setelah data stok toko berhasil dibuat.
  if (Number(initialStock) > 0) {
    try {
      await createInitialStock({
        storeId,
        variantId: finalVariantId,
        qty: initialStock,
      });
    } catch (err) {
      const reason =
        err?.response?.data?.message ||
        err?.message ||
        'alasan tidak diketahui';

      throw new Error(
        `Produk sudah ditambahkan ke toko, tetapi stok awal gagal dicatat: ${reason}`
      );
    }
  }

  return { variantId: finalVariantId };
}
