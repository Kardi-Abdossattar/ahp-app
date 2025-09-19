import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ahpAPI, reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import ResultsChart from '../../components/Results/ResultsChart';
import ConsistencyIndicator from '../../components/Results/ConsistencyIndicator';
import SensitivityAnalysis from '../../components/Results/SensitivityAnalysis';
import { ArrowLeft, Calculator, Download, RefreshCw } from 'lucide-react';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ahpAPI.getResults(id!);
      setResults(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('No results found. Please run the calculation first.');
      } else {
        setError('Error loading results');
        console.error('Error loading results:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setError('');
    
    try {
      const data = await ahpAPI.calculateResults(id!);
      setResults(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Calculation failed');
      console.error('Calculation error:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    
    try {
      const pdfBlob = await reportAPI.generatePDF(id!);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AHP_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const formatPercent = (value: number) => (value * 100).toFixed(2) + '%';
  const formatScore = (value: number) => value.toFixed(4);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AHP Results</h1>
            <p className="text-gray-600">Analysis results and decision recommendations</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleCalculate}
              loading={calculating}
              icon={<Calculator className="h-4 w-4" />}
              variant="outline"
            >
              {results ? 'Recalculate' : 'Calculate'}
            </Button>
            {results && (
              <Button
                onClick={handleDownloadPDF}
                loading={downloadingPDF}
                icon={<Download className="h-4 w-4" />}
              >
                Download Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('No results found') && (
                <div className="mt-2">
                  <Button
                    onClick={handleCalculate}
                    loading={calculating}
                    size="sm"
                    icon={<Calculator className="h-4 w-4" />}
                  >
                    Run Calculation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-8">
          {/* Final Rankings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Final Rankings</h2>
              <p className="text-sm text-gray-500 mt-1">
                Alternatives ranked by their overall scores
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {results.finalScores.map((alternative: any, index: number) => (
                  <div
                    key={alternative.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      index === 0
                        ? 'border-gold-200 bg-yellow-50'
                        : index === 1
                        ? 'border-gray-300 bg-gray-50'
                        : index === 2
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-500 text-white'
                            : index === 2
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{alternative.name}</h3>
                        <p className="text-sm text-gray-500">Score: {formatScore(alternative.score)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPercent(alternative.score)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResultsChart data={results} type="criteria" />
            <ResultsChart data={results} type="alternatives" />
          </div>

          {/* Criteria Weights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Criteria Weights</h2>
              <p className="text-sm text-gray-500 mt-1">
                Importance weights for each criterion
              </p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criterion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consistency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.criteriaWeights.map((criterion: any) => (
                      <tr key={criterion.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {criterion.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatScore(criterion.weight)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercent(criterion.weight)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <ConsistencyIndicator ratio={criterion.consistencyRatio} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Overall Consistency */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Consistency Analysis</h2>
              <p className="text-sm text-gray-500 mt-1">
                Overall consistency of your judgments
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    <ConsistencyIndicator
                      ratio={results.overallConsistency?.consistencyRatio || 0}
                      showLabel={true}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Consistency Ratio: {(results.overallConsistency?.consistencyRatio || 0).toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    results.overallConsistency?.isConsistent
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {results.overallConsistency?.isConsistent
                      ? 'Acceptable Consistency'
                      : 'Poor Consistency - Review Recommended'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    CR ≤ 0.1 is considered acceptable
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sensitivity Analysis */}
          <SensitivityAnalysis projectId={id!} results={results} />
        </div>
      )}
    </div>
  );
}