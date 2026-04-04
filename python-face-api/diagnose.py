#!/usr/bin/env python
"""
Diagnostic script to check Python Face API setup
"""
import os
import sys

print("=" * 60)
print("INSIGHT ATTENDANCE - PYTHON API DIAGNOSTIC")
print("=" * 60)

# Check 1: Faces folder
print("\n[CHECK 1] Faces Folder Structure")
print("-" * 60)
if os.path.exists("faces"):
    print("✓ faces/ folder exists")
    enrolled_students = os.listdir("faces")
    if enrolled_students:
        print(f"✓ Found {len(enrolled_students)} enrolled student(s):")
        for student in enrolled_students:
            photos = os.listdir(os.path.join("faces", student))
            print(f"  - {student}: {len(photos)} photo(s)")
    else:
        print("✗ NO ENROLLED STUDENTS - faces/ folder is empty!")
        print("  → Add a student in admin panel first")
else:
    print("✗ faces/ folder does NOT exist!")
    print("  → Will be created automatically on first enrollment")

# Check 2: Python packages
print("\n[CHECK 2] Required Python Packages")
print("-" * 60)
packages = {
    'flask': 'Flask',
    'flask_cors': 'Flask-CORS',
    'cv2': 'OpenCV',
    'numpy': 'NumPy',
}

for import_name, package_name in packages.items():
    try:
        __import__(import_name)
        print(f"✓ {package_name} is installed")
    except ImportError:
        print(f"✗ {package_name} is NOT installed!")
        print(f"  → Run: pip install -r requirements.txt")

# Check 3: Haar Cascade file
print("\n[CHECK 3] OpenCV Haar Cascade")
print("-" * 60)
try:
    import cv2
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    if os.path.exists(cascade_path):
        print(f"✓ Haar Cascade file found at:")
        print(f"  {cascade_path}")
    else:
        print(f"✗ Haar Cascade file NOT found!")
except:
    print("✗ Could not check Haar Cascade")

# Check 4: Test enrollment manually
print("\n[CHECK 4] Quick Test")
print("-" * 60)
print("To test face enrollment manually:")
print("1. Ensure API is running: python recognize_api.py")
print("2. In another terminal, run:")
print("   python -c \"")
print("   import requests, base64")
print("   with open('path/to/test/photo.jpg', 'rb') as f:")
print("       img_b64 = base64.b64encode(f.read()).decode()")
print("   resp = requests.post('http://localhost:5000/enroll', json={")
print("       'usn': 'TEST001',")
print("       'image': f'data:image/jpeg;base64,{img_b64}'")
print("   })")
print("   print(resp.json())")
print("   \"")

# Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
if os.path.exists("faces") and os.listdir("faces"):
    print("✓ System is ready for face recognition!")
else:
    print("✗ No enrolled students found.")
    print("\nTo fix this:")
    print("1. Go to Admin Panel: http://localhost:5173/admin")
    print("2. Click 'Add Student'")
    print("3. Fill details + UPLOAD A CLEAR PHOTO")
    print("4. Click 'Add Student' button")
    print("5. Check Python API console for enrollment logs")
    print("6. Then test recognition on Homepage")

print("\n" + "=" * 60)
