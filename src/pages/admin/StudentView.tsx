import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Share2, Mail, Download, Phone, MapPin, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { generateStudentReport, downloadReport, printReport } from '../../utils/reportGenerator';

// Default mock student data
const defaultStudentData = {
  id: '1',
  rollNo: 'STU001',
  name: 'Ram Kumar',
  class: '10-A',
  section: 'Science',
  dateOfBirth: '2008-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  email: 'ram@example.com',
  phone: '+91 98765 43210',
  address: '123 Main St, City',
  parentName: 'Raj Kumar',
  parentEmail: 'raj.kumar@example.com',
  parentPhone: '+91 98765 43211',
  admissionDate: '2020-08-01',
  status: 'Active',
  attendance: {
    overall: '92%',
    thisMonth: '95%',
    lastMonth: '89%',
    totalPresent: 220,
    totalAbsent: 18,
    totalLate: 5,
    totalDays: 243,
  },
  recentAttendance: [
    { date: '2025-11-30', status: 'Present', time: '08:45 AM' },
    { date: '2025-11-29', status: 'Present', time: '08:52 AM' },
    { date: '2025-11-28', status: 'Present', time: '08:38 AM' },
    { date: '2025-11-27', status: 'Absent', time: '-' },
    { date: '2025-11-26', status: 'Late', time: '09:15 AM' },
    { date: '2025-11-25', status: 'Present', time: '08:42 AM' },
    { date: '2025-11-24', status: 'Present', time: '08:50 AM' },
  ],
};

export default function StudentView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [studentData, setStudentData] = useState(defaultStudentData);
  const [attendanceRecords, setAttendanceRecords] = useState(studentData.recentAttendance);
  const [status, setStatus] = useState(studentData.status);

  // Load student data from localStorage
  useEffect(() => {
    const storedDetails = localStorage.getItem('studentDetails');
    if (storedDetails) {
      const allStudents = JSON.parse(storedDetails);
      const student = allStudents.find((s: any) => s.id === parseInt(id || '1'));
      if (student) {
        const formattedStudent = {
          ...defaultStudentData,
          id: student.id,
          rollNo: student.rollNo,
          name: `${student.firstName} ${student.lastName}`,
          class: student.class,
          section: student.section,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          email: student.email,
          phone: student.phone,
          address: student.address,
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
          status: student.status,
          attendance: student.attendance,
        };
        setStudentData(formattedStudent);
        setAttendanceRecords(formattedStudent.recentAttendance);
        setStatus(formattedStudent.status);
      }
    }
  }, [id]);

  const handleAttendanceChange = (index: number, newStatus: string) => {
    const updated = [...attendanceRecords];
    updated[index] = { ...updated[index], status: newStatus };
    setAttendanceRecords(updated);
    toast.success(`Attendance updated to ${newStatus}`);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    
    // Save to localStorage to sync with list page
    const statusUpdates = JSON.parse(localStorage.getItem('studentStatusUpdates') || '{}');
    statusUpdates[id || '1'] = newStatus;
    localStorage.setItem('studentStatusUpdates', JSON.stringify(statusUpdates));
    
    toast.success(`Student status updated to ${newStatus}`);
  };

  const handleShareReport = async () => {
    setIsSharing(true);
    const reportHTML = generateStudentReport({
      ...studentData,
      recentAttendance: attendanceRecords
    });
    
    // Simulate sending email with the report
    setTimeout(() => {
      setIsSharing(false);
      toast.success(`Attendance report sent successfully to ${studentData.email}!`, {
        description: 'The report has been delivered to the student\'s email address.',
      });
    }, 2000);
  };

  const handleDownloadReport = () => {
    toast.success('Generating attendance report...');
    const reportHTML = generateStudentReport({
      ...studentData,
      recentAttendance: attendanceRecords
    });
    const filename = `${studentData.name.replace(/ /g, '_')}_Attendance_Report_${new Date().toISOString().split('T')[0]}.html`;
    downloadReport(reportHTML, filename);
  };

  const handlePrintReport = () => {
    const reportHTML = generateStudentReport({
      ...studentData,
      recentAttendance: attendanceRecords
    });
    printReport(reportHTML);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/students')}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <h1>Student Details</h1>
            <p className="text-gray-600 mt-1">View complete student information and attendance</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            className="rounded-xl h-12 gap-2"
          >
            <Download className="w-5 h-5" />
            Download Report
          </Button>
          <Button
            onClick={handleShareReport}
            disabled={isSharing}
            className="bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12 gap-2"
          >
            <Mail className="w-5 h-5" />
            {isSharing ? 'Sending...' : 'Share Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Student Profile */}
        <div className="col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-[#A982D9] to-[#8B5FBF] rounded-2xl p-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur-sm mb-4">
                {studentData.name.charAt(0)}
              </div>
              <h2 className="text-white mb-1">{studentData.name}</h2>
              <p className="text-white/80 mb-4">Roll No: {studentData.rollNo}</p>
              <div className="flex gap-2 w-full">
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Class</p>
                  <p className="text-white">{studentData.class}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Section</p>
                  <p className="text-white">{studentData.section}</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-white/70 text-sm mb-2">Status</p>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className={`w-full border-0 ${
                    status === 'Active'
                      ? 'bg-green-500/30 text-white hover:bg-green-500/40'
                      : 'bg-red-500/30 text-white hover:bg-red-500/40'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">Attendance Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall</p>
                    <p className="text-green-900">Present</p>
                  </div>
                </div>
                <p className="text-2xl text-green-700">{studentData.attendance.overall}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-xl text-blue-700">{studentData.attendance.thisMonth}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Last Month</p>
                  <p className="text-xl text-purple-700">{studentData.attendance.lastMonth}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl text-green-600">{studentData.attendance.totalPresent}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-red-600">{studentData.attendance.totalAbsent}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-orange-600">{studentData.attendance.totalLate}</p>
                  <p className="text-xs text-gray-500">Late</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Attendance */}
        <div className="col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900">{studentData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">{new Date(studentData.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900">{studentData.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 text-red-600 flex items-center justify-center">+</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="text-gray-900">{studentData.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="text-gray-900">{new Date(studentData.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Contact Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-gray-900">{studentData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{studentData.phone}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{studentData.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Name</p>
                  <p className="text-gray-900">{studentData.parentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Phone</p>
                  <p className="text-gray-900">{studentData.parentPhone}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Email</p>
                  <p className="text-gray-900">{studentData.parentEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Recent Attendance History</h3>
            <div className="space-y-3">
              {attendanceRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg">{new Date(record.date).getDate()}</p>
                      <p className="text-xs text-gray-500 uppercase">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </div>
                    <div className="h-10 w-px bg-gray-300" />
                    <div>
                      <p className="text-gray-900">{record.date}</p>
                      <p className="text-sm text-gray-500">{record.time}</p>
                    </div>
                  </div>
                  <Select
                    value={record.status}
                    onValueChange={(value) => handleAttendanceChange(index, value)}
                  >
                    <SelectTrigger className={`w-[120px] border-0 ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : record.status === 'Absent'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
