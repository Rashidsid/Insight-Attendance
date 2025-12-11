import { useState } from 'react';
import { Calendar, TrendingUp, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Mock data
const attendanceHistory = [
  { date: '2025-11-30', day: 'Saturday', status: 'Present', time: '08:45 AM', remarks: 'On time' },
  { date: '2025-11-29', day: 'Friday', status: 'Present', time: '08:52 AM', remarks: 'On time' },
  { date: '2025-11-28', day: 'Thursday', status: 'Present', time: '08:38 AM', remarks: 'On time' },
  { date: '2025-11-27', day: 'Wednesday', status: 'Absent', time: '-', remarks: 'Medical leave' },
  { date: '2025-11-26', day: 'Tuesday', status: 'Present', time: '09:05 AM', remarks: 'Late arrival' },
  { date: '2025-11-25', day: 'Monday', status: 'Present', time: '08:42 AM', remarks: 'On time' },
  { date: '2025-11-24', day: 'Sunday', status: 'Holiday', time: '-', remarks: 'Weekend' },
  { date: '2025-11-23', day: 'Saturday', status: 'Present', time: '08:50 AM', remarks: 'On time' },
];

const monthlyStats = [
  { month: 'November', present: 22, absent: 2, late: 1, percentage: 92 },
  { month: 'October', present: 25, absent: 1, late: 2, percentage: 96 },
  { month: 'September', present: 21, absent: 3, late: 0, percentage: 88 },
  { month: 'August', present: 24, absent: 1, late: 1, percentage: 96 },
];

export default function AttendanceResult() {
  const [selectedMonth, setSelectedMonth] = useState('november');

  const currentStats = {
    totalDays: 24,
    present: 22,
    absent: 2,
    late: 1,
    percentage: 92,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>My Attendance Record</h1>
          <p className="text-gray-600 mt-1">View your attendance history and statistics</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px] h-12 rounded-xl">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="november">November 2025</SelectItem>
            <SelectItem value="october">October 2025</SelectItem>
            <SelectItem value="september">September 2025</SelectItem>
            <SelectItem value="august">August 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Info Card */}
      <div className="bg-gradient-to-br from-[#A982D9] to-[#8B5FBF] rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">
              AJ
            </div>
            <div>
              <h2 className="text-white mb-1">Alex Johnson</h2>
              <p className="text-white/80">Roll No: STU001 | Class: 10-A | Section: Science</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm mb-1">Overall Attendance</p>
            <p className="text-4xl">{currentStats.percentage}%</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Days</p>
          <p className="text-3xl">{currentStats.totalDays}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Present Days</p>
          <p className="text-3xl">{currentStats.present}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-white/30 rounded" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Absent Days</p>
          <p className="text-3xl">{currentStats.absent}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Late Arrivals</p>
          <p className="text-3xl">{currentStats.late}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Attendance History */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3>Attendance History</h3>
            <p className="text-sm text-gray-500 mt-1">Daily attendance records</p>
          </div>

          <div className="divide-y divide-gray-100">
            {attendanceHistory.map((record, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-2xl">{new Date(record.date).getDate()}</p>
                      <p className="text-xs text-gray-500 uppercase">{record.day.slice(0, 3)}</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200" />
                    <div>
                      <p className="text-gray-900">{record.date}</p>
                      <p className="text-sm text-gray-500">{record.remarks}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[80px]">
                      <p className="text-gray-600">{record.time}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm min-w-[100px] text-center ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-700'
                        : record.status === 'Absent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-6">Monthly Overview</h3>
            <div className="space-y-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-900">{stat.month}</p>
                    <span className={`px-3 py-1 rounded-lg text-sm ${
                      stat.percentage >= 90
                        ? 'bg-green-100 text-green-700'
                        : stat.percentage >= 75
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center bg-green-50 rounded-lg py-1">
                      <p className="text-green-700">{stat.present}P</p>
                    </div>
                    <div className="text-center bg-red-50 rounded-lg py-1">
                      <p className="text-red-700">{stat.absent}A</p>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg py-1">
                      <p className="text-orange-700">{stat.late}L</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badge */}
          {currentStats.percentage >= 90 && (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
              <Award className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-white mb-2">Excellent Attendance!</h3>
              <p className="text-white/90 text-sm">
                You've maintained {currentStats.percentage}% attendance this month. Keep it up!
              </p>
            </div>
          )}

          <Button className="w-full h-12 rounded-xl bg-[#A982D9] hover:bg-[#9770C8]">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
