// src/controllers/reportController.js
// Controller untuk modul Dashboard & Analitik (khusus laporan yang relevan ke Modul Produk & Stok)

const ReportModel = require('../models/reportModel');

const ReportController = {

  /**
   * GET /api/reports/product-catalog
   * GET /api/reports/product-catalog?store_id=1
   */
  productCatalog: async (req, res) => {
    try {
      const { store_id } = req.query;
      const data = await ReportModel.getProductCatalog(store_id);

      return res.status(200).json({
        success: true,
        message: 'Katalog produk berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ReportController.productCatalog error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil katalog produk', error: error.message });
    }
  },

  /**
   * GET /api/reports/low-stock
   * GET /api/reports/low-stock?store_name=Toko Testing Modul 1
   */
  lowStock: async (req, res) => {
    try {
      const { store_name } = req.query;
      const data = await ReportModel.getLowStockAlert(store_name);

      return res.status(200).json({
        success: true,
        message: 'Notifikasi stok minimum berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ReportController.lowStock error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi stok minimum', error: error.message });
    }
  },

  /**
   * GET /api/reports/sales-daily
   * GET /api/reports/sales-daily?store_id=1
   */
  salesDaily: async (req, res) => {
    try {
      const { store_id } = req.query;
      const data = await ReportModel.getSalesReportDaily(store_id);

      return res.status(200).json({
        success: true,
        message: 'Laporan penjualan harian berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ReportController.salesDaily error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil laporan penjualan harian', error: error.message });
    }
  },

  /**
   * GET /api/reports/best-selling
   * GET /api/reports/best-selling?store_id=1
   */
  bestSelling: async (req, res) => {
    try {
      const { store_id } = req.query;
      const data = await ReportModel.getBestSellingProducts(store_id);

      return res.status(200).json({
        success: true,
        message: 'Laporan produk terlaris berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ReportController.bestSelling error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil laporan produk terlaris', error: error.message });
    }
  },

  /**
   * GET /api/reports/customer-segment
   * GET /api/reports/customer-segment?customer_id=4
   */
  customerSegment: async (req, res) => {
    try {
      const { customer_id } = req.query;
      const data = await ReportModel.getCustomerLatestSegment(customer_id);

      return res.status(200).json({
        success: true,
        message: 'Segmen terbaru customer berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ReportController.customerSegment error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil segmen customer', error: error.message });
    }
  }

};

module.exports = ReportController;
