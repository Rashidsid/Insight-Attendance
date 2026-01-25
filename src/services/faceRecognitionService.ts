import { db } from '../config/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const PYTHON_API_URL = 'http://localhost:5000';

export interface RecognitionResult {
  id: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
  class: string;
  section: string;
  role: 'student' | 'teacher';
  photo?: string;
  matched: boolean;
  confidence: number;
  timestamp: string;
}

/**
 * Convert video frame to base64 image data URL
 */
export const captureVideoFrameAsBase64 = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg');
};

/**
 * Send image to Python API for face recognition
 */
export const recognizeFromPythonAPI = async (
  base64Image: string
): Promise<{ usn: string; confidence: number } | null> => {
  try {
    // Fetch all enrolled faces from Firestore
    console.log('[DEBUG] Fetching enrolled faces from Firestore');
    const faceDataCollection = collection(db, 'faceData');
    const faceQuerySnapshot = await getDocs(faceDataCollection);
    
    const enrolledFaces: { [usn: string]: string } = {};
    faceQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('[DEBUG] Found enrolled face for USN:', data.usn, 'Data keys:', Object.keys(data));
      enrolledFaces[data.usn] = data.faceBase64;
    });
    
    console.log('[DEBUG] Found enrolled faces count:', Object.keys(enrolledFaces).length);
    console.log('[DEBUG] Enrolled face USNs:', Object.keys(enrolledFaces));
    
    const response = await fetch(`${PYTHON_API_URL}/recognize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        enrolledFaces: enrolledFaces, // Send face data from database
      }),
    });
    
    console.log('[DEBUG] Sent to Python API. Enrolled faces count:', Object.keys(enrolledFaces).length);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if face was detected
    if (data.usn === 'No face detected') {
      return null;
    }

    return {
      usn: data.usn,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('Error calling Python API:', error);
    throw error;
  }
};

/**
 * Enroll a student face to Python API and store in Firestore
 */
export const enrollStudentFace = async (usn: string, base64Image: string): Promise<boolean> => {
  try {
    console.log('[DEBUG] Enrolling face for USN:', usn);
    console.log('[DEBUG] Base64 image length:', base64Image.length);
    console.log('[DEBUG] Calling Python API at:', `${PYTHON_API_URL}/enroll`);
    
    const response = await fetch(`${PYTHON_API_URL}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usn: usn,
        image: base64Image,
      }),
    });

    console.log('[DEBUG] Response status:', response.status);
    console.log('[DEBUG] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] Error response:', errorText);
      throw new Error(`Enrollment API error: ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('[DEBUG] Enrollment response:', responseData);
    
    // Store face data in Firestore for future recognition
    if (responseData.faceBase64) {
      try {
        // Create or update face data collection in Firestore
        const faceDataCollection = collection(db, 'faceData');
        await addDoc(faceDataCollection, {
          usn: usn,
          faceBase64: responseData.faceBase64,
          enrolledAt: new Date()
          // Only store extracted face ROI, not entire original image (to stay under 1MB limit)
        });
        console.log('[DEBUG] Face data stored in Firestore');
      } catch (dbError) {
        console.warn('[WARN] Could not store face data in Firestore:', dbError);
        // Continue anyway, face is still available from filesystem
      }
    }
    
    console.log('[SUCCESS] Student enrolled successfully for face recognition');
    return true;
  } catch (error) {
    console.error('[ERROR] Error enrolling student face:', error);
    throw error;
  }
};

/**
 * Main face recognition function using Python API
 */
export const recognizeFaceFromVideo = async (
  videoElement: HTMLVideoElement
): Promise<RecognitionResult | null> => {
  try {
    // Capture video frame as base64
    const base64Image = captureVideoFrameAsBase64(videoElement);

    // Send to Python API for recognition
    const result = await recognizeFromPythonAPI(base64Image);

    if (!result) {
      // No face detected or recognized
      return {
        id: '',
        firstName: '',
        lastName: '',
        rollNo: '',
        email: '',
        class: '',
        section: '',
        role: 'student',
        matched: false,
        confidence: 0,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    const usn = result.usn;

    // Query Firestore for student by roll number
    let person = await queryStudentByRollNo(usn);

    if (!person) {
      // Try as teacher employee ID
      person = await queryTeacherByEmployeeId(usn);
    }

    if (person) {
      return {
        id: person.id,
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        rollNo: person.rollNo || person.employeeId || '',
        email: person.email || '',
        class: person.class || person.department || '',
        section: person.section || person.designation || '',
        role: person.role || (person.rollNo ? 'student' : 'teacher'),
        photo: person.photo,
        matched: true,
        confidence: result.confidence,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Person not found in database
    return {
      id: '',
      firstName: '',
      lastName: '',
      rollNo: usn,
      email: '',
      class: '',
      section: '',
      role: 'student',
      matched: false,
      confidence: result.confidence,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error('Error in face recognition:', error);
    throw error;
  }
};

/**
 * Query student by roll number from Firestore
 */
const queryStudentByRollNo = async (rollNo: string): Promise<any | null> => {
  try {
    const q = query(collection(db, 'students'), where('rollNo', '==', rollNo));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error querying student:', error);
    return null;
  }
};

/**
 * Query teacher by employee ID from Firestore
 */
const queryTeacherByEmployeeId = async (employeeId: string): Promise<any | null> => {
  try {
    const q = query(collection(db, 'teachers'), where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error querying teacher:', error);
    return null;
  }
};

/**
 * Get all students with photos from Firestore
 */
export const getAllStudentsWithPhotos = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const students = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

/**
 * Get all teachers with photos from Firestore
 */
export const getAllTeachersWithPhotos = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'teachers'));
    const teachers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return teachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
};

/**
 * Check if Python API is accessible
 */
export const checkPythonAPIAvailability = async (): Promise<boolean> => {
  try {
    console.log('[DEBUG] Checking Python API availability at:', `${PYTHON_API_URL}/health`);
    const response = await fetch(`${PYTHON_API_URL}/health`, {
      method: 'GET',
    });
    console.log('[DEBUG] Health check response status:', response.status);
    const isAvailable = response.ok;
    console.log('[DEBUG] API is available:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('[ERROR] Python API not available:', error);
    return false;
  }
};

