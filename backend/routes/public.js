import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateAHP } from '../utils/ahpEngine.js';

const router = express.Router();

// Utility: ensure demo user exists
async function ensureDemoUser(prisma) {
  const email = 'demo@ahp.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Demo User',
        password: '$2a$12$demoPasswordHashedPlaceholder0000000000000000000000000', // not used for public
      },
    });
  }
  return user;
}

// Utility: upsert a project by title for demo user
async function upsertProject(prisma, userId, title, description, goal) {
  let project = await prisma.project.findFirst({ where: { userId, title } });
  if (!project) {
    project = await prisma.project.create({ data: { userId, title, description, goal } });
  }
  return project;
}

// Idempotent add criteria helper
async function ensureCriteria(prisma, projectId, list) {
  const created = [];
  for (let i = 0; i < list.length; i++) {
    const { name, description } = list[i];
    let c = await prisma.criterion.findFirst({ where: { projectId, name } });
    if (!c) {
      c = await prisma.criterion.create({ data: { name, description, order: i + 1, level: 1, projectId } });
    }
    created.push(c);
  }
  return created;
}

// Idempotent add alternatives helper
async function ensureAlternatives(prisma, projectId, list) {
  const created = [];
  for (let i = 0; i < list.length; i++) {
    const { name, description } = list[i];
    let a = await prisma.alternative.findFirst({ where: { projectId, name } });
    if (!a) {
      a = await prisma.alternative.create({ data: { name, description, order: i + 1, projectId } });
    }
    created.push(a);
  }
  // Fetch in order
  return await prisma.alternative.findMany({ where: { projectId }, orderBy: { order: 'asc' } });
}

async function upsertCriteriaComparison(prisma, projectId, aId, bId, value) {
  return prisma.comparison.upsert({
    where: { projectId_criterionAId_criterionBId: { projectId, criterionAId: aId, criterionBId: bId } },
    update: { value },
    create: { projectId, type: 'criteria', criterionAId: aId, criterionBId: bId, value },
  });
}

async function upsertAlternativeComparison(prisma, projectId, contextId, aId, bId, value) {
  return prisma.comparison.upsert({
    where: { projectId_alternativeAId_alternativeBId_contextId: { projectId, alternativeAId: aId, alternativeBId: bId, contextId } },
    update: { value },
    create: { projectId, type: 'alternatives', contextId, alternativeAId: aId, alternativeBId: bId, value },
  });
}

