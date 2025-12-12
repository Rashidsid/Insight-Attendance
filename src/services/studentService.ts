import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

// Interfaces
export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  class: string;
  section: string;
  dateOfBirth: string;
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
  recentAttendance?: AttendanceRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
}

const COLLECTION_NAME = "students";
const PHOTOS_FOLDER = "student-photos";

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

// Add new student
export const addStudent = async (studentData: Student): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...studentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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

// Upload student photo
export const uploadStudentPhoto = async (
  studentId: string,
  file: File
): Promise<string> => {
  try {
    const fileName = `${studentId}-${Date.now()}`;
    const storageRef = ref(storage, `${PHOTOS_FOLDER}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading photo:", error);
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
