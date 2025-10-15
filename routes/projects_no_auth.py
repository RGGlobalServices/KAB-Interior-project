from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Project, ProjectFile, User
import os
from datetime import datetime

projects_no_auth_bp = Blueprint('projects_no_auth', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to get or create a default user
def get_or_create_default_user():
    """Get or create a default user for projects without authentication"""
    try:
        # Try to get the default user first
        user = User.query.filter_by(email='default@example.com').first()
        if user:
            return user
        
        # If default user doesn't exist, create it
        user = User(
            name='Default User',
            email='default@example.com',
            password='default',
            role='user'
        )
        db.session.add(user)
        db.session.commit()
        print(f"Created default user: {user.id}")
        return user
        
    except Exception as e:
        print(f"Error getting/creating default user: {e}")
        return None

@projects_no_auth_bp.route('', methods=['GET'])
def get_projects():
    """Get all projects without authentication"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        print(f"Getting projects for user_id: {user.id}")
        projects = Project.query.filter_by(user_id=user.id).all()
        print(f"Found {len(projects)} projects for user {user.id}")
        return jsonify([p.to_dict() for p in projects]), 200
        
    except Exception as e:
        print(f"Error getting projects: {str(e)}")
        return jsonify({'error': f'Failed to get projects: {str(e)}'}), 500

@projects_no_auth_bp.route('', methods=['POST'])
def create_project():
    """Create a new project without authentication"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        data = request.get_json()
        
        # Debug logging
        print(f"Creating project for user_id: {user.id}")
        print(f"Request data: {data}")
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        name = data.get('name')
        description = data.get('description')
        
        if not all([name, description]):
            return jsonify({'error': 'Name and description are required'}), 400
        
        project = Project(
            name=name,
            description=description,
            user_id=user.id
        )
        
        db.session.add(project)
        db.session.commit()
        
        print(f"Project created successfully: {project.id}")
        return jsonify(project.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating project: {str(e)}")
        return jsonify({'error': f'Failed to create project: {str(e)}'}), 500

@projects_no_auth_bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project without authentication"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        project = Project.query.filter_by(id=project_id, user_id=user.id).first()
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        return jsonify(project.to_dict()), 200
        
    except Exception as e:
        print(f"Error getting project: {str(e)}")
        return jsonify({'error': f'Failed to get project: {str(e)}'}), 500

@projects_no_auth_bp.route('/<int:project_id>/upload', methods=['POST'])
def upload_file(project_id):
    """Upload a file to a project without authentication"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        project = Project.query.filter_by(id=project_id, user_id=user.id).first()
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF and Excel files allowed'}), 400
        
        # Secure filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        # Save file
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        file_type = 'pdf' if file_ext == 'pdf' else 'excel'
        
        # Create file record
        project_file = ProjectFile(
            name=filename,
            file_type=file_type,
            file_path=unique_filename,
            file_size=os.path.getsize(file_path),
            project_id=project_id
        )
        
        db.session.add(project_file)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file': project_file.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error uploading file: {str(e)}")
        return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500

@projects_no_auth_bp.route('/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project without authentication"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        project = Project.query.filter_by(id=project_id, user_id=user.id).first()
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Delete associated files
        for file in project.files:
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.file_path)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Project deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting project: {str(e)}")
        return jsonify({'error': f'Failed to delete project: {str(e)}'}), 500

# Health check for no-auth endpoints
@projects_no_auth_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for no-auth projects API"""
    try:
        user = get_or_create_default_user()
        if not user:
            return jsonify({'error': 'Could not create default user'}), 500
        
        projects_count = Project.query.filter_by(user_id=user.id).count()
        
        return jsonify({
            'status': 'ok',
            'user_id': user.id,
            'user_name': user.name,
            'projects_count': projects_count,
            'message': 'No-auth projects API is working'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'message': 'No-auth projects API has issues'
        }), 500
