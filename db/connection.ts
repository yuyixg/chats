import { Sequelize } from 'sequelize';

const { DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } =
  process.env;

const connection = new Sequelize(DB_DATABASE!, DB_USERNAME!, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
});

export default connection;
