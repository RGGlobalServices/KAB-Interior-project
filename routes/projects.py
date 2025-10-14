from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models import Project, ProjectFile
import os
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user_id).all()
    return jsonify([p.to_dict() for p in projects]), 200

@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description')
    
    if not all([name, description]):
        return jsonify({'message': 'Name and description are required'}), 400
    
    project = Project(
        name=name,
        description=description,
        user_id=user_id
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    return jsonify(project.to_dict()), 200

@projects_bp.route('/<int:project_id>/upload', methods=['POST'])
@jwt_required()
def upload_file(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file type. Only PDF and Excel files allowed'}), 400
    
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

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    # Delete associated files
    for file in project.files:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'}), 200

