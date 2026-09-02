const pool = require('../config/db');

async function getProductCatalog(store_id) {
  let query = 'SELECT * FROM vw_product_catalog';
  const params = [];

  if (store_id) {
    query += ' WHERE store_id = ?';
    params.push(store_id);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getLowStockAlert(store_name) {
  let query = 'SELECT * FROM vw_low_stock_alert';
  const params = [];

  if (store_name) {
    query += ' WHERE store_name = ?';
    params.push(store_name);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getSalesReportDaily(store_id) {
  let query = 'SELECT * FROM vw_sales_report_daily';
  const params = [];

  if (store_id) {
    query += ' WHERE store_id = ?';
    params.push(store_id);
  }

  query += ' ORDER BY sales_date DESC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getBestSellingProducts(store_id) {
  let query = 'SELECT * FROM vw_best_selling_products';
  const params = [];

  if (store_id) {
    query += ' WHERE store_id = ?';
    params.push(store_id);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getCustomerLatestSegment(customer_id) {
  let query = 'SELECT * FROM vw_customer_latest_segment';
  const params = [];

  if (customer_id) {
    query += ' WHERE customer_id = ?';
    params.push(customer_id);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

module.exports = {
  getProductCatalog,
  getLowStockAlert,
  getSalesReportDaily,
  getBestSellingProducts,
  getCustomerLatestSegment
};
