
const storeStaffModel = require('../models/storeStaffModel');
const storeModel = require('../models/storeModel');
const userModel = require('../models/userModel');
const { logActivity } = require('../helpers/loggerHelper');

// GET: daftar staff di seluruh toko milik Owner
async function getMyStaff(req, res) {
  try {
    const staff = await storeStaffModel.findStaffByOwnerId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar staff.',
      data: staff
    });
  } catch (error) {
    console.error('Error Get My Staff:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar staff.'
    });
  }
}

// POST: tempatkan staff ke toko
async function assignStaff(req, res) {
  try {
    const storeId = Number(req.body.store_id);
    const userId = Number(req.body.user_id);
    const ownerId = Number(req.user.id);

    if (Number(selectedStaff.created_by_owner_id) !== ownerId) {
  return res.status(403).json({
    success: false,
    message: 'Anda hanya dapat menugaskan staff yang Anda buat.'
  });
}

    const store = await storeStaffModel.findStoreByOwner(storeId, ownerId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan atau bukan milik Anda.'
      });
    }

    const staff = await storeStaffModel.findStaffByIdAndRole(userId, 'Manager');
    const cashier = staff
      ? null
      : await storeStaffModel.findStaffByIdAndRole(userId, 'Cashier');
    const selectedStaff = staff || cashier;

    if (!selectedStaff) {
      return res.status(400).json({
        success: false,
        message: 'Akun harus memiliki role Manager atau Cashier.'
      });
    }

    if (!selectedStaff.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Akun staff sedang nonaktif.'
      });
    }

    const existing = await storeStaffModel.findAssignmentByUserId(userId);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Staff sudah ditempatkan. Gunakan fitur pindah staff.'
      });
    }

    // Validasi jumlah role sebelum assignment.
    const currentStaff = await storeStaffModel.findStaffByOwnerId(ownerId);
    const storeStaff = currentStaff.filter(
      item => Number(item.store_id) === storeId
    );

    if (selectedStaff.role_name.toLowerCase() === 'manager' &&
        storeStaff.some(item => item.role_name.toLowerCase() === 'manager')) {
      return res.status(409).json({
        success: false,
        message: 'Toko sudah memiliki Manager.'
      });
    }

    await storeStaffModel.assignStaff(storeId, userId);

    await logActivity(ownerId, 'ASSIGN_STAFF', 'tr_store_staff', userId);

    return res.status(201).json({
      success: true,
      message: 'Staff berhasil ditempatkan ke toko.'
    });
  } catch (error) {
    console.error('Error Assign Staff:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Staff sudah memiliki penempatan toko.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menempatkan staff.'
    });
  }
}

// PUT: pindahkan staff ke toko lain milik Owner yang sama
async function moveStaff(req, res) {
  try {
    const userId = Number(req.params.userId);
    const newStoreId = Number(req.body.store_id);
    const ownerId = Number(req.user.id);

    if (Number(staff.created_by_owner_id) !== ownerId) {
  return res.status(403).json({
    success: false,
    message: 'Anda tidak berhak memindahkan staff ini.'
  });
}

    const newStore = await storeStaffModel.findStoreByOwner(
      newStoreId,
      ownerId
    );

    if (!newStore) {
      return res.status(404).json({
        success: false,
        message: 'Toko tujuan tidak ditemukan atau bukan milik Anda.'
      });
    }

    const existing = await storeStaffModel.findAssignmentByUserId(userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Penempatan staff tidak ditemukan.'
      });
    }

    const oldStore = await storeStaffModel.findStoreByOwner(
      existing.store_id,
      ownerId
    );

    if (!oldStore) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak berhak memindahkan staff dari toko ini.'
      });
    }

    if (Number(existing.store_id) === newStoreId) {
      return res.status(400).json({
        success: false,
        message: 'Staff sudah ditempatkan di toko tersebut.'
      });
    }

    const staff =
      await storeStaffModel.findStaffByIdAndRole(userId, 'Manager') ||
      await storeStaffModel.findStaffByIdAndRole(userId, 'Cashier');

    if (!staff) {
      return res.status(400).json({
        success: false,
        message: 'Akun bukan Manager atau Cashier.'
      });
    }

    // Jangan memindahkan Manager jika toko lama akan kehilangan satu-satunya Manager.
    if (staff.role_name.toLowerCase() === 'manager') {
      return res.status(409).json({
        success: false,
        message: 'Manager tidak dapat dipindahkan sebelum pengganti ditugaskan.'
      });
    }

    // Jangan biarkan toko lama kehilangan Cashier hingga kurang dari dua.
    const allStaff = await storeStaffModel.findStaffByOwnerId(ownerId);
    const oldCashiers = allStaff.filter(
      item => Number(item.store_id) === Number(existing.store_id) &&
              item.role_name.toLowerCase() === 'cashier'
    );

    if (oldCashiers.length <= 2) {
      return res.status(409).json({
        success: false,
        message: 'Toko asal harus tetap memiliki minimal 2 Cashier.'
      });
    }

    // Pastikan toko tujuan punya Manager dan minimal 2 Cashier setelah pemindahan.
    const newStoreStaff = allStaff.filter(
      item => Number(item.store_id) === newStoreId
    );

    if (!newStoreStaff.some(
      item => item.role_name.toLowerCase() === 'manager'
    )) {
      return res.status(409).json({
        success: false,
        message: 'Tugaskan satu Manager ke toko tujuan terlebih dahulu.'
      });
    }

    await storeStaffModel.moveStaff(userId, newStoreId);

    await logActivity(ownerId, 'MOVE_STAFF', 'tr_store_staff', userId);

    return res.status(200).json({
      success: true,
      message: 'Staff berhasil dipindahkan.'
    });
  } catch (error) {
    console.error('Error Move Staff:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memindahkan staff.'
    });
  }
}

module.exports = {
  getMyStaff,
  assignStaff,
  moveStaff
};
