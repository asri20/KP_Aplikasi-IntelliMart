// models/role.js
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { // Diubah dari role_id ke id sesuai standar PK database Intellimart
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: DataTypes.TINYINT, // Menggunakan TINYINT (1/0) untuk MySQL
      defaultValue: 1
    }
  }, {
    tableName: 'tm_roles', // Nama tabel fisik di MySQL
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Role;
};