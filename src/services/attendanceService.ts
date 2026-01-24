import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string | Timestamp;
  status: "Present" | "Absent" | "Late";
  time?: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  averageAttendance: number;
  classWiseData: ClassAttendance[];
  monthlyData: MonthlyAttendance[];
  statusData: StatusCount[];
}

export interface ClassAttendance {
  class: string;
  attendance: number;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface MonthlyAttendance {
  month: string;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface StatusCount {
  name: string;
  value: number;
  color: string;
}

const COLLECTION_NAME = "attendance";

// Get all attendance records
export const getAllAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

// Get attendance by date
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", "==", date),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    throw error;
  }
};

// Get attendance by student ID
export const getAttendanceByStudent = async (
  studentId: string
): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    throw error;
  }
};

// Get attendance by class
export const getAttendanceByClass = async (
  className: string
): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("class", "==", className),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    throw error;
  }
};

// Add attendance record
export const addAttendanceRecord = async (
  attendanceData: AttendanceRecord
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...attendanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding attendance record:", error);
    throw error;
  }
};

// Update attendance record
export const updateAttendanceRecord = async (
  recordId: string,
  attendanceData: Partial<AttendanceRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, recordId);
    await updateDoc(docRef, {
      ...attendanceData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }
};

// Delete attendance record
export const deleteAttendanceRecord = async (recordId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, recordId));
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw error;
  }
};

// Calculate attendance statistics
export const calculateAttendanceStats = async (
  records: AttendanceRecord[]
): Promise<AttendanceStats> => {
  const totalPresent = records.filter((r) => r.status === "Present").length;
  const totalAbsent = records.filter((r) => r.status === "Absent").length;
  const totalLate = records.filter((r) => r.status === "Late").length;
  const total = records.length || 1;

  const averageAttendance =
    total > 0 ? Math.round((totalPresent / total) * 100) : 0;

  // Class-wise calculation
  const classMap = new Map<string, any>();
  records.forEach((record) => {
    if (!classMap.has(record.class)) {
      classMap.set(record.class, {
        class: record.class,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }
    const data = classMap.get(record.class);
    data.total += 1;
    if (record.status === "Present") data.present += 1;
    if (record.status === "Absent") data.absent += 1;
    if (record.status === "Late") data.late += 1;
  });

  const classWiseData = Array.from(classMap.values()).map((data) => ({
    ...data,
    attendance: Math.round((data.present / data.total) * 100),
  }));

  // Monthly calculation
  const monthMap = new Map<string, any>();
  records.forEach((record) => {
    const date = record.date instanceof Object && 'toDate' in record.date
      ? (record.date as any).toDate() 
      : new Date(record.date as string);
    const monthKey = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }
    const data = monthMap.get(monthKey);
    data.total += 1;
    if (record.status === "Present") data.present += 1;
    if (record.status === "Absent") data.absent += 1;
    if (record.status === "Late") data.late += 1;
  });

  const monthlyData = Array.from(monthMap.values())
    .map((data) => ({
      ...data,
      percentage: Math.round((data.present / data.total) * 100),
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const statusData: StatusCount[] = [
    { name: "Present", value: totalPresent, color: "#22c55e" },
    { name: "Absent", value: totalAbsent, color: "#ef4444" },
    { name: "Late", value: totalLate, color: "#f59e0b" },
  ];

  return {
    totalPresent,
    totalAbsent,
    totalLate,
    averageAttendance,
    classWiseData,
    monthlyData,
    statusData,
  };
};

// Get daily summary
export const getDailySummary = async (date: string): Promise<any> => {
  try {
    const records = await getAttendanceByDate(date);
    return {
      date,
      total: records.length,
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      late: records.filter((r) => r.status === "Late").length,
      percentage:
        records.length > 0
          ? Math.round(
              (records.filter((r) => r.status === "Present").length /
                records.length) *
                100
            )
          : 0,
      records,
    };
  } catch (error) {
    console.error("Error getting daily summary:", error);
    throw error;
  }
};

// Get class summary
export const getClassSummary = async (className: string): Promise<any> => {
  try {
    const records = await getAttendanceByClass(className);
    const totalRecords = records.length || 1;
    return {
      class: className,
      total: records.length,
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      late: records.filter((r) => r.status === "Late").length,
      percentage: Math.round(
        (records.filter((r) => r.status === "Present").length / totalRecords) *
          100
      ),
      records,
    };
  } catch (error) {
    console.error("Error getting class summary:", error);
    throw error;
  }
};

// Get student summary
export const getStudentSummary = async (studentId: string): Promise<any> => {
  try {
    const records = await getAttendanceByStudent(studentId);
    const totalRecords = records.length || 1;
    return {
      studentId,
      total: records.length,
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      late: records.filter((r) => r.status === "Late").length,
      percentage: Math.round(
        (records.filter((r) => r.status === "Present").length / totalRecords) *
          100
      ),
      records,
    };
  } catch (error) {
    console.error("Error getting student summary:", error);
    throw error;
  }
};
