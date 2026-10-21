// src/controllers/productController.js

const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const BrandModel = require('../models/brandModel');
const UnitModel = require('../models/unitModel');

const ProductController = {

  // =====================================================
  // GET ALL PRODUCTS
  // =====================================================

  getAll: async (req, res) => {
    try {
      const ownerId = req.user.id;

      const {
        search,
        category,
        brand,
        page = 1,
        limit = 10,
        sort = 'product_id',
        order = 'ASC'
      } = req.query;

      const data = await ProductModel.findAll(
        ownerId,
        search,
        category,
        brand,
        parseInt(page),
        parseInt(limit),
        sort,
        order
      );

      return res.status(200).json({
        success: true,
        message: 'Data produk berhasil diambil',

        owner_id: ownerId,

        page: parseInt(page),
        limit: parseInt(limit),
        count: data.length,

        search: search || null,
        category: category || null,
        brand: brand || null,

        sort,
        order,

        data
      });

    } catch (error) {

      console.error(
        'ProductController.getAll error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk',
        error: error.message
      });
    }
  },


  // =====================================================
  // GET PRODUCT BY ID
  // =====================================================

  getById: async (req, res) => {
    try {

      const ownerId = req.user.id;
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID produk tidak valid'
        });
      }

      const data = await ProductModel.findById(
        id,
        ownerId
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${id} tidak ditemukan`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data produk berhasil diambil',
        data
      });

    } catch (error) {

      console.error(
        'ProductController.getById error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk',
        error: error.message
      });
    }
  },


  // =====================================================
  // CREATE PRODUCT
  // =====================================================

  create: async (req, res) => {
    try {

      const ownerId = req.user.id;

      const {
        product_name,
        description,
        category_id,
        brand_id,
        unit_id,
        is_active
      } = req.body;


      // Validasi nama produk
      if (
        !product_name ||
        product_name.trim() === ''
      ) {
        return res.status(400).json({
          success: false,
          message: 'Nama produk wajib diisi'
        });
      }


      // ===============================================
      // VALIDASI CATEGORY
      // Boleh:
      // - category milik Owner
      // - category bawaan owner_id NULL
      // ===============================================

      if (category_id) {

        const category =
          await CategoryModel.findById(category_id);

        if (!category) {
          return res.status(404).json({
            success: false,
            message:
              `Kategori dengan ID ${category_id} tidak ditemukan`
          });
        }

        if (
          category.owner_id !== null &&
          Number(category.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Kategori tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // VALIDASI BRAND
      // ===============================================

      if (brand_id) {

        const brand =
          await BrandModel.findById(brand_id);

        if (!brand) {
          return res.status(404).json({
            success: false,
            message:
              `Brand dengan ID ${brand_id} tidak ditemukan`
          });
        }

        if (
          brand.owner_id !== null &&
          Number(brand.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Brand tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // VALIDASI UNIT
      // ===============================================

      if (unit_id) {

        const unit =
          await UnitModel.findById(unit_id);

        if (!unit) {
          return res.status(404).json({
            success: false,
            message:
              `Satuan dengan ID ${unit_id} tidak ditemukan`
          });
        }

        if (
          unit.owner_id !== null &&
          Number(unit.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Satuan tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // CREATE
      // owner_id dari JWT
      // ===============================================

      const data = await ProductModel.create({

        owner_id: ownerId,

        product_name:
          product_name.trim(),

        description,

        category_id,

        brand_id,

        unit_id,

        is_active
      });


      return res.status(201).json({
        success: true,
        message: 'Produk berhasil dibuat',
        data
      });

    } catch (error) {

      console.error(
        'ProductController.create error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Gagal membuat produk',
        error: error.message
      });
    }
  },


  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  update: async (req, res) => {
    try {

      const ownerId = req.user.id;
      const { id } = req.params;

      const {
        product_name,
        description,
        category_id,
        brand_id,
        unit_id,
        is_active
      } = req.body;


      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID produk tidak valid'
        });
      }


      if (
        !product_name ||
        product_name.trim() === ''
      ) {
        return res.status(400).json({
          success: false,
          message: 'Nama produk wajib diisi'
        });
      }


      // Ambil produk milik Owner
      const existing =
        await ProductModel.findById(
          id,
          ownerId
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            `Produk dengan ID ${id} tidak ditemukan atau bukan milik Owner ini`
        });
      }


      // ===============================================
      // CATEGORY
      // ===============================================

      if (category_id) {

        const category =
          await CategoryModel.findById(category_id);

        if (!category) {
          return res.status(404).json({
            success: false,
            message:
              `Kategori dengan ID ${category_id} tidak ditemukan`
          });
        }

        if (
          category.owner_id !== null &&
          Number(category.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Kategori tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // BRAND
      // ===============================================

      if (brand_id) {

        const brand =
          await BrandModel.findById(brand_id);

        if (!brand) {
          return res.status(404).json({
            success: false,
            message:
              `Brand dengan ID ${brand_id} tidak ditemukan`
          });
        }

        if (
          brand.owner_id !== null &&
          Number(brand.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Brand tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // UNIT
      // ===============================================

      if (unit_id) {

        const unit =
          await UnitModel.findById(unit_id);

        if (!unit) {
          return res.status(404).json({
            success: false,
            message:
              `Satuan dengan ID ${unit_id} tidak ditemukan`
          });
        }

        if (
          unit.owner_id !== null &&
          Number(unit.owner_id) !== Number(ownerId)
        ) {
          return res.status(403).json({
            success: false,
            message:
              'Satuan tersebut bukan milik Owner ini'
          });
        }
      }


      // ===============================================
      // UPDATE
      // ===============================================

      const data =
        await ProductModel.update(
          id,
          ownerId,
          {
            product_name:
              product_name.trim(),

            description,

            category_id,

            brand_id,

            unit_id,

            is_active:
              is_active !== undefined
                ? is_active
                : existing.is_active
          }
        );


      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            'Produk tidak ditemukan atau bukan milik Owner ini'
        });
      }


      return res.status(200).json({
        success: true,
        message:
          'Produk berhasil diperbarui',
        data
      });

    } catch (error) {

      console.error(
        'ProductController.update error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Gagal memperbarui produk',
        error: error.message
      });
    }
  },


  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  delete: async (req, res) => {
    try {

      const ownerId = req.user.id;
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID produk tidak valid'
        });
      }


      const data =
        await ProductModel.delete(
          id,
          ownerId
        );


      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            `Produk dengan ID ${id} tidak ditemukan atau bukan milik Owner ini`
        });
      }


      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus',
        data
      });

    } catch (error) {

      console.error(
        'ProductController.delete error:',
        error
      );


      if (
        error.message.includes('memiliki') ||
        error.message.includes('digunakan')
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONSTRAINT_VIOLATION'
        });
      }


      return res.status(500).json({
        success: false,
        message:
          'Gagal menghapus produk',
        error: error.message
      });
    }
  }

};

module.exports = ProductController;