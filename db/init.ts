import prisma from './prisma';

async function main() {
  const adminUser = await prisma.users.findFirst({
    where: { username: 'admin' },
  });
  if (!adminUser) {
    const user = await prisma.users.create({
      data: {
        username: 'admin',
        account: 'admin',
        password:
          '$2a$10$fpbh5C//XcA7X7vp1Lk0G.kZrPiAb0YT8W9pI0NaLKzTyhfMv064K',
        role: 'admin',
      },
    });

    const { id: userId } = user;
    await prisma.userBalances.create({
      data: { userId },
    });

    await prisma.userModels.create({
      data: { userId },
    });
    console.log('Initialize db data completed');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
