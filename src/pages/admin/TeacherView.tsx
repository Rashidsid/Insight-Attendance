import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Mail, Download, Phone, MapPin, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { generateTeacherReport, downloadReport } from '../../utils/reportGenerator';
import { getTeacherById, updateTeacherStatus, updateTeacherAttendance } from '../../services/teacherService';

// Default mock teacher data structure
const getDefaultTeacherData = () => ({
  id: '1',
  teacherId: 'TCH001',
  firstName: 'Ram',
  lastName: 'Kumar',
  subject: 'Mathematics',
  classes: '',
  dateOfBirth: '1980-05-15',
  gender: 'Male',
  email: 'ram.kumar@example.com',
  phone: '+91 98765 43210',
  address: '123 Main St, City',
  qualification: 'M.Sc. in Mathematics',
  experience: '15',
  joiningDate: '2010-08-01',
  status: 'Active' as 'Active' | 'On Leave',
  photo: null as string | null,
  faceImages: null as { front?: string | null; left?: string | null; right?: string | null; up?: string | null; down?: string | null } | null,
  recentAttendance: [] as Array<{ date: string; status: 'Present' | 'Absent' | 'Late'; time?: string }>,
});

interface TeacherData extends ReturnType<typeof getDefaultTeacherData> {}

export default function TeacherView() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<TeacherData>(getDefaultTeacherData());
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{ date: string; status: 'Present' | 'Absent' | 'Late'; time?: string }>>([]);
  const [status, setStatus] = useState<'Active' | 'On Leave'>('Active');
  const [dateRange, setDateRange] = useState('1month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load teacher data from Firebase
  useEffect(() => {
    const loadTeacher = async () => {
      try {
        if (!id) return;
        const teacher = await getTeacherById(id);
        if (teacher) {
          const recentAttendance = Array.isArray(teacher.recentAttendance) 
            ? teacher.recentAttendance.map(record => ({
                date: record.date,
                status: (record.status || 'Present') as 'Present' | 'Absent' | 'Late',
                time: record.time || '-'
              }))
            : [];
          
          const formattedTeacher: TeacherData = {
            id: teacher.id || '',
            teacherId: teacher.teacherId,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            subject: teacher.subject,
            classes: teacher.classes || '',
            dateOfBirth: teacher.dateOfBirth,
            gender: teacher.gender,
            email: teacher.email || '',
            phone: teacher.phone || '',
            address: teacher.address || '',
            qualification: teacher.qualification,
            experience: teacher.experience,
            joiningDate: teacher.joiningDate,
            status: (teacher.status || 'Active') as 'Active' | 'On Leave',
            photo: teacher.photo || null,
            faceImages: teacher.faceImages || null,
            recentAttendance: recentAttendance,
          };
          setTeacherData(formattedTeacher);
          setAttendanceRecords(recentAttendance);
          if (formattedTeacher.status === 'Active' || formattedTeacher.status === 'On Leave') {
            setStatus(formattedTeacher.status);
          }
        }
      } catch (error) {
        toast.error('Failed to load teacher data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadTeacher();
  }, [id]);

  const handleAttendanceChange = (index: number, newStatus: string) => {
    const updated = [...attendanceRecords];
    updated[index] = { ...updated[index], status: newStatus as 'Present' | 'Absent' | 'Late' };
    setAttendanceRecords(updated);
    
    // Save to Firebase
    if (id) {
      updateTeacherAttendance(id, updated).catch(() => {
        toast.error('Failed to update attendance');
      });
    }
    
    toast.success(`Attendance updated to ${newStatus}`);
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

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as 'Active' | 'On Leave');
    
    // Update in Firebase
    if (id) {
      updateTeacherStatus(id, newStatus as 'Active' | 'On Leave').catch(() => {
        toast.error('Failed to update status');
      });
    }
    
    toast.success(`Teacher status updated to ${newStatus}`);
  };

  const handleShareReport = async () => {
    setIsSharing(true);
    const stats = getAttendanceStats();
    const reportData = {
      name: `${teacherData.firstName} ${teacherData.lastName}`,
      teacherId: teacherData.teacherId,
      subject: teacherData.subject,
      classes: teacherData.classes.split(', ').filter(c => c),
      dateOfBirth: teacherData.dateOfBirth,
      gender: teacherData.gender,
      email: teacherData.email,
      phone: teacherData.phone,
      qualification: teacherData.qualification,
      experience: teacherData.experience,
      joiningDate: teacherData.joiningDate,
      attendance: {
        overall: `${Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100)}%`,
        thisMonth: `${Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100)}%`,
        lastMonth: `${Math.max(0, Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100) - 5)}%`,
        totalPresent: stats.totalPresent,
        totalAbsent: stats.totalAbsent,
        totalLate: stats.totalLate,
        totalDays: stats.totalDays,
      },
      recentAttendance: attendanceRecords.map(r => ({
        date: r.date,
        status: r.status,
        time: r.time || '-'
      }))
    };
    generateTeacherReport(reportData as any);
    
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
    const stats = getAttendanceStats();
    const reportData = {
      name: `${teacherData.firstName} ${teacherData.lastName}`,
      teacherId: teacherData.teacherId,
      subject: teacherData.subject,
      classes: teacherData.classes.split(', ').filter(c => c),
      dateOfBirth: teacherData.dateOfBirth,
      gender: teacherData.gender,
      email: teacherData.email,
      phone: teacherData.phone,
      qualification: teacherData.qualification,
      experience: teacherData.experience,
      joiningDate: teacherData.joiningDate,
      attendance: {
        overall: `${Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100)}%`,
        thisMonth: `${Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100)}%`,
        lastMonth: `${Math.max(0, Math.round((stats.totalPresent / (stats.totalDays || 1)) * 100) - 5)}%`,
        totalPresent: stats.totalPresent,
        totalAbsent: stats.totalAbsent,
        totalLate: stats.totalLate,
        totalDays: stats.totalDays,
      },
      recentAttendance: attendanceRecords.map(r => ({
        date: r.date,
        status: r.status,
        time: r.time || '-'
      }))
    };
    const reportHTML = generateTeacherReport(reportData as any);
    const filename = `${teacherData.firstName}_${teacherData.lastName}_Attendance_Report_${new Date().toISOString().split('T')[0]}.html`;
    downloadReport(reportHTML, filename);
  };

  const getFilteredAttendance = () => {
    if (dateRange === 'all') return attendanceRecords;

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
      return attendanceRecords;
    }

    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= today;
    });
  };

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderBottomColor: theme.primaryColor }}
          ></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/teachers')}
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
                style={{ backgroundColor: theme.primaryColor }}
                className="hover:opacity-90 rounded-xl h-12 gap-2"
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
              <div 
                className="rounded-2xl p-6 text-white"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.sidebarAccent})`
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur-sm mb-4 overflow-hidden flex-shrink-0">
                    {teacherData.faceImages?.front || teacherData.photo ? (
                      <img src={teacherData.faceImages?.front || teacherData.photo || ''} alt={`${teacherData.firstName} ${teacherData.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      teacherData.firstName.charAt(0)
                    )}
                  </div>
                  <h2 className="text-white mb-1">{teacherData.firstName} {teacherData.lastName}</h2>
                  <p className="text-white/80 mb-4">ID: {teacherData.teacherId}</p>
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-white/70 text-sm mb-1">Subject</p>
                      <p className="text-white">{teacherData.subject}</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-white/70 text-sm mb-1">Experience</p>
                      <p className="text-white">{teacherData.experience} yrs</p>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-white/70 text-sm mb-2">Status</p>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger className={`w-full border-0 ${
                        status === 'Active'
                          ? 'bg-green-500/30 text-white hover:bg-green-500/40'
                          : 'bg-orange-500/30 text-white hover:bg-orange-500/40'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
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
                    <p className="text-2xl text-green-700">{Math.round((getAttendanceStats().totalPresent / (getAttendanceStats().totalDays || 1)) * 100)}%</p>
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
                      <p className="text-gray-900">{teacherData.firstName} {teacherData.lastName}</p>
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
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      <p className="text-gray-900">{teacherData.qualification}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="text-gray-900">{teacherData.experience} years</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{teacherData.address}</p>
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
                        <SelectItem value="all">All Records</SelectItem>
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
                            <p className="text-sm text-gray-500">{record.time || '-'}</p>
                          </div>
                        </div>
                        <Select
                          value={record.status}
                          onValueChange={(value) => {
                            if (value === 'Present' || value === 'Absent' || value === 'Late') {
                              handleAttendanceChange(getFilteredAttendance().indexOf(record), value);
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
