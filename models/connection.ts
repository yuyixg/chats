import { Sequelize } from 'sequelize';

const connection = new Sequelize('Chats', 'postgres', 'Passw0rd!', {
  host: 'localhost',
  dialect: 'postgres',
});

export default connection;
