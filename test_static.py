#!/usr/bin/env python3
"""
Test script to verify static files are properly configured
"""

import os
import sys

def test_static_files():
    """Test if static files exist and are accessible"""
    print("Testing static file configuration...")
    
    # Check current directory
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # List all files in current directory
    print("\nFiles in current directory:")
    try:
        files = os.listdir('.')
        for file in sorted(files):
            print(f"  {file}")
    except Exception as e:
        print(f"Error listing current directory: {e}")
    
    # Check dist folder
    dist_path = 'dist'
    print(f"\nChecking {dist_path} folder:")
    if os.path.exists(dist_path):
        print(f"[OK] {dist_path} folder exists")
        try:
            dist_files = os.listdir(dist_path)
            print(f"Files in {dist_path}:")
            for file in sorted(dist_files):
                file_path = os.path.join(dist_path, file)
                if os.path.isdir(file_path):
                    print(f"  [DIR] {file}/")
                    try:
                        sub_files = os.listdir(file_path)
                        for sub_file in sorted(sub_files):
                            print(f"    {sub_file}")
                    except Exception as e:
                        print(f"    Error listing {file}: {e}")
                else:
                    print(f"  [FILE] {file}")
        except Exception as e:
            print(f"[ERROR] Error listing {dist_path}: {e}")
    else:
        print(f"[ERROR] {dist_path} folder does not exist")
    
    # Check index.html specifically
    index_path = os.path.join(dist_path, 'index.html')
    print(f"\nChecking {index_path}:")
    if os.path.exists(index_path):
        print(f"[OK] index.html exists")
        try:
            with open(index_path, 'r') as f:
                content = f.read()
                print(f"File size: {len(content)} characters")
                if 'root' in content:
                    print("[OK] Contains 'root' div (React app)")
                else:
                    print("[WARNING] Does not contain 'root' div")
        except Exception as e:
            print(f"[ERROR] Error reading index.html: {e}")
    else:
        print(f"[ERROR] index.html does not exist")
    
    print("\nTest completed!")

if __name__ == '__main__':
    test_static_files()
