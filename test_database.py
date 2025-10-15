#!/usr/bin/env python3
"""
Test script to verify database and user setup
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database():
    """Test database connection and user setup"""
    print("Testing database connection and user setup...")
    
    try:
        # Import Flask app
        from app import app
        from models import User, Project
        from extensions import db
        
        with app.app_context():
            print("\n1. Testing database connection...")
            
            # Test database connection
            try:
                user_count = User.query.count()
                print(f"✅ Database connected successfully")
                print(f"   Total users in database: {user_count}")
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
                return False
            
            print("\n2. Testing demo user...")
            
            # Check demo user
            demo_user = User.query.filter_by(email='demo@example.com').first()
            if demo_user:
                print(f"✅ Demo user found:")
                print(f"   ID: {demo_user.id}")
                print(f"   Name: {demo_user.name}")
                print(f"   Email: {demo_user.email}")
                print(f"   Role: {demo_user.role}")
            else:
                print("❌ Demo user not found")
                return False
            
            print("\n3. Testing project creation...")
            
            # Test project creation
            try:
                test_project = Project(
                    name='Test Project',
                    description='This is a test project',
                    user_id=demo_user.id
                )
                db.session.add(test_project)
                db.session.commit()
                print(f"✅ Test project created successfully (ID: {test_project.id})")
                
                # Clean up test project
                db.session.delete(test_project)
                db.session.commit()
                print("✅ Test project cleaned up")
                
            except Exception as e:
                print(f"❌ Project creation failed: {e}")
                return False
            
            print("\n4. Testing project queries...")
            
            # Test project queries
            try:
                projects = Project.query.filter_by(user_id=demo_user.id).all()
                print(f"✅ Found {len(projects)} projects for demo user")
            except Exception as e:
                print(f"❌ Project query failed: {e}")
                return False
            
            print("\n✅ All database tests passed!")
            return True
            
    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        return False

if __name__ == '__main__':
    success = test_database()
    sys.exit(0 if success else 1)
