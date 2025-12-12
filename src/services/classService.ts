import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Class {
  id?: string;
  name: string;
  section: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION_NAME = "classes";

// Get all classes
export const getAllClasses = async (): Promise<Class[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Class[];
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Add new class
export const addClass = async (classData: Class): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...classData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

// Update class
export const updateClass = async (
  classId: string,
  classData: Partial<Class>
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, classId), {
      ...classData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

// Delete class
export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, classId));
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// Get unique class names
export const getUniqueClassNames = async (): Promise<string[]> => {
  try {
    const classes = await getAllClasses();
    const names = [...new Set(classes.map(c => c.name))];
    return names.sort();
  } catch (error) {
    console.error("Error fetching class names:", error);
    throw error;
  }
};

// Get sections for a specific class
export const getSectionsForClass = async (className: string): Promise<string[]> => {
  try {
    const classes = await getAllClasses();
    const sections = classes
      .filter(c => c.name === className)
      .map(c => c.section);
    return [...new Set(sections)].sort();
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
};
