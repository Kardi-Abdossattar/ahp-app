import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { calculateAHP, buildPairwiseMatrix, computeEigenvector, calculateConsistency } from '../utils/ahpEngine.js';

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

    // Prepare comparison data
    const comparisonData = {
      projectId,
      type,
      value: parseFloat(value),
      contextId,
    };

    if (type === 'criteria') {
      comparisonData.criterionAId = itemAId;
      comparisonData.criterionBId = itemBId;
    } else if (type === 'alternatives') {
      comparisonData.alternativeAId = itemAId;
      comparisonData.alternativeBId = itemBId;
    }

    // Create or update comparison
    const comparison = await req.prisma.comparison.upsert({
      where: {
        projectId_criterionAId_criterionBId_contextId: type === 'criteria' ? {
          projectId,
          criterionAId: itemAId,
          criterionBId: itemBId,
          contextId: contextId || null,
        } : undefined,
        projectId_alternativeAId_alternativeBId_contextId: type === 'alternatives' ? {
          projectId,
          alternativeAId: itemAId,
          alternativeBId: itemBId,
          contextId: contextId || null,
        } : undefined,
      },
      update: {
        value: parseFloat(value),
      },
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

    // Perform sensitivity analysis
    const originalResults = await calculateAHP(project);
    
    // Simulate weight change
    const sensitivityResults = await calculateAHPWithWeightChange(
      project, 
      criterionId, 
      parseFloat(newWeight)
    );

    const analysis = {
      original: originalResults,
      modified: sensitivityResults,
      changes: calculateChanges(originalResults, sensitivityResults),
    };

    res.json(analysis);
  } catch (error) {
    console.error('Sensitivity analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function for sensitivity analysis
async function calculateAHPWithWeightChange(project, criterionId, newWeight) {
  // This is a simplified implementation
  // In a full implementation, you would adjust the pairwise comparisons
  // to reflect the new weight and recalculate
  const results = await calculateAHP(project);
  
  // Find the criterion and adjust its weight
  const criterionIndex = results.criteriaWeights.findIndex(w => w.id === criterionId);
  if (criterionIndex !== -1) {
    // Normalize other weights
    const oldWeight = results.criteriaWeights[criterionIndex].weight;
    const adjustment = newWeight - oldWeight;
    const remainingWeight = 1 - newWeight;
    const currentRemainingWeight = 1 - oldWeight;
    
    results.criteriaWeights.forEach((w, i) => {
      if (i === criterionIndex) {
        w.weight = newWeight;
      } else if (currentRemainingWeight > 0) {
        w.weight = w.weight * (remainingWeight / currentRemainingWeight);
      }
    });
    
    // Recalculate final scores
    results.finalScores = results.finalScores.map(score => {
      let newScore = 0;
      results.criteriaWeights.forEach(cw => {
        const altScore = results.alternativeScores[cw.id]?.find(as => as.id === score.id);
        if (altScore) {
          newScore += cw.weight * altScore.score;
        }
      });
      return { ...score, score: newScore };
    });
    
    // Re-sort by score
    results.finalScores.sort((a, b) => b.score - a.score);
  }
  
  return results;
}

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