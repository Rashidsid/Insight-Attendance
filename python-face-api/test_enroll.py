#!/usr/bin/env python3
"""
Simple test script to verify face enrollment works
"""
import requests
import cv2
import base64
import os

PYTHON_API_URL = 'http://localhost:5000'

def test_health():
    """Test if API is running"""
    try:
        response = requests.get(f'{PYTHON_API_URL}/health')
        print(f'Health check: {response.json()}')
        return True
    except Exception as e:
        print(f'Health check failed: {e}')
        return False

def test_enroll_with_image(image_path, usn):
    """Test enrolling a face with an actual image file"""
    try:
        # Read image file
        if not os.path.exists(image_path):
            print(f'Image file not found: {image_path}')
            return False
        
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        
        # Convert to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        print(f'Testing enrollment for USN: {usn}')
        print(f'Image size: {len(image_bytes)} bytes')
        print(f'Base64 size: {len(base64_image)} bytes')
        
        # Send to API
        response = requests.post(
            f'{PYTHON_API_URL}/enroll',
            json={
                'usn': usn,
                'image': base64_image
            }
        )
        
        print(f'Response status: {response.status_code}')
        print(f'Response: {response.json()}')
        
        return response.status_code == 200
    except Exception as e:
        print(f'Enrollment test failed: {e}')
        return False

if __name__ == '__main__':
    print('Starting API tests...')
    
    # Test health
    if not test_health():
        print('API is not running. Please start the API with: python recognize_api.py')
        exit(1)
    
    print('\nAPI is running!')
    
    # Test enrollment with a sample image
    # Try to find a sample image, or create one
    sample_image = None
    
    # Look for any jpg or png file in the current directory or faces folder
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.lower().endswith(('.jpg', '.png', '.jpeg')):
                sample_image = os.path.join(root, file)
                print(f'Found sample image: {sample_image}')
                break
        if sample_image:
            break
    
    if sample_image:
        test_enroll_with_image(sample_image, 'test_user_123')
    else:
        print('No sample image found for testing')
        print('Please provide an image file to test enrollment')
