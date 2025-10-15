from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db
from models import User
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'message': 'All fields are required'}), 400
    
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400
    
    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user = User(
        name=name,
        email=email,
        password=hashed.decode('utf-8'),
        role='user'
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Log user in
    login_user(user)
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Log user in
    login_user(user)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        }), 200
    else:
        return jsonify({
            'authenticated': False
        }), 200
