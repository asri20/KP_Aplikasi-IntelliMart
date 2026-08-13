const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tm_roles`
 * Menyimpan data peran/role pengguna.
 */
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'tm_roles',
  timestamps: false
});

module.exports = Role;
