interface AttendanceRecord {
  date: string;
  status: string;
  time: string;
}

interface StudentReportData {
  name: string;
  rollNo: string;
  class: string;
  section: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  attendance: {
    overall: string;
    thisMonth: string;
    lastMonth: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalDays: number;
  };
  recentAttendance: AttendanceRecord[];
}

interface TeacherReportData {
  name: string;
  teacherId: string;
  subject: string;
  classes: string[];
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  attendance: {
    overall: string;
    thisMonth: string;
    lastMonth: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalDays: number;
  };
  recentAttendance: AttendanceRecord[];
}

export const generateStudentReport = (data: StudentReportData) => {
  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Student Attendance Report - ${data.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      background: white;
      color: #333;
    }
    .report-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #A982D9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .school-name {
      font-size: 28px;
      font-weight: bold;
      color: #A982D9;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 20px;
      color: #666;
      margin-top: 10px;
    }
    .report-date {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #A982D9;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E7D7F6;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 3px solid #A982D9;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-box {
      text-align: center;
      padding: 20px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e9e9e9 100%);
    }
    .stat-box.overall {
      background: linear-gradient(135deg, #A982D9 0%, #8B5FBF 100%);
      color: white;
      grid-column: span 2;
    }
    .stat-box.present {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    .stat-box.absent {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }
    .stat-box.late {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
    }
    .attendance-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .attendance-table th {
      background: #A982D9;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    .attendance-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e5e5;
      font-size: 13px;
    }
    .attendance-table tr:hover {
      background: #f9f9f9;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-present {
      background: #d1fae5;
      color: #065f46;
    }
    .status-absent {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-late {
      background: #fed7aa;
      color: #9a3412;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e5e5;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="school-name">Insight Attendance System</div>
      <div class="report-title">Student Attendance Report</div>
      <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="section">
      <div class="section-title">Student Information</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Full Name</div><div class="info-value">${data.name}</div></div>
        <div class="info-item"><div class="info-label">Roll Number</div><div class="info-value">${data.rollNo}</div></div>
        <div class="info-item"><div class="info-label">Class</div><div class="info-value">${data.class} - ${data.section}</div></div>
        <div class="info-item"><div class="info-label">Gender</div><div class="info-value">${data.gender}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Attendance Statistics</div>
      <div class="stats-container">
        <div class="stat-box overall"><div class="stat-label">Overall Attendance</div><div class="stat-value">${data.attendance.overall}</div></div>
        <div class="stat-box present"><div class="stat-label">Present</div><div class="stat-value">${data.attendance.totalPresent}</div></div>
        <div class="stat-box absent"><div class="stat-label">Absent</div><div class="stat-value">${data.attendance.totalAbsent}</div></div>
        <div class="stat-box late"><div class="stat-label">Late</div><div class="stat-value">${data.attendance.totalLate}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Recent Attendance History</div>
      <table class="attendance-table">
        <thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>
          ${data.recentAttendance.map(record => `
            <tr>
              <td>${record.date}</td>
              <td>${record.time}</td>
              <td><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Insight Attendance System © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `;

  return reportHTML;
};

export const generateTeacherReport = (data: TeacherReportData) => {
  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Teacher Attendance Report - ${data.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 40px; background: white; color: #333; }
    .report-container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #A982D9; padding-bottom: 20px; margin-bottom: 30px; }
    .school-name { font-size: 28px; font-weight: bold; color: #A982D9; margin-bottom: 5px; }
    .report-title { font-size: 20px; color: #666; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #A982D9; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #E7D7F6; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-item { padding: 12px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #A982D9; }
    .info-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 600; color: #333; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e5e5; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="school-name">Smart Attendance Management System</div>
      <div class="report-title">Teacher Attendance Report</div>
    </div>

    <div class="section">
      <div class="section-title">Teacher Information</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Full Name</div><div class="info-value">${data.name}</div></div>
        <div class="info-item"><div class="info-label">Teacher ID</div><div class="info-value">${data.teacherId}</div></div>
      </div>
    </div>

    <div class="footer">
      <p>Smart Attendance Management System © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `;

  return reportHTML;
};

export const downloadReport = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = (html: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
