import { connection } from '.';
import { initialBaseData, initialProjectEnvironment } from './init';

(async () => {
  try {
    await connection.authenticate();
    await connection.sync({ force: true, logging: true });
    await initialBaseData();
    console.log('Database synchronized successfully.');
    await initialProjectEnvironment();
    console.log('Project environment successfully.');
  } catch (error) {
    console.error('Initialization Error:', error);
    process.exit();
  }
})();
