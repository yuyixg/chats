import { Sequelize } from 'sequelize';

const { DB_DIALECT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } =
  process.env;
let connection: Sequelize;

if (DB_DIALECT === 'postgres') {
  connection = new Sequelize(DB_DATABASE!, DB_USERNAME!, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
  });
} else {
  connection = new Sequelize({
    dialect: 'sqlite',
    storage: 'database/chats.sqlite',
  });
}

export default connection;
