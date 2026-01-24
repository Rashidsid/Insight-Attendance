import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import * as faceapi from "face-api.js";

export interface RecognitionResult {
  id: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
  class: string;
  section: string;
  role: "student" | "teacher";
  photo?: string;
  matched: boolean;
  confidence: number;
  timestamp: string;
}

const STUDENTS_COLLECTION = "students";
const TEACHERS_COLLECTION = "teachers";
const MIN_CONFIDENCE_THRESHOLD = 0.6;

// Initialize face-api models
let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return;
  
  try {
    const MODEL_URL = "/models"; // Ensure face-api models are in public/models folder
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log("Face-API models loaded successfully");
  } catch (error) {
    console.error("Error loading face-api models:", error);
    throw new Error("Failed to load face recognition models");
  }
};

// Capture face descriptor from video element
export const captureFaceDescriptor = async (
  videoElement: HTMLVideoElement
): Promise<Float32Array | null> => {
  try {
    const detections = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      return null;
    }

    return detections.descriptor;
  } catch (error) {
    console.error("Error capturing face descriptor:", error);
    return null;
  }
};

// Get all students with photos from Firestore
export const getAllStudentsWithPhotos = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, STUDENTS_COLLECTION)
    );
    const students = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

// Get all teachers with photos from Firestore
export const getAllTeachersWithPhotos = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, TEACHERS_COLLECTION)
    );
    const teachers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return teachers;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
};

// Get face descriptor from image URL
export const getFaceDescriptorFromUrl = async (
  imageUrl: string
): Promise<Float32Array | null> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    return new Promise((resolve) => {
      img.onload = async () => {
        const detections = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detections) {
          resolve(null);
        } else {
          resolve(detections.descriptor);
        }
      };
      img.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error("Error getting face descriptor from URL:", error);
    return null;
  }
};

// Calculate distance between two face descriptors
export const calculateDistance = (
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number => {
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(distance);
};

// Find best match among stored faces
export const findBestMatch = (
  capturedDescriptor: Float32Array,
  storedDescriptors: { id: string; descriptor: Float32Array; data: any }[]
): { match: any; confidence: number; distance: number } | null => {
  let bestMatch: any = null;
  let minDistance = Infinity;

  storedDescriptors.forEach(({ id, descriptor, data }) => {
    const distance = calculateDistance(capturedDescriptor, descriptor);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = { id, data, distance };
    }
  });

  // Convert distance to confidence score (lower distance = higher confidence)
  // Distance typically ranges from 0 to ~1.5, normalize to 0-1 range
  const confidence = Math.max(0, 1 - minDistance / 1.5);

  if (bestMatch && confidence >= MIN_CONFIDENCE_THRESHOLD) {
    return {
      match: bestMatch.data,
      confidence: Math.round(confidence * 100),
      distance: minDistance,
    };
  }

  return null;
};

// Main face recognition function
export const recognizeFaceFromVideo = async (
  videoElement: HTMLVideoElement
): Promise<RecognitionResult | null> => {
  try {
    // Load models if not already loaded
    if (!modelsLoaded) {
      await loadFaceApiModels();
    }

    // Capture face descriptor from video
    const capturedDescriptor = await captureFaceDescriptor(videoElement);
    if (!capturedDescriptor) {
      throw new Error("No face detected in video");
    }

    // Get all students and teachers
    const [students, teachers] = await Promise.all([
      getAllStudentsWithPhotos(),
      getAllTeachersWithPhotos(),
    ]);

    // Get descriptors for all stored photos
    const storedDescriptors: {
      id: string;
      descriptor: Float32Array;
      data: any;
    }[] = [];

    // Process student photos
    for (const student of students) {
      if (student.photo) {
        const descriptor = await getFaceDescriptorFromUrl(student.photo);
        if (descriptor) {
          storedDescriptors.push({
            id: student.id,
            descriptor,
            data: {
              ...student,
              role: "student",
            },
          });
        }
      }
    }

    // Process teacher photos
    for (const teacher of teachers) {
      if (teacher.photo) {
        const descriptor = await getFaceDescriptorFromUrl(teacher.photo);
        if (descriptor) {
          storedDescriptors.push({
            id: teacher.id,
            descriptor,
            data: {
              ...teacher,
              role: "teacher",
            },
          });
        }
      }
    }

    if (storedDescriptors.length === 0) {
      throw new Error("No stored face data found in database");
    }

    // Find best match
    const matchResult = findBestMatch(capturedDescriptor, storedDescriptors);

    if (matchResult && matchResult.confidence >= 60) {
      const { match, confidence } = matchResult;
      return {
        id: match.id || match.rollNo || "",
        firstName: match.firstName || "",
        lastName: match.lastName || "",
        rollNo: match.rollNo || match.employeeId || "",
        email: match.email || "",
        class: match.class || match.department || "",
        section: match.section || match.designation || "",
        role: match.role,
        photo: match.photo,
        matched: true,
        confidence,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // No match found
    return {
      id: "",
      firstName: "",
      lastName: "",
      rollNo: "",
      email: "",
      class: "",
      section: "",
      role: "student",
      matched: false,
      confidence: 0,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error("Error in face recognition:", error);
    throw error;
  }
};

// Verify if a person's face matches a specific ID
export const verifyFaceMatch = async (
  videoElement: HTMLVideoElement,
  userId: string,
  userRole: "student" | "teacher"
): Promise<boolean> => {
  try {
    if (!modelsLoaded) {
      await loadFaceApiModels();
    }

    const capturedDescriptor = await captureFaceDescriptor(videoElement);
    if (!capturedDescriptor) {
      return false;
    }

    const collection_name =
      userRole === "student" ? STUDENTS_COLLECTION : TEACHERS_COLLECTION;
    const userDoc = await getDocs(
      query(collection(db, collection_name), where("id", "==", userId))
    );

    if (userDoc.empty) {
      return false;
    }

    const userData = userDoc.docs[0].data();
    if (!userData.photo) {
      return false;
    }

    const storedDescriptor = await getFaceDescriptorFromUrl(userData.photo);
    if (!storedDescriptor) {
      return false;
    }

    const distance = calculateDistance(capturedDescriptor, storedDescriptor);
    const confidence = Math.max(0, 1 - distance / 1.5);

    return confidence >= MIN_CONFIDENCE_THRESHOLD;
  } catch (error) {
    console.error("Error verifying face match:", error);
    return false;
  }
};
