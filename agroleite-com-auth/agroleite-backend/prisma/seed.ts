import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const seedEnabled = process.env.ADMIN_SEED?.toLowerCase() === 'true';

  if (!seedEnabled) {
    console.log(
      'ℹ️ Admin seed desabilitado. Defina ADMIN_SEED=true, ADMIN_EMAIL e ADMIN_PASSWORD para criar um admin inicial.',
    );
    return;
  }

  if (!email || !password) {
    throw new Error(
      'ADMIN_SEED=true requer ADMIN_EMAIL e ADMIN_PASSWORD definidos explicitamente.',
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        password: hashedPassword,
        role: 'admin',
        farmName: 'AgroLeite Base',
      },
    });
    console.log(`✅ Usuário administrador criado: ${email}`);
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
