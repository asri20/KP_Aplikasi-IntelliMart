const DashboardModel = require("../models/dashboardModel");

function getFilters(req, res) {
  const storeId = req.query.store_id ? Number(req.query.store_id) : null;

  if (storeId !== null && (!Number.isInteger(storeId) || storeId <= 0)) {
    res.status(400).json({
      success: false,
      message: "store_id harus berupa bilangan bulat positif.",
    });
    return null;
  }

  const { from_date, to_date } = req.query;

  const validDate = (value) =>
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value);

  if (!validDate(from_date) || !validDate(to_date)) {
    res.status(400).json({
      success: false,
      message: "Format tanggal harus YYYY-MM-DD.",
    });
    return null;
  }

  if (from_date && to_date && from_date > to_date) {
    res.status(400).json({
      success: false,
      message: "from_date tidak boleh melebihi to_date.",
    });
    return null;
  }

  return { storeId, fromDate: from_date, toDate: to_date };
}

function handleError(res, error, label) {
  console.error(`${label}:`, error);

  return res.status(500).json({
    success: false,
    message: `Gagal mengambil ${label}.`,
  });
}

const DashboardController = {
  getSummary: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const data = await DashboardModel.getSummary(filters.storeId);

      return res.status(200).json({
        success: true,
        message: "Ringkasan dashboard berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "ringkasan dashboard");
    }
  },

  getSalesTrend: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const data = await DashboardModel.getSalesTrend(
        filters.storeId,
        filters.fromDate,
        filters.toDate,
      );

      return res.status(200).json({
        success: true,
        message: "Tren penjualan berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "tren penjualan");
    }
  },

  getTopProducts: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const limit = Number(req.query.limit || 10);

      if (!Number.isInteger(limit) || limit <= 0) {
        return res.status(400).json({
          success: false,
          message: "limit harus berupa bilangan bulat positif.",
        });
      }

      const data = await DashboardModel.getTopProducts(filters.storeId, limit);

      return res.status(200).json({
        success: true,
        message: "Produk terlaris berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "produk terlaris");
    }
  },

  getLowStock: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const data = await DashboardModel.getLowStock(filters.storeId);

      return res.status(200).json({
        success: true,
        message: "Peringatan stok berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "peringatan stok");
    }
  },

  getRecentTransactions: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const limit = Number(req.query.limit || 10);

      if (!Number.isInteger(limit) || limit <= 0) {
        return res.status(400).json({
          success: false,
          message: "limit harus berupa bilangan bulat positif.",
        });
      }

      const data = await DashboardModel.getRecentTransactions(
        filters.storeId,
        limit,
      );

      return res.status(200).json({
        success: true,
        message: "Transaksi terbaru berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "transaksi terbaru");
    }
  },

  getProfitReport: async (req, res) => {
    try {
      const filters = getFilters(req, res);
      if (!filters) return;

      const data = await DashboardModel.getProfitReport(
        filters.storeId,
        filters.fromDate,
        filters.toDate,
      );

      return res.status(200).json({
        success: true,
        message: "Laporan keuntungan berhasil diambil.",
        data,
      });
    } catch (error) {
      return handleError(res, error, "laporan keuntungan");
    }
  },
};

module.exports = DashboardController;
