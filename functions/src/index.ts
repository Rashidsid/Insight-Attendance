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
