const TransactionModel = require("../models/transactionModel");

// Mengambil seluruh transaksi
exports.getAllTransactions = async (req, res) => {
  try {
    const data = await TransactionModel.getAll();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Gagal mengambil transaksi:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data transaksi.",
    });
  }
};

// Mengambil detail transaksi untuk struk/invoice
exports.getTransactionDetail = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid.",
      });
    }

    const transaction = await TransactionModel.getById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Gagal mengambil detail transaksi:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi.",
    });
  }
};

// Checkout transaksi POS
exports.createCheckout = async (req, res) => {
  try {
    const result = await TransactionModel.checkout(req.body);

    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("Checkout gagal:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Terjadi kesalahan saat memproses transaksi.",
    });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const [rows] = await require("../config/db").query(
      `SELECT id, method_name
       FROM tm_payment_method
       ORDER BY id ASC`,
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Gagal mengambil metode pembayaran:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil metode pembayaran.",
    });
  }
};
