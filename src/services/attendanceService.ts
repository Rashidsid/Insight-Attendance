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
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAttendanceSettings } from "./attendanceSettingsService";

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

/**
 * Helper function to convert HH:MM to minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Determine attendance status based on current time and work hours
 * Logic: If marked within (workStartTime + lateTimeAllowed), mark as "Late"
 *        Otherwise, mark as "Present"
 */
async function determineAttendanceStatus(
  currentTimeStr: string // HH:MM format (24-hour)
): Promise<"Present" | "Late"> {
  try {
    // Get settings
    const settings = await getAttendanceSettings();
    
    if (!settings) {
      // If settings not configured, default to "Present"
      return "Present";
    }

    const currentMinutes = timeToMinutes(currentTimeStr.split(":").slice(0, 2).join(":"));
    const workStartMinutes = timeToMinutes(settings.workStartTime);
    const lateTimeThreshold = workStartMinutes + settings.lateTimeAllowed;

    // If arrival time is after (workStartTime + lateTimeAllowed), mark as Present
    // Otherwise, mark as Late
    if (currentMinutes > lateTimeThreshold) {
      return "Present";
    } else {
      return "Late";
    }
  } catch (error) {
    console.error("Error determining attendance status:", error);
    // Default to Present if error
    return "Present";
  }
}

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

/**
 * Count working days (Monday-Friday, excluding holidays) between two dates
 * This used for accurate attendance percentage calculation
 */
export const countWorkingDays = (
  startDate: Date,
  endDate: Date,
  holidays: string[] = []
): number => {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateString = current.toLocaleDateString("en-CA"); // YYYY-MM-DD

    // Skip weekends (0 = Sunday, 6 = Saturday) and holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Calculate attendance statistics with accurate percentage based on working days
 * Formula: (Present + Late) / Total Working Days * 100
 */
export const calculateAttendanceStats = async (
  records: AttendanceRecord[],
  holidays: string[] = []
): Promise<AttendanceStats> => {
  const totalPresent = records.filter((r) => r.status === "Present").length;
  const totalAbsent = records.filter((r) => r.status === "Absent").length;
  const totalLate = records.filter((r) => r.status === "Late").length;

  // Get date range from records
  let minDate = new Date();
  let maxDate = new Date();
  let hasRecords = false;

  records.forEach((record) => {
    hasRecords = true;
    const date = record.date instanceof Object && 'toDate' in record.date
      ? (record.date as any).toDate()
      : new Date(record.date as string);

    if (date < minDate) minDate = date;
    if (date > maxDate) maxDate = date;
  });

  // If no records, return zero stats
  if (!hasRecords) {
    return {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      averageAttendance: 0,
      classWiseData: [],
      monthlyData: [],
      statusData: [],
    };
  }

  // Calculate working days in the date range
  const workingDays = countWorkingDays(minDate, maxDate, holidays);
  const totalWorkingDays = Math.max(workingDays, 1); // Avoid division by zero

  // Accurate percentage: (Present + Late) / Working Days
  const averageAttendance =
    totalWorkingDays > 0
      ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100)
      : 0;

  // Class-wise calculation with accurate percentages
  const classMap = new Map<string, any>();
  records.forEach((record) => {
    if (!classMap.has(record.class)) {
      classMap.set(record.class, {
        class: record.class,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        dates: new Set<string>(),
      });
    }
    const data = classMap.get(record.class);
    data.total += 1;
    if (record.status === "Present") data.present += 1;
    if (record.status === "Absent") data.absent += 1;
    if (record.status === "Late") data.late += 1;
    // Track unique dates per class
    const dateString = record.date instanceof Object && 'toDate' in record.date
      ? (record.date as any).toDate().toLocaleDateString("en-CA")
      : typeof record.date === 'string'
        ? record.date
        : new Date(record.date).toLocaleDateString("en-CA");
    data.dates.add(dateString);
  });

  const classWiseData = Array.from(classMap.values()).map((data) => {
    // For each class, calculate working days in their date range
    const classDates = (Array.from(data.dates) as string[]).map((d) => new Date(d));
    const classMinDate = new Date(Math.min(...classDates.map((d) => d.getTime())));
    const classMaxDate = new Date(Math.max(...classDates.map((d) => d.getTime())));
    const classWorkingDays = Math.max(
      countWorkingDays(classMinDate, classMaxDate, holidays),
      1
    );

    return {
      class: data.class,
      present: data.present,
      absent: data.absent,
      late: data.late,
      total: data.total,
      workingDays: classWorkingDays,
      attendance: Math.round(((data.present + data.late) / classWorkingDays) * 100),
    };
  });

  // Monthly calculation with accurate percentages
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
        dates: new Set<string>(),
      });
    }
    const data = monthMap.get(monthKey);
    data.total += 1;
    if (record.status === "Present") data.present += 1;
    if (record.status === "Absent") data.absent += 1;
    if (record.status === "Late") data.late += 1;
    data.dates.add(date.toLocaleDateString("en-CA"));
  });

  const monthlyData = Array.from(monthMap.values())
    .map((data) => {
      const monthDates = (Array.from(data.dates) as string[]).map((d) => new Date(d));
      const monthMinDate = new Date(Math.min(...monthDates.map((d) => d.getTime())));
      const monthMaxDate = new Date(Math.max(...monthDates.map((d) => d.getTime())));
      const monthWorkingDays = Math.max(
        countWorkingDays(monthMinDate, monthMaxDate, holidays),
        1
      );

      return {
        month: data.month,
        present: data.present,
        absent: data.absent,
        late: data.late,
        total: data.total,
        workingDays: monthWorkingDays,
        percentage: Math.round(((data.present + data.late) / monthWorkingDays) * 100),
      };
    })
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

