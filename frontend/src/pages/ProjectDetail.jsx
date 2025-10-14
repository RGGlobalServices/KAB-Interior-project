import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, qaAPI, discussionsAPI } from '../services/api';
import { formatDate, formatFileSize, getFileIcon } from '../utils/helpers';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  
  // Q&A State
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Discussion State
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'qa') {
      loadQuestions();
    } else if (activeTab === 'discussion') {
      loadDiscussions();
    }
  }, [activeTab]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      showToast('Failed to load project', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await qaAPI.getByProject(id);
      setQuestions(response.data);
    } catch (error) {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadDiscussions = async () => {
    try {
      setLoadingDiscussions(true);
      const response = await discussionsAPI.getByProject(id);
      setDiscussions(response.data);
    } catch (error) {
      showToast('Failed to load discussions', 'error');
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      await qaAPI.create({ project_id: parseInt(id), question: newQuestion });
      setNewQuestion('');
      showToast('Question submitted! AI is processing...', 'success');
      setTimeout(loadQuestions, 500);
      // Reload after AI response (3 seconds)
      setTimeout(loadQuestions, 3000);
    } catch (error) {
      showToast('Failed to submit question', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await discussionsAPI.create({ project_id: parseInt(id), message: newMessage });
      setNewMessage('');
      loadDiscussions();
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      await projectsAPI.uploadFile(id, formData);
      showToast('File uploaded successfully!', 'success');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      loadProject();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      showToast('Project deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container-responsive py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <p className="text-gray-600">{project.description || 'No description'}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>
                  <i className="fas fa-calendar mr-1"></i>
                  Created {formatDate(project.created_at)}
                </span>
                <span>
                  <i className="fas fa-file mr-1"></i>
                  {project.files?.length || 0} files
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <i className="fas fa-upload"></i>
                Upload File
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <i className="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Files Grid - Only show when files tab is active */}
        {activeTab === 'files' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Files</h2>
            
            {project.files && project.files.length > 0 ? (
              <div className="grid-responsive">
                {project.files.map((file) => (
                  <div key={file.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`fas ${getFileIcon(file.type)} text-2xl`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {file.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(file.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex-1 text-center text-sm py-2"
                      >
                        <i className="fas fa-eye mr-1"></i>
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <i className="fas fa-file-upload text-gray-300 text-5xl mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No files uploaded</h3>
                <p className="text-gray-500 mb-4">Upload your first file to get started</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="btn-primary"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Upload File
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('files')}
            className={`card hover:shadow-lg transition-shadow text-left group ${activeTab === 'files' ? 'ring-2 ring-gray-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-folder text-gray-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Files</h3>
                <p className="text-sm text-gray-500">View uploads</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('annotations')}
            className={`card hover:shadow-lg transition-shadow text-left group ${activeTab === 'annotations' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-pencil-alt text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Annotations</h3>
                <p className="text-sm text-gray-500">CAD Tools</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('qa')}
            className={`card hover:shadow-lg transition-shadow text-left group ${activeTab === 'qa' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-question-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Q&A</h3>
                <p className="text-sm text-gray-500">Ask questions</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('discussion')}
            className={`card hover:shadow-lg transition-shadow text-left group ${activeTab === 'discussion' ? 'ring-2 ring-purple-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-comments text-purple-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Discussion</h3>
                <p className="text-sm text-gray-500">Team chat</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            className={`card hover:shadow-lg transition-shadow text-left group ${activeTab === 'ai' ? 'ring-2 ring-orange-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-robot text-orange-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-500">Get suggestions</p>
              </div>
            </div>
          </button>
        </div>

        {/* Annotations Tab */}
        {activeTab === 'annotations' && (
          <div className="card">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                <i className="fas fa-pencil-alt text-blue-600 mr-2"></i>
                Select a File to Annotate
              </h3>
              <p className="text-gray-600 mb-6">
                Open professional CAD-style editor with advanced tools: measurements, angles, text, drawing tools, and more!
              </p>
              
              {project.files && project.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => navigate(`/project/${id}/annotate/${file.id}`, { state: { file } })}
                      className="card hover:shadow-xl hover:scale-105 transition-all cursor-pointer text-left border-2 border-transparent hover:border-blue-500"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`fas ${getFileIcon(file.type)} text-3xl text-blue-600`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate mb-1">
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(file.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-blue-700 font-medium">
                          <i className="fas fa-pencil-ruler mr-2"></i>
                          Open CAD Editor
                        </span>
                        <i className="fas fa-external-link-alt text-blue-600"></i>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <i className="fas fa-file-upload text-gray-300 text-5xl mb-4"></i>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Files Available</h4>
                  <p className="text-gray-500 mb-4">Upload a file first to start annotating</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-primary"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    Upload File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Q&A - Ask AI About This Project</h3>
            
            {/* Ask Question Form */}
            <form onSubmit={handleAskQuestion} className="mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question about your project..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Ask
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <i className="fas fa-lightbulb mr-1"></i>
                Try asking about dimensions, materials, or design recommendations
              </p>
            </form>

            {/* Questions List */}
            {loadingQuestions ? (
              <LoadingSpinner />
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{q.user_name}</p>
                        <p className="text-gray-700 mt-1">{q.question}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(q.created_at)}</p>
                      </div>
                    </div>
                    
                    {q.answered ? (
                      <div className="flex items-start gap-3 ml-11 mt-3 bg-white rounded-lg p-3 border-l-4 border-green-500">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-robot text-green-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">AI Assistant</p>
                          <p className="text-gray-700 mt-1">{q.answer}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="ml-11 mt-3 text-gray-500 text-sm italic">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        AI is thinking...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-question-circle text-4xl mb-3 block"></i>
                <p>No questions yet. Ask your first question!</p>
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Team Discussion</h3>
            
            {/* Messages List */}
            <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
              {loadingDiscussions ? (
                <LoadingSpinner />
              ) : discussions.length > 0 ? (
                discussions.map((d) => (
                  <div key={d.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user text-purple-600"></i>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{d.user_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(d.created_at)}</p>
                      </div>
                      <p className="text-gray-700">{d.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-comments text-4xl mb-3 block"></i>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="border-t pt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🤖 AI Design Assistant</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎨✨</div>
              <p className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Design Intelligence</p>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Get instant AI-powered design suggestions, color palettes, material recommendations, and cost estimates tailored to your project.
              </p>
              
              <button
                onClick={() => navigate(`/ai-design/${project.id}`)}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                <i className="fas fa-magic"></i>
                Launch AI Design Assistant
              </button>
              
              <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="font-semibold text-blue-900 mb-1">Project Analysis</h4>
                  <p className="text-sm text-blue-800">Comprehensive AI analysis of your design</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold text-purple-900 mb-1">Color Palettes</h4>
                  <p className="text-sm text-purple-800">AI-generated color schemes for any style</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏗️</div>
                  <h4 className="font-semibold text-green-900 mb-1">Materials</h4>
                  <p className="text-sm text-green-800">Smart material & finish recommendations</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="font-semibold text-orange-900 mb-1">Cost Estimates</h4>
                  <p className="text-sm text-orange-800">AI-powered budget planning & estimation</p>
                </div>
              </div>
              
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 max-w-2xl mx-auto text-left">
                <p className="text-sm text-yellow-900">
                  <strong>⚡ Real-time AI:</strong> Powered by OpenAI's GPT-4, providing professional-grade design insights based on your actual project files and requirements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        title="Upload File"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4 block"></i>
              <p className="text-gray-700 font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Click to select file'}
              </p>
              <p className="text-sm text-gray-500">
                Supported: PDF, Excel, Images (Max 50MB)
              </p>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

