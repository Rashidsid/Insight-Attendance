import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as cors from "cors";
import * as express from "express";

// Initialize Firebase Admin
admin.initializeApp();

// Configure your Gmail account - Use environment variables in production
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "alhurfoods@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_APP_PASSWORD || "Rashidzayn786@$";

console.log("Email service initialized for:", ADMIN_EMAIL);

// Create email transporter with error handling
let transporter: nodemailer.Transporter;

function initializeTransporter() {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ADMIN_EMAIL,
        pass: ADMIN_PASSWORD,
      },
    });
    console.log("Email transporter initialized successfully");
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
  }
}

// Initialize on startup
initializeTransporter();

// Cloud Function to send emails via Callable
export const sendEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      console.warn("Unauthenticated email request");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { to, subject, html, type } = data;

    // Validate email
    if (!to || !subject || !html) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: to, subject, html"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid email address format"
      );
    }

    if (!transporter) {
      console.error("Email transporter not initialized");
      throw new functions.https.HttpsError(
        "internal",
        "Email service not available"
      );
    }

    // Send email
    const mailOptions = {
      from: `Attendance System <${ADMIN_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
      replyTo: ADMIN_EMAIL,
    };

    console.log(`Attempting to send ${type} email to:`, to);
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return {
      success: true,
      message: `Email sent to ${to}`,
      type: type,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
});

// ============================================
// ATTENDANCE SETTINGS INTERFACE
// ============================================

interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  lateTimeAllowed: number;
  timezone: string;
  holidays: string[];
  institutionName: string;
}

// ============================================
// SINGLE INSTITUTION AUTO-ABSENT MARKING
// ============================================

/**
 * Scheduled function to mark students absent at end of work day
 * Runs hourly to check if current time matches work end time
 */
export const markDailyAbsentees = functions.pubsub
  .schedule("0 * * * *") // Every hour (0 minutes past the hour)
  .timeZone("UTC") // Run in UTC, convert to institution timezone
  .onRun(async (context) => {
    try {
      console.log("📋 [Attendance] Starting daily absent marking process...");
      const db = admin.firestore();

      // Get institution settings
      const settingsDoc = await db.collection("settings").doc("institution-settings").get();

      if (!settingsDoc.exists) {
        console.log("⚠️ Settings not configured yet. Skipping absent marking.");
        return {
          status: "skipped",
          message: "Settings not configured",
        };
      }

      const settings = settingsDoc.data() as AttendanceSettings;
      const { workEndTime, timezone, holidays = [], institutionName } = settings;

      console.log(`📍 Institution: ${institutionName}`);
      console.log(`🕐 Work end time: ${workEndTime}, Timezone: ${timezone}`);

      // Get current time in institution's timezone
      const currentTimeInInstitution = new Date().toLocaleString("en-US", {
        timeZone: timezone,
      });

      const currentDate = new Date(currentTimeInInstitution);
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      const currentTimeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

      const [endHour, endMinute] = workEndTime.split(":").map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      console.log(`⏰ Current time: ${currentTimeString}, End time: ${workEndTime}`);

      // Check if current time is within 1 minute of end time
      const timeDiff = currentTimeInMinutes - endTimeInMinutes;
      const isEndOfDay = timeDiff >= 0 && timeDiff < 2; // Within end time and next minute

      if (!isEndOfDay) {
        console.log("⏭️  Not time for absent marking yet");
        return {
          status: "not_yet",
          message: "Not time for absent marking",
          currentTime: currentTimeString,
          expectedTime: workEndTime,
        };
      }

      console.log("✅ Time to mark absences for today");

      // Get today's date in YYYY-MM-DD format
      const today = currentDate.toLocaleDateString("en-CA");

      // Check if today is a working day (exclude weekends)
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) {
        console.log("📅 Weekend detected, skipping absent marking");
        return {
          status: "skipped",
          message: "Weekend, not a working day",
          date: today,
        };
      }

      // Check if today is a holiday
      if (holidays.includes(today)) {
        console.log("🎉 Holiday detected, skipping absent marking");
        return {
          status: "skipped",
          message: "Holiday, skipping attendance",
          date: today,
        };
      }

      // Get all active students
      const studentsSnapshot = await db
        .collection("students")
        .where("status", "==", "Active")
        .get();

      console.log(`👥 Found ${studentsSnapshot.size} active students`);

      let markedCount = 0;
      const batch = db.batch();

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        const studentId = studentDoc.id;

        // Check if student already has attendance record for today
        const attendanceQuery = await db
          .collection("attendance")
          .where("studentId", "==", studentId)
          .where("date", "==", today)
          .get();

        // If no attendance record exists, create an "Absent" record
        if (attendanceQuery.empty) {
          const newAbsentRecord = {
            studentId: studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            class: student.class,
            section: student.section,
            date: today,
            status: "Absent",
            time: workEndTime,
            remarks: `Auto-marked at end of work day (${workEndTime})`,
            recognitionMethod: "System Auto-Absent",
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          };

          const newDocRef = db.collection("attendance").doc();
          batch.set(newDocRef, newAbsentRecord);

          // Update student's recent attendance
          const recentAttendance = student.recentAttendance || [];
          const updatedAttendance = [
            {
              date: today,
              status: "Absent",
              recognitionMethod: "System Auto-Absent",
              time: workEndTime,
            },
            ...recentAttendance,
          ].slice(0, 30);

          batch.update(studentDoc.ref, {
            recentAttendance: updatedAttendance,
            lastAttendanceDate: today,
            lastAttendanceTime: admin.firestore.Timestamp.now(),
          });

          markedCount++;
        }
      }

      // Commit batch
      if (markedCount > 0) {
        await batch.commit();
        console.log(`✓ Marked ${markedCount} students as absent for ${today}`);
      } else {
        console.log(`ℹ️  No new students to mark as absent`);
      }

      return {
        status: "success",
        message: `Marked ${markedCount} students as absent`,
        date: today,
        markedCount: markedCount,
        institutionName: institutionName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in markDailyAbsentees:", error);
      return {
        status: "error",
        message: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  });

// ============================================
// OPTIONAL: HTTP ENDPOINT FOR MANUAL TRIGGER
// ============================================

/**
 * HTTP endpoint to manually trigger mark absent
 * Loads settings and marks absent for a specific date
 */
export const markAbsentManually = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      // Only allow admin users
      if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Only admins can trigger manual absence marking"
        );
      }

      const { date } = data;

      if (!date) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing date parameter (format: YYYY-MM-DD)"
        );
      }

      const db = admin.firestore();

      // Get settings to access institution info
      const settingsDoc = await db.collection("settings").doc("institution-settings").get();
      const settings = settingsDoc.exists ? settingsDoc.data() as AttendanceSettings : null;

      // Check if it's a valid date
      const checkDate = new Date(date);
      if (isNaN(checkDate.getTime())) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid date format"
        );
      }

      // Get all active students
      const studentsSnapshot = await db
        .collection("students")
        .where("status", "==", "Active")
        .get();

      let markedCount = 0;
      const batch = db.batch();

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        const studentId = studentDoc.id;

        // Check if student already has attendance record for this date
        const attendanceQuery = await db
          .collection("attendance")
          .where("studentId", "==", studentId)
          .where("date", "==", date)
          .get();

        // If no attendance record exists, create an "Absent" record
        if (attendanceQuery.empty) {
          const currentTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const newAbsentRecord = {
            studentId: studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            class: student.class,
            section: student.section,
            date: date,
            status: "Absent",
            time: currentTime,
            remarks: "Manually marked by admin",
            recognitionMethod: "Admin Manual",
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          };

          const newDocRef = db.collection("attendance").doc();
          batch.set(newDocRef, newAbsentRecord);
          markedCount++;
        }
      }

      // Commit batch
      await batch.commit();

      console.log(`✓ Manually marked ${markedCount} students as absent for ${date}`);

      return {
        success: true,
        message: `Marked ${markedCount} students as absent for ${date}`,
        date: date,
        markedCount: markedCount,
      };
    } catch (error) {
      console.error("Error in markAbsentManually:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to mark absents: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
);

