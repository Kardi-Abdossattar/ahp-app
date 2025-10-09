import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding example projects...');

  // Create or get demo user
  let user = await prisma.user.findUnique({
    where: { email: 'demo@ahp.com' }
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('Demo123!', 12);
    user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@ahp.com',
        password: hashedPassword,
      },
    });
    console.log('✅ Created demo user');
  }

  // Project 1: Laptop Selection
  console.log('\n📝 Creating Project 1: Laptop Selection');
  const project1 = await prisma.project.create({
    data: {
      title: 'Laptop Selection for University',
      description: 'Choosing the best laptop for computer science studies',
      goal: 'Select the optimal laptop considering performance, price, portability, and battery life',
      userId: user.id,
    },
  });

  // Criteria for Project 1
  const criteria1 = await Promise.all([
    prisma.criterion.create({
      data: { name: 'Performance', description: 'Processing power and speed', order: 1, level: 1, projectId: project1.id }
    }),
    prisma.criterion.create({
      data: { name: 'Price', description: 'Cost and value for money', order: 2, level: 1, projectId: project1.id }
    }),
    prisma.criterion.create({
      data: { name: 'Portability', description: 'Weight and size', order: 3, level: 1, projectId: project1.id }
    }),
    prisma.criterion.create({
      data: { name: 'Battery Life', description: 'Hours of usage per charge', order: 4, level: 1, projectId: project1.id }
    }),
  ]);

  // Alternatives for Project 1
  const alternatives1 = await Promise.all([
    prisma.alternative.create({
      data: { name: 'Dell XPS 13', description: 'Premium ultrabook with great performance', order: 1, projectId: project1.id }
    }),
    prisma.alternative.create({
      data: { name: 'MacBook Air M2', description: 'Apple silicon with excellent battery life', order: 2, projectId: project1.id }
    }),
    prisma.alternative.create({
      data: { name: 'ThinkPad X1 Carbon', description: 'Business-class laptop with durability', order: 3, projectId: project1.id }
    }),
    prisma.alternative.create({
      data: { name: 'HP Pavilion 15', description: 'Budget-friendly option with good specs', order: 4, projectId: project1.id }
    }),
  ]);

  // Criteria comparisons for Project 1 (Performance > Price > Battery > Portability)
  await Promise.all([
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[0].id, criterionBId: criteria1[1].id, value: 2 }
    }),
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[0].id, criterionBId: criteria1[2].id, value: 4 }
    }),
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[0].id, criterionBId: criteria1[3].id, value: 3 }
    }),
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[1].id, criterionBId: criteria1[2].id, value: 3 }
    }),
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[1].id, criterionBId: criteria1[3].id, value: 2 }
    }),
    prisma.comparison.create({
      data: { projectId: project1.id, type: 'criteria', criterionAId: criteria1[2].id, criterionBId: criteria1[3].id, value: 0.5 }
    }),
  ]);

  // Alternative comparisons for each criterion
  for (let i = 0; i < criteria1.length; i++) {
    const values = [
      [[1, 3, 2, 5], [1/3, 1, 0.5, 2], [0.5, 2, 1, 3], [0.2, 0.5, 1/3, 1]], // Performance
      [[1, 0.5, 2, 3], [2, 1, 3, 4], [0.5, 1/3, 1, 2], [1/3, 0.25, 0.5, 1]], // Price
      [[1, 2, 0.5, 3], [0.5, 1, 1/3, 2], [2, 3, 1, 4], [1/3, 0.5, 0.25, 1]], // Portability
      [[1, 0.5, 2, 3], [2, 1, 3, 5], [0.5, 1/3, 1, 2], [1/3, 0.2, 0.5, 1]], // Battery Life
    ][i];

    for (let j = 0; j < alternatives1.length; j++) {
      for (let k = j + 1; k < alternatives1.length; k++) {
        await prisma.comparison.create({
          data: {
            projectId: project1.id,
            type: 'alternatives',
            alternativeAId: alternatives1[j].id,
            alternativeBId: alternatives1[k].id,
            contextId: criteria1[i].id,
            value: values[j][k],
          },
        });
      }
    }
  }

  console.log('✅ Project 1 created with criteria and comparisons');

  // Project 2: Car Purchase Decision
  console.log('\n📝 Creating Project 2: Car Purchase Decision');
  const project2 = await prisma.project.create({
    data: {
      title: 'Family Car Selection',
      description: 'Choosing the best family SUV',
      goal: 'Select the optimal car considering safety, fuel efficiency, comfort, and price',
      userId: user.id,
    },
  });

  const criteria2 = await Promise.all([
    prisma.criterion.create({
      data: { name: 'Safety', description: 'Safety ratings and features', order: 1, level: 1, projectId: project2.id }
    }),
    prisma.criterion.create({
      data: { name: 'Fuel Efficiency', description: 'Miles per gallon', order: 2, level: 1, projectId: project2.id }
    }),
    prisma.criterion.create({
      data: { name: 'Comfort', description: 'Interior space and ride quality', order: 3, level: 1, projectId: project2.id }
    }),
    prisma.criterion.create({
      data: { name: 'Price', description: 'Purchase price and value', order: 4, level: 1, projectId: project2.id }
    }),
  ]);

  const alternatives2 = await Promise.all([
    prisma.alternative.create({
      data: { name: 'Toyota RAV4', description: 'Reliable and fuel-efficient', order: 1, projectId: project2.id }
    }),
    prisma.alternative.create({
      data: { name: 'Honda CR-V', description: 'Spacious with good safety', order: 2, projectId: project2.id }
    }),
    prisma.alternative.create({
      data: { name: 'Mazda CX-5', description: 'Fun to drive with premium feel', order: 3, projectId: project2.id }
    }),
    prisma.alternative.create({
      data: { name: 'Hyundai Tucson', description: 'Budget-friendly with warranty', order: 4, projectId: project2.id }
    }),
  ]);

  // Criteria comparisons for Project 2 (Safety > Fuel > Comfort > Price)
  await Promise.all([
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[0].id, criterionBId: criteria2[1].id, value: 3 }
    }),
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[0].id, criterionBId: criteria2[2].id, value: 4 }
    }),
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[0].id, criterionBId: criteria2[3].id, value: 7 }
    }),
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[1].id, criterionBId: criteria2[2].id, value: 2 }
    }),
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[1].id, criterionBId: criteria2[3].id, value: 4 }
    }),
    prisma.comparison.create({
      data: { projectId: project2.id, type: 'criteria', criterionAId: criteria2[2].id, criterionBId: criteria2[3].id, value: 2 }
    }),
  ]);

  // Alternative comparisons for Project 2
  for (let i = 0; i < criteria2.length; i++) {
    const values = [
      [[1, 1, 2, 4], [1, 1, 2, 4], [0.5, 0.5, 1, 2], [0.25, 0.25, 0.5, 1]], // Safety
      [[1, 0.5, 2, 3], [2, 1, 3, 4], [0.5, 1/3, 1, 2], [1/3, 0.25, 0.5, 1]], // Fuel Efficiency
      [[1, 2, 0.5, 4], [0.5, 1, 1/3, 2], [2, 3, 1, 5], [0.25, 0.5, 0.2, 1]], // Comfort
      [[1, 2, 3, 0.5], [0.5, 1, 2, 1/3], [1/3, 0.5, 1, 0.25], [2, 3, 4, 1]], // Price
    ][i];

    for (let j = 0; j < alternatives2.length; j++) {
      for (let k = j + 1; k < alternatives2.length; k++) {
        await prisma.comparison.create({
          data: {
            projectId: project2.id,
            type: 'alternatives',
            alternativeAId: alternatives2[j].id,
            alternativeBId: alternatives2[k].id,
            contextId: criteria2[i].id,
            value: values[j][k],
          },
        });
      }
    }
  }

  console.log('✅ Project 2 created with criteria and comparisons');

  // Project 3: Job Offer Evaluation
  console.log('\n📝 Creating Project 3: Job Offer Evaluation');
  const project3 = await prisma.project.create({
    data: {
      title: 'Software Engineer Job Offers',
      description: 'Evaluating multiple job offers',
      goal: 'Choose the best job offer considering salary, work-life balance, growth, and location',
      userId: user.id,
    },
  });

  const criteria3 = await Promise.all([
    prisma.criterion.create({
      data: { name: 'Salary & Benefits', description: 'Compensation package', order: 1, level: 1, projectId: project3.id }
    }),
    prisma.criterion.create({
      data: { name: 'Work-Life Balance', description: 'Flexibility and work hours', order: 2, level: 1, projectId: project3.id }
    }),
    prisma.criterion.create({
      data: { name: 'Career Growth', description: 'Learning and advancement opportunities', order: 3, level: 1, projectId: project3.id }
    }),
    prisma.criterion.create({
      data: { name: 'Location', description: 'Commute and city quality', order: 4, level: 1, projectId: project3.id }
    }),
  ]);

  const alternatives3 = await Promise.all([
    prisma.alternative.create({
      data: { name: 'Google - Senior SWE', description: 'Large tech company with great benefits', order: 1, projectId: project3.id }
    }),
    prisma.alternative.create({
      data: { name: 'Startup - Lead Developer', description: 'High growth potential, equity', order: 2, projectId: project3.id }
    }),
    prisma.alternative.create({
      data: { name: 'Microsoft - SWE II', description: 'Stable with good work-life balance', order: 3, projectId: project3.id }
    }),
    prisma.alternative.create({
      data: { name: 'Local Company - Senior Dev', description: 'Close to home, good culture', order: 4, projectId: project3.id }
    }),
  ]);

  // Criteria comparisons for Project 3
  await Promise.all([
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[0].id, criterionBId: criteria3[1].id, value: 2 }
    }),
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[0].id, criterionBId: criteria3[2].id, value: 1 }
    }),
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[0].id, criterionBId: criteria3[3].id, value: 3 }
    }),
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[1].id, criterionBId: criteria3[2].id, value: 0.5 }
    }),
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[1].id, criterionBId: criteria3[3].id, value: 2 }
    }),
    prisma.comparison.create({
      data: { projectId: project3.id, type: 'criteria', criterionAId: criteria3[2].id, criterionBId: criteria3[3].id, value: 3 }
    }),
  ]);

  // Alternative comparisons for Project 3
  for (let i = 0; i < criteria3.length; i++) {
    const values = [
      [[1, 2, 1, 3], [0.5, 1, 0.5, 2], [1, 2, 1, 3], [1/3, 0.5, 1/3, 1]], // Salary
      [[1, 0.5, 2, 0.5], [2, 1, 3, 1], [0.5, 1/3, 1, 1/3], [2, 1, 3, 1]], // Work-Life
      [[1, 3, 1, 2], [1/3, 1, 1/3, 0.5], [1, 3, 1, 2], [0.5, 2, 0.5, 1]], // Growth
      [[1, 0.5, 1, 0.25], [2, 1, 2, 0.5], [1, 0.5, 1, 0.25], [4, 2, 4, 1]], // Location
    ][i];

    for (let j = 0; j < alternatives3.length; j++) {
      for (let k = j + 1; k < alternatives3.length; k++) {
        await prisma.comparison.create({
          data: {
            projectId: project3.id,
            type: 'alternatives',
            alternativeAId: alternatives3[j].id,
            alternativeBId: alternatives3[k].id,
            contextId: criteria3[i].id,
            value: values[j][k],
          },
        });
      }
    }
  }

  console.log('✅ Project 3 created with criteria and comparisons');

  console.log('\n🎉 Successfully seeded 3 example projects!');
  console.log('\nLogin with:');
  console.log('  Email: demo@ahp.com');
  console.log('  Password: Demo123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