// Initialize or refresh demo data
router.get('/init', async (req, res) => {
  try {
    const prisma = req.prisma || new PrismaClient();
    const user = await ensureDemoUser(prisma);

    // Laptop project
    const laptop = await upsertProject(
      prisma,
      user.id,
      'Laptop Selection',
      'Choose the best laptop for software development',
      'Select the optimal laptop considering performance, price, and portability'
    );

    // Remove any other laptop-like demo projects for this user (keep only one)
    const otherLaptopProjects = await prisma.project.findMany({
      where: {
        userId: user.id,
        id: { not: laptop.id },
        OR: [
          { title: { contains: 'Laptop', mode: 'insensitive' } },
          { goal: { contains: 'laptop', mode: 'insensitive' } },
        ],
      },
    });
    for (const p of otherLaptopProjects) {
      await prisma.project.delete({ where: { id: p.id } });
    }

    const [perf, price, port] = await ensureCriteria(prisma, laptop.id, [
      { name: 'Performance', description: 'Processing power and speed' },
      { name: 'Price', description: 'Cost considerations' },
      { name: 'Portability', description: 'Weight and size' },
    ]);

    const laptopAlts = await ensureAlternatives(prisma, laptop.id, [
      { name: 'MacBook Pro 16"', description: 'High-performance laptop with M2 Pro/Max' },
      { name: 'Dell XPS 15', description: 'Powerful Windows laptop with good display' },
      { name: 'ThinkPad X1 Carbon', description: 'Ultralight business laptop' },
      { name: 'Surface Laptop Studio', description: 'Versatile 2-in-1 creative laptop' },
    ]);

    // Logical criteria comparisons (laptop)
    await upsertCriteriaComparison(prisma, laptop.id, perf.id, price.id, 5);
    await upsertCriteriaComparison(prisma, laptop.id, perf.id, port.id, 3);
    await upsertCriteriaComparison(prisma, laptop.id, port.id, price.id, 2);

    const [mac, dell, x1, surface] = laptopAlts;

    // Alternatives under Performance
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, mac.id, dell.id, 2);
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, mac.id, surface.id, 3);
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, mac.id, x1.id, 5);
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, dell.id, surface.id, 2);
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, dell.id, x1.id, 3);
    await upsertAlternativeComparison(prisma, laptop.id, perf.id, surface.id, x1.id, 2);

    // Alternatives under Price (cheaper preferred)
    await upsertAlternativeComparison(prisma, laptop.id, price.id, x1.id, dell.id, 3);
    await upsertAlternativeComparison(prisma, laptop.id, price.id, x1.id, surface.id, 4);
    await upsertAlternativeComparison(prisma, laptop.id, price.id, x1.id, mac.id, 7);
    await upsertAlternativeComparison(prisma, laptop.id, price.id, dell.id, surface.id, 2);
    await upsertAlternativeComparison(prisma, laptop.id, price.id, dell.id, mac.id, 5);
    await upsertAlternativeComparison(prisma, laptop.id, price.id, surface.id, mac.id, 3);

    // Alternatives under Portability (lighter preferred)
    await upsertAlternativeComparison(prisma, laptop.id, port.id, x1.id, dell.id, 5);
    await upsertAlternativeComparison(prisma, laptop.id, port.id, x1.id, surface.id, 6);
    await upsertAlternativeComparison(prisma, laptop.id, port.id, x1.id, mac.id, 7);
    await upsertAlternativeComparison(prisma, laptop.id, port.id, dell.id, surface.id, 2);
    await upsertAlternativeComparison(prisma, laptop.id, port.id, dell.id, mac.id, 3);
    await upsertAlternativeComparison(prisma, laptop.id, port.id, surface.id, mac.id, 2);

    // Save results (laptop)
    {
      const full = await prisma.project.findUnique({
        where: { id: laptop.id },
        include: { criteria: { orderBy: { order: 'asc' } }, alternatives: { orderBy: { order: 'asc' } }, comparisons: true },
      });
      const results = await calculateAHP(full);
      await prisma.result.create({ data: { projectId: laptop.id, data: results } });
    }

    // Car project
    const car = await upsertProject(
      prisma,
      user.id,
      'Car Selection',
      'Choose the best family SUV',
      'Select the optimal car considering safety, fuel efficiency, price, and comfort'
    );

    // Remove any other car-like demo projects for this user (keep only one)
    const otherCarProjects = await prisma.project.findMany({
      where: {
        userId: user.id,
        id: { not: car.id },
        OR: [
          { title: { contains: 'Car', mode: 'insensitive' } },
          { goal: { contains: 'car', mode: 'insensitive' } },
        ],
      },
    });
    for (const p of otherCarProjects) {
      await prisma.project.delete({ where: { id: p.id } });
    }

    const [safety, fuel, comfort, carPrice] = await ensureCriteria(prisma, car.id, [
      { name: 'Safety', description: 'Crash tests, safety features' },
      { name: 'Fuel Efficiency', description: 'MPG/consumption' },
      { name: 'Comfort', description: 'Ride quality and features' },
      { name: 'Price', description: 'Purchase cost' },
    ]);

    const carAlts = await ensureAlternatives(prisma, car.id, [
      { name: 'Toyota RAV4', description: 'Reliable compact SUV' },
      { name: 'Honda CR-V', description: 'Efficient and spacious' },
      { name: 'Mazda CX-5', description: 'Sporty and refined' },
      { name: 'Hyundai Tucson', description: 'Value-packed' },
    ]);

    const [rav4, crv, cx5, tucson] = carAlts;

    // Criteria comparisons (car)
    await upsertCriteriaComparison(prisma, car.id, safety.id, fuel.id, 3);
    await upsertCriteriaComparison(prisma, car.id, safety.id, comfort.id, 4);
    await upsertCriteriaComparison(prisma, car.id, safety.id, carPrice.id, 7);
    await upsertCriteriaComparison(prisma, car.id, fuel.id, comfort.id, 2);
    await upsertCriteriaComparison(prisma, car.id, fuel.id, carPrice.id, 3);
    await upsertCriteriaComparison(prisma, car.id, comfort.id, carPrice.id, 3);

    // Alternatives under Safety
    await upsertAlternativeComparison(prisma, car.id, safety.id, rav4.id, cx5.id, 3);
    await upsertAlternativeComparison(prisma, car.id, safety.id, rav4.id, tucson.id, 4);
    await upsertAlternativeComparison(prisma, car.id, safety.id, rav4.id, crv.id, 1);
    await upsertAlternativeComparison(prisma, car.id, safety.id, crv.id, cx5.id, 3);
    await upsertAlternativeComparison(prisma, car.id, safety.id, crv.id, tucson.id, 4);
    await upsertAlternativeComparison(prisma, car.id, safety.id, cx5.id, tucson.id, 2);

    // Alternatives under Fuel Efficiency
    await upsertAlternativeComparison(prisma, car.id, fuel.id, crv.id, rav4.id, 2);
    await upsertAlternativeComparison(prisma, car.id, fuel.id, crv.id, cx5.id, 3);
    await upsertAlternativeComparison(prisma, car.id, fuel.id, crv.id, tucson.id, 3);
    await upsertAlternativeComparison(prisma, car.id, fuel.id, rav4.id, cx5.id, 3);
    await upsertAlternativeComparison(prisma, car.id, fuel.id, rav4.id, tucson.id, 3);
    await upsertAlternativeComparison(prisma, car.id, fuel.id, cx5.id, tucson.id, 2);

    // Alternatives under Price (cheaper preferred)
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, tucson.id, rav4.id, 5);
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, tucson.id, crv.id, 4);
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, tucson.id, cx5.id, 3);
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, cx5.id, rav4.id, 2);
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, cx5.id, crv.id, 2);
    await upsertAlternativeComparison(prisma, car.id, carPrice.id, crv.id, rav4.id, 2);

    // Alternatives under Comfort
    await upsertAlternativeComparison(prisma, car.id, comfort.id, cx5.id, rav4.id, 3);
    await upsertAlternativeComparison(prisma, car.id, comfort.id, cx5.id, crv.id, 2);
    await upsertAlternativeComparison(prisma, car.id, comfort.id, cx5.id, tucson.id, 4);
    await upsertAlternativeComparison(prisma, car.id, comfort.id, rav4.id, crv.id, 2);
    await upsertAlternativeComparison(prisma, car.id, comfort.id, rav4.id, tucson.id, 3);
    await upsertAlternativeComparison(prisma, car.id, comfort.id, crv.id, tucson.id, 2);

    // Save results (car)
    {
      const full = await prisma.project.findUnique({
        where: { id: car.id },
        include: { criteria: { orderBy: { order: 'asc' } }, alternatives: { orderBy: { order: 'asc' } }, comparisons: true },
      });
      const results = await calculateAHP(full);
      await prisma.result.create({ data: { projectId: car.id, data: results } });
    }

    res.json({ ok: true, message: 'Demo data initialized', projects: [laptop.id, car.id] });
  } catch (err) {
    console.error('Public init error:', err);
    res.status(500).json({ ok: false, message: 'Initialization error', error: err.message });
  }
});

// List demo projects with latest results (public)
router.get('/projects', async (req, res) => {
  try {
    const prisma = req.prisma || new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email: 'demo@ahp.com' } });
    if (!user) return res.json([]);

    const projects = await prisma.project.findMany({
      where: { userId: user.id, title: { in: ['Laptop Selection', 'Car Selection'] } },
      include: {
        criteria: { orderBy: { order: 'asc' } },
        alternatives: { orderBy: { order: 'asc' } },
        results: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const data = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      goal: p.goal,
      criteriaCount: p.criteria.length,
      alternativesCount: p.alternatives.length,
      latestResults: p.results[0]?.data || null,
    }));

    res.json(data);
  } catch (err) {
    console.error('Public projects error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get public results by project id
router.get('/results/:projectId', async (req, res) => {
  try {
    const prisma = req.prisma || new PrismaClient();
    const result = await prisma.result.findFirst({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
    });
    if (!result) return res.status(404).json({ ok: false, message: 'No results found' });
    res.json(result.data);
  } catch (err) {
    console.error('Public results error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;
