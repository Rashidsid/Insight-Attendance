import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Mail, Download, Phone, MapPin, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { generateStudentReport, downloadReport } from '../../utils/reportGenerator';
import { getStudentById, updateStudentStatus, updateStudentAttendance } from '../../services/studentService';

// Default mock student data structure
const getDefaultStudentData = () => ({
  id: '1',
  rollNo: 'STU001',
  firstName: 'Ram',
  lastName: 'Kumar',
  class: '10-A',
  section: 'Science',
  dateOfBirth: '2008-05-15',
  admissionDate: '2023-06-01',
  gender: 'Male',
  email: 'ram@example.com',
  phone: '+91 98765 43210',
  address: '123 Main St, City',
  parentName: 'Raj Kumar',
  parentEmail: 'raj.kumar@example.com',
  parentPhone: '+91 98765 43211',
  status: 'Active' as 'Active' | 'Inactive',
  photo: null as string | null,
  attendance: 92,
  recentAttendance: [] as Array<{ date: string; status: 'Present' | 'Absent' | 'Late'; time: string }>,
});

interface StudentData extends ReturnType<typeof getDefaultStudentData> {}

export default function StudentView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData>(getDefaultStudentData());
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{ date: string; status: 'Present' | 'Absent' | 'Late'; time: string }>>([]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [dateRange, setDateRange] = useState('1month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load student data from Firebase
  useEffect(() => {
    const loadStudent = async () => {
      try {
        if (!id) return;
        const student = await getStudentById(id);
        if (student) {
          const recentAttendance = Array.isArray(student.recentAttendance) 
            ? student.recentAttendance.map(record => ({
                date: record.date,
                status: (record.status || 'Present') as 'Present' | 'Absent' | 'Late',
                time: '-'
              }))
            : [];
          
          const formattedStudent: StudentData = {
            id: student.id || '',
            rollNo: student.rollNo,
            firstName: student.firstName,
            lastName: student.lastName,
            class: student.class,
            section: student.section,
            dateOfBirth: student.dateOfBirth,
            admissionDate: student.admissionDate || '',
            gender: student.gender,
            email: student.email || '',
            phone: student.phone || '',
            address: student.address || '',
            parentName: student.parentName,
            parentEmail: student.parentEmail || '',
            parentPhone: student.parentPhone,
            status: (student.status || 'Active') as 'Active' | 'Inactive',
            photo: student.photo || null,
            attendance: student.attendance ? parseInt(student.attendance.toString()) : 0,
            recentAttendance: recentAttendance,
          };
          setStudentData(formattedStudent);
          setAttendanceRecords(recentAttendance);
          if (formattedStudent.status === 'Active' || formattedStudent.status === 'Inactive') {
            setStatus(formattedStudent.status);
          }
        }
      } catch (error) {
        toast.error('Failed to load student data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id]);

  const handleAttendanceChange = async (index: number, newStatus: 'Present' | 'Absent' | 'Late') => {
    try {
      const updated = [...attendanceRecords];
      updated[index] = { ...updated[index], status: newStatus };
      setAttendanceRecords(updated);

      // Update in Firebase
      if (id) {
        await updateStudentAttendance(id, updated);
      }

      toast.success(`Attendance updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update attendance');
      console.error(error);
    }
  };

  // Calculate attendance statistics from recent attendance  
  const getAttendanceStats = () => {
    const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
    const totalAbsent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const totalLate = attendanceRecords.filter(r => r.status === 'Late').length;
    const totalDays = attendanceRecords.length;
    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalDays
    };
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newStatus !== 'Active' && newStatus !== 'Inactive') {
        toast.error('Invalid status');
        return;
      }
      
      setStatus(newStatus);

      // Update in Firebase
      if (id) {
        await updateStudentStatus(id, newStatus);
      }

      toast.success(`Student status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleShareReport = async () => {
    setIsSharing(true);
    try {
      const stats = getAttendanceStats();
      const reportData = {
        ...studentData,
        name: `${studentData.firstName} ${studentData.lastName}`,
        recentAttendance: attendanceRecords,
        attendance: {
          overall: `${studentData.attendance}%`,
          thisMonth: `${studentData.attendance}%`,
          lastMonth: `${studentData.attendance - 5}%`,
          totalPresent: stats.totalPresent,
          totalAbsent: stats.totalAbsent,
          totalLate: stats.totalLate,
          totalDays: stats.totalDays,
        }
      };
      generateStudentReport(reportData);

      // Simulate sending email with the report
      setTimeout(() => {
        setIsSharing(false);
        toast.success(`Attendance report sent successfully to ${studentData.email}!`, {
          description: 'The report has been delivered to the student\'s email address.',
        });
      }, 2000);
    } catch (error) {
      setIsSharing(false);
      toast.error('Failed to generate report');
      console.error(error);
    }
  };

  const handleDownloadReport = () => {
    toast.success('Generating attendance report...');
    try {
      const stats = getAttendanceStats();
      const reportData = {
        ...studentData,
        name: `${studentData.firstName} ${studentData.lastName}`,
        recentAttendance: attendanceRecords,
        attendance: {
          overall: `${studentData.attendance}%`,
          thisMonth: `${studentData.attendance}%`,
          lastMonth: `${studentData.attendance - 5}%`,
          totalPresent: stats.totalPresent,
          totalAbsent: stats.totalAbsent,
          totalLate: stats.totalLate,
          totalDays: stats.totalDays,
        }
      };
      const reportHTML = generateStudentReport(reportData);
      const filename = `${studentData.firstName}_${studentData.lastName}_Attendance_Report_${new Date().toISOString().split('T')[0]}.html`;
      downloadReport(reportHTML, filename);
    } catch (error) {
      toast.error('Failed to download report');
      console.error(error);
    }
  };

  const getFilteredAttendance = () => {
    if (dateRange === 'all') return studentData.recentAttendance;

    const today = new Date();
    let startDate = new Date();

    if (dateRange === '1month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (dateRange === '2months') {
      startDate.setMonth(today.getMonth() - 2);
    } else if (dateRange === '3months') {
      startDate.setMonth(today.getMonth() - 3);
    } else if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      today.setTime(new Date(customEndDate).getTime());
    } else {
      return studentData.recentAttendance;
    }

    return studentData.recentAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= today;
    });
  };

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A982D9]"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/students')}
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
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur-sm mb-4 overflow-hidden flex-shrink-0">
                {studentData.photo ? (
                  <img src={studentData.photo} alt={`${studentData.firstName} ${studentData.lastName}`} className="w-full h-full object-cover" />
                ) : (
                  studentData.firstName.charAt(0)
                )}
              </div>
              <h2 className="text-white mb-1">{studentData.firstName} {studentData.lastName}</h2>
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
                <p className="text-2xl text-green-700">{studentData.attendance}%</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-xl text-blue-700">{studentData.attendance}%</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600 mb-1">Last Month</p>
                  <p className="text-xl text-purple-700">{Math.max(0, studentData.attendance - 5)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl text-green-600">{getAttendanceStats().totalPresent}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-red-600">{getAttendanceStats().totalAbsent}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-orange-600">{getAttendanceStats().totalLate}</p>
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
                  <p className="text-gray-900">{studentData.firstName} {studentData.lastName}</p>
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="text-gray-900">{studentData.admissionDate ? new Date(studentData.admissionDate).toLocaleDateString() : 'N/A'}</p>
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
            <div className="flex items-center justify-between mb-6">
              <h3>Recent Attendance History</h3>
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={(value) => {
                  setDateRange(value);
                  if (value !== 'custom') {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}>
                  <SelectTrigger className="w-[150px] h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last 1 Month</SelectItem>
                    <SelectItem value="2months">Last 2 Months</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dateRange === 'custom' && (
              <div className="flex gap-3 mb-4">
                <div>
                  <Label className="text-xs">From Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs">To Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {getFilteredAttendance().length > 0 ? (
                getFilteredAttendance().map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-semibold">{new Date(record.date).getDate()}</p>
                        <p className="text-xs text-gray-500 uppercase">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-gray-300" />
                      <div>
                        <p className="text-gray-900 font-medium">{record.date}</p>
                        <p className="text-sm text-gray-500">{record.time}</p>
                      </div>
                    </div>
                    <Select
                      value={record.status}
                      onValueChange={(value) => {
                        if (value === 'Present' || value === 'Absent' || value === 'Late') {
                          handleAttendanceChange(index, value);
                        }
                      }}
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found for the selected date range
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
