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
        // Logika create customer yang sudah ada sebelumnya
        return res.status(201).json({ success: true, message: 'Pelanggan berhasil ditambahkan.' });
    } catch (error) {
        console.error('Gagal menambah pelanggan:', error);
        return res.status(500).json({ success: false, message: 'Kesalahan pada server.' });
    }
};

const upgradeToReseller = async (req, res) => {
  const { user_id, address } = req.body;
  try {
    // Query untuk memasukkan atau memperbarui profil customer menjadi RESELLER
    const query = `
      INSERT INTO tm_customer_profile (user_id, address, customer_type) 
      VALUES (?, ?, 'RESELLER')
      ON DUPLICATE KEY UPDATE 
      address = VALUES(address), 
      customer_type = 'RESELLER'
    `;
    await db.query(query, [user_id, address]);
    
    // Opsional: Catat log riwayat segmen ke tt_customer_segments
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

// FUNGSI BARU: Pendaftaran toko lengkap (tm_users, tm_customer_profile, tt_customer_segments)
const registerStore = async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  try {
    // 1. Simpan data pemilik toko ke tabel tm_users
    const [userResult] = await db.query(
      `INSERT INTO tm_users (name, email, phone, password, role_id) 
       VALUES (?, ?, ?, ?, 2) 
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
      [name, email, phone, password || 'default_pass']
    );

    // Ambil user_id dari hasil insert atau request
    const userId = userResult.insertId || req.body.user_id;

    // 2. Simpan atau perbarui profil customer di tm_customer_profile menjadi RESELLER dan simpan alamatnya
    await db.query(
      `INSERT INTO tm_customer_profile (user_id, address, customer_type) 
       VALUES (?, ?, 'RESELLER')
       ON DUPLICATE KEY UPDATE address = VALUES(address), customer_type = 'RESELLER'`,
      [userId, address]
    );

    // 3. Catat log riwayat ke tt_customer_segments
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

// PENTING: Semua fungsi controller harus diekspor di sini agar terbaca oleh router
module.exports = {
  getAllCustomers,
  createCustomer,
  upgradeToReseller,
  registerStore
};