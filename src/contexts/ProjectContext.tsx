import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectAPI } from '../services/api';

interface Project {
  id: string;
  title: string;
  description?: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    criteria: number;
    alternatives: number;
  };
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
  createProject: (data: { title: string; description?: string; goal: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectAPI.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: { title: string; description?: string; goal: string }) => {
    const newProject = await projectAPI.create(data);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = async (id: string) => {
    await projectAPI.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const value = {
    projects,
    loading,
    refreshProjects,
    createProject,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}