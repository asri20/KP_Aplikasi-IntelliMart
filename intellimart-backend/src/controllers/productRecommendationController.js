const ProductRecommendationModel = require("../models/productRecommendationModel");

const ProductRecommendationController = {
  getUpselling: async (req, res) => {
    try {
      const variantId = Number(req.query.variant_id);
      const storeId = Number(req.query.store_id || 1);

      if (!Number.isInteger(variantId) || variantId <= 0) {
        return res.status(400).json({
          success: false,
          message: "variant_id harus berupa ID varian yang valid",
        });
      }

      if (!Number.isInteger(storeId) || storeId <= 0) {
        return res.status(400).json({
          success: false,
          message: "store_id tidak valid",
        });
      }

      const data = await ProductRecommendationModel.getUpselling(
        variantId,
        storeId,
      );

      return res.status(200).json({
        success: true,
        message: data.length
          ? "Rekomendasi upselling berhasil ditemukan"
          : "Belum ada varian upselling yang tersedia",
        data,
      });
    } catch (error) {
      console.error("Upselling error:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil rekomendasi upselling",
        error: error.message,
      });
    }
  },

  getCrossSelling: async (req, res) => {
    try {
      const limit = Number(req.query.limit || 10);

      if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: "limit harus berupa angka antara 1 sampai 50",
        });
      }

      const data = await ProductRecommendationModel.getCrossSelling(limit);

      return res.status(200).json({
        success: true,
        message: data.length
          ? "Rekomendasi cross-selling berhasil ditemukan"
          : "Belum ada pola pembelian bersama yang cukup",
        data,
      });
    } catch (error) {
      console.error("Cross-selling error:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil rekomendasi cross-selling",
        error: error.message,
      });
    }
  },
};

module.exports = ProductRecommendationController;
