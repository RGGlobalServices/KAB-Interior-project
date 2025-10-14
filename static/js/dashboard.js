// Dashboard Page JavaScript

// Require authentication
if (!requireAuth()) {
    throw new Error('Authentication required');
}

let projects = [];

// Load user info
const user = getCurrentUser();
if (user) {
    document.getElementById('userName').textContent = user.name;
}

// Load projects
async function loadProjects() {
    try {
        showLoading();
        projects = await apiRequest('/projects', { method: 'GET' });
        renderProjects(projects);
    } catch (error) {
        showToast('Failed to load projects', 'error');
    } finally {
        hideLoading();
    }
}

// Render projects
function renderProjects(projectList) {
    const grid = document.getElementById('projectsGrid');
    
    if (projectList.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-folder text-gray-300 text-6xl mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
                <p class="text-gray-500">Create your first project to get started</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = projectList.map(project => `
        <div class="project-card btn-3d bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all border border-gray-200"
             onclick="window.location.href='/project/${project.id}'">
            <div class="flex items-start gap-4">
                <div class="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    <i class="fas fa-folder text-blue-600 text-3xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold text-gray-900 truncate mb-1">
                        ${project.name}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2 mb-3">
                        ${project.description}
                    </p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>${project.files ? project.files.length : 0} files</span>
                        <span>${formatDate(project.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Search projects
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    const filtered = projects.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    renderProjects(filtered);
}, 300));

// New Project Modal
function openNewProjectModal() {
    document.getElementById('newProjectModal').classList.remove('hidden');
}

function closeNewProjectModal() {
    document.getElementById('newProjectModal').classList.add('hidden');
    document.getElementById('newProjectForm').reset();
}

// Create Project
document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;

    try {
        showLoading();

        const project = await apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });

        showToast('Project created successfully!', 'success');
        closeNewProjectModal();
        loadProjects();

    } catch (error) {
        showToast(error.message || 'Failed to create project', 'error');
    } finally {
        hideLoading();
    }
});

// Load projects on page load
loadProjects();

