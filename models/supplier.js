// models/supplier.js
module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    supplier_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact_person: DataTypes.STRING,
    phone:          DataTypes.STRING,
    email:          DataTypes.STRING,
    address:        DataTypes.TEXT,
    city:           DataTypes.STRING,
    lead_time_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    // FIX: tanpa tableName, Sequelize otomatis pluralize jadi "Tm_supplierss"
    tableName: 'tm_suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Supplier;
};
