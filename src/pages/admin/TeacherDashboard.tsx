import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

// Mock data
const initialTeachers = [
  { id: 1, name: 'Ram Kumar', teacherId: 'TCH001', subject: 'Mathematics', classes: '10-A, 10-B', status: 'Active', experience: '15 years' },
  { id: 2, name: 'Shyam Singh', teacherId: 'TCH002', subject: 'Physics', classes: '11-A, 12-A', status: 'Active', experience: '12 years' },
  { id: 3, name: 'Farhan Ahmed', teacherId: 'TCH003', subject: 'English', classes: '9-A, 10-A', status: 'Active', experience: '8 years' },
  { id: 4, name: 'Shoaib Khan', teacherId: 'TCH004', subject: 'Chemistry', classes: '11-A, 11-B', status: 'Active', experience: '10 years' },
  { id: 5, name: 'Saif Ali', teacherId: 'TCH005', subject: 'Biology', classes: '10-A, 12-A', status: 'On Leave', experience: '14 years' },
  { id: 6, name: 'Siddiqui Hassan', teacherId: 'TCH006', subject: 'History', classes: '9-A, 9-B', status: 'Active', experience: '6 years' },
  { id: 7, name: 'Mohammad Amin', teacherId: 'TCH007', subject: 'Geography', classes: '10-A, 11-A', status: 'Active', experience: '9 years' },
  { id: 8, name: 'Rashid Karim', teacherId: 'TCH008', subject: 'Computer Science', classes: '10-B, 11-B', status: 'Active', experience: '7 years' },
  { id: 9, name: 'Komal Sharma', teacherId: 'TCH009', subject: 'Mathematics', classes: '9-A, 9-B', status: 'Active', experience: '16 years' },
  { id: 10, name: 'Ram Prasad', teacherId: 'TCH010', subject: 'English', classes: '11-A, 12-A', status: 'Active', experience: '11 years' },
  { id: 11, name: 'Shyam Verma', teacherId: 'TCH011', subject: 'Physics', classes: '10-A, 10-B', status: 'Active', experience: '13 years' },
  { id: 12, name: 'Farhan Hassan', teacherId: 'TCH012', subject: 'Chemistry', classes: '9-A, 11-A', status: 'Active', experience: '8 years' },
  { id: 13, name: 'Shoaib Malik', teacherId: 'TCH013', subject: 'Biology', classes: '9-B, 12-B', status: 'Active', experience: '10 years' },
  { id: 14, name: 'Saif Hussain', teacherId: 'TCH014', subject: 'History', classes: '10-A, 10-B', status: 'On Leave', experience: '17 years' },
  { id: 15, name: 'Mohammad Faisal', teacherId: 'TCH015', subject: 'Geography', classes: '9-A, 12-A', status: 'Active', experience: '5 years' },
];

