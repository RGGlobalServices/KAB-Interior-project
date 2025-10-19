from flask import Flask, render_template, send_from_directory, jsonify, request, redirect
from werkzeug.exceptions import RequestEntityTooLarge
from dotenv import load_dotenv
import os
import bcrypt
from extensions import db
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, 
           template_folder='templates',
           static_folder='dist',
           static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'simple-secret-key-for-development')

# Database URL - Railway provides DATABASE_URL with postgres:// which needs to be postgresql://
database_url = os.getenv('DATABASE_URL', 'sqlite:///interior_design.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

# For SQLite in deployment, use a writable directory
if database_url.startswith('sqlite:///'):
    # In deployment, use /tmp directory which is writable
    if os.path.exists('/tmp'):
        database_url = 'sqlite:////tmp/interior_design.db'
    else:
        # Fallback to current directory
        database_url = 'sqlite:///interior_design.db'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Initialize extensions
from extensions import db, login_manager, cors

db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'
cors.init_app(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import models after extensions are initialized
from models import User 

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    # For API requests, return JSON 401 instead of redirecting
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Authentication required'}), 401
    # For web requests, redirect to login page
    return redirect('/login')

# Register blueprints
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.annotations import annotations_bp
from routes.qa import qa_bp
from routes.discussions import discussions_bp
from routes.ai_design import ai_design_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(projects_bp, url_prefix='/api/projects')
app.register_blueprint(annotations_bp, url_prefix='/api/annotations')
app.register_blueprint(qa_bp, url_prefix='/api/qa')
app.register_blueprint(discussions_bp, url_prefix='/api/discussions')
app.register_blueprint(ai_design_bp, url_prefix='/api/ai-design')

# Serve uploaded files
@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Login page for web requests
@app.route('/login')
def login_page():
    return send_from_directory(app.static_folder, 'index.html')

# Serve React App
@app.route('/')
def serve_react_app_root():
    try:
        # Debug: Check if static folder and index.html exist
        static_folder_path = app.static_folder
        index_path = os.path.join(static_folder_path, 'index.html')
        
        print(f"Static folder: {static_folder_path}")
        print(f"Looking for index.html at: {index_path}")
        print(f"Static folder exists: {os.path.exists(static_folder_path)}")
        print(f"index.html exists: {os.path.exists(index_path)}")
        
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            # List files in static folder for debugging
            files = []
            if os.path.exists(static_folder_path):
                try:
                    files = os.listdir(static_folder_path)
                    print(f"Files in static folder: {files}")
                except Exception as e:
                    print(f"Error listing static folder: {e}")
                    files = [f"Error: {e}"]
            else:
                print(f"Static folder does not exist: {static_folder_path}")
                
            return jsonify({
                'error': 'Frontend not built',
                'static_folder': static_folder_path,
                'index_exists': os.path.exists(index_path),
                'files': files,
                'current_working_directory': os.getcwd(),
                'all_files_in_root': os.listdir('.') if os.path.exists('.') else []
            }), 500
    except Exception as e:
        print(f"Error serving React app: {e}")
        return jsonify({'error': f'Static file error: {str(e)}'}), 500

@app.route('/<path:path>')
def serve_react_app(path):
    # Check if it's a static file that exists
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # For any other path, serve the React app (for client-side routing)
        return send_from_directory(app.static_folder, 'index.html')

# Health check endpoint
@app.route('/api/health')
def health():
    try:
        # Check database connection
        from models import User
        user_count = User.query.count()
        demo_user = User.query.filter_by(email='demo@example.com').first()
        
        return {
            'status': 'ok',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'port': os.getenv('PORT', '5000'),
            'database_url': 'configured' if os.getenv('DATABASE_URL') else 'sqlite',
            'database_status': 'connected',
            'user_count': user_count,
            'demo_user_exists': demo_user is not None,
            'demo_user_id': demo_user.id if demo_user else None
        }
    except Exception as e:
        return {
            'status': 'error',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'port': os.getenv('PORT', '5000'),
            'database_url': 'configured' if os.getenv('DATABASE_URL') else 'sqlite',
            'database_status': 'error',
            'error': str(e)
        }

# Simple test endpoint
@app.route('/api/test')
def test():
    return {'message': 'App is running successfully!'}

# Error handlers
@app.errorhandler(404)
def not_found(error):
    # Return JSON for API requests, serve React app for others
    if request.path.startswith('/api/'):
        return jsonify(error='Resource not found'), 404
    # For non-API requests, serve the React app
    return send_from_directory(app.static_folder, 'index.html')

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
    print("Starting database initialization...")
    print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    try:
        # Check if tables exist before creating
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            db.create_all()
            print("Database tables created successfully")
        else:
            print(f"Database tables already exist: {existing_tables}")
    except Exception as e:
        print(f"Error checking/creating database tables: {e}")
        # Fallback: try to create tables anyway
        try:
            db.create_all()
            print("Database tables created on fallback")
        except Exception as fallback_e:
            print(f"Fallback table creation also failed: {fallback_e}")
            # If all else fails, continue without database - the app will handle this gracefully
    
    # Create default user if not exists (only if database is working)
    try:
        # Test database connection first
        db.session.execute(db.text('SELECT 1'))
        default_user = User.query.filter_by(email='default@example.com').first()
        if not default_user:
            # Hash the default password properly
            import bcrypt
            hashed_password = bcrypt.hashpw('default123'.encode('utf-8'), bcrypt.gensalt())
            default_user = User(
                name='Default User',
                email='default@example.com',
                password=hashed_password.decode('utf-8'),
                role='user'
            )
            db.session.add(default_user)
            db.session.commit()
            print("Default user created: default@example.com")
        else:
            print("Default user already exists")
    except Exception as e:
        print(f"Error creating default user: {e}")
        print("Continuing without default user - users can register normally")

print("Flask app initialization completed successfully!")

if __name__ == '__main__':
    # Get port from environment, with fallback
    port = os.getenv('PORT', '5000')
    try:
        port = int(port)
    except (ValueError, TypeError):
        print(f"Invalid port '{port}', using default 5000")
        port = 5000
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    print(f"Starting Flask app on port {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)