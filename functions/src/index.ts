import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin
admin.initializeApp();

// Configure your Gmail account here
const ADMIN_EMAIL = "alhurfoods@gmail.com"; // Change to your Gmail
const ADMIN_PASSWORD = "Rashidzayn786@$"; // Use Gmail App Password 

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: ADMIN_PASSWORD,
  },
});

// Cloud Function to send emails
export const sendEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
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

    // Send email
    const mailOptions = {
      from: `Attendance System <${ADMIN_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
      replyTo: ADMIN_EMAIL,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${to}`);
    return {
      success: true,
      message: `Email sent to ${to}`,
      type: type,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to send email",
      error
    );
  }
});
