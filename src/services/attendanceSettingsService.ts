import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface AttendanceSettings {
  workStartTime: string; // Format: "HH:MM" (e.g., "10:00")
  workEndTime: string; // Format: "HH:MM" (e.g., "16:00")
  lateTimeAllowed: number; // Minutes (e.g., 15, 20)
  timezone: string; // e.g., "Asia/Karachi"
  holidays: string[]; // Array of dates in "YYYY-MM-DD" format
  institutionName: string;
  institutionCode: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const SETTINGS_DOC_ID = 'institution-settings';
const SETTINGS_COLLECTION = 'settings';

/**
 * Get current attendance settings
 */
export async function getAttendanceSettings(): Promise<AttendanceSettings | null> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snapshot = await getDoc(settingsRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as AttendanceSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting attendance settings:', error);
    throw error;
  }
}

/**
 * Create or update attendance settings
 */
export async function updateAttendanceSettings(
  settings: Partial<AttendanceSettings>
): Promise<void> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snapshot = await getDoc(settingsRef);

    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
    };

    if (snapshot.exists()) {
      // Update existing settings
      await updateDoc(settingsRef, updatedSettings);
    } else {
      // Create new settings
      await setDoc(settingsRef, {
        workStartTime: settings.workStartTime || '09:00',
        workEndTime: settings.workEndTime || '17:00',
        lateTimeAllowed: settings.lateTimeAllowed || 15,
        timezone: settings.timezone || 'Asia/Karachi',
        holidays: settings.holidays || [],
        institutionName: settings.institutionName || 'My Institution',
        institutionCode: settings.institutionCode || 'INST001',
        address: settings.address || '',
        email: settings.email || '',
        phone: settings.phone || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating attendance settings:', error);
    throw error;
  }
}

/**
 * Get just work hours
 */
export async function getWorkHours(): Promise<{ start: string; end: string } | null> {
  try {
    const settings = await getAttendanceSettings();
    if (settings) {
      return {
        start: settings.workStartTime,
        end: settings.workEndTime,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting work hours:', error);
    throw error;
  }
}

/**
 * Get late time allowed in minutes
 */
export async function getLateTimeAllowed(): Promise<number> {
  try {
    const settings = await getAttendanceSettings();
    return settings?.lateTimeAllowed || 15;
  } catch (error) {
    console.error('Error getting late time allowed:', error);
    throw error;
  }
}

/**
 * Get holidays array
 */
export async function getHolidays(): Promise<string[]> {
  try {
    const settings = await getAttendanceSettings();
    return settings?.holidays || [];
  } catch (error) {
    console.error('Error getting holidays:', error);
    throw error;
  }
}

/**
 * Add a holiday date
 */
export async function addHoliday(date: string): Promise<void> {
  try {
    const settings = await getAttendanceSettings();
    const holidays = settings?.holidays || [];

    if (!holidays.includes(date)) {
      holidays.push(date);
      await updateAttendanceSettings({ holidays });
    }
  } catch (error) {
    console.error('Error adding holiday:', error);
    throw error;
  }
}

/**
 * Remove a holiday date
 */
export async function removeHoliday(date: string): Promise<void> {
  try {
    const settings = await getAttendanceSettings();
    const holidays = settings?.holidays || [];

    const filtered = holidays.filter((h) => h !== date);
    await updateAttendanceSettings({ holidays: filtered });
  } catch (error) {
    console.error('Error removing holiday:', error);
    throw error;
  }
}

/**
 * Check if a specific date is a holiday
 */
export async function isHoliday(date: string): Promise<boolean> {
  try {
    const holidays = await getHolidays();
    return holidays.includes(date);
  } catch (error) {
    console.error('Error checking holiday:', error);
    throw error;
  }
}

/**
 * Update work hours
 */
export async function updateWorkHours(
  startTime: string,
  endTime: string
): Promise<void> {
  try {
    await updateAttendanceSettings({
      workStartTime: startTime,
      workEndTime: endTime,
    });
  } catch (error) {
    console.error('Error updating work hours:', error);
    throw error;
  }
}

/**
 * Update late time allowed
 */
export async function updateLateTimeAllowed(minutes: number): Promise<void> {
  try {
    await updateAttendanceSettings({ lateTimeAllowed: minutes });
  } catch (error) {
    console.error('Error updating late time allowed:', error);
    throw error;
  }
}

/**
 * Update holidays array
 */
export async function updateHolidays(holidays: string[]): Promise<void> {
  try {
    await updateAttendanceSettings({ holidays });
  } catch (error) {
    console.error('Error updating holidays:', error);
    throw error;
  }
}
