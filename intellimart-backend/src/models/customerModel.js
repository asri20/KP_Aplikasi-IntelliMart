const db = require("../config/db");

const CustomerModel = {
  /**
   * Mengambil pelanggan yang dapat dipilih pada halaman POS.
   *
   * RETAIL    -> akun Customer dengan profil RETAIL
   * WHOLESALE -> akun Customer dengan profil RESELLER
   *
   * customer_id yang dikembalikan adalah tm_users.id.
   */
  getPOSCustomers: async (saleType) => {
    const normalizedSaleType = String(saleType || "")
      .trim()
      .toUpperCase();

    if (!["RETAIL", "WHOLESALE"].includes(normalizedSaleType)) {
      throw new Error("Jenis transaksi pelanggan tidak valid.");
    }

    const customerType =
      normalizedSaleType === "RETAIL" ? "RETAIL" : "RESELLER";

    const [rows] = await db.query(
      `
      SELECT
        u.id AS customer_id,
        u.name AS customer_name,
        u.phone,
        cp.customer_type,
        cp.loyalty_level
      FROM tm_users u
      INNER JOIN tm_roles r
        ON r.id = u.role_id
      INNER JOIN tm_customer_profile cp
        ON cp.user_id = u.id
      WHERE LOWER(TRIM(r.role_name)) = 'customer'
        AND u.is_active = 1
        AND cp.customer_type = ?
      ORDER BY u.name ASC
      `,
      [customerType],
    );

    return rows;
  },
};

module.exports = CustomerModel;
