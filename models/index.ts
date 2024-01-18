import ChatModels from './models';
import ChatMessages from './messages';
import Users from './users';
import connection from './connection';

Users.hasMany(ChatMessages, {
  foreignKey: 'userId',
  as: 'messages',
});

ChatMessages.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'user',
});

ChatModels.hasMany(ChatMessages, {
  foreignKey: 'modelId',
  as: 'messages',
});

ChatMessages.belongsTo(ChatModels, {
  foreignKey: 'modelId',
  as: 'models',
});

export { connection, ChatModels, ChatMessages, Users };
