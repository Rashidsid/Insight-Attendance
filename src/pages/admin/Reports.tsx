import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllAttendance, calculateAttendanceStats } from '../../services/attendanceService';
import AttendanceWidget from '../../components/AttendanceWidget';

export default function Reports() {
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [classWiseData, setClassWiseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allClasses, setAllClasses] = useState<string[]>([]);

  // Load attendance data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const attendanceRecords = await getAllAttendance();
        const classes = [...new Set(attendanceRecords.map((r) => r.class))].sort();
        setAllClasses(classes as string[]);

        // Filter records based on selected class and month
        let filteredRecords = attendanceRecords;

        if (selectedClass !== 'all') {
          filteredRecords = filteredRecords.filter((r) => r.class === selectedClass);
        }

        // Filter by month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        if (selectedMonth === 'current') {
          filteredRecords = filteredRecords.filter((r) => {
            const dateValue = r.date instanceof Object && 'toDate' in r.date 
              ? (r.date as any).toDate() 
              : new Date(r.date as string);
            return dateValue.getMonth() === currentMonth && dateValue.getFullYear() === currentYear;
          });
        } else if (selectedMonth === 'last') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          filteredRecords = filteredRecords.filter((r) => {
            const dateValue = r.date instanceof Object && 'toDate' in r.date 
              ? (r.date as any).toDate() 
              : new Date(r.date as string);
            return dateValue.getMonth() === lastMonth && dateValue.getFullYear() === lastYear;
          });
        } else if (selectedMonth === 'quarter') {
          const startMonth = Math.floor(currentMonth / 3) * 3;
          filteredRecords = filteredRecords.filter((r) => {
            const dateValue = r.date instanceof Object && 'toDate' in r.date 
              ? (r.date as any).toDate() 
              : new Date(r.date as string);
            const monthIndex = dateValue.getMonth();
            return monthIndex >= startMonth && monthIndex < startMonth + 3 && dateValue.getFullYear() === currentYear;
          });
        } else if (selectedMonth === 'year') {
          filteredRecords = filteredRecords.filter((r) => {
            const dateValue = r.date instanceof Object && 'toDate' in r.date 
              ? (r.date as any).toDate() 
              : new Date(r.date as string);
            return dateValue.getFullYear() === currentYear;
          });
        }

        // Calculate statistics
        const calculatedStats = await calculateAttendanceStats(filteredRecords);

        setMonthlyData(
          calculatedStats.monthlyData.map((d: any) => ({
            ...d,
            percentage: d.percentage || 0,
          }))
        );
        setClassWiseData(calculatedStats.classWiseData);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error loading attendance data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedRole, selectedClass, selectedMonth]);

  const generateReportHTML = (reportType: string) => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const classText = selectedClass === 'all' ? 'All Classes' : `Class ${selectedClass}`;
    const periodText =
      selectedMonth === 'current'
        ? 'Current Month'
        : selectedMonth === 'last'
          ? 'Last Month'
          : selectedMonth === 'quarter'
            ? 'This Quarter'
            : 'This Year';

    // Generate class rows for the table
    const classRows = classWiseData
      .map(
        (cls: any) => `
      <tr>
        <td>${cls.class}</td>
        <td>${cls.attendance}%</td>
        <td style="color: ${cls.attendance >= 85 ? '#22c55e' : cls.attendance >= 75 ? '#f59e0b' : '#ef4444'};">
          ${cls.attendance >= 85 ? 'Excellent' : cls.attendance >= 75 ? 'Good' : 'Poor'}
        </td>
        <td>${cls.present}</td>
        <td>${cls.absent}</td>
        <td>${cls.late}</td>
      </tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType} - Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${theme.primaryColor}; padding-bottom: 20px; }
          .header h1 { color: ${theme.primaryColor}; margin: 0; font-size: 32px; }
          .header p { color: #666; margin: 10px 0 0 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px; }
          .info-box h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .info-box p { margin: 0; font-size: 24px; color: ${theme.primaryColor}; font-weight: bold; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; }
          .stat-card h4 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
          .stat-card .value { font-size: 28px; color: #333; font-weight: bold; }
          .stat-card .change { font-size: 12px; color: #22c55e; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: ${theme.primaryColor}; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportType}</h1>
          <p>Smart Attendance Management System</p>
          <p>Generated on ${today}</p>
        </div>

        <div class="info-row">
          <div class="info-box">
            <h3>Class Filter</h3>
            <p>${classText}</p>
          </div>
          <div class="info-box">
            <h3>Period</h3>
            <p>${periodText}</p>
          </div>
          <div class="info-box">
            <h3>Report Type</h3>
            <p>${reportType}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h4>Average Attendance</h4>
            <div class="value">${stats?.averageAttendance || 0}%</div>
            <div class="change">Based on current data</div>
          </div>
          <div class="stat-card">
            <h4>Total Present</h4>
            <div class="value">${stats?.totalPresent || 0}</div>
            <div class="change">Students marked present</div>
          </div>
          <div class="stat-card">
            <h4>Total Absent</h4>
            <div class="value">${stats?.totalAbsent || 0}</div>
            <div class="change" style="color: #ef4444;">Students marked absent</div>
          </div>
          <div class="stat-card">
            <h4>Late Arrivals</h4>
            <div class="value">${stats?.totalLate || 0}</div>
            <div class="change" style="color: #ef4444;">Students marked late</div>
          </div>
        </div>

        <h2 style="color: ${theme.primaryColor}; margin-top: 40px;">Class-wise Attendance Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Attendance %</th>
              <th>Status</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
            </tr>
          </thead>
          <tbody>
            ${classRows || '<tr><td colspan="6" style="text-align: center; color: #999;">No data available</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was automatically generated by the Smart Attendance Management System</p>
          <p>&copy; ${new Date().getFullYear()} School Management. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: '4px', borderStyle: 'solid', borderColor: theme.primaryColor, borderTopColor: 'transparent' }}></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1>Attendance Reports Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive attendance analytics and insights</p>
          </div>

          {/* Full Attendance Widget with all details */}
          <div className="mb-8">
            <AttendanceWidget />
          </div>

          {/* Filters and Export Options */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-4">Report Filters</h3>
                <div className="flex gap-3">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px] h-12 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[180px] h-12 rounded-xl">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {allClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px] h-12 rounded-xl">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Month</SelectItem>
                      <SelectItem value="last">Last Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => {
                  const reportHTML = generateReportHTML('Complete Attendance Report');
                  const blob = new Blob([reportHTML], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Report exported successfully!');
                }}
                style={{ backgroundColor: theme.primaryColor }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.sidebarAccent} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primaryColor} className="rounded-xl h-12 gap-2"
              >
                <Download className="w-5 h-5" />
                Export HTML
              </Button>
            </div>
          </div>

          {/* Additional Charts Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Monthly Attendance Trend */}
            {monthlyData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3>Monthly Attendance Trend</h3>
                    <p className="text-sm text-gray-500 mt-1">Performance over time</p>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke={theme.primaryColor}
                      strokeWidth={3}
                      name="Attendance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Class-wise Attendance */}
            {classWiseData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3>Class-wise Comparison</h3>
                    <p className="text-sm text-gray-500 mt-1">Attendance by class</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classWiseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="class" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="attendance" fill={theme.primaryColor} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Reports */}
          <div className="grid grid-cols-2 gap-6">
            <div
              onClick={() => {
                const reportHTML = generateReportHTML('Daily Attendance Report');
                const blob = new Blob([reportHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Daily_Report_${new Date().toISOString().split('T')[0]}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Daily report generated!');
              }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              <FileText className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-white mb-2">Daily Report</h3>
              <p className="text-blue-100 text-sm">Generate today&apos;s attendance summary</p>
            </div>
            <div
              onClick={() => {
                const reportHTML = generateReportHTML('Monthly Attendance Report');
                const blob = new Blob([reportHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Monthly_Report_${new Date().toISOString().split('T')[0]}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Monthly report generated!');
              }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              <FileText className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-white mb-2">Monthly Report</h3>
              <p className="text-green-100 text-sm">Detailed monthly analysis</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
