from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Discussion, User

discussions_bp = Blueprint('discussions', __name__)

# Helper function to get user ID (defaults to demo user if no token)
def get_current_user_id():
    user_id = get_jwt_identity()
    return user_id if user_id else 1

@discussions_bp.route('/project/<int:project_id>', methods=['GET'])
@jwt_required(optional=True)
def get_discussions(project_id):
    discussions = Discussion.query.filter_by(project_id=project_id).order_by(Discussion.created_at.asc()).all()
    return jsonify([d.to_dict() for d in discussions]), 200

@discussions_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def create_discussion():
    user_id = get_current_user_id()
    data = request.get_json()
    
    project_id = data.get('project_id')
    message = data.get('message')
    
    if not all([project_id, message]):
        return jsonify({'message': 'Project ID and message are required'}), 400
    
    discussion = Discussion(
        project_id=project_id,
        user_id=user_id,
        message=message
    )
    
    db.session.add(discussion)
    db.session.commit()
    
    return jsonify(discussion.to_dict()), 201

