import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@ahp.com' },
    update: {},
    create: {
      email: 'demo@ahp.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  // Create demo project
  const project = await prisma.project.create({
    data: {
      title: 'Laptop Selection',
      description: 'Choose the best laptop for software development',
      goal: 'Select the optimal laptop considering performance, price, and portability',
      userId: user.id,
    },
  });

  // Create criteria
  const performanceCriterion = await prisma.criterion.create({
    data: {
      name: 'Performance',
      description: 'Processing power and speed',
      order: 1,
      level: 1,
      projectId: project.id,
    },
  });

  const priceCriterion = await prisma.criterion.create({
    data: {
      name: 'Price',
      description: 'Cost considerations',
      order: 2,
      level: 1,
      projectId: project.id,
    },
  });

  const portabilityCriterion = await prisma.criterion.create({
    data: {
      name: 'Portability',
      description: 'Weight and size',
      order: 3,
      level: 1,
      projectId: project.id,
    },
  });

  // Create alternatives
  await prisma.alternative.createMany({
    data: [
      {
        name: 'MacBook Pro 16"',
        description: 'High-performance laptop with M2 Pro chip',
        order: 1,
        projectId: project.id,
      },
      {
        name: 'Dell XPS 15',
        description: 'Powerful Windows laptop with good display',
        order: 2,
        projectId: project.id,
      },
      {
        name: 'ThinkPad X1 Carbon',
        description: 'Ultralight business laptop',
        order: 3,
        projectId: project.id,
      },
      {
        name: 'Surface Laptop Studio',
        description: 'Versatile 2-in-1 creative laptop',
        order: 4,
        projectId: project.id,
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });