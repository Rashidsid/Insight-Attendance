import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Mock data for charts
const monthlyData = [
  { month: 'Jan', present: 920, absent: 80, percentage: 92 },
  { month: 'Feb', present: 890, absent: 110, percentage: 89 },
  { month: 'Mar', present: 950, absent: 50, percentage: 95 },
  { month: 'Apr', present: 910, absent: 90, percentage: 91 },
  { month: 'May', present: 880, absent: 120, percentage: 88 },
  { month: 'Jun', present: 940, absent: 60, percentage: 94 },
];

const classWiseData = [
  { class: '9-A', attendance: 91 },
  { class: '9-B', attendance: 87 },
  { class: '10-A', attendance: 93 },
  { class: '10-B', attendance: 89 },
  { class: '11-A', attendance: 95 },
  { class: '11-B', attendance: 90 },
  { class: '12-A', attendance: 92 },
  { class: '12-B', attendance: 88 },
];

const statusData = [
  { name: 'Present', value: 940, color: '#22c55e' },
  { name: 'Absent', value: 45, color: '#ef4444' },
  { name: 'Late', value: 15, color: '#f59e0b' },
];

export default function Reports() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('current');

  const stats = [
    { label: 'Average Attendance', value: '91.5%', change: '+2.3%', trend: 'up', color: 'bg-green-500' },
    { label: 'Total Present', value: '940', change: '+12', trend: 'up', color: 'bg-blue-500' },
    { label: 'Total Absent', value: '45', change: '-5', trend: 'down', color: 'bg-red-500' },
    { label: 'Late Arrivals', value: '15', change: '-3', trend: 'down', color: 'bg-orange-500' },
  ];

  const generateReportHTML = (reportType: string) => {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const classText = selectedClass === 'all' ? 'All Classes' : `Class ${selectedClass}`;
    const periodText = selectedMonth === 'current' ? 'Current Month' :
                       selectedMonth === 'last' ? 'Last Month' :
                       selectedMonth === 'quarter' ? 'This Quarter' : 'This Year';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType} - Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #A982D9; padding-bottom: 20px; }
          .header h1 { color: #A982D9; margin: 0; font-size: 32px; }
          .header p { color: #666; margin: 10px 0 0 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px; }
          .info-box h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .info-box p { margin: 0; font-size: 24px; color: #A982D9; font-weight: bold; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; }
          .stat-card h4 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
          .stat-card .value { font-size: 28px; color: #333; font-weight: bold; }
          .stat-card .change { font-size: 12px; color: #22c55e; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #A982D9; color: white; padding: 12px; text-align: left; }
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
            <div class="value">91.5%</div>
            <div class="change">+2.3% from last period</div>
          </div>
          <div class="stat-card">
            <h4>Total Present</h4>
            <div class="value">940</div>
            <div class="change">+12 from last period</div>
          </div>
          <div class="stat-card">
            <h4>Total Absent</h4>
            <div class="value">45</div>
            <div class="change" style="color: #ef4444;">-5 from last period</div>
          </div>
          <div class="stat-card">
            <h4>Late Arrivals</h4>
            <div class="value">15</div>
            <div class="change" style="color: #ef4444;">-3 from last period</div>
          </div>
        </div>

        <h2 style="color: #A982D9; margin-top: 40px;">Class-wise Attendance Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Attendance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>9-A</td><td>91%</td><td style="color: #22c55e;">Excellent</td></tr>
            <tr><td>9-B</td><td>87%</td><td style="color: #22c55e;">Good</td></tr>
            <tr><td>10-A</td><td>93%</td><td style="color: #22c55e;">Excellent</td></tr>
            <tr><td>10-B</td><td>89%</td><td style="color: #22c55e;">Good</td></tr>
            <tr><td>11-A</td><td>95%</td><td style="color: #22c55e;">Excellent</td></tr>
            <tr><td>11-B</td><td>90%</td><td style="color: #22c55e;">Excellent</td></tr>
            <tr><td>12-A</td><td>92%</td><td style="color: #22c55e;">Excellent</td></tr>
            <tr><td>12-B</td><td>88%</td><td style="color: #22c55e;">Good</td></tr>
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

  const handleExportPDF = () => {
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
    
    toast.success('Report exported successfully!', {
      description: 'The attendance report has been downloaded as an HTML file.',
    });
  };

  const handleDailyReport = () => {
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
    
    toast.success('Daily report generated!', {
      description: 'Today\'s attendance summary has been downloaded.',
    });
  };

  const handleMonthlyReport = () => {
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
    
    toast.success('Monthly report generated!', {
      description: 'Detailed monthly analysis has been downloaded.',
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Attendance Reports</h1>
          <p className="text-gray-600 mt-1">View detailed attendance analytics and reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px] h-12 rounded-xl">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="9-A">Class 9-A</SelectItem>
              <SelectItem value="9-B">Class 9-B</SelectItem>
              <SelectItem value="10-A">Class 10-A</SelectItem>
              <SelectItem value="10-B">Class 10-B</SelectItem>
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
          <Button onClick={handleExportPDF} className="bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12 gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <div className="w-6 h-6 bg-white/30 rounded" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Monthly Attendance Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3>Monthly Attendance Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
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
              <Line type="monotone" dataKey="percentage" stroke="#A982D9" strokeWidth={3} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3>Attendance Status</h3>
              <p className="text-sm text-gray-500 mt-1">Current month distribution</p>
            </div>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class-wise Attendance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3>Class-wise Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">Comparison across all classes</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={classWiseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="class" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Bar dataKey="attendance" fill="#A982D9" name="Attendance %" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div 
          onClick={handleDailyReport}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
        >
          <FileText className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-white mb-2">Daily Report</h3>
          <p className="text-blue-100 text-sm">Generate today&apos;s attendance summary</p>
        </div>
        <div 
          onClick={handleMonthlyReport}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
        >
          <FileText className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-white mb-2">Monthly Report</h3>
          <p className="text-green-100 text-sm">Detailed monthly analysis</p>
        </div>
      </div>
    </div>
  );
}
