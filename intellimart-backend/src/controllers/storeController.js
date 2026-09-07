// src/controllers/storeController.js
const storeModel = require('../models/storeModel');
const { logActivity } = require('../helpers/loggerHelper');

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
// 2. ASSIGN MANAGER TO STORE (Khusus Owner)
// ========================================================
async function assignManagerToStore(req, res) {
  try {
    const { store_id, manager_id } = req.body;

    if (!store_id || !manager_id) {
      return res.status(400).json({
        success: false,
        message: 'store_id dan manager_id wajib diisi.'
      });
    }

    const store = await storeModel.findById(store_id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan.'
      });
    }

    if (store.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan pemilik toko ini.'
      });
    }

    await storeModel.assignManager(store_id, manager_id);

    // 📝 Catat ke tt_activity_log
    await logActivity(req.user.id, 'ASSIGN_MANAGER', 'tm_store', store_id);

    return res.status(200).json({
      success: true,
      message: 'Manager berhasil ditugaskan ke toko.'
    });

  } catch (error) {
    console.error('Error Assign Manager:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menugaskan manager.'
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