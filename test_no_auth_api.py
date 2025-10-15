#!/usr/bin/env python3
"""
Test script for the no-auth projects API
"""

import requests
import json

def test_no_auth_api():
    """Test the no-auth projects API endpoints"""
    base_url = "http://localhost:5000/api/projects-no-auth"
    
    print("Testing No-Auth Projects API...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data.get('message')}")
            print(f"   User ID: {data.get('user_id')}")
            print(f"   Projects count: {data.get('projects_count')}")
        else:
            print(f"❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Get Projects
    print("\n2. Testing Get Projects...")
    try:
        response = requests.get(base_url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Found {len(projects)} projects")
            for project in projects:
                print(f"   - {project['name']} (ID: {project['id']})")
        else:
            print(f"❌ Get projects failed: {response.text}")
    except Exception as e:
        print(f"❌ Get projects error: {e}")
    
    # Test 3: Create Project
    print("\n3. Testing Create Project...")
    try:
        project_data = {
            "name": "Test Project from Script",
            "description": "This is a test project created by the test script"
        }
        response = requests.post(base_url, json=project_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            project = response.json()
            print(f"✅ Project created successfully: {project['name']} (ID: {project['id']})")
            project_id = project['id']
        else:
            print(f"❌ Create project failed: {response.text}")
            project_id = None
    except Exception as e:
        print(f"❌ Create project error: {e}")
        project_id = None
    
    # Test 4: Get Specific Project
    if project_id:
        print(f"\n4. Testing Get Specific Project (ID: {project_id})...")
        try:
            response = requests.get(f"{base_url}/{project_id}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                project = response.json()
                print(f"✅ Project retrieved: {project['name']}")
            else:
                print(f"❌ Get specific project failed: {response.text}")
        except Exception as e:
            print(f"❌ Get specific project error: {e}")
    
    # Test 5: Delete Project
    if project_id:
        print(f"\n5. Testing Delete Project (ID: {project_id})...")
        try:
            response = requests.delete(f"{base_url}/{project_id}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"✅ Project deleted successfully")
            else:
                print(f"❌ Delete project failed: {response.text}")
        except Exception as e:
            print(f"❌ Delete project error: {e}")
    
    print("\n" + "=" * 50)
    print("No-Auth API testing completed!")

if __name__ == '__main__':
    test_no_auth_api()
