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

// Interfaces
export interface Teacher {
  id?: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  subject: string;
  classes: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  status: "Active" | "On Leave";
  photo?: string | null;
  recentAttendance?: AttendanceRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
  time?: string;
}

const COLLECTION_NAME = "teachers";

// Get all teachers
export const getAllTeachers = async (): Promise<Teacher[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

// Get single teacher by ID
export const getTeacherById = async (teacherId: string): Promise<Teacher | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Teacher;
    }
    return null;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    throw error;
  }
};

// Add new teacher
export const addTeacher = async (teacherData: Teacher): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...teacherData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding teacher:", error);
    throw error;
  }
};

// Update teacher
export const updateTeacher = async (
  teacherId: string,
  teacherData: Partial<Teacher>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    await updateDoc(docRef, {
      ...teacherData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};

// Delete teacher
export const deleteTeacher = async (teacherId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, teacherId));
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};

// Update teacher attendance
export const updateTeacherAttendance = async (
  teacherId: string,
  attendance: AttendanceRecord[]
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    await updateDoc(docRef, {
      recentAttendance: attendance,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

// Update teacher status
export const updateTeacherStatus = async (
  teacherId: string,
  status: "Active" | "On Leave"
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, teacherId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

// Search teachers
export const searchTeachers = async (searchQuery: string): Promise<Teacher[]> => {
  try {
    const allTeachers = await getAllTeachers();
    const query = searchQuery.toLowerCase();
    
    return allTeachers.filter(
      (teacher) =>
        teacher.firstName.toLowerCase().includes(query) ||
        teacher.lastName.toLowerCase().includes(query) ||
        teacher.teacherId.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query) ||
        teacher.classes.toLowerCase().includes(query)
    );
  } catch (error) {
    console.error("Error searching teachers:", error);
    throw error;
  }
};
