const db = require("../config/db");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toNumber(value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw createError(`${fieldName} harus berupa angka yang valid.`);
  }

  return number;
}

const TransactionModel = {
  // Mengambil seluruh transaksi
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT
         t.*,
         u.name AS cashier_name,
         s.store_name
       FROM tt_transaction t
       LEFT JOIN tm_users u ON u.id = t.cashier_id
       LEFT JOIN tm_store s ON s.id = t.store_id
       ORDER BY t.created_at DESC`,
    );

    return rows;
  },

  // Mengambil detail transaksi, produk, dan pembayaran
  getById: async (transactionId) => {
    const [headerRows] = await db.query(
      `SELECT
         t.*,
         u.name AS cashier_name,
         s.store_name
       FROM tt_transaction t
       LEFT JOIN tm_users u ON u.id = t.cashier_id
       LEFT JOIN tm_store s ON s.id = t.store_id
       WHERE t.id = ?`,
      [transactionId],
    );

    if (headerRows.length === 0) {
      return null;
    }

    const [items] = await db.query(
      `SELECT
         d.*,
         v.variant_name,
         v.sku,
         p.product_name
       FROM tt_transaction_detail d
       LEFT JOIN ms_product_variant v ON v.id = d.variant_id
       LEFT JOIN tm_product p ON p.id = v.product_id
       WHERE d.transaction_id = ?`,
      [transactionId],
    );

    const [payments] = await db.query(
      `SELECT
         p.id,
         p.transaction_id,
         p.payment_method_id,
         pm.method_name,
         p.amount,
         p.reference_no,
         p.payment_date
       FROM tt_payment p
       JOIN tm_payment_method pm ON pm.id = p.payment_method_id
       WHERE p.transaction_id = ?`,
      [transactionId],
    );

    return {
      header: headerRows[0],
      items,
      payments,
    };
  },

  // Proses checkout dalam satu database transaction
  checkout: async (payload) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const {
        customer_id,
        cashier_id,
        store_id,
        sale_type = "RETAIL",
        items,
        discount_type,
        discount_value = 0,
        promo_id,
        payment_method_id,
        amount_received,
        reference_no,
      } = payload;

      // 1. Validasi data utama
      const cashierId = Number(cashier_id);
      const storeId = Number(store_id);
      const paymentMethodId = Number(payment_method_id);

      if (!Number.isInteger(cashierId) || cashierId <= 0) {
        throw createError("ID kasir tidak valid.");
      }

      if (!Number.isInteger(storeId) || storeId <= 0) {
        throw createError("ID toko tidak valid.");
      }

      if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
        throw createError("Metode pembayaran harus dipilih.");
      }

      if (!["RETAIL", "WHOLESALE"].includes(sale_type)) {
        throw createError("Jenis penjualan tidak valid.");
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw createError("Keranjang belanja tidak boleh kosong.");
      }

      // 2. Gabungkan item dengan variant_id yang sama
      const itemMap = new Map();

      for (const item of items) {
        const variantId = Number(item.variant_id || item.product_id);
        const qty = Number(item.qty);

        if (!Number.isInteger(variantId) || variantId <= 0) {
          throw createError("Terdapat produk dengan ID varian tidak valid.");
        }

        if (!Number.isInteger(qty) || qty <= 0) {
          throw createError(
            "Kuantitas produk harus berupa bilangan bulat positif.",
          );
        }

        itemMap.set(variantId, (itemMap.get(variantId) || 0) + qty);
      }

      const normalizedItems = [...itemMap.entries()]
        .map(([variant_id, qty]) => ({ variant_id, qty }))
        .sort((a, b) => a.variant_id - b.variant_id);

      // 3. Validasi metode pembayaran
      const [paymentMethods] = await connection.query(
        `SELECT id, method_name
         FROM tm_payment_method
         WHERE id = ?`,
        [paymentMethodId],
      );

      if (paymentMethods.length === 0) {
        throw createError("Metode pembayaran tidak ditemukan.");
      }

      const paymentMethod = paymentMethods[0];

      // 4. Kunci stok dan hitung harga dari database
      let subtotalPrice = 0;
      const processedItems = [];

      for (const item of normalizedItems) {
        const [stockRows] = await connection.query(
          `SELECT
             ps.stock,
             ps.base_price,
             ps.price_code_id,
             ps.discount_store,
             pc.is_active AS price_code_active
           FROM tr_product_stock ps
           LEFT JOIN tm_price_code pc
             ON pc.id = ps.price_code_id
           WHERE ps.store_id = ?
             AND ps.variant_id = ?
           FOR UPDATE`,
          [storeId, item.variant_id],
        );

        if (stockRows.length === 0) {
          throw createError(
            `Data stok produk varian ID ${item.variant_id} tidak ditemukan.`,
          );
        }

        const stockData = stockRows[0];
        const currentStock = Number(stockData.stock);

        if (currentStock < item.qty) {
          throw createError(
            `Stok tidak mencukupi untuk varian ID ${item.variant_id}. Stok tersedia: ${currentStock}, jumlah diminta: ${item.qty}.`,
          );
        }

        let finalUnitPrice;

        if (sale_type === "WHOLESALE") {
          if (
            !stockData.price_code_id ||
            Number(stockData.price_code_active) !== 1
          ) {
            throw createError(
              `Harga grosir belum dikonfigurasi atau kode harga tidak aktif untuk varian ID ${item.variant_id}.`,
            );
          }

          const [tierRows] = await connection.query(
            `SELECT unit_price
             FROM tr_tier_price
             WHERE price_code_id = ?
               AND min_qty <= ?
               AND (max_qty >= ? OR max_qty IS NULL)
             ORDER BY min_qty DESC
             LIMIT 1`,
            [stockData.price_code_id, item.qty, item.qty],
          );

          if (tierRows.length === 0) {
            throw createError(
              `Tidak ditemukan harga grosir yang sesuai untuk varian ID ${item.variant_id} dengan jumlah ${item.qty}.`,
            );
          }

          finalUnitPrice = toNumber(tierRows[0].unit_price, "Harga grosir");
        } else {
          const basePrice = toNumber(stockData.base_price, "Harga dasar");

          const storeDiscount = toNumber(
            stockData.discount_store || 0,
            "Diskon toko",
          );

          if (basePrice < 0 || storeDiscount < 0 || storeDiscount > 100) {
            throw createError(
              `Konfigurasi harga atau diskon toko tidak valid untuk varian ID ${item.variant_id}.`,
            );
          }

          // discount_store diperlakukan sebagai diskon persentase.
          finalUnitPrice = basePrice * (1 - storeDiscount / 100);
        }

        if (!Number.isFinite(finalUnitPrice) || finalUnitPrice < 0) {
          throw createError("Harga produk tidak valid.");
        }

        finalUnitPrice = Number(finalUnitPrice.toFixed(2));

        const itemSubtotal = Number((item.qty * finalUnitPrice).toFixed(2));

        subtotalPrice += itemSubtotal;

        processedItems.push({
          variant_id: item.variant_id,
          qty: item.qty,
          price_per_unit: finalUnitPrice,
          subtotal: itemSubtotal,
        });
      }

      subtotalPrice = Number(subtotalPrice.toFixed(2));

      // 5. Hitung diskon manual
      let manualDiscount = 0;
      const discountValue = toNumber(discount_value || 0, "Nilai diskon");

      const normalizedDiscountType =
        discount_type === "AMOUNT" ? "FIXED" : discount_type;

      if (discountValue < 0) {
        throw createError("Nilai diskon tidak boleh negatif.");
      }

      if (discountValue > 0) {
        if (normalizedDiscountType === "PERCENT") {
          if (discountValue > 100) {
            throw createError("Diskon persentase maksimal 100%.");
          }

          manualDiscount = (subtotalPrice * discountValue) / 100;
        } else if (normalizedDiscountType === "FIXED") {
          manualDiscount = discountValue;
        } else {
          throw createError("Jenis diskon tidak valid.");
        }
      }

      manualDiscount = Math.min(
        Number(manualDiscount.toFixed(2)),
        subtotalPrice,
      );

      // 6. Validasi dan hitung promo jika promo_id dikirim
      let promoDiscount = 0;
      let activePromo = null;

      if (promo_id) {
        const [promoRows] = await connection.query(
          `SELECT
             id,
             promo_code,
             promo_name,
             discount_type,
             discount_value
           FROM tm_promo
           WHERE id = ?
             AND is_active = 1
             AND start_date <= NOW()
             AND end_date >= NOW()
           FOR UPDATE`,
          [promo_id],
        );

        if (promoRows.length === 0) {
          throw createError(
            "Promo tidak ditemukan, tidak aktif, atau sudah di luar periode berlaku.",
          );
        }

        activePromo = promoRows[0];

        const promoValue = toNumber(activePromo.discount_value, "Nilai promo");

        if (activePromo.discount_type === "PERCENT") {
          if (promoValue < 0 || promoValue > 100) {
            throw createError("Konfigurasi persentase promo tidak valid.");
          }

          promoDiscount = (subtotalPrice * promoValue) / 100;
        } else if (activePromo.discount_type === "FIXED") {
          if (promoValue < 0) {
            throw createError("Konfigurasi nominal promo tidak valid.");
          }

          promoDiscount = promoValue;
        }

        promoDiscount = Number(promoDiscount.toFixed(2));
      }

      // Total diskon tidak boleh melebihi subtotal
      const discountTotal = Math.min(
        Number((manualDiscount + promoDiscount).toFixed(2)),
        subtotalPrice,
      );

      const appliedPromoDiscount = Number(
        Math.max(0, discountTotal - manualDiscount).toFixed(2),
      );

      const finalTotalPrice = Number(
        (subtotalPrice - discountTotal).toFixed(2),
      );

      // 7. Validasi pembayaran
      const amountReceived = toNumber(amount_received, "Nominal pembayaran");

      if (amountReceived < finalTotalPrice) {
        throw createError(
          `Pembayaran kurang. Total tagihan: ${finalTotalPrice}.`,
        );
      }

      const isCash = paymentMethod.method_name.toLowerCase() === "cash";

      const changeAmount = isCash
        ? Number((amountReceived - finalTotalPrice).toFixed(2))
        : 0;

      if (!isCash && amountReceived !== finalTotalPrice) {
        throw createError(
          "Untuk pembayaran non-tunai, nominal pembayaran harus sama dengan total tagihan.",
        );
      }

      // 8. Simpan header transaksi
      const [transactionResult] = await connection.query(
        `INSERT INTO tt_transaction
           (
             customer_id,
             cashier_id,
             store_id,
             sale_type,
             total_price,
             discount_total,
             tax_total,
             status,
             created_at,
             updated_at
           )
         VALUES (?, ?, ?, ?, ?, ?, 0, 'UNPAID', NOW(), NOW())`,
        [
          customer_id || null,
          cashierId,
          storeId,
          sale_type,
          finalTotalPrice,
          discountTotal,
        ],
      );

      const transactionId = transactionResult.insertId;

      // 9. Buat nomor invoice unik berdasarkan ID transaksi
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const invoiceNo = `INV-${datePart}-${String(transactionId).padStart(6, "0")}`;

      await connection.query(
        `UPDATE tt_transaction
         SET invoice_no = ?
         WHERE id = ?`,
        [invoiceNo, transactionId],
      );

      // 10. Simpan detail transaksi
      for (const item of processedItems) {
        await connection.query(
          `INSERT INTO tt_transaction_detail
             (
               transaction_id,
               variant_id,
               quantity,
               price_per_unit,
               subtotal
             )
           VALUES (?, ?, ?, ?, ?)`,
          [
            transactionId,
            item.variant_id,
            item.qty,
            item.price_per_unit,
            item.subtotal,
          ],
        );
      }

      // 11. Simpan hubungan promo jika digunakan
      if (activePromo) {
        await connection.query(
          `INSERT INTO tr_transaction_promo
             (transaction_id, promo_id, discount_amount)
           VALUES (?, ?, ?)`,
          [transactionId, activePromo.id, appliedPromoDiscount],
        );
      }

      // 12. Simpan pembayaran
      // amount menyimpan nominal tagihan yang dibayarkan,
      // bukan uang tunai yang diserahkan sebelum dikurangi kembalian.
      await connection.query(
        `INSERT INTO tt_payment
           (
             transaction_id,
             payment_method_id,
             amount,
             reference_no,
             verified_by,
             payment_date
           )
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          transactionId,
          paymentMethodId,
          finalTotalPrice,
          reference_no || null,
          cashierId,
        ],
      );

      // 13. Catat pergerakan stok.
      // Trigger database akan mengurangi stok secara otomatis.
      for (const item of processedItems) {
        await connection.query(
          `INSERT INTO tt_stock_movement
             (
               store_id,
               variant_id,
               movement_type,
               qty,
               reference_type,
               reference_id,
               created_by,
               created_at
             )
           VALUES (?, ?, 'OUT', ?, 'SALE', ?, ?, NOW())`,
          [storeId, item.variant_id, item.qty, transactionId, cashierId],
        );
      }

      // 14. Tandai transaksi sudah dibayar
      await connection.query(
        `UPDATE tt_transaction
         SET status = 'PAID'
         WHERE id = ?`,
        [transactionId],
      );

      await connection.commit();

      return {
        transaction_id: transactionId,
        invoice_no: invoiceNo,
        sale_type,
        items: processedItems,
        subtotal: subtotalPrice,
        manual_discount: manualDiscount,
        promo_discount: promoDiscount,
        discount_amount: discountTotal,
        total_price: finalTotalPrice,
        payment_method: paymentMethod.method_name,
        amount_paid: finalTotalPrice,
        amount_received: amountReceived,
        change_amount: changeAmount,
        status: "PAID",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = TransactionModel;
