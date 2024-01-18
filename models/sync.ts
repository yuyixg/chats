import { connection } from '.';

(async () => {
  try {
    await connection.authenticate();
    await connection.sync({ force: false });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error occurred while synchronizing the database:', error);
    process.exit();
  }
})();
