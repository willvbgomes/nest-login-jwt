import { PrismaClient } from '@prisma/client';
import { hash, genSalt } from 'bcryptjs';

const prisma = new PrismaClient();

const seed = async () => {
  const email = 'test@test.com';
  const password = '123123';

  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
