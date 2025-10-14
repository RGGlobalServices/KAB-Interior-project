import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false); // State to manage loading during creation
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      // Extract the actual error message from the backend
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to load projects.';
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null); // Clear previous errors

    // 🎯 FIX 1: Client-side validation to prevent sending empty data
    if (!formData.name.trim()) {
      setToast({ type: 'error', message: 'Project Name is required.' });
      return;
    }

    setCreating(true);
    try {
      const response = await projectsAPI.create(formData);
      setProjects([response.data, ...projects]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      setToast({ type: 'success', message: `Project '${response.data.name}' created successfully!` });
    } catch (error) {
      console.error('Error creating project:', error);
      
      // 🎯 FIX 2: Extract specific error message for 422/other errors
      const errorMessage = error.response?.data?.error || 'Failed to create project. Check server logs.';
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setCreating(false);
    }
  };

  const navigateToProject = (id) => {
    navigate(`/project/${id}`);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project '${name}'? This action cannot be undone.`)) {
      try {
        await projectsAPI.delete(id);
        setProjects(projects.filter(p => p.id !== id));
        setToast({ type: 'success', message: `Project '${name}' deleted successfully.` });
      } catch (error) {
        console.error('Error deleting project:', error);
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to delete project.' });
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          New Project
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search projects by name or description..."
          className="w-full input-field-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 && searchQuery ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">No projects match your search query.</p>
        </div>
      ) : filteredProjects.length === 0 && !searchQuery ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500 mb-4">You don't have any projects yet.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
            >
              <div 
                className="p-6 flex-1 cursor-pointer"
                onClick={() => navigateToProject(project.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 truncate pr-4" title={project.name}>
                    {project.name}
                  </h2>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex-shrink-0">
                    ID: {project.id}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm">
                <div className="text-gray-500">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Created: {formatDate(project.created_at)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProject(project.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Project"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id, project.name);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete Project"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
      }} title="Create New Project">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={creating}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input-field resize-none"
              rows="4"
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={creating}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ name: '', description: '' });
              }}
              className="btn-secondary flex-1"
              disabled={creating}
            >
              Cancel
            </button>
            <button 
                type="submit" 
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={creating}
            >
              {creating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fas fa-plus"></i>
              )}
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;