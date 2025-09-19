import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { Plus, FolderOpen, Calendar, BarChart, Trash2, Edit } from 'lucide-react';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import CreateProjectModal from './CreateProjectModal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Dashboard() {
  const { projects, loading, deleteProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setDeletingProject(id);
      try {
        await deleteProject(id);
      } finally {
        setDeletingProject(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and analyze your decision-making projects
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first AHP project</p>
          <div className="mt-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 block truncate"
                    >
                      {project.title}
                    </Link>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    disabled={deletingProject === project.id}
                    className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {deletingProject === project.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span>{project._count?.criteria || 0} criteria</span>
                  </div>
                  <div className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-1" />
                    <span>{project._count?.alternatives || 0} alternatives</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}