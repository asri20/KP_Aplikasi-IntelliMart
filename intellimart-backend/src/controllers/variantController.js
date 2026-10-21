
const VariantModel = require('../models/variantModel');
const ProductModel = require('../models/productModel');

const VariantController = {
  // GET /api/variants?product_id=5
  getAll: async (req, res) => {
    try {
      const ownerId = req.user.id;
      const { product_id } = req.query;

      // Validasi filter agar product_id tidak sembarang nilai.
      if (
        product_id !== undefined &&
        (!/^\d+$/.test(String(product_id)) || Number(product_id) < 1)
      ) {
        return res.status(400).json({
          success: false,
          message: 'product_id tidak valid'
        });
      }

      // Jika filter produk diberikan, pastikan produk dapat diakses.
      if (product_id !== undefined) {
        const product = await ProductModel.findById(product_id, ownerId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Produk tidak ditemukan'
          });
        }
      }

      const variants = await VariantModel.findAll(product_id);

      // Hanya tampilkan varian dari produk bawaan atau milik Owner ini.
      const accessibleVariants = variants.filter(
        (variant) =>
          variant.product_owner_id === null ||
          Number(variant.product_owner_id) === Number(ownerId)
      );

      return res.status(200).json({
        success: true,
        message: 'Data varian berhasil diambil',
        count: accessibleVariants.length,
        data: accessibleVariants
      });
    } catch (error) {
      console.error('VariantController.getAll error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data varian'
      });
    }
  },

  // GET /api/variants/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      if (!/^\d+$/.test(id) || Number(id) < 1) {
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

      const product = await ProductModel.findById(
        variant.product_id,
        ownerId
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data varian berhasil diambil',
        data: variant
      });
    } catch (error) {
      console.error('VariantController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data varian'
      });
    }
  },

  // POST /api/variants
  create: async (req, res) => {
    try {
      const ownerId = req.user.id;
      const {
        product_id,
        variant_name,
        sku,
        barcode,
        cost_price,
        weight,
        is_active
      } = req.body;

      if (
        product_id === undefined ||
        product_id === null ||
        !/^\d+$/.test(String(product_id)) ||
        Number(product_id) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'product_id wajib berupa ID produk yang valid'
        });
      }

      if (typeof variant_name !== 'string' || !variant_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'variant_name wajib diisi'
        });
      }

      if (typeof sku !== 'string' || !sku.trim()) {
        return res.status(400).json({
          success: false,
          message: 'sku wajib diisi'
        });
      }

      const product = await ProductModel.findById(product_id, ownerId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });
      }

      // Produk bawaan hanya dapat dilihat, bukan dimodifikasi.
      if (
        product.owner_id === null ||
        Number(product.owner_id) !== Number(ownerId)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Varian produk bawaan tidak dapat ditambahkan'
        });
      }

      const data = await VariantModel.create({
        product_id: Number(product_id),
        variant_name: variant_name.trim(),
        sku: sku.trim(),
        barcode,
        cost_price,
        weight,
        is_active
      });

      return res.status(201).json({
        success: true,
        message: 'Varian berhasil dibuat',
        data
      });
    } catch (error) {
      console.error('VariantController.create error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'SKU atau barcode sudah dipakai varian lain',
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal membuat varian'
      });
    }
  },

  // PUT /api/variants/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const {
        variant_name,
        sku,
        barcode,
        cost_price,
        weight,
        is_active
      } = req.body;

      if (!/^\d+$/.test(id) || Number(id) < 1) {
        return res.status(400).json({
          success: false,
          message: 'ID varian tidak valid'
        });
      }

      if (typeof variant_name !== 'string' || !variant_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'variant_name wajib diisi'
        });
      }

      if (typeof sku !== 'string' || !sku.trim()) {
        return res.status(400).json({
          success: false,
          message: 'sku wajib diisi'
        });
      }

      const existing = await VariantModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });
      }

      const product = await ProductModel.findById(
        existing.product_id,
        ownerId
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });
      }

      if (
        product.owner_id === null ||
        Number(product.owner_id) !== Number(ownerId)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Varian produk bawaan tidak dapat diubah'
        });
      }

      const data = await VariantModel.update(id, {
        variant_name: variant_name.trim(),
        sku: sku.trim(),
        barcode,
        cost_price,
        weight,
        is_active:
          is_active !== undefined ? is_active : existing.is_active
      });

      return res.status(200).json({
        success: true,
        message: 'Varian berhasil diperbarui',
        data
      });
    } catch (error) {
      console.error('VariantController.update error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'SKU atau barcode sudah dipakai varian lain',
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui varian'
      });
    }
  },

  // DELETE /api/variants/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      if (!/^\d+$/.test(id) || Number(id) < 1) {
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

      const product = await ProductModel.findById(
        existing.product_id,
        ownerId
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Varian tidak ditemukan'
        });
      }

      if (
        product.owner_id === null ||
        Number(product.owner_id) !== Number(ownerId)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Varian produk bawaan tidak dapat dihapus'
        });
      }

      const data = await VariantModel.delete(id);

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
      console.error('VariantController.delete error:', error);

      if (
        error.code === 'ER_ROW_IS_REFERENCED_2' ||
        error.code === 'ER_ROW_IS_REFERENCED'
      ) {
        return res.status(409).json({
          success: false,
          message:
            'Varian masih digunakan oleh data lain seperti stok atau transaksi, sehingga tidak dapat dihapus',
          error: 'ROW_IS_REFERENCED'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus varian'
      });
    }
  }
};

module.exports = VariantController;
