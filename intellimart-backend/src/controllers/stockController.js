// src/controllers/stockController.js

const db = require("../config/db");

const StoreModel = require("../models/storeModel");
const VariantModel = require("../models/variantModel");
const StockBalanceModel = require("../models/stockBalanceModel");
const StockMovementModel = require("../models/stockMovementModel");

const StockController = {

  /**
   * =====================================================
   * STOCK IN
   * =====================================================
   */
  stockIn: async (req, res) => {

    const client = await db.getClient();

    try {

      const {
        store_id,
        variant_id,
        quantity,
        notes,
        reference_type,
        reference_id,
        created_by
      } = req.body;

      // ===========================
      // VALIDASI
      // ===========================

      if (!store_id || !variant_id || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "store_id, variant_id dan quantity wajib diisi."
        });
      }

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity harus lebih besar dari 0."
        });
      }

      // cek toko

      const store = await StoreModel.findById(store_id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Toko tidak ditemukan."
        });
      }

      // cek varian

      const variant = await VariantModel.findById(variant_id);

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant tidak ditemukan."
        });
      }

      // ===========================
      // TRANSAKSI
      // ===========================

      await client.query("BEGIN");

      let balance =
        await StockBalanceModel.findByStoreVariant(
          client,
          store_id,
          variant_id
        );

      if (!balance) {

        balance =
          await StockBalanceModel.createBalance(
            client,
            store_id,
            variant_id,
            0,
            0
          );

      }

      const currentQty =
        Number(balance.quantity_available);

      const newQty =
        currentQty + Number(quantity);

      await StockBalanceModel.updateBalance(
        client,
        store_id,
        variant_id,
        newQty
      );

      await StockMovementModel.createMovement(client, {

        store_id,

        variant_id,

        movement_type: "in",

        quantity,

        reference_type,

        reference_id,

        notes,

        created_by

      });

      await client.query("COMMIT");

      return res.status(200).json({

        success: true,

        message: "Stock In berhasil.",

        data: {

          store_id,

          store_name: store.store_name,

          variant_id,

          variant_name: variant.variant_name,

          quantity,

          stock_before: currentQty,

          stock_after: newQty

        }

      });

    }
    catch (err) {

      await client.query("ROLLBACK");

      console.error(err);

      return res.status(500).json({

        success: false,

        message: err.message

      });

    }
    finally {

      client.release();

    }

  },



  /**
   * =====================================================
   * STOCK OUT
   * =====================================================
   */
  stockOut: async (req, res) => {

    const client = await db.getClient();

    try {

      const {

        store_id,

        variant_id,

        quantity,

        notes,

        reference_type,

        reference_id,

        created_by

      } = req.body;

      // ===========================
      // VALIDASI
      // ===========================

      if (!store_id || !variant_id || quantity === undefined) {

        return res.status(400).json({

          success: false,

          message: "store_id, variant_id dan quantity wajib diisi."

        });

      }

      if (Number(quantity) <= 0) {

        return res.status(400).json({

          success: false,

          message: "Quantity harus lebih besar dari 0."

        });

      }

      // cek toko

      const store = await StoreModel.findById(store_id);

      if (!store) {

        return res.status(404).json({

          success: false,

          message: "Toko tidak ditemukan."

        });

      }

      // cek varian

      const variant = await VariantModel.findById(variant_id);

      if (!variant) {

        return res.status(404).json({

          success: false,

          message: "Variant tidak ditemukan."

        });

      }

      await client.query("BEGIN");

      const balance =
        await StockBalanceModel.findByStoreVariant(
          client,
          store_id,
          variant_id
        );

      if (!balance) {

        throw new Error("Data stok belum tersedia.");

      }

      const currentQty =
        Number(balance.quantity_available);

      if (currentQty < Number(quantity)) {

        throw new Error("Stok tidak mencukupi.");

      }

      const newQty =
        currentQty - Number(quantity);

      await StockBalanceModel.updateBalance(

        client,

        store_id,

        variant_id,

        newQty

      );

      await StockMovementModel.createMovement(client, {

        store_id,

        variant_id,

        movement_type: "out",

        quantity,

        reference_type,

        reference_id,

        notes,

        created_by

      });

      await client.query("COMMIT");

      return res.status(200).json({

        success: true,

        message: "Stock Out berhasil.",

        data: {

          store_id,

          store_name: store.store_name,

          variant_id,

          variant_name: variant.variant_name,

          quantity,

          stock_before: currentQty,

          stock_after: newQty

        }

      });

    }
    catch (err) {

      await client.query("ROLLBACK");

      console.error(err);

      return res.status(500).json({

        success: false,

        message: err.message

      });

    }
    finally {

      client.release();

    }

  },
    /**
   * =====================================================
   * LIST SEMUA STOCK
   * =====================================================
   */
  getAllStock: async (req, res) => {

    try {

      const data =
        await StockBalanceModel.findAll();

      return res.status(200).json({

        success: true,

        total: data.length,

        data

      });

    }
    catch (err) {

      console.error(err);

      return res.status(500).json({

        success: false,

        message: err.message

      });

    }

  },



  /**
   * =====================================================
   * HISTORY STOCK MOVEMENT
   * =====================================================
   */
  getMovementHistory: async (req, res) => {

    try {

      const {

        store_id,

        variant_id

      } = req.query;

      let data;

      if (store_id && variant_id) {

        data =
          await StockMovementModel.findByStoreVariant(
            store_id,
            variant_id
          );

      }
      else if (store_id) {

        data =
          await StockMovementModel.findByStore(
            store_id
          );

      }
      else if (variant_id) {

        data =
          await StockMovementModel.findByVariant(
            variant_id
          );

      }
      else {

        data =
          await StockMovementModel.findAll();

      }

      return res.status(200).json({

        success: true,

        total: data.length,

        data

      });

    }
    catch (err) {

      console.error(err);

      return res.status(500).json({

        success: false,

        message: err.message

      });

    }

  },



  /**
   * =====================================================
   * LOW STOCK
   * =====================================================
   */
  getLowStock: async (req, res) => {

    try {

      const stocks =
        await StockBalanceModel.findAll();

      const lowStocks =
        stocks.filter(item =>
          Number(item.quantity_available) <=
          Number(item.min_stock)
        );

      return res.status(200).json({

        success: true,

        total: lowStocks.length,

        data: lowStocks

      });

    }
    catch (err) {

      console.error(err);

      return res.status(500).json({

        success: false,

        message: err.message

      });

    }

  }

};

module.exports = StockController;