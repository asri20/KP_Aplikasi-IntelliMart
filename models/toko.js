// models/toko.js
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Tm_toko', {
    store_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    store_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: DataTypes.TEXT,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Store;
};