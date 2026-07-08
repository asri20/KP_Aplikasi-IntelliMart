// src/controllers/variantController.js

const VariantModel = require('../models/variantModel');
const ProductModel = require('../models/productModel');

const VariantController = {

  /**
   * =====================================================
   * GET ALL VARIANTS
   * =====================================================
   */
  getAll: async (req, res) => {
    try {

      const data = await VariantModel.findAll();

      return res.status(200).json({
        success: true,
        message: 'Data varian berhasil diambil',
        total: data.length,
        data
      });

    } catch (error) {

      console.error('VariantController.getAll:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data varian',
        error: error.message
      });

    }
  },

  /**
   * =====================================================
   * GET VARIANT BY ID
   * =====================================================
   */
  getById: async (req, res) => {

    try {

      const { id } = req.params;

      if (isNaN(id)) {

        return res.status(400).json({
          success: false,
          message: 'ID varian tidak valid'
        });

      }

      const variant = await VariantModel.findById(id);

      if (!variant) {

        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });

      }

      return res.status(200).json({
        success: true,
        data: variant
      });

    } catch (error) {

      console.error('VariantController.getById:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data varian',
        error: error.message
      });

    }

  },

  /**
   * =====================================================
   * CREATE VARIANT
   * =====================================================
   */
  create: async (req, res) => {

    try {

      const {

        product_id,
        sku,
        barcode,
        variant_name,
        cost_price,
        selling_price,
        weight,
        is_active

      } = req.body;

      // =============================
      // VALIDASI
      // =============================

      if (!product_id) {

        return res.status(400).json({
          success: false,
          message: 'product_id wajib diisi'
        });

      }

      if (!sku || sku.trim() === '') {

        return res.status(400).json({
          success: false,
          message: 'SKU wajib diisi'
        });

      }

      if (!variant_name || variant_name.trim() === '') {

        return res.status(400).json({
          success: false,
          message: 'Nama varian wajib diisi'
        });

      }

      if (Number(cost_price) < 0) {

        return res.status(400).json({
          success: false,
          message: 'Harga modal tidak boleh negatif'
        });

      }

      if (Number(selling_price) < 0) {

        return res.status(400).json({
          success: false,
          message: 'Harga jual tidak boleh negatif'
        });

      }

      // =============================
      // CEK PRODUCT
      // =============================

      const product = await ProductModel.findById(product_id);

      if (!product) {

        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });

      }

      // =============================
      // CEK SKU
      // =============================

      const skuExist = await VariantModel.findBySku(sku);

      if (skuExist) {

        return res.status(409).json({
          success: false,
          message: 'SKU sudah digunakan'
        });

      }

      // =============================
      // CEK BARCODE
      // =============================

      if (barcode) {

        const barcodeExist =
          await VariantModel.findByBarcode(barcode);

        if (barcodeExist) {

          return res.status(409).json({
            success: false,
            message: 'Barcode sudah digunakan'
          });

        }

      }

      // =============================
      // INSERT
      // =============================

      const data = await VariantModel.create({

        product_id,

        sku: sku.trim(),

        barcode:
          barcode && barcode.trim() !== ''
            ? barcode.trim()
            : null,

        variant_name: variant_name.trim(),

        cost_price,

        selling_price,

        weight,

        is_active:
          is_active !== undefined
            ? is_active
            : true

      });

      return res.status(201).json({

        success: true,

        message: 'Varian berhasil ditambahkan',

        data

      });

    } catch (error) {

      console.error('VariantController.create:', error);

      return res.status(500).json({

        success: false,

        message: 'Gagal membuat varian',

        error: error.message

      });

    }

  },
    /**
   * =====================================================
   * UPDATE VARIANT
   * =====================================================
   */
  update: async (req, res) => {

    try {

      const { id } = req.params;

      if (isNaN(id)) {

        return res.status(400).json({
          success: false,
          message: 'ID varian tidak valid'
        });

      }

      const existing = await VariantModel.findById(id);

      if (!existing) {

        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });

      }

      const {

        product_id,
        sku,
        barcode,
        variant_name,
        cost_price,
        selling_price,
        weight,
        is_active

      } = req.body;

      // =============================
      // VALIDASI PRODUCT
      // =============================

      if (product_id) {

        const product =
          await ProductModel.findById(product_id);

        if (!product) {

          return res.status(404).json({
            success: false,
            message: 'Produk tidak ditemukan'
          });

        }

      }

      // =============================
      // VALIDASI SKU
      // =============================

      if (sku) {

        const skuExist =
          await VariantModel.findBySku(sku, id);

        if (skuExist) {

          return res.status(409).json({
            success: false,
            message: 'SKU sudah digunakan'
          });

        }

      }

      // =============================
      // VALIDASI BARCODE
      // =============================

      if (barcode) {

        const barcodeExist =
          await VariantModel.findByBarcode(barcode, id);

        if (barcodeExist) {

          return res.status(409).json({
            success: false,
            message: 'Barcode sudah digunakan'
          });

        }

      }

      // =============================
      // UPDATE
      // =============================

      const data = await VariantModel.update(id, {

        product_id:
          product_id ?? existing.product_id,

        sku:
          sku
            ? sku.trim()
            : existing.sku,

        barcode:
          barcode !== undefined
            ? (barcode === '' ? null : barcode.trim())
            : existing.barcode,

        variant_name:
          variant_name
            ? variant_name.trim()
            : existing.variant_name,

        cost_price:
          cost_price ?? existing.cost_price,

        selling_price:
          selling_price ?? existing.selling_price,

        weight:
          weight ?? existing.weight,

        is_active:
          is_active !== undefined
            ? is_active
            : existing.is_active

      });

      return res.status(200).json({

        success: true,

        message: 'Varian berhasil diperbarui',

        data

      });

    } catch (error) {

      console.error('VariantController.update:', error);

      return res.status(500).json({

        success: false,

        message: 'Gagal memperbarui varian',

        error: error.message

      });

    }

  },



  /**
   * =====================================================
   * DELETE VARIANT
   * =====================================================
   */
  delete: async (req, res) => {

    try {

      const { id } = req.params;

      if (isNaN(id)) {

        return res.status(400).json({

          success: false,

          message: 'ID varian tidak valid'

        });

      }

      const data =
        await VariantModel.delete(id);

      if (!data) {

        return res.status(404).json({

          success: false,

          message: 'Varian tidak ditemukan'

        });

      }

      return res.status(200).json({

        success: true,

        message: 'Varian berhasil dihapus',

        data

      });

    } catch (error) {

      console.error('VariantController.delete:', error);

      if (
        error.message.includes('foreign key') ||
        error.message.includes('constraint')
      ) {

        return res.status(409).json({

          success: false,

          message:
            'Varian tidak dapat dihapus karena masih digunakan.',

          error: 'CONSTRAINT_VIOLATION'

        });

      }

      return res.status(500).json({

        success: false,

        message: 'Gagal menghapus varian',

        error: error.message

      });

    }

  }

};

module.exports = VariantController;