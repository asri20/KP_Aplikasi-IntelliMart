/**
 * @file storeAccess.js
 * @description Pembatasan data per role untuk endpoint Dashboard & Analitik (Modul 10).
 *
 * Aturan akses toko:
 *   - Owner   : hanya toko yang dimilikinya (tm_store.owner_id)
 *   - Manager : hanya toko yang ditugaskan kepadanya (tm_store.manager_id)
 *   - Cashier / Customer : tidak punya akses ke data agregat toko
 *     (mereka memakai endpoint /api/me/* yang hanya berisi data miliknya sendiri)
 */
const StoreModel = require('../models/storeModel');

const ROLE_BY_ID = { 1: 'owner', 2: 'manager', 3: 'cashier', 4: 'customer' };

function getRole(user) {
  const name = String(user?.role_name || '').trim().toLowerCase();
  return name || ROLE_BY_ID[Number(user?.role_id)] || '';
}

async function getAccessibleStores(user) {
  const userId = Number(user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return [];

  const role = getRole(user);

  if (role === 'owner') {
    return StoreModel.findByOwnerId(userId);
  }

  if (role === 'manager') {
    const store = await StoreModel.findByManagerId(userId);
    return store ? [store] : [];
  }

  return [];
}

/**
 * Batasi akses ke role tertentu (dipanggil setelah verifyToken).
 * Contoh: checkRole('owner', 'manager')
 */
function checkRole(...allowedRoles) {
  const allowed = allowedRoles.map((r) => r.toLowerCase());
  return (req, res, next) => {
    if (!allowed.includes(getRole(req.user))) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk data ini.',
      });
    }
    next();
  };
}

/**
 * Pastikan store_id / store_name pada query adalah toko yang boleh diakses user.
 * @param {Object} [options]
 * @param {boolean} [options.required=true] - Wajibkan parameter store_id/store_name
 */
function requireStoreAccess({ required = true } = {}) {
  return async (req, res, next) => {
    try {
      const stores = await getAccessibleStores(req.user);
      req.accessibleStores = stores;

      const { store_id: storeId, store_name: storeName } = req.query;

      if (storeId !== undefined && storeId !== '') {
        const allowed = stores.some((s) => Number(s.id) === Number(storeId));
        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: 'Anda tidak memiliki akses ke toko ini.',
          });
        }
      } else if (storeName) {
        const allowed = stores.some((s) => s.store_name === storeName);
        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: 'Anda tidak memiliki akses ke toko ini.',
          });
        }
      } else if (required) {
        return res.status(400).json({
          success: false,
          message: 'Parameter store_id diperlukan.',
        });
      }

      next();
    } catch (error) {
      console.error('[storeAccess]', error.message);
      return res.status(500).json({
        success: false,
        message: 'Gagal memeriksa hak akses toko.',
      });
    }
  };
}

async function getEffectiveOwnerId(user) {
  const userId = Number(user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return null;

  const role = getRole(user);
  if (role === 'owner') return userId;

  if (role === 'manager') {
    const store = await StoreModel.findByManagerId(userId);
    return store ? Number(store.owner_id) : null;
  }

  return null;
}

module.exports = { getRole, getAccessibleStores, getEffectiveOwnerId, checkRole, requireStoreAccess };

