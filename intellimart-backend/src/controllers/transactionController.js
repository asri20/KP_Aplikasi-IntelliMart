const TransactionModel = require("../models/transactionModel");

exports.getAllTransactions = async (req, res) => {
  try {
    const data = await TransactionModel.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCheckout = async (req, res) => {
  try {
    const {
      customer_id,
      cashier_id,
      store_id,
      sale_type,
      items,
      discount_type, // 'PERCENT' atau 'NOMINAL'
      discount_value, // nominal rupiah atau angka persentase
      status,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keranjang belanja tidak boleh kosong",
      });
    }

    let subtotalPrice = 0;
    const processedItems = [];

    // 1. Hitung Bulk Pricing per item & total kotor
    for (let item of items) {
      const variantId = item.product_id;
      const priceCodeId = item.price_code_id || item.product_id;
      const qty = item.qty;

      const tierPrice = await TransactionModel.getTierPrice(priceCodeId, qty);
      const finalUnitPrice =
        tierPrice !== null ? parseFloat(tierPrice) : parseFloat(item.price);
      const subtotal = qty * finalUnitPrice;

      subtotalPrice += subtotal;

      processedItems.push({
        variant_id: variantId,
        qty,
        price_per_unit: finalUnitPrice,
        subtotal,
      });
    }

    // 2. Kalkulasi Nilai Diskon
    let calculatedDiscount = 0;
    if (discount_value && discount_value > 0) {
      if (discount_type === "PERCENT") {
        calculatedDiscount = (subtotalPrice * parseFloat(discount_value)) / 100;
      } else {
        calculatedDiscount = parseFloat(discount_value);
      }
    }

    // Batasi nilai diskon agar tidak melampaui subtotal
    if (calculatedDiscount > subtotalPrice) {
      calculatedDiscount = subtotalPrice;
    }

    const finalTotalPrice = subtotalPrice - calculatedDiscount;

    // 3. Simpan Header Transaksi dengan total harga bersih
    const transactionId = await TransactionModel.create({
      customer_id,
      cashier_id,
      store_id,
      sale_type: sale_type || "RETAIL",
      total_price: finalTotalPrice,
      status: status || "PAID",
    });

    // 4. Simpan Detail Transaksi dan Catat Pergerakan Stok
    for (let item of processedItems) {
      await TransactionModel.createDetail({
        transaction_id: transactionId,
        variant_id: item.variant_id,
        quantity: item.qty,
        price_per_unit: item.price_per_unit,
        subtotal: item.subtotal,
      });

      await TransactionModel.createStockMovement({
        store_id: store_id || 1,
        variant_id: item.variant_id,
        qty: item.qty,
        reference_id: transactionId,
        created_by: cashier_id || 1,
      });
    }

    res.status(201).json({
      success: true,
      message: "Transaksi penjualan dengan diskon berhasil disimpan!",
      transaction_id: transactionId,
      subtotal: subtotalPrice,
      discount_amount: calculatedDiscount,
      total_price: finalTotalPrice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
