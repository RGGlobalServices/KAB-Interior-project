"""
Quick test script to verify the app runs without errors
"""
import sys

print("Testing Flask application...")
print("-" * 50)

try:
    print("✓ Importing Flask...")
    from flask import Flask
    
    print("✓ Importing extensions...")
    from extensions import db, login_manager, jwt, cors
    
    print("✓ Importing models...")
    from models import User, Project, ProjectFile, Annotation, Question, Discussion
    
    print("✓ Importing app...")
    from app import app
    
    print("\n" + "=" * 50)
    print("✅ SUCCESS! All imports working correctly!")
    print("=" * 50)
    print("\nYou can now run the application with:")
    print("  python app.py")
    print("\nThen visit: http://localhost:5000")
    print("\nLogin with:")
    print("  Email: demo@example.com")
    print("  Password: demo123")
    print("=" * 50)
    
except Exception as e:
    print("\n" + "=" * 50)
    print("❌ ERROR:", str(e))
    print("=" * 50)
    import traceback
    traceback.print_exc()
    sys.exit(1)

