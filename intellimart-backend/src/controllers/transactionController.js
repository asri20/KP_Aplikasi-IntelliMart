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
      total_price,
      items,
      status,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keranjang belanja tidak boleh kosong",
      });
    }

    // 1. Simpan Header Transaksi
    const transactionId = await TransactionModel.create({
      customer_id,
      cashier_id,
      store_id,
      sale_type,
      total_price,
      status,
    });

    // 2. Loop detail transaksi dan potong stok
    for (let item of items) {
      const subtotal = item.qty * item.price;

      await TransactionModel.createDetail({
        transaction_id: transactionId,
        variant_id: item.product_id,
        quantity: item.qty,
        price_per_unit: item.price,
        subtotal,
      });

      await TransactionModel.createStockMovement({
        store_id: store_id || 1,
        variant_id: item.product_id,
        qty: item.qty,
        reference_id: transactionId,
        created_by: cashier_id || 1,
      });
    }

    res.status(201).json({
      success: true,
      message: "Transaksi penjualan berhasil disimpan!",
      transaction_id: transactionId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