/**
 * Mark attendance for student via face recognition
 */
/**
 * Mark attendance for teacher via face recognition
 */
export const markTeacherAttendanceViaFaceRecognition = async (
  teacherId: string,
  teacherName: string,
  confidence: number
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[DEBUG] markTeacherAttendanceViaFaceRecognition called with:', { teacherId, teacherName, confidence });
    
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    
    // Extract HH:MM for status determination
    const currentTimeHHMM = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log('[DEBUG] Today:', today, 'Time:', currentTime);

    // Check if already marked today
    const q = query(
      collection(db, "teacher_attendance"),
      where("teacherId", "==", teacherId),
      where("date", "==", today)
    );
    const existingRecords = await getDocs(q);

    if (existingRecords.size > 0) {
      console.log('[WARN] Attendance already marked today for teacher:', teacherId);
      return {
        success: false,
        message: "Attendance already marked for today!",
      };
    }

    // Determine attendance status based on current time and late time allowed
    const attendanceStatus = await determineAttendanceStatus(currentTimeHHMM);
    console.log('[DEBUG] Attendance status determined:', attendanceStatus);

    // Add attendance record to teacher_attendance collection
    const attendanceDocRef = await addDoc(collection(db, "teacher_attendance"), {
      teacherId,
      teacherName,
      date: today,
      time: currentTime,
      status: attendanceStatus,
      recognitionConfidence: Math.round(100 - confidence),
      recognitionMethod: "Face Recognition",
      remarks: `Face recognized with ${Math.round(100 - confidence)}% confidence (${attendanceStatus})`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[DEBUG] Teacher attendance record created:', attendanceDocRef.id);

    // Update teacher document with recent attendance
    const teachersRef = collection(db, "teachers");
    const teacherQ = query(teachersRef, where("id", "==", teacherId));
    const teacherQueryDocs = await getDocs(teacherQ);

    console.log('[DEBUG] Teacher query found:', teacherQueryDocs.size, 'documents');

    let foundTeacher = false;
    if (!teacherQueryDocs.empty) {
      const teacherDoc = teacherQueryDocs.docs[0];
      const existingAttendance = teacherDoc.data()?.recentAttendance || [];
      
      // Append new attendance record and keep last 30 records
      const newAttendanceRecord = {
        date: today,
        time: currentTime,
        status: attendanceStatus,
        confidence: Math.round(100 - confidence),
        recognitionMethod: "Face Recognition",
      };
      
      const updatedAttendance = [newAttendanceRecord, ...existingAttendance].slice(0, 30);

      await updateDoc(teacherDoc.ref, {
        recentAttendance: updatedAttendance,
        lastAttendanceTime: Timestamp.fromDate(new Date()),
        lastAttendanceDate: today,
      });
      
      foundTeacher = true;
      console.log('[DEBUG] Updated teacher record by id field with accumulated attendance');
    }

    // Try updating by document ID if not found by 'id' field
    if (!foundTeacher) {
      try {
        const teacherRef = doc(db, "teachers", teacherId);
        const teacherSnap = await getDoc(teacherRef);
        const existingAttendance = teacherSnap.data()?.recentAttendance || [];
        
        // Append new attendance record and keep last 30 records
        const newAttendanceRecord = {
          date: today,
          time: currentTime,
          status: attendanceStatus,
          confidence: Math.round(100 - confidence),
          recognitionMethod: "Face Recognition",
        };
        
        const updatedAttendance = [newAttendanceRecord, ...existingAttendance].slice(0, 30);

        await updateDoc(teacherRef, {
          recentAttendance: updatedAttendance,
          lastAttendanceTime: Timestamp.fromDate(new Date()),
          lastAttendanceDate: today,
        });
        
        console.log('[DEBUG] Updated teacher record by document ID with accumulated attendance');
      } catch (updateError) {
        console.warn('[WARN] Could not update teacher record:', updateError);
      }
    }

    console.log(`✓ Teacher attendance marked for ${teacherName} at ${currentTime} (${attendanceStatus})`);
    return {
      success: true,
      message: `Attendance marked as ${attendanceStatus} at ${currentTime}`,
    };
  } catch (error) {
    console.error("Error marking teacher attendance via face recognition:", error);
    return {
      success: false,
      message: "Failed to mark attendance. Please try again.",
    };
  }
};

/**
 * Mark attendance for student via face recognition
 */
export const markAttendanceViaFaceRecognition = async (
  studentId: string,
  studentName: string,
  className: string,
  confidence: number
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[DEBUG] markAttendanceViaFaceRecognition called with:', { studentId, studentName, className, confidence });
    
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    
    // Extract HH:MM for status determination
    const currentTimeHHMM = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log('[DEBUG] Today:', today, 'Time:', currentTime);

    // Check if already marked today
    const q = query(
      collection(db, COLLECTION_NAME),
      where("studentId", "==", studentId),
      where("date", "==", today)
    );
    const existingRecords = await getDocs(q);

    if (existingRecords.size > 0) {
      console.log('[WARN] Attendance already marked today for student:', studentId);
      return {
        success: false,
        message: "Attendance already marked for today!",
      };
    }

    // Determine attendance status based on current time and late time allowed
    const attendanceStatus = await determineAttendanceStatus(currentTimeHHMM);
    console.log('[DEBUG] Attendance status determined:', attendanceStatus);

    // Add attendance record
    const attendanceDocRef = await addDoc(collection(db, COLLECTION_NAME), {
      studentId,
      studentName,
      class: className,
      date: today,
      time: currentTime,
      status: attendanceStatus,
      recognitionConfidence: Math.round(100 - confidence), // Lower confidence in API = better match
      recognitionMethod: "Face Recognition",
      remarks: `Face recognized with ${Math.round(100 - confidence)}% confidence (${attendanceStatus})`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[DEBUG] Attendance record created:', attendanceDocRef.id);

    // Update student document with recent attendance
    const studentsRef = collection(db, "students");
    const studentQ = query(studentsRef, where("id", "==", studentId));
    const studentQueryDocs = await getDocs(studentQ);

    console.log('[DEBUG] Student query found:', studentQueryDocs.size, 'documents');

    // If not found by 'id' field, try by document ID
    let foundStudent = false;
    if (!studentQueryDocs.empty) {
      const studentDoc = studentQueryDocs.docs[0];
      const existingAttendance = studentDoc.data()?.recentAttendance || [];
      
      // Append new attendance record and keep last 30 records
      const newAttendanceRecord = {
        date: today,
        time: currentTime,
        status: attendanceStatus,
        confidence: Math.round(100 - confidence),
        recognitionMethod: "Face Recognition",
      };
      
      const updatedAttendance = [newAttendanceRecord, ...existingAttendance].slice(0, 30);

      await updateDoc(studentDoc.ref, {
        recentAttendance: updatedAttendance,
        lastAttendanceTime: Timestamp.fromDate(new Date()),
        lastAttendanceDate: today,
      });
      
      foundStudent = true;
      console.log('[DEBUG] Updated student record by id field with accumulated attendance');
    }

    // Try updating by document ID if not found by 'id' field
    if (!foundStudent) {
      try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        const existingAttendance = studentSnap.data()?.recentAttendance || [];
        
        // Append new attendance record and keep last 30 records
        const newAttendanceRecord = {
          date: today,
          time: currentTime,
          status: attendanceStatus,
          confidence: Math.round(100 - confidence),
          recognitionMethod: "Face Recognition",
        };
        
        const updatedAttendance = [newAttendanceRecord, ...existingAttendance].slice(0, 30);

        await updateDoc(studentRef, {
          recentAttendance: updatedAttendance,
          lastAttendanceTime: Timestamp.fromDate(new Date()),
          lastAttendanceDate: today,
        });
        
        console.log('[DEBUG] Updated student record by document ID with accumulated attendance');
      } catch (updateError) {
        console.warn('[WARN] Could not update student record:', updateError);
        // Don't fail if student update fails, attendance is already recorded
      }
    }

    console.log(`✓ Attendance marked for ${studentName} at ${currentTime}`);
    return {
      success: true,
      message: `Attendance marked successfully at ${currentTime}`,
    };
  } catch (error) {
    console.error("Error marking attendance via face recognition:", error);
    return {
      success: false,
      message: "Failed to mark attendance. Please try again.",
    };
  }
};
/**
 * Calculate personal attendance percentages for different time periods
 * Returns overall, this month, and last month attendance percentages
 */
export const getPersonalAttendanceByPeriod = async (
  personId: string,
  isStudent: boolean = true
): Promise<{
  overall: number;
  thisMonth: number;
  lastMonth: number;
  totalDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}> => {
  try {
    let records: AttendanceRecord[] = [];
    
    if (isStudent) {
      records = await getAttendanceByStudent(personId);
    } else {
      // For teachers, fetch from a similar collection or use a different query
      // For now, we'll use attendance records filtered by the teacher ID
      const q = query(
        collection(db, COLLECTION_NAME),
        where("teacherId", "==", personId)
      );
      const snapshot = await getDocs(q);
      records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AttendanceRecord[];
    }

    // Calculate totals
    const totalPresent = records.filter((r) => r.status === "Present").length;
    const totalLate = records.filter((r) => r.status === "Late").length;
    const totalAbsent = records.filter((r) => r.status === "Absent").length;
    const totalDays = records.length;

    // Helper to convert date string or Timestamp to Date
    const getDateFromRecord = (date: any): Date => {
      if (date instanceof Object && 'toDate' in date) {
        return (date as any).toDate();
      }
      if (typeof date === 'string') {
        return new Date(date);
      }
      return new Date(date);
    };

    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate This Month attendance
    const thisMonthRecords = records.filter((r) => {
      const date = getDateFromRecord(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const thisMonthPresent = thisMonthRecords.filter((r) => r.status === "Present" || r.status === "Late").length;
    const thisMonthTotal = thisMonthRecords.length;
    const thisMonth = thisMonthTotal > 0 ? Math.round((thisMonthPresent / thisMonthTotal) * 100) : 0;

    // Calculate Last Month attendance
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth_M = lastMonthDate.getMonth();
    const lastMonth_Y = lastMonthDate.getFullYear();

    const lastMonthRecords = records.filter((r) => {
      const date = getDateFromRecord(r.date);
      return date.getMonth() === lastMonth_M && date.getFullYear() === lastMonth_Y;
    });

    const lastMonthPresent = lastMonthRecords.filter((r) => r.status === "Present" || r.status === "Late").length;
    const lastMonthTotalDays = lastMonthRecords.length;
    const lastMonthPercentage = lastMonthTotalDays > 0 ? Math.round((lastMonthPresent / lastMonthTotalDays) * 100) : 0;

    // Calculate Overall attendance
    const overall = totalDays > 0 ? Math.round(((totalPresent + totalLate) / totalDays) * 100) : 0;

    return {
      overall,
      thisMonth,
      lastMonth: lastMonthPercentage,
      totalDays,
      totalPresent,
      totalAbsent,
      totalLate,
    };
  } catch (error) {
    console.error("Error calculating personal attendance by period:", error);
    // Return zeros on error
    return {
      overall: 0,
      thisMonth: 0,
      lastMonth: 0,
      totalDays: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
    };
  }
};