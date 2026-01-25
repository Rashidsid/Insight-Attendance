import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Edit, Trash2, Eye, UserPlus, Search, X } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import { getAllStudents, deleteStudent } from '../../services/studentService';
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
  const { theme } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

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
          attendance: s.attendance,
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

  const stats = [
    { label: 'Total Students', value: students.length.toString(), color: 'bg-blue-500' },
    { label: 'Active Today', value: students.filter(s => s.status === 'Active').length.toString(), color: 'bg-green-500' },
    { label: 'Inactive', value: students.filter(s => s.status === 'Inactive').length.toString(), color: 'bg-red-500' },
    { label: 'Total Classes', value: new Set(students.map(s => s.class)).size.toString(), color: `var(--primary-color)` },
  ];

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

  // First apply global search query, then local search
  const filteredStudents = students.filter((student) => {
    const globalQuery = searchQuery.toLowerCase();
    const localQuery = localSearch.toLowerCase();
    const name = student.name || '';
    
    // First filter by global search
    const matchesGlobal = !globalQuery || 
      name.toLowerCase().includes(globalQuery) ||
      student.rollNo.toLowerCase().includes(globalQuery) ||
      student.class.toLowerCase().includes(globalQuery) ||
      student.section.toLowerCase().includes(globalQuery);
    
    // Then filter by local search
    const matchesLocal = !localQuery ||
      name.toLowerCase().includes(localQuery) ||
      student.rollNo.toLowerCase().includes(localQuery) ||
      student.class.toLowerCase().includes(localQuery) ||
      student.section.toLowerCase().includes(localQuery);
    
    return matchesGlobal && matchesLocal;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage and track student information</p>
        </div>
        <Button
          onClick={() => navigate('/admin/students/add')}
          style={{ backgroundColor: theme.primaryColor }}
          className="hover:opacity-90 rounded-xl h-12 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Student
        </Button>
      </div>

      {/* Local Search for This Page */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search in student list (Roll No, Name, Class, Section)..."
            className="h-12 pl-12 pr-10 rounded-xl border-gray-300 bg-white"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
        <div style={{ backgroundColor: theme.primaryColor }} className="text-white h-[60px] px-6 flex items-center">
          <div className="flex-1 grid grid-cols-7 gap-4">
            <div className="col-span-1">Roll No</div>
            <div className="col-span-2">Student Name</div>
            <div className="col-span-1">Class</div>
            <div className="col-span-1">Section</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredStudents.length === 0 ? (
            <div className="h-[300px] px-6 flex items-center justify-center">
              <p className="text-gray-500">No students found.</p>
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className={`h-[88px] px-6 flex items-center ${
                  index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex-1 grid grid-cols-7 gap-4 items-center">
                  <div className="col-span-1 text-gray-900 font-medium">{student.rollNo}</div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm overflow-hidden"
                        style={{ backgroundColor: theme.sidebarBg, color: theme.primaryColor }}
                      >
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name?.split(' ')[1]?.charAt(0) || student.name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{student.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 text-gray-600">{student.class}</div>
                  <div className="col-span-1 text-gray-600">{student.section}</div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      student.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
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
            ))
          )}
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
