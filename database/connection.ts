import { Sequelize } from 'sequelize';

const connection = new Sequelize('wxpay', 'root', 'Passw0rd!', {
  host: 'localhost',
  dialect: 'postgres',
});

export default connection;
