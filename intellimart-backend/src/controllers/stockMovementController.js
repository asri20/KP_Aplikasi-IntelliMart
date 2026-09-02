// src/controllers/stockMovementController.js
// Controller untuk modul Pergerakan Stok

const StockMovementModel = require('../models/stockMovementModel');
const StoreModel = require('../models/storeModel');
const VariantModel = require('../models/variantModel');
const SupplierModel = require('../models/supplierModel');
const UserModel = require('../models/userModel');

const VALID_MOVEMENT_TYPES = ['IN', 'OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'];
const VALID_REFERENCE_TYPES = ['PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'INITIAL', 'RETURN'];
const OUTGOING_TYPES = ['OUT', 'ADJUSTMENT_OUT'];

const StockMovementController = {

  /**
   * GET /api/stock-movements
   * GET /api/stock-movements?store_id=1&variant_id=1
   */
  getAll: async (req, res) => {
    try {
      const { store_id, variant_id } = req.query;
      const data = await StockMovementModel.findAll(store_id, variant_id);

      return res.status(200).json({
        success: true,
        message: 'Data pergerakan stok berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('StockMovementController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data pergerakan stok', error: error.message });
    }
  },

  /**
   * GET /api/stock-movements/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID pergerakan stok tidak valid' });
      }

      const data = await StockMovementModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Pergerakan stok dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data pergerakan stok berhasil diambil', data });
    } catch (error) {
      console.error('StockMovementController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data pergerakan stok', error: error.message });
    }
  },

  /**
   * POST /api/stock-movements
   *
   * CATATAN: created_by WAJIB dikirim manual di body untuk saat ini (mis. id user yang login),
   * karena Modul Auth belum ada. Nanti kalau Modul Auth sudah jadi, ini akan diambil otomatis
   * dari token login, bukan dari body.
   */
  create: async (req, res) => {
    try {
      const {
        store_id, variant_id, movement_type, qty,
        reference_type, reference_id, supplier_id, note, created_by
      } = req.body;

      // --- Validasi field wajib ---
      if (!store_id) {
        return res.status(400).json({ success: false, message: 'store_id wajib diisi' });
      }
      if (!variant_id) {
        return res.status(400).json({ success: false, message: 'variant_id wajib diisi' });
      }
      if (!movement_type) {
        return res.status(400).json({ success: false, message: 'movement_type wajib diisi' });
      }
      if (!VALID_MOVEMENT_TYPES.includes(movement_type)) {
        return res.status(400).json({
          success: false,
          message: `movement_type harus salah satu dari: ${VALID_MOVEMENT_TYPES.join(', ')}`
        });
      }
      if (qty === undefined || qty === null || isNaN(qty) || Number(qty) <= 0) {
        return res.status(400).json({ success: false, message: 'qty wajib diisi dan harus lebih besar dari 0' });
      }
      if (!reference_type) {
        return res.status(400).json({ success: false, message: 'reference_type wajib diisi' });
      }
      if (!VALID_REFERENCE_TYPES.includes(reference_type)) {
        return res.status(400).json({
          success: false,
          message: `reference_type harus salah satu dari: ${VALID_REFERENCE_TYPES.join(', ')}`
        });
      }
      if (!created_by) {
        return res.status(400).json({
          success: false,
          message: 'created_by wajib diisi (sementara manual, sampai Modul Auth siap)'
        });
      }

      // --- Validasi FK ---
      const store = await StoreModel.findById(store_id);
      if (!store) {
        return res.status(404).json({ success: false, message: `Toko dengan ID ${store_id} tidak ditemukan` });
      }

      const variant = await VariantModel.findById(variant_id);
      if (!variant) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${variant_id} tidak ditemukan` });
      }

      const user = await UserModel.findById(created_by);
      if (!user) {
        return res.status(404).json({ success: false, message: `User dengan ID ${created_by} tidak ditemukan` });
      }

      if (supplier_id) {
        const supplier = await SupplierModel.findById(supplier_id);
        if (!supplier) {
          return res.status(404).json({ success: false, message: `Supplier dengan ID ${supplier_id} tidak ditemukan` });
        }
      }

      // --- Validasi stok cukup, KHUSUS utk movement yang mengurangi stok ---
      if (OUTGOING_TYPES.includes(movement_type)) {
        const currentStock = await StockMovementModel.getCurrentStock(store_id, variant_id);

        if (currentStock === null) {
          return res.status(400).json({
            success: false,
            message: `Belum ada data stok untuk toko ${store_id} & varian ${variant_id}. Buat dulu lewat POST /api/stocks sebelum mengurangi stok.`
          });
        }

        if (currentStock < qty) {
          return res.status(409).json({
            success: false,
            message: `Stok tidak mencukupi. Stok saat ini: ${currentStock}, diminta: ${qty}`,
            error: 'INSUFFICIENT_STOCK',
            current_stock: currentStock
          });
        }
      }

      const data = await StockMovementModel.create({
        store_id, variant_id, movement_type, qty,
        reference_type, reference_id, supplier_id, note, created_by
      });

      return res.status(201).json({
        success: true,
        message: 'Pergerakan stok berhasil dicatat, stok otomatis diperbarui',
        data
      });
    } catch (error) {
      console.error('StockMovementController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mencatat pergerakan stok', error: error.message });
    }
  }

};

module.exports = StockMovementController;
