import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { toast } from 'sonner';
import { getAllStudents, deleteStudent, updateStudentStatus } from '../../services/studentService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface Student {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  rollNo: string;
  class: string;
  section: string;
  attendance?: string;
  status: string;
  photo?: string | null;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [students, setStudents] = useState<Student[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load students from Firebase
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await getAllStudents();
        const formattedStudents = data.map((s: any) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          name: `${s.firstName} ${s.lastName}`,
          rollNo: s.rollNo,
          class: s.class,
          section: s.section,
          attendance: s.attendance || '0%',
          status: s.status,
          photo: s.photo || null,
        }));
        setStudents(formattedStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleStatusChange = async (studentId: string | undefined, newStatus: string) => {
    if (!studentId) return;
    
    try {
      // Update local state first for instant feedback
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId ? { ...student, status: newStatus } : student
        )
      );

      // Update in Firebase
      if (newStatus === 'Active' || newStatus === 'Inactive') {
        await updateStudentStatus(studentId, newStatus);
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      // Revert local change on error
      loadStudents();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteStudent(deleteId);
      setStudents(students.filter((s) => s.id !== deleteId));
      setDeleteId(null);
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      const formattedStudents = data.map((s: any) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        name: `${s.firstName} ${s.lastName}`,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        attendance: s.attendance || '0%',
        status: s.status,
        photo: s.photo || null,
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Students', value: students.length.toString(), color: 'bg-blue-500' },
    { label: 'Active Today', value: students.filter(s => s.status === 'Active').length.toString(), color: 'bg-green-500' },
    { label: 'Inactive', value: students.filter(s => s.status === 'Inactive').length.toString(), color: 'bg-red-500' },
    { label: 'Total Classes', value: new Set(students.map(s => s.class)).size.toString(), color: 'bg-[#A982D9]' },
  ];

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const name = student.name || '';
    return (
      name.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query) ||
      student.section.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A982D9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Student Management</h1>
          <p className="text-gray-600 mt-1">Manage and track student information</p>
        </div>
        <Button
          onClick={() => navigate('/admin/students/add')}
          className="bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Student
        </Button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <div className="w-6 h-6 bg-white/30 rounded" />
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#A982D9] text-white h-[60px] px-6 flex items-center">
          <div className="flex-1 grid grid-cols-8 gap-4">
            <div className="col-span-1">Roll No</div>
            <div className="col-span-2">Student Name</div>
            <div className="col-span-1">Class</div>
            <div className="col-span-1">Section</div>
            <div className="col-span-1">Attendance</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredStudents.map((student, index) => (
            <div
              key={student.id}
              className={`h-[88px] px-6 flex items-center ${
                student.status === 'Inactive'
                  ? 'bg-red-100 hover:bg-red-200'
                  : index % 2 === 0
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors`}
            >
              <div className="flex-1 grid grid-cols-8 gap-4 items-center">
                <div className="col-span-1 text-gray-900 font-medium">{student.rollNo}</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E7D7F6] text-[#A982D9] font-semibold text-sm overflow-hidden">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        (student.name || '').charAt(0)
                      )}
                    </div>
                    <span className={`${student.status === 'Inactive' ? 'text-red-900 font-medium' : 'text-gray-900'}`}>
                      {student.name}
                    </span>
                  </div>
                </div>
                <div className={`col-span-1 ${student.status === 'Inactive' ? 'text-red-900 font-medium' : 'text-gray-600'}`}>{student.class}</div>
                <div className={`col-span-1 ${student.status === 'Inactive' ? 'text-red-900 font-medium' : 'text-gray-600'}`}>{student.section}</div>
                <div className="col-span-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                    parseInt(student.attendance || '0') >= 90
                      ? 'bg-green-100 text-green-700'
                      : parseInt(student.attendance || '0') >= 80
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {student.attendance}
                  </span>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => handleStatusChange(student.id, student.status === 'Active' ? 'Inactive' : 'Active')}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      student.status === 'Active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-200 text-red-800 hover:bg-red-300'
                    }`}
                  >
                    {student.status}
                  </button>
                </div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => student.id && setDeleteId(student.id)}
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
