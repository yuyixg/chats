import { connection } from '.';
import fs from 'fs';

export async function initialBaseData() {
  const adminUser = {
    id: '6bcc0e1f-893b-4c5e-b48e-18066bd6db4a',
    username: 'admin',
    password: '$2a$10$fpbh5C//XcA7X7vp1Lk0G.kZrPiAb0YT8W9pI0NaLKzTyhfMv064K',
    role: 'admin',
  };
  const currentDate = new Date().toLocaleString();
  const user = await connection.query(
    `SELECT "id" FROM users WHERE "id" = '${adminUser.id}';`
  );
  if (user[0].length === 0) {
    await connection.query(
      `INSERT INTO users ("id", "password", "username", "role", "enabled", "createdAt", "updatedAt") VALUES ('${adminUser.id}', '${adminUser.password}', '${adminUser.username}', '${adminUser.role}', 't', '${currentDate}', '${currentDate}');`
    );
    await connection.query(
      `INSERT INTO user_models ("id", "userId", "models", "createdAt", "updatedAt") VALUES ('5a567a51-4332-48ab-b2ab-d684e5553faf', '${adminUser.id}', '[]', '${currentDate}', '${currentDate}');`
    );
  }
}

export async function initialProjectEnvironment() {
  const isExisted = await fs.existsSync('public/files');
  if (!isExisted) {
    await fs.mkdirSync('public/files');
  }
}
