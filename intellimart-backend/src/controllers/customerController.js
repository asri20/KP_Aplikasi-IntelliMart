const CustomerModel = require("../models/customerModel");

exports.getPOSCustomers = async (req, res) => {
  try {
    const { sale_type } = req.query;

    if (!sale_type) {
      return res.status(400).json({
        success: false,
        message: "Parameter sale_type wajib diisi.",
      });
    }

    const customers = await CustomerModel.getPOSCustomers(sale_type);

    return res.status(200).json({
      success: true,
      message: "Daftar pelanggan berhasil dimuat.",
      data: customers,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
