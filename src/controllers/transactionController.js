const TransactionModel = require("../models/transactionModel");
const { getRole, getAccessibleStores } = require("../middlewares/storeAccess");

exports.getAllTransactions = async (req, res) => {
  try {
    const role = getRole(req.user);
    const userId = Number(req.user?.id);
    const { store_id } = req.query;

    let data = [];

    if (role === "owner" || role === "manager") {
      const stores = await getAccessibleStores(req.user);
      const allowedIds = stores.map((s) => Number(s.id));

      if (store_id !== undefined && store_id !== "") {
        if (!allowedIds.includes(Number(store_id))) {
          return res.status(403).json({
            success: false,
            message: "Anda tidak memiliki akses ke transaksi toko ini.",
          });
        }
        data = await TransactionModel.getByStoreIds([Number(store_id)]);
      } else {
        data = await TransactionModel.getByStoreIds(allowedIds);
      }
    } else if (role === "cashier") {
      data = await TransactionModel.getByCashierId(userId);
    } else if (role === "customer") {
      data = await TransactionModel.getByCustomerId(userId);
    }

    res.status(200).json({ success: true, count: data.length, data });
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
      cashier_id: cashier_id || req.user?.id,
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
        created_by: cashier_id || req.user?.id || 1,
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
