import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all projects for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await req.prisma.project.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            criteria: true,
            alternatives: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project with full details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
        alternatives: {
          orderBy: { order: 'asc' },
        },
        comparisons: true,
        results: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, goal } = req.body;

    if (!title || !goal) {
      return res.status(400).json({ message: 'Title and goal are required' });
    }

    const project = await req.prisma.project.create({
      data: {
        title,
        description,
        goal,
        userId: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, goal } = req.body;

    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await req.prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        goal,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await req.prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add criterion
router.post('/:id/criteria', authenticateToken, async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Criterion name is required' });
    }

    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get next order
    const lastCriterion = await req.prisma.criterion.findFirst({
      where: {
        projectId: req.params.id,
        parentId: parentId || null,
      },
      orderBy: { order: 'desc' },
    });

    const order = (lastCriterion?.order || 0) + 1;
    let level = 1;

    if (parentId) {
      const parent = await req.prisma.criterion.findUnique({
        where: { id: parentId },
      });
      level = (parent?.level || 1) + 1;
    }

    const criterion = await req.prisma.criterion.create({
      data: {
        name,
        description,
        order,
        level,
        parentId,
        projectId: req.params.id,
      },
    });

    res.status(201).json(criterion);
  } catch (error) {
    console.error('Add criterion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add alternative
router.post('/:id/alternatives', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Alternative name is required' });
    }

    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get next order
    const lastAlternative = await req.prisma.alternative.findFirst({
      where: { projectId: req.params.id },
      orderBy: { order: 'desc' },
    });

    const order = (lastAlternative?.order || 0) + 1;

    const alternative = await req.prisma.alternative.create({
      data: {
        name,
        description,
        order,
        projectId: req.params.id,
      },
    });

    res.status(201).json(alternative);
  } catch (error) {
    console.error('Add alternative error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update criterion/alternative order
router.put('/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const { items, type } = req.body; // items: [{ id, order }], type: 'criteria' | 'alternatives'

    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update orders in transaction
    await req.prisma.$transaction(async (prisma) => {
      for (const item of items) {
        if (type === 'criteria') {
          await prisma.criterion.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } else if (type === 'alternatives') {
          await prisma.alternative.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        }
      }
    });

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;