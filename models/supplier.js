// models/supplier.js
module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: { // Diubah dari supplier_id ke id sesuai standar PK database Intellimart
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact_person: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    lead_time_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    is_active: {
      type: DataTypes.TINYINT, // Menggunakan TINYINT (1/0) untuk MySQL
      defaultValue: 1
    }
  }, {
    tableName: 'tm_supplier', // Diubah dari 'tm_suppliers' ke 'tm_supplier' (kata benda tunggal)
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Supplier;
};