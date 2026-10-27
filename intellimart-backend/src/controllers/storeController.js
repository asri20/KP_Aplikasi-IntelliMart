// src/controllers/storeController.js
const storeModel = require('../models/storeModel');
const { logActivity } = require('../helpers/loggerHelper');
const userModel = require('../models/userModel');

// ========================================================
// 1. CREATE STORE (Khusus Owner)
// ========================================================
async function createStore(req, res) {
  try {
    const { store_name, location, phone, manager_id } = req.body;
    const owner_id = req.user.id; // Diambil otomatis dari JWT token

    if (!store_name) {
      return res.status(400).json({
        success: false,
        message: 'Nama toko (store_name) wajib diisi.'
      });
    }

    const newStore = await storeModel.createStore({
      store_name,
      location: location || null,
      phone: phone || null,
      owner_id,
      manager_id: manager_id || null
    });

    // 📝 Catat ke tt_activity_log
    await logActivity(owner_id, 'CREATE_STORE', 'tm_store', newStore.id);

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil dibuat.',
      data: newStore
    });

  } catch (error) {
    console.error('Error Create Store:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat membuat toko.'
    });
  }
}




// ========================================================
// ASSIGN MANAGER TO STORE (Khusus Owner)
// ========================================================
async function assignManagerToStore(req, res) {
  try {
    const { store_id, manager_id } = req.body;
    const ownerId = Number(req.user.id);
    const storeId = Number(store_id);
    const managerId = Number(manager_id);

    // 1. Validasi input
    if (
      !Number.isInteger(storeId) ||
      storeId <= 0 ||
      !Number.isInteger(managerId) ||
      managerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'store_id dan manager_id harus berupa ID yang valid.'
      });
    }

    // 2. Pastikan toko tersedia dan milik Owner yang login
    const store = await storeModel.findById(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan.'
      });
    }

    if (Number(store.owner_id) !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan pemilik toko ini.'
      });
    }

    // 3. Pastikan user tersedia dan aktif
    const manager = await userModel.findById(managerId);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'User Manager tidak ditemukan.'
      });
    }

    if (Number(manager.is_active) !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Akun Manager tidak aktif.'
      });
    }

    // 4. Pastikan role user adalah Manager
    const managerRole = await userModel.findRoleByName('Manager');

    if (!managerRole || Number(manager.role_id) !== Number(managerRole.id)) {
      return res.status(400).json({
        success: false,
        message: 'User yang dipilih harus memiliki role Manager.'
      });
    }

    // 5. Manager tidak boleh ditugaskan ke toko lain
    const existingStore = await storeModel.findByManagerId(managerId);

    if (existingStore && Number(existingStore.id) !== storeId) {
      return res.status(409).json({
        success: false,
        message: 'Manager ini sudah ditugaskan ke toko lain.'
      });
    }

    // 6. Simpan penugasan
    await storeModel.assignManager(storeId, managerId);

    // 7. Catat aktivitas
    await logActivity(ownerId, 'ASSIGN_MANAGER', 'tm_store', storeId);

    return res.status(200).json({
      success: true,
      message: 'Manager berhasil ditugaskan ke toko.'
    });
  } catch (error) {
    console.error('Error Assign Manager:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menugaskan Manager.'
    });
  }
}

// ========================================================
// 3. GET MY STORES (Daftar Toko milik Owner)
// ========================================================
async function getMyStores(req, res) {
  try {
    const stores = await storeModel.findByOwnerId(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar toko.',
      data: stores
    });
  } catch (error) {
    console.error('Error Get Stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil daftar toko.'
    });
  }
}

module.exports = {
  createStore,
  assignManagerToStore,
  getMyStores
};