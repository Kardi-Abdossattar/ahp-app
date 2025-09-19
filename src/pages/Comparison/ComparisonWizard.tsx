import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, ahpAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import PairwiseComparison from '../../components/Comparison/PairwiseComparison';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface ComparisonPair {
  itemA: any;
  itemB: any;
  type: 'criteria' | 'alternatives';
  contextId?: string;
  contextName?: string;
}

export default function ComparisonWizard() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allPairs, setAllPairs] = useState<ComparisonPair[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [comparisons, setComparisons] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getById(id!);
      setProject(data);
      
      // Load existing comparisons
      const existingComparisons = await ahpAPI.getComparisons(id!);
      const comparisonMap: Record<string, number> = {};
      
      existingComparisons.forEach((comp: any) => {
        const key = generateComparisonKey(comp);
        comparisonMap[key] = comp.value;
      });
      
      setComparisons(comparisonMap);
      
      // Generate all comparison pairs
      const pairs = generateAllPairs(data);
      setAllPairs(pairs);
      
      // Find first incomplete comparison
      const firstIncomplete = pairs.findIndex(pair => 
        !comparisonMap[generatePairKey(pair)]
      );
      setCurrentPairIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAllPairs = (projectData: any): ComparisonPair[] => {
    const pairs: ComparisonPair[] = [];
    
    // Criteria pairs
    for (let i = 0; i < projectData.criteria.length; i++) {
      for (let j = i + 1; j < projectData.criteria.length; j++) {
        pairs.push({
          itemA: projectData.criteria[i],
          itemB: projectData.criteria[j],
          type: 'criteria',
        });
      }
    }
    
    // Alternative pairs for each criterion
    projectData.criteria.forEach((criterion: any) => {
      for (let i = 0; i < projectData.alternatives.length; i++) {
        for (let j = i + 1; j < projectData.alternatives.length; j++) {
          pairs.push({
            itemA: projectData.alternatives[i],
            itemB: projectData.alternatives[j],
            type: 'alternatives',
            contextId: criterion.id,
            contextName: criterion.name,
          });
        }
      }
    });
    
    return pairs;
  };

  const generateComparisonKey = (comp: any) => {
    if (comp.type === 'criteria') {
      return `criteria-${comp.criterionAId}-${comp.criterionBId}-${comp.contextId || 'null'}`;
    } else {
      return `alternatives-${comp.alternativeAId}-${comp.alternativeBId}-${comp.contextId || 'null'}`;
    }
  };

  const generatePairKey = (pair: ComparisonPair) => {
    return `${pair.type}-${pair.itemA.id}-${pair.itemB.id}-${pair.contextId || 'null'}`;
  };

  const handleComparisonSave = async (value: number) => {
    const currentPair = allPairs[currentPairIndex];
    setSaving(true);
    
    try {
      await ahpAPI.saveComparison({
        projectId: id!,
        type: currentPair.type,
        itemAId: currentPair.itemA.id,
        itemBId: currentPair.itemB.id,
        value,
        contextId: currentPair.contextId,
      });
      
      // Update local state
      const key = generatePairKey(currentPair);
      setComparisons(prev => ({ ...prev, [key]: value }));
      
      // Move to next pair
      if (currentPairIndex < allPairs.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      }
      
    } catch (error) {
      console.error('Error saving comparison:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCompletedCount = () => {
    return Object.keys(comparisons).length;
  };

  const getProgress = () => {
    return allPairs.length > 0 ? (getCompletedCount() / allPairs.length) * 100 : 0;
  };

  const isComplete = () => {
    return getCompletedCount() === allPairs.length;
  };

  const currentPair = allPairs[currentPairIndex];

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (allPairs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No comparisons needed</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add at least 2 criteria and 2 alternatives to start making comparisons.
          </p>
          <div className="mt-6">
            <Link to={`/projects/${id}`}>
              <Button>Back to Project</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pairwise Comparisons</h1>
        <p className="text-gray-600">{project.title}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {getCompletedCount()} of {allPairs.length} comparisons
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Current Comparison */}
      {isComplete() ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            All Comparisons Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You've completed all pairwise comparisons. You can now calculate the results.
          </p>
          <div className="space-x-4">
            <Link to={`/projects/${id}`}>
              <Button variant="outline">Back to Project</Button>
            </Link>
            <Link to={`/projects/${id}/results`}>
              <Button>View Results</Button>
            </Link>
          </div>
        </div>
      ) : currentPair ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <PairwiseComparison
            pair={currentPair}
            onSave={handleComparisonSave}
            saving={saving}
            currentIndex={currentPairIndex + 1}
            totalPairs={allPairs.length}
          />
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setCurrentPairIndex(Math.max(0, currentPairIndex - 1))}
              disabled={currentPairIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPairIndex(Math.min(allPairs.length - 1, currentPairIndex + 1))}
              disabled={currentPairIndex === allPairs.length - 1}
            >
              Skip for Now
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}