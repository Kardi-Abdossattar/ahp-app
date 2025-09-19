import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, BarChart, Play, FileText } from 'lucide-react';

interface ProjectData {
  id: string;
  title: string;
  description?: string;
  goal: string;
  criteria: Array<{
    id: string;
    name: string;
    description?: string;
    order: number;
    level: number;
    parentId?: string;
  }>;
  alternatives: Array<{
    id: string;
    name: string;
    description?: string;
    order: number;
  }>;
  comparisons: any[];
  results: any[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [criterionName, setCriterionName] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');
  const [alternativeName, setAlternativeName] = useState('');
  const [alternativeDescription, setAlternativeDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getById(id!);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await projectAPI.addCriterion(id!, {
        name: criterionName,
        description: criterionDescription,
      });
      
      setCriterionName('');
      setCriterionDescription('');
      setShowCriterionModal(false);
      loadProject();
    } catch (error) {
      console.error('Error adding criterion:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAlternative = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await projectAPI.addAlternative(id!, {
        name: alternativeName,
        description: alternativeDescription,
      });
      
      setAlternativeName('');
      setAlternativeDescription('');
      setShowAlternativeModal(false);
      loadProject();
    } catch (error) {
      console.error('Error adding alternative:', error);
    } finally {
      setSaving(false);
    }
  };

  const canProceedToComparisons = () => {
    return project && project.criteria.length >= 2 && project.alternatives.length >= 2;
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600 mb-4">{project.description}</p>
            )}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Decision Goal:</strong> {project.goal}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 ml-6">
            {canProceedToComparisons() && (
              <Link to={`/projects/${id}/compare`}>
                <Button icon={<Play className="h-4 w-4" />}>
                  Start Comparisons
                </Button>
              </Link>
            )}
            <Link to={`/projects/${id}/results`}>
              <Button variant="outline" icon={<BarChart className="h-4 w-4" />}>
                View Results
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criteria Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Criteria ({project.criteria.length})
              </h2>
              <Button
                size="sm"
                onClick={() => setShowCriterionModal(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Add Criterion
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Define the factors to evaluate alternatives
            </p>
          </div>
          
          <div className="p-6">
            {project.criteria.length === 0 ? (
              <div className="text-center py-8">
                <BarChart className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">No criteria added yet</p>
                <Button
                  size="sm"
                  onClick={() => setShowCriterionModal(true)}
                  className="mt-3"
                >
                  Add First Criterion
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.criteria.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {criterion.name}
                        </h3>
                        {criterion.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alternatives Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Alternatives ({project.alternatives.length})
              </h2>
              <Button
                size="sm"
                onClick={() => setShowAlternativeModal(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Add Alternative
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add options to choose from
            </p>
          </div>
          
          <div className="p-6">
            {project.alternatives.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">No alternatives added yet</p>
                <Button
                  size="sm"
                  onClick={() => setShowAlternativeModal(true)}
                  className="mt-3"
                >
                  Add First Alternative
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.alternatives.map((alternative, index) => (
                  <div
                    key={alternative.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {alternative.name}
                        </h3>
                        {alternative.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {alternative.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{project.criteria.length}</div>
            <div className="text-sm text-blue-600">Criteria defined</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{project.alternatives.length}</div>
            <div className="text-sm text-green-600">Alternatives added</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{project.comparisons.length}</div>
            <div className="text-sm text-purple-600">Comparisons made</div>
          </div>
        </div>
        
        {!canProceedToComparisons() && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Next steps:</strong> Add at least 2 criteria and 2 alternatives to start making comparisons.
            </p>
          </div>
        )}
      </div>

      {/* Add Criterion Modal */}
      <Modal
        isOpen={showCriterionModal}
        onClose={() => setShowCriterionModal(false)}
        title="Add Criterion"
      >
        <form onSubmit={handleAddCriterion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={criterionName}
              onChange={(e) => setCriterionName(e.target.value)}
              required
              placeholder="e.g., Performance, Price, Portability"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={criterionDescription}
              onChange={(e) => setCriterionDescription(e.target.value)}
              placeholder="Brief description of this criterion..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCriterionModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add Criterion
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Alternative Modal */}
      <Modal
        isOpen={showAlternativeModal}
        onClose={() => setShowAlternativeModal(false)}
        title="Add Alternative"
      >
        <form onSubmit={handleAddAlternative} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={alternativeName}
              onChange={(e) => setAlternativeName(e.target.value)}
              required
              placeholder="e.g., MacBook Pro, Dell XPS, ThinkPad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={alternativeDescription}
              onChange={(e) => setAlternativeDescription(e.target.value)}
              placeholder="Brief description of this alternative..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAlternativeModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add Alternative
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}