import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from '../src/config/load-env';

async function main() {
  loadRootEnv();
  const prisma = new PrismaClient();
  const count = await prisma.student.count();
  console.log('Total students:', count);

  const rafiqUser = await prisma.user.findUnique({
    where: { email: 'rafiq.hasan@university.edu' },
    include: { student: true },
  });
  console.log('Rafiq User:', rafiqUser);

  const searchRafiq = await prisma.student.findMany({
    where: {
      OR: [
        { studentNumber: { contains: '2024-360-117' } },
        { user: { fullName: { contains: 'Rafiq' } } },
      ],
    },
    include: { user: true },
  });
  console.log('Search matches:', searchRafiq.length, searchRafiq.map((s) => ({ id: s.id, num: s.studentNumber, name: s.user.fullName })));

  await prisma.$disconnect();
}

main().catch(console.error);
