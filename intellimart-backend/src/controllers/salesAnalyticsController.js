const SalesAnalyticsModel = require("../models/salesAnalyticsModel");

const SalesAnalyticsController = {
  getCustomerAnalytics: async (req, res) => {
    try {
      const data = await SalesAnalyticsModel.getCustomerAnalytics();

      return res.status(200).json({
        success: true,
        message: "Analisis pelanggan berhasil diambil",
        data,
      });
    } catch (error) {
      console.error("Customer analytics error:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil analisis pelanggan",
        error: error.message,
      });
    }
  },

  getBestSellingProducts: async (req, res) => {
    try {
      const data = await SalesAnalyticsModel.getBestSellingProducts();

      return res.status(200).json({
        success: true,
        message: "Data produk terlaris berhasil diambil",
        data,
      });
    } catch (error) {
      console.error("Best selling products error:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data produk terlaris",
        error: error.message,
      });
    }
  },
};

module.exports = SalesAnalyticsController;
