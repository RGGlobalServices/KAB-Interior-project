from flask import Flask, render_template, send_from_directory, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge
from dotenv import load_dotenv
import os
import bcrypt

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, 
           template_folder='templates',
           static_folder='dist',
           static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# Database URL - Railway provides DATABASE_URL with postgres:// which needs to be postgresql://
database_url = os.getenv('DATABASE_URL', 'sqlite:///interior_design.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Initialize extensions
from extensions import db, login_manager, jwt, cors

db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
jwt.init_app(app)
cors.init_app(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import models after extensions are initialized
from models import User 

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register blueprints
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.annotations import annotations_bp
from routes.qa import qa_bp
from routes.discussions import discussions_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(projects_bp, url_prefix='/api/projects')
app.register_blueprint(annotations_bp, url_prefix='/api/annotations')
app.register_blueprint(qa_bp, url_prefix='/api/qa')
app.register_blueprint(discussions_bp, url_prefix='/api/discussions')

# Serve uploaded files
@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Health check endpoint
@app.route('/api/health')
def health():
    return {
        'status': 'ok',
        'environment': os.getenv('FLASK_ENV', 'development')
    }

# Error handlers
@app.errorhandler(404)
def not_found(error):
    # Return JSON for API requests, HTML for others
    if request.path.startswith('/api/'):
        return jsonify(error='Resource not found'), 404
    return jsonify(error='Page not found'), 404

@app.errorhandler(500)
def internal_error(error):
    # Return JSON for API requests, HTML for others
    if request.path.startswith('/api/'):
        return jsonify(error='Internal server error'), 500
    return jsonify(error='Internal server error'), 500

@app.errorhandler(413)
@app.errorhandler(RequestEntityTooLarge)
def file_too_large(e):
    # This ensures a clean JSON response for file size errors
    return jsonify(error="File is larger than the maximum allowed size (50MB)."), 413

# Create database tables
with app.app_context():
    db.create_all()
    
    # Create demo user if not exists
    # Removed: 'from models import User' since it's now imported above
    # import bcrypt # Moved to top-level imports
    
    demo_user = User.query.filter_by(email='demo@example.com').first()
    if not demo_user:
        hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt())
        demo_user = User(
            name='Demo User',
            email='demo@example.com',
            password=hashed.decode('utf-8'),
            role='user'
        )
        db.session.add(demo_user)
        db.session.commit()
        print("Demo user created: demo@example.com / demo123")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)