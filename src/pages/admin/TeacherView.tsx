import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Share2, Mail, Download, Phone, MapPin, Calendar, User, Award, TrendingUp, GraduationCap, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { generateTeacherReport, downloadReport, printReport } from '../utils/reportGenerator';

// Default mock teacher data
const defaultTeacherData = {
  id: '1',
  teacherId: 'TCH001',
  name: 'Ram Kumar',
  subject: 'Mathematics',
  classes: ['10-A', '10-B'],
  dateOfBirth: '1980-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  email: 'ram.kumar@example.com',
  phone: '+91 98765 43210',
  address: '123 Main St, City',
  qualification: 'M.Sc. in Mathematics',
  experience: '15',
  joiningDate: '2010-08-01',
  status: 'Active',
  attendance: {
    overall: '96%',
    thisMonth: '100%',
    lastMonth: '92%',
    totalPresent: 285,
    totalAbsent: 8,
    totalLate: 2,
    totalDays: 295,
  },
  recentAttendance: [
    { date: '2025-11-30', status: 'Present', time: '08:15 AM' },
    { date: '2025-11-29', status: 'Present', time: '08:10 AM' },
    { date: '2025-11-28', status: 'Present', time: '08:05 AM' },
    { date: '2025-11-27', status: 'Present', time: '08:12 AM' },
    { date: '2025-11-26', status: 'Late', time: '08:35 AM' },
    { date: '2025-11-25', status: 'Present', time: '08:08 AM' },
    { date: '2025-11-24', status: 'Present', time: '08:20 AM' },
  ],
};

export default function TeacherView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [teacherData, setTeacherData] = useState(defaultTeacherData);
  const [attendanceRecords, setAttendanceRecords] = useState(teacherData.recentAttendance);
  const [status, setStatus] = useState(teacherData.status);

  // Load teacher data from localStorage
  useEffect(() => {
    const storedDetails = localStorage.getItem('teacherDetails');
    if (storedDetails) {
      const allTeachers = JSON.parse(storedDetails);
      const teacher = allTeachers.find((t: any) => t.id === parseInt(id || '1'));
      if (teacher) {
        const formattedTeacher = {
          ...defaultTeacherData,
          id: teacher.id,
          teacherId: teacher.teacherId,
          name: `${teacher.firstName} ${teacher.lastName}`,
          subject: teacher.subject,
          classes: typeof teacher.classes === 'string' ? teacher.classes.split(', ') : teacher.classes,
          dateOfBirth: teacher.dateOfBirth,
          gender: teacher.gender,
          email: teacher.email,
          phone: teacher.phone,
          address: teacher.address,
          qualification: teacher.qualification,
          experience: `${teacher.experience} years`,
          joiningDate: teacher.joiningDate,
          status: teacher.status,
          attendance: teacher.attendance || defaultTeacherData.attendance,
        };
        setTeacherData(formattedTeacher);
        setAttendanceRecords(formattedTeacher.recentAttendance);
        setStatus(formattedTeacher.status);
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
    const statusUpdates = JSON.parse(localStorage.getItem('teacherStatusUpdates') || '{}');
    statusUpdates[id || '1'] = newStatus;
    localStorage.setItem('teacherStatusUpdates', JSON.stringify(statusUpdates));
    
    toast.success(`Teacher status updated to ${newStatus}`);
  };

  const handleShareReport = async () => {
    setIsSharing(true);
    const reportHTML = generateTeacherReport({
      ...teacherData,
      recentAttendance: attendanceRecords
    });
    
    // Simulate sending email with the report
    setTimeout(() => {
      setIsSharing(false);
      toast.success(`Attendance report sent successfully to ${teacherData.email}!`, {
        description: 'The report has been delivered to the teacher\'s email address.',
      });
    }, 2000);
  };

  const handleDownloadReport = () => {
    toast.success('Generating attendance report...');
    const reportHTML = generateTeacherReport({
      ...teacherData,
      recentAttendance: attendanceRecords
    });
    const filename = `${teacherData.name.replace(/ /g, '_')}_Attendance_Report_${new Date().toISOString().split('T')[0]}.html`;
    downloadReport(reportHTML, filename);
  };

  const handlePrintReport = () => {
    const reportHTML = generateTeacherReport({
      ...teacherData,
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
            onClick={() => navigate('/teachers')}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teachers
          </Button>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <h1>Teacher Details</h1>
            <p className="text-gray-600 mt-1">View complete teacher information and attendance</p>
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
        {/* Left Column - Teacher Profile */}
        <div className="col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-[#A982D9] to-[#8B5FBF] rounded-2xl p-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur-sm mb-4">
                {teacherData.name.charAt(0)}
              </div>
              <h2 className="text-white mb-1">{teacherData.name}</h2>
              <p className="text-white/80 mb-4">ID: {teacherData.teacherId}</p>
              <div className="flex gap-2 w-full">
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Subject</p>
                  <p className="text-white">{teacherData.subject}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-sm mb-1">Experience</p>
                  <p className="text-white">{teacherData.experience}</p>
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
                <p className="text-2xl text-green-700">{teacherData.attendance.overall}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-xl text-blue-700">{teacherData.attendance.thisMonth}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Last Month</p>
                  <p className="text-xl text-purple-700">{teacherData.attendance.lastMonth}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl text-green-600">{teacherData.attendance.totalPresent}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-red-600">{teacherData.attendance.totalAbsent}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-orange-600">{teacherData.attendance.totalLate}</p>
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
                  <p className="text-gray-900">{teacherData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">{new Date(teacherData.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900">{teacherData.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 text-red-600 flex items-center justify-center">+</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="text-gray-900">{teacherData.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="text-gray-900">{new Date(teacherData.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Professional Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-gray-900">{teacherData.subject}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="text-gray-900">{teacherData.experience}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Highest Qualification</p>
                  <p className="text-gray-900">{teacherData.qualification}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Classes</p>
                  <div className="flex gap-2 mt-1">
                    {teacherData.classes.map((cls, index) => (
                      <span key={index} className="px-3 py-1 bg-[#E7D7F6] text-[#A982D9] rounded-lg text-sm">
                        {cls}
                      </span>
                    ))}
                  </div>
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
                  <p className="text-gray-900">{teacherData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{teacherData.phone}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{teacherData.address}</p>
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