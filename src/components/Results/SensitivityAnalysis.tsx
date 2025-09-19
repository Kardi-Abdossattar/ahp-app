import React, { useState } from 'react';
import { ahpAPI } from '../../services/api';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SensitivityAnalysisProps {
  projectId: string;
  results: any;
}

export default function SensitivityAnalysis({ projectId, results }: SensitivityAnalysisProps) {
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedCriterion || !newWeight) return;

    setLoading(true);
    try {
      const data = await ahpAPI.performSensitivityAnalysis(
        projectId,
        selectedCriterion,
        parseFloat(newWeight) / 100
      );
      setAnalysis(data);
    } catch (error) {
      console.error('Sensitivity analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Sensitivity Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">
          Analyze how changes in criteria weights affect the final rankings
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Criterion
            </label>
            <select
              value={selectedCriterion}
              onChange={(e) => setSelectedCriterion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose criterion...</option>
              {results.criteriaWeights.map((criterion: any) => (
                <option key={criterion.id} value={criterion.id}>
                  {criterion.name} ({(criterion.weight * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Weight (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="e.g., 40"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleAnalyze}
              loading={loading}
              disabled={!selectedCriterion || !newWeight}
              className="w-full"
            >
              Analyze
            </Button>
          </div>
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Impact on Rankings</h3>
              <div className="space-y-3">
                {analysis.changes.map((change: any) => (
                  <div key={change.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {change.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {(change.originalScore * 100).toFixed(2)}% → {(change.newScore * 100).toFixed(2)}%
                      </span>
                      <div className={`flex items-center text-sm ${
                        change.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.changePercent > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(change.changePercent).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}