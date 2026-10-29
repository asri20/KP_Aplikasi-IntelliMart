
const StockMovementModel = require('../models/stockMovementModel');
const StoreModel = require('../models/storeModel');
const VariantModel = require('../models/variantModel');
const SupplierModel = require('../models/supplierModel');

const VALID_MOVEMENT_TYPES = [
  'IN',
  'OUT',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT'
];

const VALID_REFERENCE_TYPES = [
  'PURCHASE',
  'SALE',
  'ADJUSTMENT',
  'TRANSFER',
  'INITIAL',
  'RETURN'
];

const OUTGOING_TYPES = ['OUT', 'ADJUSTMENT_OUT'];

const isPositiveInteger = (value) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const isValidQty = (value) =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0;

const getAccessibleStores = async (user) => {
  const userId = Number(user?.id);
  const roleId = Number(user?.role_id);
  const roleName = String(user?.role_name || '').toLowerCase();

  if (!isPositiveInteger(userId)) {
    return [];
  }

  // Owner: hanya toko yang dimilikinya.
  if (roleId === 1 || roleName === 'owner') {
    return StoreModel.findByOwnerId(userId);
  }

  // Manager: hanya toko yang ditugaskan kepadanya.
  if (roleName === 'manager') {
    const store = await StoreModel.findByManagerId(userId);
    return store ? [store] : [];
  }

  return [];
};

const getAuthorizedStore = async (user, storeId) => {
  if (!isPositiveInteger(storeId)) {
    return { error: 'ID toko tidak valid', status: 400 };
  }

  const store = await StoreModel.findById(Number(storeId));

  if (!store) {
    return { error: 'Toko tidak ditemukan', status: 404 };
  }

  const accessibleStores = await getAccessibleStores(user);
  const allowed = accessibleStores.some(
    (item) => Number(item.id) === Number(store.id)
  );

  if (!allowed) {
    return {
      error: 'Anda tidak memiliki akses ke toko ini',
      status: 403
    };
  }

  return { store };
};

const StockMovementController = {
  // GET /api/stock-movements?store_id=1&variant_id=1
  getAll: async (req, res) => {
    try {
      const { store_id, variant_id } = req.query;

      if (variant_id && !isPositiveInteger(variant_id)) {
        return res.status(400).json({
          success: false,
          message: 'variant_id tidak valid'
        });
      }

      let stores;

      if (store_id) {
        const result = await getAuthorizedStore(req.user, store_id);

        if (result.error) {
          return res.status(result.status).json({
            success: false,
            message: result.error
          });
        }

        stores = [result.store];
      } else {
        stores = await getAccessibleStores(req.user);
      }

      if (!stores.length) {
        return res.status(403).json({
          success: false,
          message: 'Tidak ada toko yang dapat Anda akses'
        });
      }

      const results = await Promise.all(
        stores.map((store) =>
          StockMovementModel.findAll(store.id, variant_id)
        )
      );

      const data = results
        .flat()
        .sort(
          (a, b) =>
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );

      return res.status(200).json({
        success: true,
        message: 'Data pergerakan stok berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('StockMovementController.getAll error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pergerakan stok'
      });
    }
  },

  // GET /api/stock-movements/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!isPositiveInteger(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID pergerakan stok tidak valid'
        });
      }

      const data = await StockMovementModel.findById(Number(id));

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Pergerakan stok tidak ditemukan'
        });
      }

      const result = await getAuthorizedStore(req.user, data.store_id);

      if (result.error) {
        return res.status(result.status).json({
          success: false,
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data pergerakan stok berhasil diambil',
        data
      });
    } catch (error) {
      console.error('StockMovementController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pergerakan stok'
      });
    }
  },

  // POST /api/stock-movements
  create: async (req, res) => {
    try {
      const {
        store_id,
        variant_id,
        movement_type,
        qty,
        reference_type,
        reference_id,
        supplier_id,
        note
      } = req.body;

      if (!isPositiveInteger(store_id)) {
        return res.status(400).json({
          success: false,
          message: 'store_id wajib diisi dengan ID yang valid'
        });
      }

      if (!isPositiveInteger(variant_id)) {
        return res.status(400).json({
          success: false,
          message: 'variant_id wajib diisi dengan ID yang valid'
        });
      }

      if (!VALID_MOVEMENT_TYPES.includes(movement_type)) {
        return res.status(400).json({
          success: false,
          message: `movement_type harus salah satu dari: ${VALID_MOVEMENT_TYPES.join(', ')}`
        });
      }

      if (!isValidQty(qty)) {
        return res.status(400).json({
          success: false,
          message: 'qty harus berupa angka lebih besar dari 0'
        });
      }

      if (!VALID_REFERENCE_TYPES.includes(reference_type)) {
        return res.status(400).json({
          success: false,
          message: `reference_type harus salah satu dari: ${VALID_REFERENCE_TYPES.join(', ')}`
        });
      }

      // Pastikan pengguna berhak mengakses toko tujuan.
      const storeResult = await getAuthorizedStore(req.user, store_id);

      if (storeResult.error) {
        return res.status(storeResult.status).json({
          success: false,
          message: storeResult.error
        });
      }

      const variant = await VariantModel.findById(Number(variant_id));

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Varian produk tidak ditemukan'
        });
      }

      if (supplier_id !== undefined && supplier_id !== null && supplier_id !== '') {
        if (!isPositiveInteger(supplier_id)) {
          return res.status(400).json({
            success: false,
            message: 'supplier_id tidak valid'
          });
        }

        const supplier = await SupplierModel.findById(Number(supplier_id));

        if (!supplier) {
          return res.status(404).json({
            success: false,
            message: 'Supplier tidak ditemukan'
          });
        }
      }

      const quantity = Number(qty);

      if (OUTGOING_TYPES.includes(movement_type)) {
        const currentStock = await StockMovementModel.getCurrentStock(
          Number(store_id),
          Number(variant_id)
        );

        if (currentStock === null || currentStock === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Data stok untuk toko dan varian ini belum tersedia'
          });
        }

        if (Number(currentStock) < quantity) {
          return res.status(409).json({
            success: false,
            message: `Stok tidak mencukupi. Stok saat ini: ${currentStock}, diminta: ${quantity}`,
            error: 'INSUFFICIENT_STOCK',
            current_stock: Number(currentStock)
          });
        }
      }

      // Jangan percaya created_by dari request body.
      const createdBy = Number(req.user?.id);

      if (!isPositiveInteger(createdBy)) {
        return res.status(401).json({
          success: false,
          message: 'Identitas pengguna dari token tidak valid'
        });
      }

      const data = await StockMovementModel.create({
        store_id: Number(store_id),
        variant_id: Number(variant_id),
        movement_type,
        qty: quantity,
        reference_type,
        reference_id: reference_id || null,
        supplier_id: supplier_id ? Number(supplier_id) : null,
        note: note || null,
        created_by: createdBy
      });

      return res.status(201).json({
        success: true,
        message: 'Pergerakan stok berhasil dicatat, stok otomatis diperbarui',
        data
      });

    } catch (error) {
      if (
        error.code === 'INSUFFICIENT_STOCK' ||
        error.code === 'STOCK_NOT_FOUND'
      ) {
        const status = error.code === 'INSUFFICIENT_STOCK' ? 409 : 400;

        return res.status(status).json({
          success: false,
          message: error.message,
          error: error.code,
          ...(error.current_stock !== undefined
            ? { current_stock: error.current_stock }
            : {})
        });
      }

      console.error('StockMovementController.create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mencatat pergerakan stok'
      });
    }

  }
};

module.exports = StockMovementController;
