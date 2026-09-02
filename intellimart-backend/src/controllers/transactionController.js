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
    const { customer_id, cashier_id, store_id, sale_type, items, status } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keranjang belanja tidak boleh kosong",
      });
    }

    let calculatedTotalPrice = 0;
    const processedItems = [];

    // 1. Cek Bulk Pricing (Harga Bertingkat) per item dari tr_tier_price
    for (let item of items) {
      const variantId = item.product_id;
      const priceCodeId = item.price_code_id || item.product_id;
      const qty = item.qty;

      // Ambil harga grosir/tier dari database jika kuantitas memenuhi syarat
      const tierPrice = await TransactionModel.getTierPrice(priceCodeId, qty);

      // Gunakan tierPrice jika ada, jika tidak gunakan harga normal (item.price)
      const finalUnitPrice =
        tierPrice !== null ? parseFloat(tierPrice) : parseFloat(item.price);
      const subtotal = qty * finalUnitPrice;

      calculatedTotalPrice += subtotal;

      processedItems.push({
        variant_id: variantId,
        qty,
        price_per_unit: finalUnitPrice,
        subtotal,
      });
    }

    // 2. Simpan Header Transaksi dengan total harga terhitung
    const transactionId = await TransactionModel.create({
      customer_id,
      cashier_id,
      store_id,
      sale_type: sale_type || "RETAIL",
      total_price: calculatedTotalPrice,
      status: status || "PAID",
    });

    // 3. Simpan Detail Transaksi dan Catat Pergerakan Stok
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
      message: "Transaksi penjualan dengan harga bertingkat berhasil disimpan!",
      transaction_id: transactionId,
      total_price: calculatedTotalPrice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
