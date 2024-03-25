import { UserModels, Users } from '.';

export default async function InitDbData() {
  const adminUser = {
    id: '6bcc0e1f-893b-4c5e-b48e-18066bd6db4a',
    username: 'admin',
    password: '$2a$10$fpbh5C//XcA7X7vp1Lk0G.kZrPiAb0YT8W9pI0NaLKzTyhfMv064K',
    role: 'admin',
  };
  await Users.findOrCreate({
    where: { id: adminUser.id },
    defaults: adminUser,
  });
  await UserModels.findCreateFind({
    where: { userId: adminUser.id },
    defaults: {
      userId: adminUser.id,
      models: [],
    },
  });
}