// Complete teacher details for editing
const completeTeacherData = [
  { id: 1, firstName: 'Ram', lastName: 'Kumar', teacherId: 'TCH001', subject: 'Mathematics', dateOfBirth: '1980-05-15', gender: 'Male', email: 'ram.kumar@example.com', phone: '+91 98765 43210', address: '123 Main St, City', qualification: 'M.Sc. in Mathematics', experience: '15', joiningDate: '2010-08-01', status: 'Active', classes: '10-A, 10-B' },
  { id: 2, firstName: 'Shyam', lastName: 'Singh', teacherId: 'TCH002', subject: 'Physics', dateOfBirth: '1985-08-22', gender: 'Male', email: 'shyam.singh@example.com', phone: '+91 98765 43211', address: '456 Oak Ave, Town', qualification: 'M.Sc. in Physics', experience: '12', joiningDate: '2012-09-01', status: 'Active', classes: '11-A, 12-A' },
  { id: 3, firstName: 'Farhan', lastName: 'Ahmed', teacherId: 'TCH003', subject: 'English', dateOfBirth: '1990-03-10', gender: 'Male', email: 'farhan.ahmed@example.com', phone: '+91 98765 43212', address: '789 Elm St, Village', qualification: 'M.A. in English', experience: '8', joiningDate: '2016-07-01', status: 'Active', classes: '9-A, 10-A' },
  { id: 4, firstName: 'Shoaib', lastName: 'Khan', teacherId: 'TCH004', subject: 'Chemistry', dateOfBirth: '1982-12-18', gender: 'Male', email: 'shoaib.khan@example.com', phone: '+91 98765 43213', address: '234 Birch Ave, City', qualification: 'M.Sc. in Chemistry', experience: '10', joiningDate: '2014-08-15', status: 'Active', classes: '11-A, 11-B' },
  { id: 5, firstName: 'Saif', lastName: 'Ali', teacherId: 'TCH005', subject: 'Biology', dateOfBirth: '1978-06-25', gender: 'Male', email: 'saif.ali@example.com', phone: '+91 98765 43214', address: '345 Oak St, Town', qualification: 'M.Sc. in Biology', experience: '14', joiningDate: '2011-09-01', status: 'On Leave', classes: '10-A, 12-A' },
  { id: 6, firstName: 'Siddiqui', lastName: 'Hassan', teacherId: 'TCH006', subject: 'History', dateOfBirth: '1992-09-08', gender: 'Male', email: 'siddiqui.hassan@example.com', phone: '+91 98765 43215', address: '456 Maple Dr, Village', qualification: 'M.A. in History', experience: '6', joiningDate: '2018-07-01', status: 'Active', classes: '9-A, 9-B' },
  { id: 7, firstName: 'Mohammad', lastName: 'Amin', teacherId: 'TCH007', subject: 'Geography', dateOfBirth: '1988-04-12', gender: 'Male', email: 'mohammad.amin@example.com', phone: '+91 98765 43216', address: '567 Oak St, City', qualification: 'M.A. in Geography', experience: '9', joiningDate: '2015-08-01', status: 'Active', classes: '10-A, 11-A' },
  { id: 8, firstName: 'Rashid', lastName: 'Karim', teacherId: 'TCH008', subject: 'Computer Science', dateOfBirth: '1991-07-19', gender: 'Male', email: 'rashid.karim@example.com', phone: '+91 98765 43217', address: '678 Pine Rd, Town', qualification: 'M.Tech. in Computer Science', experience: '7', joiningDate: '2017-09-01', status: 'Active', classes: '10-B, 11-B' },
  { id: 9, firstName: 'Komal', lastName: 'Sharma', teacherId: 'TCH009', subject: 'Mathematics', dateOfBirth: '1978-11-23', gender: 'Female', email: 'komal.sharma@example.com', phone: '+91 98765 43218', address: '789 Elm Ave, Village', qualification: 'M.Sc. in Mathematics', experience: '16', joiningDate: '2008-08-01', status: 'Active', classes: '9-A, 9-B' },
  { id: 10, firstName: 'Ram', lastName: 'Prasad', teacherId: 'TCH010', subject: 'English', dateOfBirth: '1987-02-14', gender: 'Male', email: 'ram.prasad@example.com', phone: '+91 98765 43219', address: '890 Cedar Ave, City', qualification: 'M.A. in English', experience: '11', joiningDate: '2013-07-15', status: 'Active', classes: '11-A, 12-A' },
  { id: 11, firstName: 'Shyam', lastName: 'Verma', teacherId: 'TCH011', subject: 'Physics', dateOfBirth: '1981-08-07', gender: 'Male', email: 'shyam.verma@example.com', phone: '+91 98765 43220', address: '901 Maple Ave, Town', qualification: 'M.Sc. in Physics', experience: '13', joiningDate: '2011-09-01', status: 'Active', classes: '10-A, 10-B' },
  { id: 12, firstName: 'Farhan', lastName: 'Hassan', teacherId: 'TCH012', subject: 'Chemistry', dateOfBirth: '1989-05-30', gender: 'Male', email: 'farhan.hassan@example.com', phone: '+91 98765 43221', address: '012 Oak Ln, Village', qualification: 'M.Sc. in Chemistry', experience: '8', joiningDate: '2016-08-01', status: 'Active', classes: '9-A, 11-A' },
  { id: 13, firstName: 'Shoaib', lastName: 'Malik', teacherId: 'TCH013', subject: 'Biology', dateOfBirth: '1986-10-11', gender: 'Male', email: 'shoaib.malik@example.com', phone: '+91 98765 43222', address: '123 Birch Ave, City', qualification: 'M.Sc. in Biology', experience: '10', joiningDate: '2014-09-01', status: 'Active', classes: '9-B, 12-B' },
  { id: 14, firstName: 'Saif', lastName: 'Hussain', teacherId: 'TCH014', subject: 'History', dateOfBirth: '1976-12-28', gender: 'Male', email: 'saif.hussain@example.com', phone: '+91 98765 43223', address: '234 Cedar Ave, Town', qualification: 'M.A. in History', experience: '17', joiningDate: '2006-07-01', status: 'On Leave', classes: '10-A, 10-B' },
  { id: 15, firstName: 'Mohammad', lastName: 'Faisal', teacherId: 'TCH015', subject: 'Geography', dateOfBirth: '1993-06-15', gender: 'Male', email: 'mohammad.faisal@example.com', phone: '+91 98765 43224', address: '345 Pine Rd, Village', qualification: 'M.A. in Geography', experience: '5', joiningDate: '2019-08-01', status: 'Active', classes: '9-A, 12-A' },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [teachers, setTeachers] = useState(initialTeachers);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Initialize complete teacher data in localStorage on first load
  useEffect(() => {
    // Clear old data and always use the latest mock data
    localStorage.removeItem('teacherStatusUpdates');
    localStorage.setItem('teacherDetails', JSON.stringify(completeTeacherData));
  }, []);

  // Load status updates and data changes from localStorage
  useEffect(() => {
    const storedDetails = localStorage.getItem('teacherDetails');
    if (storedDetails) {
      const allTeachers = JSON.parse(storedDetails);
      // Update display list from complete data
      setTeachers(allTeachers.map((t: any) => ({
        id: t.id,
        name: `${t.firstName.startsWith('Dr.') || t.firstName.startsWith('Prof.') || t.firstName.startsWith('Mr.') || t.firstName.startsWith('Ms.') ? '' : t.gender === 'Male' ? 'Mr. ' : t.gender === 'Female' ? 'Ms. ' : ''}${t.firstName} ${t.lastName}`,
        teacherId: t.teacherId,
        subject: t.subject,
        classes: t.classes,
        status: t.status,
        experience: `${t.experience} years`
      })));
    } else {
      // Fallback to status updates if no complete data
      const statusUpdates = JSON.parse(localStorage.getItem('teacherStatusUpdates') || '{}');
      if (Object.keys(statusUpdates).length > 0) {
        setTeachers(prevTeachers =>
          prevTeachers.map(teacher => ({
            ...teacher,
            status: statusUpdates[teacher.id] || teacher.status
          }))
        );
      }
    }
  }, []);

  const stats = [
    { label: 'Total Teachers', value: '156', color: 'bg-indigo-500' },
    { label: 'Active Today', value: '142', color: 'bg-green-500' },
    { label: 'On Leave', value: '8', color: 'bg-orange-500' },
    { label: 'New This Month', value: '5', color: 'bg-[#A982D9]' },
  ];

  const handleDelete = () => {
    if (deleteId === null) return;
    setTeachers(teachers.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.teacherId.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.classes.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Teacher Management</h1>
          <p className="text-gray-600 mt-1">Manage and track teacher information</p>
        </div>
        <Button
          onClick={() => navigate('/teachers/add')}
          className="bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Teacher
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

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#A982D9] text-white h-[60px] px-6 flex items-center">
          <div className="flex-1 grid grid-cols-7 gap-4">
            <div className="col-span-1">Teacher ID</div>
            <div className="col-span-2">Teacher Name</div>
            <div className="col-span-1">Subject</div>
            <div className="col-span-1">Classes</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredTeachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className={`h-[88px] px-6 flex items-center ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1 grid grid-cols-7 gap-4 items-center">
                <div className="col-span-1 text-gray-900">{teacher.teacherId}</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E7D7F6] rounded-full flex items-center justify-center text-[#A982D9]">
                      {teacher.name.split(' ')[1]?.charAt(0) || teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-gray-900">{teacher.name}</div>
                      <div className="text-xs text-gray-500">{teacher.experience}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-gray-600">{teacher.subject}</div>
                <div className="col-span-1 text-gray-600 text-sm">{teacher.classes}</div>
                <div className="col-span-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    teacher.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {teacher.status}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigate(`/teachers/edit/${teacher.id}`)}
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={() => setDeleteId(teacher.id)}
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