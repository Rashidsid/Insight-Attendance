// Email service for sending professional notifications
// Using Brevo SMTP API - Free and allows individual recipients

// Brevo configuration (Free tier: 300 emails/day)
// API Key should be stored in environment variable: VITE_BREVO_API_KEY
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = 'rashidzayn11@gmail.com';
const BREVO_SENDER_NAME = 'Insight Attendance System';

// Function to send email via Brevo API
const sendEmailViaBrevo = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    console.log('[EMAIL] Sending professional email via Brevo to:', to);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
            name: 'Recipient',
          }
        ],
        subject: subject,
        htmlContent: html,
        replyTo: {
          email: BREVO_SENDER_EMAIL,
          name: BREVO_SENDER_NAME,
        }
      })
    });

    if (response.ok || response.status === 201) {
      console.log('[EMAIL] ✅ Email sent successfully via Brevo!');
      return true;
    } else {
      const error = await response.json();
      console.warn('[EMAIL] Brevo response error:', error);
      return false;
    }
  } catch (error) {
    console.warn('[EMAIL] Brevo API call failed:', error);
    return false;
  }
};

interface StudentEmailData {
  email: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  class: string;
  section: string;
  instituteName: string;
}

interface TeacherEmailData {
  email: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  subject: string;
  instituteName: string;
}

interface EmailResult {
  success: boolean;
  method?: string;
  stored?: boolean;
  error?: string;
}

export const notifyStudentCreated = async (data: StudentEmailData): Promise<EmailResult> => {
  try {
    console.log('[EMAIL] Preparing to send student welcome email to:', data.email);
    
    const htmlContent = generateStudentWelcomeHTML(data);
    
    // Try to send via Brevo API
    const emailSent = await sendEmailViaBrevo(
      data.email,
      `Welcome to ${data.instituteName}! - Roll Number: ${data.rollNo}`,
      htmlContent
    );

    if (emailSent) {
      console.log('[EMAIL] ✅ Student welcome email sent successfully!');
      return { success: true, method: 'brevo', stored: true };
    } else {
      console.log('[EMAIL] Brevo failed, trying localStorage backup');
      
      // Fallback: Store in localStorage
      const emailPayload = {
        to: data.email,
        subject: `Welcome to ${data.instituteName}!`,
        html: htmlContent,
        type: 'student',
        timestamp: new Date().toISOString(),
        status: 'pending',
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          rollNo: data.rollNo,
          class: data.class,
          section: data.section,
          instituteName: data.instituteName,
        }
      };
      
      const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
      pendingEmails.push(emailPayload);
      localStorage.setItem('pendingEmails', JSON.stringify(pendingEmails));
      
      console.log('[EMAIL] Email stored in localStorage as backup');
      return { success: true, method: 'localStorage', stored: true };
    }
  } catch (error) {
    console.error('[EMAIL] Error sending student welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const notifyTeacherCreated = async (data: TeacherEmailData): Promise<EmailResult> => {
  try {
    console.log('[EMAIL] Preparing to send teacher welcome email to:', data.email);
    
    const htmlContent = generateTeacherWelcomeHTML(data);
    
    // Try to send via Brevo API
    const emailSent = await sendEmailViaBrevo(
      data.email,
      `Welcome to ${data.instituteName}! - Teacher ID: ${data.teacherId}`,
      htmlContent
    );

    if (emailSent) {
      console.log('[EMAIL] ✅ Teacher welcome email sent successfully!');
      return { success: true, method: 'brevo', stored: true };
    } else {
      console.log('[EMAIL] Brevo failed, trying localStorage backup');
      
      // Fallback: Store in localStorage
      const emailPayload = {
        to: data.email,
        subject: `Welcome to ${data.instituteName}!`,
        html: htmlContent,
        type: 'teacher',
        timestamp: new Date().toISOString(),
        status: 'pending',
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          teacherId: data.teacherId,
          subject: data.subject,
          instituteName: data.instituteName,
        }
      };
      
      const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
      pendingEmails.push(emailPayload);
      localStorage.setItem('pendingEmails', JSON.stringify(pendingEmails));
      
      console.log('[EMAIL] Email stored in localStorage as backup');
      return { success: true, method: 'localStorage', stored: true };
    }
  } catch (error) {
    console.error('[EMAIL] Error sending teacher welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Generate professional HTML email templates
export const generateStudentWelcomeHTML = (data: StudentEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #A982D9 0%, #9770C8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px; color: #333; }
        .welcome { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #A982D9; }
        .info-box { background-color: #f9f9f9; border-left: 4px solid #A982D9; padding: 15px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #666; }
        .info-value { color: #333; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        .button { display: inline-block; background-color: #A982D9; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${data.instituteName}</h1>
          <p>Your Account Has Been Created Successfully</p>
        </div>
        <div class="content">
          <div class="welcome">Dear ${data.firstName} ${data.lastName},</div>
          <p>We are pleased to inform you that your student account has been successfully created in the Insight Attendance System. Here are your account details:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Institution:</span>
              <span class="info-value">${data.instituteName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.firstName} ${data.lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Roll Number:</span>
              <span class="info-value"><strong>${data.rollNo}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Class:</span>
              <span class="info-value">${data.class}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Section:</span>
              <span class="info-value">${data.section}</span>
            </div>
          </div>

          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Your attendance will be tracked daily through the Insight Attendance System</li>
            <li>Keep your roll number safe for future reference</li>
            <li>Contact your institution's administration for any account-related queries</li>
            <li>Regular attendance is essential for maintaining your academic progress</li>
          </ul>

          <p>If you have any questions or need assistance, please contact your institution's administrator.</p>

          <div class="signature">
            <p>Best regards,<br><strong>${data.instituteName}</strong><br>Administration Team</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 Insight Attendance System. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateTeacherWelcomeHTML = (data: TeacherEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #A982D9 0%, #9770C8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px; color: #333; }
        .welcome { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #A982D9; }
        .info-box { background-color: #f9f9f9; border-left: 4px solid #A982D9; padding: 15px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #666; }
        .info-value { color: #333; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        .button { display: inline-block; background-color: #A982D9; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 600; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${data.instituteName}</h1>
          <p>Your Account Has Been Created Successfully</p>
        </div>
        <div class="content">
          <div class="welcome">Dear ${data.firstName} ${data.lastName},</div>
          <p>We are pleased to welcome you to the Insight Attendance System. Your teacher account has been successfully created. Here are your account details:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Institution:</span>
              <span class="info-value">${data.instituteName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.firstName} ${data.lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teacher ID:</span>
              <span class="info-value"><strong>${data.teacherId}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value">${data.subject}</span>
            </div>
          </div>

          <p><strong>Your Role & Responsibilities:</strong></p>
          <ul>
            <li>Access to the Insight Attendance System for marking daily attendance</li>
            <li>View attendance reports for your assigned classes</li>
            <li>Your Teacher ID is your unique identifier in the system</li>
            <li>Please ensure accurate and timely attendance marking</li>
            <li>Contact administration for any technical issues or assistance</li>
          </ul>

          <p>If you have any questions or need technical support, please reach out to your institution's administrator.</p>

          <div class="signature">
            <p>Best regards,<br><strong>${data.instituteName}</strong><br>Administration Team</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 Insight Attendance System. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
