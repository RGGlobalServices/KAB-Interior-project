#!/usr/bin/env python3
"""
Robust server startup script for deployment
Handles multiple WSGI server options with fallbacks
"""

import os
import sys

def start_with_waitress():
    """Start server with waitress (recommended for deployment)"""
    try:
        from waitress import serve
        from app import app
        
        port = int(os.environ.get('PORT', 5000))
        print(f"Starting server with waitress on port {port}")
        serve(app, host='0.0.0.0', port=port)
        return True
    except ImportError:
        print("Waitress not available")
        return False
    except Exception as e:
        print(f"Error starting with waitress: {e}")
        return False

def start_with_gunicorn():
    """Start server with gunicorn"""
    try:
        import gunicorn.app.wsgiapp as wsgi
        from app import app
        
        port = os.environ.get('PORT', '5000')
        sys.argv = ['gunicorn', 'app:app', '--bind', f'0.0.0.0:{port}', '--workers', '4']
        print(f"Starting server with gunicorn on port {port}")
        wsgi.run()
        return True
    except ImportError:
        print("Gunicorn not available")
        return False
    except Exception as e:
        print(f"Error starting with gunicorn: {e}")
        return False

def start_with_flask_dev():
    """Start server with Flask development server (fallback)"""
    try:
        from app import app
        
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') == 'development'
        print(f"Starting server with Flask dev server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=debug)
        return True
    except Exception as e:
        print(f"Error starting with Flask dev server: {e}")
        return False

if __name__ == '__main__':
    print("Attempting to start server...")
    
    # Try different server options in order of preference
    if start_with_waitress():
        pass
    elif start_with_gunicorn():
        pass
    elif start_with_flask_dev():
        pass
    else:
        print("Failed to start server with any available method")
        sys.exit(1)
