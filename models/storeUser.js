// models/storeUser.js
module.exports = (sequelize, DataTypes) => {
  const StoreUser = sequelize.define('Tm_store_users', {
    store_user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    createdAt: 'joined_at',
    updatedAt: 'updated_at'
  });

  return StoreUser;
};