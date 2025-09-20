import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { calculateAHP, calculateAHPWithCustomCriteriaWeights, buildPairwiseMatrix, computeEigenvector, calculateConsistency } from '../utils/ahpEngine.js';

const router = express.Router();

// Save pairwise comparison
router.post('/comparisons', authenticateToken, async (req, res) => {
  try {
    const { projectId, type, itemAId, itemBId, value, contextId } = req.body;

    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Basic validation
    const numericValue = parseFloat(value);
    if (!projectId || !type || !itemAId || !itemBId || Number.isNaN(numericValue)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // Prepare comparison data to create
    const comparisonData = (
      type === 'criteria'
        ? {
            projectId,
            type,
            value: numericValue,
            // no contextId for criteria comparisons
            criterionAId: itemAId,
            criterionBId: itemBId,
          }
        : {
            projectId,
            type,
            value: numericValue,
            // alternatives must specify the criterion context
            contextId: contextId,
            alternativeAId: itemAId,
            alternativeBId: itemBId,
          }
    );

    // Build a single valid where object depending on the type
    let where;
    if (type === 'criteria') {
      where = {
        projectId_criterionAId_criterionBId: {
          projectId,
          criterionAId: itemAId,
          criterionBId: itemBId,
        },
      };
    } else if (type === 'alternatives') {
      if (!contextId) {
        return res.status(400).json({ message: 'contextId is required for alternative comparisons' });
      }
      where = {
        projectId_alternativeAId_alternativeBId_contextId: {
          projectId,
          alternativeAId: itemAId,
          alternativeBId: itemBId,
          contextId: contextId,
        },
      };
    } else {
      return res.status(400).json({ message: 'Invalid comparison type' });
    }

    // Create or update comparison with a valid unique where
    const comparison = await req.prisma.comparison.upsert({
      where,
      update: { value: numericValue },
      create: comparisonData,
    });

    res.json(comparison);
  } catch (error) {
    console.error('Save comparison error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comparisons for project
router.get('/comparisons/:projectId', authenticateToken, async (req, res) => {
  try {
    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const comparisons = await req.prisma.comparison.findMany({
      where: { projectId: req.params.projectId },
      include: {
        criterionA: true,
        criterionB: true,
        alternativeA: true,
        alternativeB: true,
      },
    });

    res.json(comparisons);
  } catch (error) {
    console.error('Get comparisons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate AHP results
router.post('/calculate/:projectId', authenticateToken, async (req, res) => {
  try {
    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.projectId,
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
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Calculate AHP
    const results = await calculateAHP(project);

    // Save results
    await req.prisma.result.create({
      data: {
        projectId: req.params.projectId,
        data: results,
      },
    });

    res.json(results);
  } catch (error) {
    console.error('Calculate AHP error:', error);
    res.status(500).json({ 
      message: 'Calculation error',
      error: error.message 
    });
  }
});

// Get latest results
router.get('/results/:projectId', authenticateToken, async (req, res) => {
  try {
    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await req.prisma.result.findFirst({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
    });

    if (!result) {
      return res.status(404).json({ message: 'No results found. Run calculation first.' });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sensitivity analysis
router.post('/sensitivity/:projectId', authenticateToken, async (req, res) => {
  try {
    const { criterionId, newWeight } = req.body;

    // Verify project ownership
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.projectId,
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
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Calculate baseline results
    const originalResults = await calculateAHP(project);

    // Build a criteria weights map from original results
    const weightsById = {};
    for (const cw of originalResults.criteriaWeights) {
      weightsById[cw.id] = cw.weight;
    }

    // Apply new absolute weight for the target criterion and renormalize
    const target = parseFloat(newWeight);
    weightsById[criterionId] = isNaN(target) ? weightsById[criterionId] : target;
    // Renormalize to sum=1
    const sumW = Object.values(weightsById).reduce((a, b) => a + (b || 0), 0) || 1;
    Object.keys(weightsById).forEach(k => { weightsById[k] = (weightsById[k] || 0) / sumW; });

    // Recompute results using consistent criteria matrix derived from desired weights
    const modifiedResults = await calculateAHPWithCustomCriteriaWeights(project, weightsById);

    const analysis = {
      original: originalResults,
      modified: modifiedResults,
      changes: calculateChanges(originalResults, modifiedResults),
      consistency: {
        original: {
          overall: originalResults.overallConsistency,
          criteriaCR: (originalResults.criteriaWeights || []).map(cw => ({
            id: cw.id,
            name: cw.name,
            consistencyRatio: cw.consistencyRatio ?? 0,
          })),
        },
        modified: {
          overall: modifiedResults.overallConsistency,
          criteriaCR: (modifiedResults.criteriaWeights || []).map(cw => ({
            id: cw.id,
            name: cw.name,
            consistencyRatio: cw.consistencyRatio ?? 0,
          })),
        },
      },
    };

    res.json(analysis);
  } catch (error) {
    console.error('Sensitivity analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function for sensitivity analysis
// Note: previous simplified calculateAHPWithWeightChange removed in favor of
// calculateAHPWithCustomCriteriaWeights for more faithful sensitivity results.

function calculateChanges(original, modified) {
  const changes = [];
  
  original.finalScores.forEach(origScore => {
    const modScore = modified.finalScores.find(s => s.id === origScore.id);
    if (modScore) {
      const change = ((modScore.score - origScore.score) / origScore.score) * 100;
      changes.push({
        id: origScore.id,
        name: origScore.name,
        originalScore: origScore.score,
        newScore: modScore.score,
        changePercent: change,
      });
    }
  });
  
  return changes;
}

export default router;