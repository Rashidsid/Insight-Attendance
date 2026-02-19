import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadToCloudinary } from "../config/cloudinary";

// Interfaces
export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  class: string;
  section: string;
  dateOfBirth: string;
  admissionDate: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: "Active" | "Inactive";
  attendance: string;
  photo?: string | null;
  faceImages?: {
    front?: string | null;
    left?: string | null;
    right?: string | null;
    up?: string | null;
    down?: string | null;
  } | null;
  recentAttendance?: AttendanceRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
}

const COLLECTION_NAME = "students";

// Upload image to Cloudinary and return download URL
export const uploadStudentImage = async (
  rollNo: string,
  imageBase64: string,
  imageType: 'photo' | 'front' | 'left' | 'right' | 'up' | 'down'
): Promise<string> => {
  try {
    const imageName = `student-${rollNo}-${imageType}-${Date.now()}`;
    console.log(`[uploadStudentImage] Uploading ${imageType} for student ${rollNo}`);
    
    const downloadURL = await uploadToCloudinary(imageBase64, imageName);
    console.log(`[uploadStudentImage] ${imageType} uploaded successfully:`, downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${imageType} image:`, error);
    throw error;
  }
};

// Get all students
export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get single student by ID
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

// Add new student (receives URLs only, no base64)
export const addStudent = async (studentData: Student): Promise<string> => {
  try {
    // Log what we're about to save to verify no base64
    console.log('[SERVICE] Adding student with data:', {
      rollNo: studentData.rollNo,
      firstName: studentData.firstName,
      photo: studentData.photo ? '[URL]' : null,
      faceImages: studentData.faceImages ? Object.keys(studentData.faceImages) : null,
    });

    const dataToSave: any = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      rollNo: studentData.rollNo,
      class: studentData.class,
      section: studentData.section,
      dateOfBirth: studentData.dateOfBirth,
      admissionDate: studentData.admissionDate,
      gender: studentData.gender,
      email: studentData.email,
      phone: studentData.phone,
      address: studentData.address,
      parentName: studentData.parentName,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      status: studentData.status,
      attendance: studentData.attendance,
      recentAttendance: studentData.recentAttendance || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add photo if it exists and is a string (URL)
    if (studentData.photo && typeof studentData.photo === 'string') {
      dataToSave.photo = studentData.photo;
    }

    // Only add faceImages if they exist and contain only URLs
    if (studentData.faceImages && typeof studentData.faceImages === 'object') {
      const cleanFaceImages: any = {};
      for (const [key, value] of Object.entries(studentData.faceImages)) {
        if (value && typeof value === 'string') {
          cleanFaceImages[key] = value;
        }
      }
      if (Object.keys(cleanFaceImages).length > 0) {
        dataToSave.faceImages = cleanFaceImages;
      }
    }

    console.log('[SERVICE] Saving to Firestore, data keys:', Object.keys(dataToSave));
    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
    console.log('[SERVICE] Student added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

// Update student
export const updateStudent = async (
  studentId: string,
  studentData: Partial<Student>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      ...studentData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    // Delete student document
    await deleteDoc(doc(db, COLLECTION_NAME, studentId));

    // Try to delete photo if exists
    // Note: In practice, you may want to keep photos for records
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

// Update student attendance
export const updateStudentAttendance = async (
  studentId: string,
  attendance: AttendanceRecord[]
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      recentAttendance: attendance,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

// Update student status
export const updateStudentStatus = async (
  studentId: string,
  status: "Active" | "Inactive"
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

// Search students by roll number or name
export const searchStudents = async (searchQuery: string): Promise<Student[]> => {
  try {
    const allStudents = await getAllStudents();
    const query = searchQuery.toLowerCase();
    
    return allStudents.filter(
      (student) =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query) ||
        student.section.toLowerCase().includes(query)
    );
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};
