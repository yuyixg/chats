import { Model, Sequelize } from 'sequelize';
import connection from '../connection';

const initChatModels = (sequelize: Sequelize) => {
  class ChatModels extends Model {}
  ChatModels.init({
    
  }, { sequelize, modelName: 'chat_models' });
};

export default initChatModels(connection);
