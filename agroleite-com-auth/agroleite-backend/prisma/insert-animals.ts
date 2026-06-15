import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const breeds = ['Holandesa', 'Jersey', 'Gir Leiteiro', 'Girolando', 'Pardo Suíço'];
const categories = ['cow', 'heifer'];
const statuses = ['lactation', 'dry', 'pregnant', 'sick', 'pre-calving'];

async function main() {
  const email = 'admin@agroleite.com';
  
  const admin = await prisma.user.findUnique({
    where: { email },
  });

  if (!admin) {
    console.error(`❌ Usuário ${email} não encontrado.`);
    process.exit(1);
  }

  console.log(`🔍 Usuário encontrado: ${admin.name} (ID: ${admin.id})`);
  console.log('⏳ Cadastrando 100 animais...');

  const animalsData = [];
  for (let i = 1; i <= 100; i++) {
    const breed = breeds[Math.floor(Math.random() * breeds.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tag = `TAG-${String(i).padStart(3, '0')}`;
    const name = `Mimosa ${String(i).padStart(3, '0')}`;
    
    // Configura datas de forma realista dependendo do status
    let expectedCalving: Date | null = null;
    let lastCalving: Date | null = null;
    let dryingDate: Date | null = null;

    if (status === 'pregnant' || status === 'pre-calving') {
      expectedCalving = new Date(Date.now() + (10 + Math.random() * 80) * 24 * 60 * 60 * 1000); // 10 a 90 dias no futuro
    }
    if (status === 'lactation') {
      lastCalving = new Date(Date.now() - (30 + Math.random() * 120) * 24 * 60 * 60 * 1000); // 30 a 150 dias no passado
    }
    if (status === 'dry') {
      dryingDate = new Date(Date.now() - (5 + Math.random() * 30) * 24 * 60 * 60 * 1000); // 5 a 35 dias no passado
    }

    animalsData.push({
      userId: admin.id,
      name,
      tag,
      breed,
      category,
      status,
      dailyTarget: Math.round((15 + Math.random() * 25) * 10) / 10,
      weight: Math.round((450 + Math.random() * 200) * 10) / 10,
      ecc: Math.round((2.5 + Math.random() * 2) * 10) / 10,
      birthDate: new Date(Date.now() - (3 + Math.random() * 5) * 365 * 24 * 60 * 60 * 1000),
      expectedCalving,
      lastCalving,
      dryingDate,
    });
  }

  // Deleta animais de teste anteriores com tags do mesmo formato
  const deleted = await prisma.animal.deleteMany({
    where: {
      userId: admin.id,
      tag: {
        startsWith: 'TAG-',
      },
    },
  });
  console.log(`🧹 Removidos ${deleted.count} animais antigos com tag TAG-*.`);

  const created = await prisma.animal.createMany({
    data: animalsData,
  });

  console.log(`✅ Cadastrados com sucesso ${created.count} novos animais com chaves compatíveis!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao cadastrar animais:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
