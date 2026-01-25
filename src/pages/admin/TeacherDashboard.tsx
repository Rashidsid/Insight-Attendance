import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Edit, Trash2, Eye, UserPlus, Search, X } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import { getAllTeachers, deleteTeacher, updateTeacherStatus } from '../../services/teacherService';
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

interface Teacher {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  teacherId: string;
  subject: string;
  classes: string;
  status: string;
  experience: string;
  photo?: string | null;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  // Load teachers from Firebase
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const data = await getAllTeachers();
        const formattedTeachers = data.map((t: any) => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          name: `${t.firstName} ${t.lastName}`,
          teacherId: t.teacherId,
          subject: t.subject,
          classes: t.classes || '',
          status: t.status,
          experience: t.experience,
          photo: t.photo || null,
        }));
        setTeachers(formattedTeachers);
      } catch (error) {
        console.error('Error loading teachers:', error);
        toast.error('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const stats = [
    { label: 'Total Teachers', value: teachers.length.toString(), color: 'bg-indigo-500' },
    { label: 'Active Today', value: teachers.filter(t => t.status === 'Active').length.toString(), color: 'bg-green-500' },
    { label: 'On Leave', value: teachers.filter(t => t.status === 'On Leave').length.toString(), color: 'bg-orange-500' },
    { label: 'New This Month', value: '5', color: `var(--primary-color)` },
  ];

  const handleStatusChange = async (teacherId: string | undefined, newStatus: string) => {
    if (!teacherId) return;
    
    try {
      // Update local state first for instant feedback
      setTeachers(prevTeachers =>
        prevTeachers.map(teacher =>
          teacher.id === teacherId ? { ...teacher, status: newStatus } : teacher
        )
      );

      // Update in Firebase
      if (newStatus === 'Active' || newStatus === 'On Leave') {
        await updateTeacherStatus(teacherId, newStatus as 'Active' | 'On Leave');
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTeacher(deleteId);
      setTeachers(teachers.filter((t) => t.id !== deleteId));
      setDeleteId(null);
      toast.success('Teacher deleted successfully');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  };

  // First apply global search query, then local search
  const filteredTeachers = teachers.filter((teacher) => {
    const globalQuery = searchQuery.toLowerCase();
    const localQuery = localSearch.toLowerCase();
    
    // First filter by global search
    const matchesGlobal = !globalQuery ||
      teacher.name?.toLowerCase().includes(globalQuery) ||
      teacher.teacherId.toLowerCase().includes(globalQuery) ||
      teacher.subject.toLowerCase().includes(globalQuery) ||
      teacher.classes.toLowerCase().includes(globalQuery);
    
    // Then filter by local search
    const matchesLocal = !localQuery ||
      teacher.name?.toLowerCase().includes(localQuery) ||
      teacher.teacherId.toLowerCase().includes(localQuery) ||
      teacher.subject.toLowerCase().includes(localQuery) ||
      teacher.classes.toLowerCase().includes(localQuery);
    
    return matchesGlobal && matchesLocal;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-1">Manage and track teacher information</p>
        </div>
        <Button
          onClick={() => navigate('/admin/teachers/add')}
          style={{ backgroundColor: theme.primaryColor }}
          className="hover:opacity-90 rounded-xl h-12 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Teacher
        </Button>
      </div>

      {/* Local Search for This Page */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search in teacher list (Name, ID, Subject, Classes)..."
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

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div style={{ backgroundColor: theme.primaryColor }} className="text-white h-[60px] px-6 flex items-center">
          <div className="flex-1 grid grid-cols-7 gap-4">
            <div className="col-span-1">Teacher ID</div>
            <div className="col-span-2">Teacher Name</div>
            <div className="col-span-1">Subject</div>
            <div className="col-span-1">Experience</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredTeachers.length === 0 ? (
            <div className="h-[300px] px-6 flex items-center justify-center">
              <p className="text-gray-500">No teachers found.</p>
            </div>
          ) : (
            filteredTeachers.map((teacher, index) => (
              <div
                key={teacher.id}
                className={`h-[88px] px-6 flex items-center ${
                  index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex-1 grid grid-cols-7 gap-4 items-center">
                  <div className="col-span-1 text-gray-900 font-medium">{teacher.teacherId}</div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm overflow-hidden"
                        style={{ backgroundColor: theme.sidebarBg, color: theme.primaryColor }}
                      >
                        {teacher.photo ? (
                          <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          teacher.name?.split(' ')[1]?.charAt(0) || teacher.name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{teacher.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 text-gray-600">{teacher.subject}</div>
                  <div className="col-span-1 text-gray-600 text-sm">{teacher.experience}</div>
                  <div className="col-span-1">
                    <Select value={teacher.status} onValueChange={(newStatus) => handleStatusChange(teacher.id, newStatus)}>
                      <SelectTrigger className={`border-0 h-8 ${
                        teacher.status === 'Active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                      className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/teachers/edit/${teacher.id}`)}
                      className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => teacher.id && setDeleteId(teacher.id)}
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
              This action cannot be undone. This will permanently delete the teacher from the system.
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
