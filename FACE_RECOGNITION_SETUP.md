# Face Recognition Setup Guide

## Overview
The HomePage now has real face recognition integrated with your Firestore database. When a user clicks "Recognize Face", it:
1. Captures face data from the camera using face-api.js
2. Compares it against student and teacher photos in Firestore
3. Returns the matched student/teacher ID and name

## Quick Setup Instructions

### Step 1: Install Face-API Package ✓ (Already Done)
```bash
npm install face-api.js
```

### Step 2: Download Face-API Models (IMPORTANT)
The face recognition models must be downloaded separately and placed in the public folder.

#### Option A: Manual Download (Recommended)
1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download all files from the weights folder
3. Create folder: `public/models/`
4. Copy all downloaded files to `public/models/`

#### Option B: Run Download Script
```powershell
# For Windows
powershell -ExecutionPolicy Bypass -File download_models.ps1

# For Mac/Linux
bash download_models.sh
```

**Note:** If the script fails due to CDN issues, use Option A instead.

### Step 3: Verify Installation
After adding models to `public/models/`, your folder structure should look like:
```
public/
└── models/
    ├── tiny_face_detector_model-weights_manifest.json
    ├── tiny_face_detector_model-weights_shard1
    ├── tiny_face_detector_model-weights_shard2
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-weights_shard1
    ├── face_landmark_68_model-weights_shard2
    ├── face_recognition_model-weights_manifest.json
    ├── face_recognition_model-weights_shard1
    ├── face_recognition_model-weights_shard2
    ├── face_expression_model-weights_manifest.json
    ├── face_expression_model-weights_shard1
    └── face_expression_model-weights_shard2
```

### Step 4: Test the Application
1. Start dev server: `npm run dev`
2. Go to HomePage
3. Click "Activate Camera" 
4. Once models load, you should see face detection working

## How It Works

### On HomePage (User Side):
1. User clicks "Activate Camera"
2. Camera starts and checks for face detection
3. When face is detected, user clicks "Recognize Face"
4. System captures face descriptor from video
5. System searches Firestore database for matching face
6. If match found (>60% confidence), displays student/teacher info:
   - ID / Roll Number
   - First Name & Last Name
   - Role (Student/Teacher)
   - Class/Section or Department/Designation
   - Email

7. If no match, shows "Face does not match any record"

### Face Matching Algorithm:
- Extracts face descriptors (128-dimensional vectors) from both captured and stored photos
- Calculates Euclidean distance between descriptors  
- Confidence score = 1 - (distance / 1.5)
- **Minimum confidence threshold: 60%** (can be adjusted in faceRecognitionService.ts)

## Key Features

✅ Real face recognition using face-api.js (128-dimensional face descriptors)
✅ Matches against all students and teachers in Firestore  
✅ Shows ID, name, role, class/section when matched
✅ Displays confidence score
✅ Error handling for no face detected
✅ Fallback messaging for unrecognized faces
✅ Loads Firestore photos on-demand for matching

## Important Notes

### Photo Requirements
Student/teacher photos should be:
- Clear facial images with face taking up 70-80% of frame
- Well-lit (avoid shadows on face)
- Front-facing (look directly at camera)
- Similar conditions to recognition environment
- JPG or PNG format
- Uploaded through admin panel when creating students/teachers

### Database Structure
Make sure your Firestore collections have:

**Students Collection:**
```
- firstName: string
- lastName: string
- rollNo: string
- email: string
- class: string
- section: string
- photo: string (URL)
```

**Teachers Collection:**
```
- firstName: string
- lastName: string
- employeeId: string
- email: string
- department: string
- designation: string
- photo: string (URL)
```

### Privacy & Security
- Face recognition data is processed locally in browser (no server-side processing)
- Face descriptors are 128-dimensional vectors, not images
- Photos are only loaded from Firestore when needed
- Camera access requires user permission

### Performance Notes
- **First recognition:** ~3-5 seconds (models loading + processing)
- **Subsequent recognitions:** ~1-2 seconds
- Larger photo databases will take slightly longer
- Works best on machines with GPU support

## Troubleshooting

### Models not loading / "Failed to load face-api models"
**Solution:**
- Verify all files are in `public/models/`
- Check browser console (F12) for specific file errors
- If CDN download failed, download manually from GitHub
- Ensure vite is serving static files correctly

### Face not detected
**Solution:**
- Ensure good lighting on your face
- Position face clearly in the blue detection frame
- Move closer to camera (face should be ~30-50cm away)
- Clear camera lens if using laptop camera
- Check browser console for permission errors

### No matches found but face exists in database
**Possible causes:**
- Photo quality difference (lighting, angle)
- Database photo taken at different angle/lighting
- Confidence threshold too high (currently 60%)
- Face descriptor mismatch due to expression changes

**Solutions:**
- Retake database photos in similar environment
- Increase confidence threshold in `faceRecognitionService.ts` line 31:
  ```typescript
  const MIN_CONFIDENCE_THRESHOLD = 0.6; // Change to 0.5 or lower
  ```
- Ensure database photos show clear full face

### Camera not working
- Check browser permissions (Settings > Privacy)
- Ensure HTTPS or localhost (some browsers block HTTP camera)
- Try in different browser
- Check if another app is using camera

### Slow performance
- Close other applications
- Clear browser cache
- Try on machine with better GPU
- Reduce number of photos in database if >1000

## File Structure
```
src/
├── pages/
│   └── user/
│       └── HomePage.tsx (Updated - real face recognition)
├── services/
│   └── faceRecognitionService.ts (New - face matching logic)
└── ...

public/
└── models/ (Add face-api models here - REQUIRED)
```

## Service API Reference

Located in `src/services/faceRecognitionService.ts`:

```typescript
// Load all required models (call once on app start)
await loadFaceApiModels()

// Main recognition function - captures and matches face
const result = await recognizeFaceFromVideo(videoElement)
// Returns: { matched, id, firstName, lastName, role, confidence, ... }

// Verify specific person's face
const isMatch = await verifyFaceMatch(videoElement, userId, "student")
// Returns: boolean

// Get all students with photos
const students = await getAllStudentsWithPhotos()

// Get all teachers with photos  
const teachers = await getAllTeachersWithPhotos()
```

## Next Steps

1. ✅ Install package: `npm install face-api.js`
2. ⏳ Download models and add to `public/models/`
3. ✅ HomePage updated with real recognition
4. ✅ Firestore service integration ready
5. Test with actual student/teacher photos
6. Adjust confidence threshold if needed
7. Deploy to production

## Support

For issues or questions:
- Check browser console logs
- Review Firestore database structure
- Verify model files are accessible
- Test with high-quality photos first
