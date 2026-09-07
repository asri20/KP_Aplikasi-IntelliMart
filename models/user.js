// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { // Diubah dari user_id ke id sesuai konvensi standar PK database
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: DataTypes.STRING,
    is_active: {
      type: DataTypes.TINYINT, // Menggunakan TINYINT (1/0) untuk MySQL
      defaultValue: 1
    }
  }, {
    tableName: 'tm_users', // Menegaskan nama tabel fisik di MySQL (case-sensitive di Linux)
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};