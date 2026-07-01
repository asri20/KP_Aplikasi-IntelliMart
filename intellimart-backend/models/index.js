const User = require('./user');
const Store = require('./store');
const UserStore = require('./userStore');
const ActivityLog = require('./activityLog');

User.belongsToMany(Store, {
  through: UserStore,
  foreignKey: 'user_id'
});

Store.belongsToMany(User, {
  through: UserStore,
  foreignKey: 'store_id'
});

User.hasMany(ActivityLog, {
  foreignKey: 'user_id'
});

ActivityLog.belongsTo(User, {
  foreignKey: 'user_id'
});

module.exports = {
  User,
  Store,
  UserStore,
  ActivityLog
};