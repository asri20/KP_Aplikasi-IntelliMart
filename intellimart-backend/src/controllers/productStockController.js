// src/controllers/productStockController.js
// Controller untuk modul Stok & Harga per Toko

const ProductStockModel = require('../models/productStockModel');
const StoreModel = require('../models/storeModel');
const VariantModel = require('../models/variantModel');
const PriceCodeModel = require('../models/priceCodeModel');

const ProductStockController = {

  /**
   * GET /api/product-stock
   * GET /api/product-stock?store_id=1
   * GET /api/product-stock?variant_id=1
   */
  getAll: async (req, res) => {
    try {
      const { store_id, variant_id } = req.query;
      const data = await ProductStockModel.findAll(store_id, variant_id);

      return res.status(200).json({
        success: true,
        message: 'Data stok & harga berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ProductStockController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data stok & harga', error: error.message });
    }
  },

  /**
   * GET /api/product-stock/:store_id/:variant_id
   */
  getOne: async (req, res) => {
    try {
      const { store_id, variant_id } = req.params;

      const data = await ProductStockModel.findOne(store_id, variant_id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Belum ada data stok/harga untuk toko ${store_id} & varian ${variant_id}`
        });
      }

      return res.status(200).json({ success: true, message: 'Data stok & harga berhasil diambil', data });
    } catch (error) {
      console.error('ProductStockController.getOne error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data stok & harga', error: error.message });
    }
  },

  /**
   * POST /api/product-stock
   * Buat harga/pengaturan awal untuk kombinasi toko+varian.
   * stock SELALU mulai dari 0 (pakai endpoint stock-movement utk isi stok awal).
   */
  create: async (req, res) => {
    try {
      const { store_id, variant_id, base_price, price_code_id, discount_store, min_stock } = req.body;

      if (!store_id) {
        return res.status(400).json({ success: false, message: 'store_id wajib diisi' });
      }
      if (!variant_id) {
        return res.status(400).json({ success: false, message: 'variant_id wajib diisi' });
      }
      if (base_price === undefined || base_price === null || isNaN(base_price) || Number(base_price) < 0) {
        return res.status(400).json({ success: false, message: 'base_price wajib diisi dan tidak boleh negatif' });
      }
      if ('stock' in req.body) {
        return res.status(400).json({
          success: false,
          message: 'stock tidak boleh diisi lewat endpoint ini. Gunakan POST /api/stock-movements untuk stok awal.',
          error: 'STOCK_DIRECT_UPDATE_FORBIDDEN'
        });
      }

      const store = await StoreModel.findById(store_id);
      if (!store) {
        return res.status(404).json({ success: false, message: `Toko dengan ID ${store_id} tidak ditemukan` });
      }

      const variant = await VariantModel.findById(variant_id);
      if (!variant) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${variant_id} tidak ditemukan` });
      }

      if (price_code_id) {
        const priceCode = await PriceCodeModel.findById(price_code_id);
        if (!priceCode) {
          return res.status(404).json({ success: false, message: `Kode harga dengan ID ${price_code_id} tidak ditemukan` });
        }
      }

      const existing = await ProductStockModel.findOne(store_id, variant_id);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Data stok/harga untuk toko ${store_id} & varian ${variant_id} sudah ada, gunakan PUT untuk update`,
          error: 'ALREADY_EXISTS'
        });
      }

      const data = await ProductStockModel.create({ store_id, variant_id, base_price, price_code_id, discount_store, min_stock });
      return res.status(201).json({ success: true, message: 'Harga & pengaturan stok berhasil dibuat', data });
    } catch (error) {
      console.error('ProductStockController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat data stok & harga', error: error.message });
    }
  },

  /**
   * PUT /api/product-stock/:store_id/:variant_id
   * HANYA update base_price, price_code_id, discount_store, min_stock. TIDAK bisa ubah stock.
   *
   * PARTIAL UPDATE: field yang tidak dikirim di body akan TETAP memakai nilai lama
   * (tidak ditimpa jadi null/0). Kalau mau benar-benar mengosongkan price_code_id,
   * kirim eksplisit "price_code_id": null di body.
   */
  update: async (req, res) => {
    try {
      const { store_id, variant_id } = req.params;
      const { base_price, price_code_id, discount_store, min_stock } = req.body;

      if ('stock' in req.body) {
        return res.status(400).json({
          success: false,
          message: 'stock tidak boleh diubah lewat endpoint ini. Gunakan POST /api/stock-movements untuk mengubah stok.',
          error: 'STOCK_DIRECT_UPDATE_FORBIDDEN'
        });
      }

      const existing = await ProductStockModel.findOne(store_id, variant_id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Belum ada data stok/harga untuk toko ${store_id} & varian ${variant_id}, gunakan POST untuk membuat`
        });
      }

      // Merge: pakai nilai baru kalau dikirim, kalau tidak pertahankan nilai lama
      const finalBasePrice = base_price !== undefined ? base_price : existing.base_price;
      const finalPriceCodeId = price_code_id !== undefined ? price_code_id : existing.price_code_id;
      const finalDiscountStore = discount_store !== undefined ? discount_store : existing.discount_store;
      const finalMinStock = min_stock !== undefined ? min_stock : existing.min_stock;

      if (finalBasePrice === undefined || finalBasePrice === null || isNaN(finalBasePrice) || Number(finalBasePrice) < 0) {
        return res.status(400).json({ success: false, message: 'base_price wajib diisi dan tidak boleh negatif' });
      }

      if (finalPriceCodeId) {
        const priceCode = await PriceCodeModel.findById(finalPriceCodeId);
        if (!priceCode) {
          return res.status(404).json({ success: false, message: `Kode harga dengan ID ${finalPriceCodeId} tidak ditemukan` });
        }
      }

      const data = await ProductStockModel.update(store_id, variant_id, {
        base_price: finalBasePrice,
        price_code_id: finalPriceCodeId,
        discount_store: finalDiscountStore,
        min_stock: finalMinStock
      });
      return res.status(200).json({ success: true, message: 'Harga & pengaturan stok berhasil diperbarui', data });
    } catch (error) {
      console.error('ProductStockController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui data stok & harga', error: error.message });
    }
  },

  /**
   * DELETE /api/product-stock/:store_id/:variant_id
   */
  delete: async (req, res) => {
    try {
      const { store_id, variant_id } = req.params;

      const data = await ProductStockModel.delete(store_id, variant_id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Belum ada data stok/harga untuk toko ${store_id} & varian ${variant_id}`
        });
      }

      return res.status(200).json({ success: true, message: 'Data stok & harga berhasil dihapus', data });
    } catch (error) {
      console.error('ProductStockController.delete error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus data stok & harga', error: error.message });
    }
  }

};

module.exports = ProductStockController;