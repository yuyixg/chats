import ChatModels from './models';
import ChatMessages from './messages';
import Users from './users';
import connection from './connection';
import UserModels from './userModels';

Users.hasMany(ChatMessages, {
  foreignKey: 'userId',
});

ChatMessages.belongsTo(Users, {
  foreignKey: 'userId',
});

ChatModels.hasMany(ChatMessages, {
  foreignKey: 'modelId',
});

ChatMessages.belongsTo(ChatModels, {
  foreignKey: 'modelId',
});

Users.hasMany(UserModels, {
  foreignKey: 'userId',
});

UserModels.belongsTo(Users, {
  foreignKey: 'userId',
});

export { connection, ChatModels, ChatMessages, Users, UserModels };
