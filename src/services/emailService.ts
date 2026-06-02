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

// Interface for attendance report data
interface StudentAttendanceReport {
  email: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  attendance: {
    overall: string;
    thisMonth: string;
    lastMonth: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalDays: number;
  };
  recentAttendance: Array<{
    date: string;
    status: string;
  }>;
}

interface TeacherAttendanceReport {
  email: string;
  name: string;
  teacherId: string;
  subject: string;
  totalStudents: number;
  averageAttendance: string;
  recentData: Array<{
    date: string;
    presentCount: number;
    absentCount: number;
  }>;
}

// Send attendance report to student via email
export const sendStudentAttendanceReport = async (data: { email: string; name: string; reportHTML: string; filename: string }): Promise<EmailResult> => {
  try {
    console.log('[EMAIL] Sending attendance report to student:', data.email);
    
    // Send the pre-generated HTML report as email body
    const emailSent = await sendEmailViaBrevo(
      data.email,
      `Attendance Report - ${data.name}`,
      data.reportHTML
    );

    if (emailSent) {
      console.log('[EMAIL] ✅ Student attendance report sent successfully!');
      return { success: true, method: 'brevo', stored: true };
    } else {
      console.log('[EMAIL] Brevo failed, storing in localStorage');
      const emailPayload = {
        to: data.email,
        subject: `Attendance Report - ${data.name}`,
        html: data.reportHTML,
        type: 'student_report',
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      
      const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
      pendingEmails.push(emailPayload);
      localStorage.setItem('pendingEmails', JSON.stringify(pendingEmails));
      
      return { success: true, method: 'localStorage', stored: true };
    }
  } catch (error) {
    console.error('[EMAIL] Error sending student report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Send attendance report to teacher via email
export const sendTeacherAttendanceReport = async (data: { email: string; name: string; reportHTML: string; filename: string }): Promise<EmailResult> => {
  try {
    console.log('[EMAIL] Sending attendance report to teacher:', data.email);
    
    // Send the pre-generated HTML report as email body
    const emailSent = await sendEmailViaBrevo(
      data.email,
      `Attendance Report - ${data.name}`,
      data.reportHTML
    );

    if (emailSent) {
      console.log('[EMAIL] ✅ Teacher attendance report sent successfully!');
      return { success: true, method: 'brevo', stored: true };
    } else {
      console.log('[EMAIL] Brevo failed, storing in localStorage');
      const emailPayload = {
        to: data.email,
        subject: `Attendance Report - ${data.name}`,
        html: data.reportHTML,
        type: 'teacher_report',
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      
      const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
      pendingEmails.push(emailPayload);
      localStorage.setItem('pendingEmails', JSON.stringify(pendingEmails));
      
      return { success: true, method: 'localStorage', stored: true };
    }
  } catch (error) {
    console.error('[EMAIL] Error sending teacher report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Generate HTML for student attendance report
export const generateStudentReportHTML = (data: StudentAttendanceReport): string => {
  const recentRows = data.recentAttendance.slice(0, 10).map(record => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${record.date}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 600; 
          background-color: ${record.status === 'Present' ? '#D1FAE5' : record.status === 'Absent' ? '#FEE2E2' : '#FEF3C7'};
          color: ${record.status === 'Present' ? '#065F46' : record.status === 'Absent' ? '#7F1D1D' : '#92400E'};">
          ${record.status}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 700px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #A982D9 0%, #9770C8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px; color: #333; }
        .report-title { font-size: 20px; font-weight: 600; margin-bottom: 25px; color: #A982D9; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-card { background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #A982D9; }
        .info-label { font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600; }
        .info-value { font-size: 18px; font-weight: 600; color: #333; margin-top: 5px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .stat-box { background: linear-gradient(135deg, #E0C3FC 0%, #D4A5FF 100%); padding: 20px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 12px; color: #666; font-weight: 600; }
        .stat-value { font-size: 28px; font-weight: 700; color: #333; margin-top: 8px; }
        .table-section { margin-top: 30px; }
        .table-title { font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 2px solid #ddd; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Attendance Report</h1>
          <p>Your Monthly Summary</p>
        </div>
        <div class="content">
          <div class="report-title">Attendance Summary for ${data.name}</div>
          
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Roll Number</div>
              <div class="info-value">${data.rollNo}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Class</div>
              <div class="info-value">${data.class} - ${data.section}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Overall Attendance</div>
              <div class="stat-value">${data.attendance.overall}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Present</div>
              <div class="stat-value">${data.attendance.totalPresent}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Absent</div>
              <div class="stat-value">${data.attendance.totalAbsent}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Late</div>
              <div class="stat-value">${data.attendance.totalLate}</div>
            </div>
          </div>

          <div class="table-section">
            <div class="table-title">Recent Attendance Records</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentRows}
              </tbody>
            </table>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #666;">
            <strong>Note:</strong> This is an automated report generated from the Insight Attendance System. For any queries or discrepancies, please contact your institution's administration.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Insight Attendance System. All rights reserved.</p>
          <p>This email was sent to ${data.email} on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML for teacher attendance report
export const generateTeacherReportHTML = (data: TeacherAttendanceReport): string => {
  const recentRows = data.recentData.slice(0, 10).map(record => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${record.date}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        <span style="background-color: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 4px; font-weight: 600;">
          ${record.presentCount}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        <span style="background-color: #FEE2E2; color: #7F1D1D; padding: 4px 12px; border-radius: 4px; font-weight: 600;">
          ${record.absentCount}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 700px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #A982D9 0%, #9770C8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px; color: #333; }
        .report-title { font-size: 20px; font-weight: 600; margin-bottom: 25px; color: #A982D9; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-card { background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #A982D9; }
        .info-label { font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600; }
        .info-value { font-size: 18px; font-weight: 600; color: #333; margin-top: 5px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .stat-box { background: linear-gradient(135deg, #E0C3FC 0%, #D4A5FF 100%); padding: 20px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 12px; color: #666; font-weight: 600; }
        .stat-value { font-size: 28px; font-weight: 700; color: #333; margin-top: 8px; }
        .table-section { margin-top: 30px; }
        .table-title { font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 2px solid #ddd; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Attendance Report</h1>
          <p>Your Class Summary</p>
        </div>
        <div class="content">
          <div class="report-title">Attendance Summary for ${data.name}</div>
          
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Teacher ID</div>
              <div class="info-value">${data.teacherId}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Subject</div>
              <div class="info-value">${data.subject}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Students</div>
              <div class="stat-value">${data.totalStudents}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Average Attendance</div>
              <div class="stat-value">${data.averageAttendance}</div>
            </div>
          </div>

          <div class="table-section">
            <div class="table-title">Recent Attendance Overview</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Present</th>
                  <th>Absent</th>
                </tr>
              </thead>
              <tbody>
                ${recentRows}
              </tbody>
            </table>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #666;">
            <strong>Note:</strong> This is an automated report generated from the Insight Attendance System. For any queries or discrepancies, please contact the administration.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Insight Attendance System. All rights reserved.</p>
          <p>This email was sent to ${data.email} on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
