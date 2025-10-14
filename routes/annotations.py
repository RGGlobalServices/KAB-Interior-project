from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Annotation, User

annotations_bp = Blueprint('annotations', __name__)

@annotations_bp.route('/file/<int:file_id>', methods=['GET'])
@jwt_required()
def get_annotations_by_file(file_id):
    annotations = Annotation.query.filter_by(file_id=file_id).all()
    return jsonify([a.to_dict() for a in annotations]), 200

@annotations_bp.route('/project/<int:project_id>', methods=['GET'])
@jwt_required()
def get_annotations_by_project(project_id):
    annotations = Annotation.query.filter_by(project_id=project_id).all()
    return jsonify([a.to_dict() for a in annotations]), 200

@annotations_bp.route('', methods=['POST'])
@jwt_required()
def create_annotation():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    annotation = Annotation(
        project_id=data.get('project_id'),
        file_id=data.get('file_id'),
        user_id=user_id,
        annotation_type=data.get('type'),
        x=data.get('x'),
        y=data.get('y'),
        width=data.get('width'),
        height=data.get('height'),
        text=data.get('text'),
        color=data.get('color'),
        page=data.get('page', 1)
    )
    
    db.session.add(annotation)
    db.session.commit()
    
    return jsonify(annotation.to_dict()), 201

@annotations_bp.route('/<int:annotation_id>', methods=['DELETE'])
@jwt_required()
def delete_annotation(annotation_id):
    user_id = get_jwt_identity()
    annotation = Annotation.query.filter_by(id=annotation_id, user_id=user_id).first()
    
    if not annotation:
        return jsonify({'message': 'Annotation not found'}), 404
    
    db.session.delete(annotation)
    db.session.commit()
    
    return jsonify({'message': 'Annotation deleted'}), 200

