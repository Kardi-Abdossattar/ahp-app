/**
 * AHP (Analytic Hierarchy Process) Calculation Engine
 * Implements the mathematical core of the AHP method
 */

export function buildPairwiseMatrix(items, comparisons) {
  const n = items.length;
  const matrix = Array(n).fill(null).map(() => Array(n).fill(1));
  
  // Build matrix from comparisons
  for (const comparison of comparisons) {
    const aIndex = items.findIndex(item => item.id === comparison.criterionAId || item.id === comparison.alternativeAId);
    const bIndex = items.findIndex(item => item.id === comparison.criterionBId || item.id === comparison.alternativeBId);
    
    if (aIndex !== -1 && bIndex !== -1) {
      matrix[aIndex][bIndex] = comparison.value;
      matrix[bIndex][aIndex] = 1 / comparison.value;
    }
  }
  
  return matrix;
}

export function computeEigenvector(matrix) {
  const n = matrix.length;
  if (n === 0) return [];
  
  // Use geometric mean method for simplicity
  const weights = [];
  
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    weights[i] = Math.pow(product, 1 / n);
  }
  
  // Normalize weights
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  return weights.map(weight => weight / sum);
}

export function calculateConsistency(matrix, weights) {
  const n = matrix.length;
  if (n <= 2) return { consistencyIndex: 0, consistencyRatio: 0, isConsistent: true };
  
  // Calculate lambda max
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * weights[j];
    }
    lambdaMax += sum / weights[i];
  }
  lambdaMax /= n;
  
  // Consistency Index
  const consistencyIndex = (lambdaMax - n) / (n - 1);
  
  // Random Index values for matrices of different sizes
  const randomIndex = {
    3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32,
    8: 1.41, 9: 1.45, 10: 1.49, 11: 1.51, 12: 1.48
  };
  
  const ri = randomIndex[n] || 1.49;
  const consistencyRatio = consistencyIndex / ri;
  
  return {
    consistencyIndex,
    consistencyRatio,
    lambdaMax,
    isConsistent: consistencyRatio <= 0.1
  };
}

export async function calculateAHP(project) {
  const { criteria, alternatives, comparisons } = project;
  
  if (criteria.length === 0) {
    throw new Error('No criteria defined');
  }
  
  if (alternatives.length === 0) {
    throw new Error('No alternatives defined');
  }
  
  // Separate comparisons by type
  const criteriaComparisons = comparisons.filter(c => c.type === 'criteria');
  const alternativeComparisons = comparisons.filter(c => c.type === 'alternatives');
  
  // Calculate criteria weights
  const criteriaMatrix = buildPairwiseMatrix(criteria, criteriaComparisons);
  const criteriaWeights = computeEigenvector(criteriaMatrix);
  const criteriaConsistency = calculateConsistency(criteriaMatrix, criteriaWeights);
  
  // Calculate alternative weights for each criterion
  const alternativeScores = {};
  const alternativeConsistencies = {};
  
  for (const criterion of criteria) {
    const contextComparisons = alternativeComparisons.filter(c => c.contextId === criterion.id);
    const altMatrix = buildPairwiseMatrix(alternatives, contextComparisons);
    const altWeights = computeEigenvector(altMatrix);
    const altConsistency = calculateConsistency(altMatrix, altWeights);
    
    alternativeScores[criterion.id] = alternatives.map((alt, index) => ({
      id: alt.id,
      name: alt.name,
      score: altWeights[index] || 0
    }));
    
    alternativeConsistencies[criterion.id] = altConsistency;
  }
  
  // Calculate final scores
  const finalScores = alternatives.map(alt => {
    let totalScore = 0;
    
    criteria.forEach((criterion, index) => {
      const altScore = alternativeScores[criterion.id]?.find(s => s.id === alt.id);
      if (altScore && criteriaWeights[index]) {
        totalScore += criteriaWeights[index] * altScore.score;
      }
    });
    
    return {
      id: alt.id,
      name: alt.name,
      score: totalScore
    };
  });
  
  // Sort by score (descending)
  finalScores.sort((a, b) => b.score - a.score);
  
  // Calculate overall consistency
  let overallCR = 0;
  let totalWeight = 0;
  
  criteria.forEach((criterion, index) => {
    const consistency = alternativeConsistencies[criterion.id];
    const weight = criteriaWeights[index] || 0;
    overallCR += consistency.consistencyRatio * weight;
    totalWeight += weight;
  });
  
  if (totalWeight > 0) {
    overallCR = (overallCR + criteriaConsistency.consistencyRatio) / (totalWeight + 1);
  }
  
  return {
    criteriaWeights: criteria.map((criterion, index) => ({
      id: criterion.id,
      name: criterion.name,
      weight: criteriaWeights[index] || 0,
      consistencyRatio: alternativeConsistencies[criterion.id]?.consistencyRatio || 0
    })),
    alternativeScores,
    finalScores,
    consistencyAnalysis: {
      criteria: {
        ...criteriaConsistency,
        matrix: criteriaMatrix
      },
      alternatives: alternativeConsistencies
    },
    overallConsistency: {
      consistencyRatio: overallCR,
      isConsistent: overallCR <= 0.1
    }
  };
}

// Helper function to generate all pairs for comparison
export function generateComparisonPairs(items) {
  const pairs = [];
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push({
        itemA: items[i],
        itemB: items[j]
      });
    }
  }
  
  return pairs;
}

// Saaty's scale definitions
export const SAATY_SCALE = {
  1: { label: 'Equal importance', description: 'Two activities contribute equally to the objective' },
  2: { label: 'Weak or slight', description: 'Experience and judgment slightly favor one activity over another' },
  3: { label: 'Moderate importance', description: 'Experience and judgment strongly favor one activity over another' },
  4: { label: 'Moderate plus', description: 'One activity is favored very strongly over another' },
  5: { label: 'Strong importance', description: 'One activity is favored very strongly over another' },
  6: { label: 'Strong plus', description: 'One activity is demonstrated to be strongly more important' },
  7: { label: 'Very strong importance', description: 'One activity is of demonstrated importance' },
  8: { label: 'Very, very strong', description: 'The evidence favoring one activity is of the highest possible order' },
  9: { label: 'Extreme importance', description: 'The evidence favoring one activity is of the highest possible order' }
};