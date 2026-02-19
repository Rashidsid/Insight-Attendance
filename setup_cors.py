#!/usr/bin/env python3
"""Apply CORS configuration to Firebase Storage bucket using gsutil."""

import subprocess
import json
import os

# Define CORS configuration
cors_config = [
    {
        "origin": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
        "method": ["GET", "HEAD", "DELETE"],
        "responseHeader": ["Content-Type"],
        "maxAgeSeconds": 3600
    },
    {
        "origin": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
        "method": ["PUT", "POST", "OPTIONS"],
        "responseHeader": ["Content-Type"],
        "maxAgeSeconds": 3600
    }
]

# Write CORS config to file
cors_file = 'cors_config.json'
with open(cors_file, 'w') as f:
    json.dump(cors_config, f, indent=2)

print(f"Created {cors_file}")
print(f"Contents: {json.dumps(cors_config, indent=2)}")
print("\n" + "="*80)
print("NOTE: You need to apply this manually using Firebase Console or gsutil.")
print("="*80)
print("\nTo apply CORS using gsutil, run:")
print("  gsutil cors set cors_config.json gs://insight-attendance-system.appspot.com")
print("\nOR configure it via Firebase Console:")
print("1. Go to https://console.firebase.google.com/")
print("2. Select 'insight-attendance-system' project")
print("3. Go to Storage > Files")
print("4. Click the bucket menu (...) > Edit CORS configuration")
print("5. Paste the JSON configuration above")
print("\n" + "="*80)
print("Configuration ready in: cors_config.json")
