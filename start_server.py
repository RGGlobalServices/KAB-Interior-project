#!/usr/bin/env python3
"""
Optimized server startup script for deployment
Uses gunicorn as primary server with Flask dev fallback
"""

import os
import sys

def start_with_gunicorn():
    """Start server with gunicorn (recommended for production)"""
    try:
        # Check if we're on Windows - gunicorn doesn't work on Windows
        if sys.platform == 'win32':
            print("Gunicorn is not compatible with Windows - skipping")
            return False
            
        # Check if gunicorn is available before importing
        import importlib.util
        gunicorn_spec = importlib.util.find_spec("gunicorn")
        if gunicorn_spec is None:
            print("Gunicorn not installed - install with: pip install gunicorn")
            return False
            
        # Import gunicorn modules only if available
        try:
            import gunicorn.app.wsgiapp as wsgi  # type: ignore[import-untyped]
            from app import app
        except ImportError as import_err:
            print(f"Gunicorn import failed: {import_err}")
            return False
        
        # Get port from environment, with fallback
        port = os.environ.get('PORT', '5000')
        # Ensure port is a valid integer
        try:
            port = int(port)
        except (ValueError, TypeError):
            print(f"Invalid port '{port}', using default 5000")
            port = 5000
            
        workers = os.environ.get('WORKERS', '2')
        timeout = os.environ.get('TIMEOUT', '120')
        
        sys.argv = [
            'gunicorn', 
            'app:app', 
            '--bind', f'0.0.0.0:{port}', 
            '--workers', workers,
            '--timeout', timeout,
            '--access-logfile', '-',
            '--error-logfile', '-'
        ]
        print(f"Starting server with gunicorn on port {port} with {workers} workers")
        wsgi.run()
        return True
    except ImportError as e:
        print(f"Gunicorn import error: {e}")
        print("Note: Gunicorn is not compatible with Windows")
        return False
    except Exception as e:
        print(f"Error starting with gunicorn: {e}")
        return False

def start_with_waitress():
    """Start server with waitress (Windows-compatible production server)"""
    try:
        from waitress import serve  # type: ignore[import-untyped]
        from app import app
        
        # Get port from environment, with fallback
        port = os.environ.get('PORT', '5000')
        try:
            port = int(port)
        except (ValueError, TypeError):
            print(f"Invalid port '{port}', using default 5000")
            port = 5000
        print(f"Starting server with waitress on port {port}")
        serve(app, host='0.0.0.0', port=port)
        return True
    except ImportError:
        print("Waitress not available")
        return False
    except Exception as e:
        print(f"Error starting with waitress: {e}")
        return False

def start_with_flask_dev():
    """Start server with Flask development server (fallback)"""
    try:
        from app import app
        
        # Get port from environment, with fallback
        port = os.environ.get('PORT', '5000')
        try:
            port = int(port)
        except (ValueError, TypeError):
            print(f"Invalid port '{port}', using default 5000")
            port = 5000
        debug = os.environ.get('FLASK_ENV') == 'development'
        print(f"Starting server with Flask dev server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=debug)
        return True
    except Exception as e:
        print(f"Error starting with Flask dev server: {e}")
        return False

if __name__ == '__main__':
    print("Attempting to start server...")
    
    # Setup environment variables
    try:
        from setup_env import setup_environment
        setup_environment()
    except ImportError:
        print("setup_env.py not found, using existing environment variables")
    
    # Debug environment variables
    print(f"Environment variables:")
    print(f"  PORT: {os.environ.get('PORT', 'NOT SET')}")
    print(f"  FLASK_ENV: {os.environ.get('FLASK_ENV', 'NOT SET')}")
    print(f"  SECRET_KEY: {'SET' if os.environ.get('SECRET_KEY') else 'NOT SET'}")
    print(f"  DATABASE_URL: {os.environ.get('DATABASE_URL', 'NOT SET')}")
    print(f"  PYTHONPATH: {os.environ.get('PYTHONPATH', 'NOT SET')}")
    print(f"  Platform: {sys.platform}")
    
    # Choose server based on platform
    if sys.platform == 'win32':
        # On Windows, try waitress first, then Flask dev server
        if start_with_waitress():
            pass
        elif start_with_flask_dev():
            pass
        else:
            print("Failed to start server with any available method")
            sys.exit(1)
    else:
        # On Unix-like systems, try gunicorn first, then waitress, then Flask dev server
        if start_with_gunicorn():
            pass
        elif start_with_waitress():
            pass
        elif start_with_flask_dev():
            pass
        else:
            print("Failed to start server with any available method")
            sys.exit(1)
