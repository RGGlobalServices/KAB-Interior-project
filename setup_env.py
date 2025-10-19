#!/usr/bin/env python3
"""
Environment setup script for deployment
This script sets up environment variables for the application
"""

import os

def setup_environment():
    """Set up environment variables for the application"""
    
    # Set default environment variables if not already set
    if not os.getenv('SECRET_KEY'):
        os.environ['SECRET_KEY'] = 'your-secret-key-here-change-me-in-production'
        print("Set SECRET_KEY environment variable")
    
    if not os.getenv('FLASK_ENV'):
        os.environ['FLASK_ENV'] = 'production'
        print("Set FLASK_ENV environment variable")
    
    if not os.getenv('PORT'):
        os.environ['PORT'] = '10000'
        print("Set PORT environment variable")
    
    # Database configuration
    if not os.getenv('DATABASE_URL'):
        # Use SQLite in /tmp for deployment
        if os.path.exists('/tmp'):
            os.environ['DATABASE_URL'] = 'sqlite:////tmp/interior_design.db'
        else:
            os.environ['DATABASE_URL'] = 'sqlite:///interior_design.db'
        print(f"Set DATABASE_URL environment variable: {os.environ['DATABASE_URL']}")
    
    print("Environment setup completed!")

if __name__ == '__main__':
    setup_environment()
