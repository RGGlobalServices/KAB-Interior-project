import React, { useState, useEffect } from 'react';
import { projectsNoAuthAPI } from '../services/api-no-auth';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const DashboardNoAuth = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsNoAuthAPI.getAll();
      setProjects(response.data);
      console.log('Projects loaded:', response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load projects.';
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!formData.name.trim()) {
      setToast({ type: 'error', message: 'Project Name is required.' });
      return;
    }

    setCreating(true);
    try {
      const response = await projectsNoAuthAPI.create(formData);
      setProjects([response.data, ...projects]);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setToast({ type: 'success', message: `Project '${response.data.name}' created successfully!` });
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create project.';
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project '${name}'?`)) {
      try {
        await projectsNoAuthAPI.delete(id);
        setProjects(projects.filter(p => p.id !== id));
        setToast({ type: 'success', message: `Project '${name}' deleted successfully.` });
      } catch (error) {
        console.error('Error deleting project:', error);
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to delete project.' });
      }
    }
  };

  const testHealthCheck = async () => {
    try {
      const response = await projectsNoAuthAPI.healthCheck();
      setToast({ type: 'success', message: `Health check passed: ${response.data.message}` });
    } catch (error) {
      setToast({ type: 'error', message: 'Health check failed' });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Projects Dashboard (No Auth Required)
        </h1>
        <p className="text-gray-600">
          This version doesn't require any authentication tokens.
        </p>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Create New Project'}
        </button>
        <button
          onClick={testHealthCheck}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Test Health Check
        </button>
        <button
          onClick={loadProjects}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Refresh Projects
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={creating}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No projects found</p>
            <p>Create your first project to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                      <p>Files: {project.files?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNoAuth;
