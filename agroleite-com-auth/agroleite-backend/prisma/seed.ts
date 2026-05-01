import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@agroleite.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        password: hashedPassword,
        role: 'admin',
        farmName: 'AgroLeite Base',
      },
    });
    console.log('✅ Usuário administrador criado: admin@agroleite.com / admin123');
  } else {
    console.log('✅ Usuário administrador já existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
