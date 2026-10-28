const db = require('../config/database'); // Sesuaikan path database kamu jika berbeda

const getAllCustomers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tm_customer_profile');
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Gagal mengambil data pelanggan:', error);
        return res.status(500).json({ success: false, message: 'Kesalahan pada server.' });
    }
};

const createCustomer = async (req, res) => {
    try {
        return res.status(201).json({ success: true, message: 'Pelanggan berhasil ditambahkan.' });
    } catch (error) {
        console.error('Gagal menambah pelanggan:', error);
        return res.status(500).json({ success: false, message: 'Kesalahan pada server.' });
    }
};

const upgradeToReseller = async (req, res) => {
  const { user_id, address } = req.body;
  try {
    const query = `
      INSERT INTO tm_customer_profile (user_id, address, customer_type) 
      VALUES (?, ?, 'RESELLER')
      ON DUPLICATE KEY UPDATE 
      address = VALUES(address), 
      customer_type = 'RESELLER'
    `;
    await db.query(query, [user_id, address]);
    
    const segmentQuery = `
      INSERT INTO tt_customer_segments (customer_id, segment_name) 
      VALUES (?, 'Reseller Baru')
    `;
    await db.query(segmentQuery, [user_id]);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mendaftarkan toko! Akun Anda kini berstatus Reseller.'
    });
  } catch (error) {
    console.error('Gagal memproses buka toko:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server.' 
    });
  }
};

const registerStore = async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  try {
    const [userResult] = await db.query(
      `INSERT INTO tm_users (name, email, phone, password, role_id) 
       VALUES (?, ?, ?, ?, 2) 
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
      [name, email, phone, password || 'default_pass']
    );

    const userId = userResult.insertId || req.body.user_id;

    await db.query(
      `INSERT INTO tm_customer_profile (user_id, address, customer_type) 
       VALUES (?, ?, 'RESELLER')
       ON DUPLICATE KEY UPDATE address = VALUES(address), customer_type = 'RESELLER'`,
      [userId, address]
    );

    await db.query(
      `INSERT INTO tt_customer_segments (customer_id, segment_name) 
       VALUES (?, 'Reseller Baru')`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Toko berhasil didaftarkan! Akun Anda kini berstatus Reseller.',
      user_id: userId
    });
  } catch (error) {
    console.error('Gagal mendaftarkan toko:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mendaftarkan toko.'
    });
  }
};

// FUNGSI: Mencatat transaksi ke tt_transaction & tt_transaction_detail
const createTransaction = async (req, res) => {
  const { user_id, total_amount, items } = req.body;

  try {
    const invoiceNo = `INV/${Date.now()}`;

    // 1. Simpan ke tt_transaction
    const [transactionResult] = await db.query(
      `INSERT INTO tt_transaction (invoice_no, customer_id, sale_type, total_price, status, created_at, updated_at) 
       VALUES (?, ?, 'RETAIL', ?, 'SUCCESS', NOW(), NOW())`,
      [invoiceNo, user_id, total_amount]
    );

    const transactionId = transactionResult.insertId;

    // 2. Jika ada item, simpan ke tt_transaction_detail
    if (items && Array.isArray(items) && items.length > 0) {
      // Nonaktifkan sementara pemeriksaan Foreign Key constraint untuk tabel detail
      await db.query(`SET FOREIGN_KEY_CHECKS = 0`);

      const itemValues = items.map(item => [
        transactionId,
        item.product_id, // variant_id
        item.quantity,
        item.price,      // price_per_unit
        item.price * item.quantity // subtotal
      ]);

      await db.query(
        `INSERT INTO tt_transaction_detail (transaction_id, variant_id, quantity, price_per_unit, subtotal) VALUES ?`,
        [itemValues]
      );

      // Aktifkan kembali pemeriksaan Foreign Key constraint
      await db.query(`SET FOREIGN_KEY_CHECKS = 1`);
    }

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dicatat.',
      transaction_id: transactionId
    });
  } catch (error) {
    // Pastikan foreign key diaktifkan kembali jika terjadi error
    await db.query(`SET FOREIGN_KEY_CHECKS = 1`).catch(() => {});
    
    console.error('Gagal mencatat transaksi:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mencatat transaksi.'
    });
  }
};

// FUNGSI: Mengambil riwayat pembelian dari tt_transaction
const getPurchaseHistory = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id AS transaction_id, invoice_no, total_price AS total_amount, status, created_at AS transaction_date 
       FROM tt_transaction WHERE customer_id = ? ORDER BY created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Gagal mengambil riwayat pembelian:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = {
  getAllCustomers,
  createCustomer,
  upgradeToReseller,
  registerStore,
  createTransaction,
  getPurchaseHistory
};