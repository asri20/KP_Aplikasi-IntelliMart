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
    const { customer_id, items, total_amount, payment_id } = req.body;

    // 1. Simpan header transaksi
    const transactionId = await TransactionModel.create({
      customer_id,
      total_amount,
      payment_id,
    });

    // 2. Simpan setiap item di detail transaksi
    for (let item of items) {
      await TransactionModel.createDetail({
        transaction_id: transactionId,
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
        subtotal: item.qty * item.price,
      });
    }

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan!",
      transaction_id: transactionId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
