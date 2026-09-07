// models/toko.js
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: { // Diubah dari store_id ke id sesuai standar PK database Intellimart
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
    owner_id: { // Kolom wajib di tm_store sesuai dokumentasi
      type: DataTypes.INTEGER,
      allowNull: false
    },
    manager_id: { // Kolom manajer (opsional) di tm_store
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.TINYINT, // Menggunakan TINYINT (1/0) untuk MySQL
      defaultValue: 1
    }
  }, {
    tableName: 'tm_store', // Nama tabel fisik di MySQL[cite: 2]
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Store;
};