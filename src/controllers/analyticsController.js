const { Sales, SaleItems, ProductVariant, Product } = require('../models');
const { Sequelize } = require('sequelize');

exports.getTopProducts = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: "store_id diperlukan" });

    // Melakukan group berdasarkan produk untuk mencari yang paling laris
    const topProducts = await SaleItems.findAll({
      include: [
        {
          model: Sales,
          as: 'sale',
          where: { store_id },
          attributes: []
        },
        {
          model: ProductVariant,
          as: 'variant',
          attributes: ['variant_name', 'cost_price', 'selling_price'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['product_name']
          }]
        }
      ],
      attributes: [
        'variant_id',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity_sold'],
        [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'total_revenue']
      ],
      group: ['variant_id', 'variant.variant_id', 'variant->product.product_id'],
      order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
      limit: 5,
    });

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfitReport = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: "store_id diperlukan" });

    // Menarik seluruh item yang terjual pada toko tersebut
    // Keuntungan = Subtotal - (Modal/cost_price * jumlah barang terjual)
    const items = await SaleItems.findAll({
      include: [
        { model: Sales, as: 'sale', where: { store_id }, attributes: [] },
        { model: ProductVariant, as: 'variant', attributes: ['cost_price'] }
      ]
    });

    let totalRevenue = 0;
    let totalCost = 0;

    items.forEach(item => {
      totalRevenue += parseFloat(item.subtotal || 0);
      const costPrice = parseFloat(item.variant?.cost_price || 0);
      totalCost += (costPrice * item.quantity);
    });

    const totalProfit = totalRevenue - totalCost;

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_profit: totalProfit,
        profit_margin_percentage: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
