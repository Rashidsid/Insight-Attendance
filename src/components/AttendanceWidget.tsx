import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAllAttendance, calculateAttendanceStats } from '@/services/attendanceService';

interface AttendanceWidgetProps {
  className?: string;
  compact?: boolean;
}

export default function AttendanceWidget({ className: customClass, compact = false }: AttendanceWidgetProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendanceStats = async () => {
      try {
        setLoading(true);
        const records = await getAllAttendance();
        const calculatedStats = await calculateAttendanceStats(records);
        setStats(calculatedStats);
        setError(null);
      } catch (err) {
        console.error('Error loading attendance stats:', err);
        setError('Failed to load attendance data');
        // Fallback to mock data if database fails
        setStats({
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          averageAttendance: 0,
          classWiseData: [],
          monthlyData: [],
          statusData: [
            { name: 'Present', value: 0, color: '#22c55e' },
            { name: 'Absent', value: 0, color: '#ef4444' },
            { name: 'Late', value: 0, color: '#f59e0b' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceStats();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${customClass}`}>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#A982D9] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${customClass}`}>
        <p className="text-red-600 text-sm">{error || 'No attendance data available'}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`grid grid-cols-4 gap-4 ${customClass}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-[#A982D9]">{stats.averageAttendance}%</p>
          <p className="text-xs text-gray-500 mt-2">Overall performance</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Present</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalPresent}</p>
          <p className="text-xs text-gray-500 mt-2">Students present today</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Absent</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.totalAbsent}</p>
          <p className="text-xs text-gray-500 mt-2">Students absent today</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Late</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.totalLate}</p>
          <p className="text-xs text-gray-500 mt-2">Students late today</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${customClass}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Average Attendance</p>
              <p className="text-3xl font-bold text-[#A982D9]">{stats.averageAttendance}%</p>
            </div>
            <div className="w-12 h-12 bg-[#A982D9]/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#A982D9]" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Overall system performance</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalPresent}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Students marked present</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.totalAbsent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Students marked absent</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Late</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalLate}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Students marked late</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Attendance Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class-wise Attendance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Class-wise Attendance</h3>
          {stats.classWiseData && stats.classWiseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.classWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="class" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="attendance" fill="#A982D9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <p>No class data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      {stats.monthlyData && stats.monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
