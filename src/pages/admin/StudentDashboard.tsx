import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
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
  id: number;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  attendance: string;
  status: string;
  photo?: string | null;
}

// Mock data
const initialStudents = [
  { id: 1, name: 'Ram Kumar', rollNo: 'STU001', class: '10-A', section: 'Science', attendance: '92%', status: 'Active' },
  { id: 2, name: 'Shyam Singh', rollNo: 'STU002', class: '10-A', section: 'Science', attendance: '88%', status: 'Active' },
  { id: 3, name: 'Farhan Ahmed', rollNo: 'STU003', class: '10-B', section: 'Commerce', attendance: '95%', status: 'Active' },
  { id: 4, name: 'Shoaib Khan', rollNo: 'STU004', class: '10-A', section: 'Science', attendance: '85%', status: 'Active' },
  { id: 5, name: 'Saif Ali', rollNo: 'STU005', class: '9-A', section: 'Arts', attendance: '78%', status: 'Inactive' },
  { id: 6, name: 'Siddiqui Hassan', rollNo: 'STU006', class: '10-B', section: 'Commerce', attendance: '91%', status: 'Active' },
  { id: 7, name: 'Mohammad Amin', rollNo: 'STU007', class: '11-A', section: 'Science', attendance: '89%', status: 'Active' },
  { id: 8, name: 'Rashid Karim', rollNo: 'STU008', class: '10-B', section: 'Science', attendance: '94%', status: 'Active' },
  { id: 9, name: 'Komal Sharma', rollNo: 'STU009', class: '9-B', section: 'Commerce', attendance: '81%', status: 'Active' },
  { id: 10, name: 'Ram Prasad', rollNo: 'STU010', class: '11-B', section: 'Arts', attendance: '87%', status: 'Active' },
  { id: 11, name: 'Shyam Verma', rollNo: 'STU011', class: '10-A', section: 'Commerce', attendance: '93%', status: 'Active' },
  { id: 12, name: 'Farhan Hassan', rollNo: 'STU012', class: '9-A', section: 'Science', attendance: '86%', status: 'Active' },
  { id: 13, name: 'Shoaib Malik', rollNo: 'STU013', class: '10-B', section: 'Arts', attendance: '80%', status: 'Active' },
  { id: 14, name: 'Saif Hussain', rollNo: 'STU014', class: '11-A', section: 'Commerce', attendance: '96%', status: 'Active' },
  { id: 15, name: 'Siddiqui Azad', rollNo: 'STU015', class: '10-A', section: 'Science', attendance: '84%', status: 'Inactive' },
  { id: 16, name: 'Mohammad Faisal', rollNo: 'STU016', class: '9-B', section: 'Science', attendance: '90%', status: 'Active' },
  { id: 17, name: 'Rashid Nasir', rollNo: 'STU017', class: '11-B', section: 'Commerce', attendance: '88%', status: 'Active' },
  { id: 18, name: 'Komal Verma', rollNo: 'STU018', class: '10-B', section: 'Science', attendance: '92%', status: 'Active' },
  { id: 19, name: 'Ram Singh', rollNo: 'STU019', class: '10-A', section: 'Arts', attendance: '79%', status: 'Active' },
  { id: 20, name: 'Shyam Patel', rollNo: 'STU020', class: '11-A', section: 'Science', attendance: '95%', status: 'Active' },
];

// Complete student details for editing
const completeStudentData = [
  { id: 1, firstName: 'Ram', lastName: 'Kumar', rollNo: 'STU001', class: '10-A', section: 'Science', dateOfBirth: '2008-05-15', gender: 'Male', email: 'ram@example.com', phone: '+91 98765 43210', address: '123 Main St, City', parentName: 'Raj Kumar', parentPhone: '+91 98765 43211', parentEmail: 'raj.kumar@example.com', status: 'Active', attendance: '92%' },
  { id: 2, firstName: 'Shyam', lastName: 'Singh', rollNo: 'STU002', class: '10-A', section: 'Science', dateOfBirth: '2008-08-22', gender: 'Male', email: 'shyam@example.com', phone: '+91 98765 43212', address: '456 Oak Ave, Town', parentName: 'Vikram Singh', parentPhone: '+91 98765 43213', parentEmail: 'vikram.singh@example.com', status: 'Active', attendance: '88%' },
  { id: 3, firstName: 'Farhan', lastName: 'Ahmed', rollNo: 'STU003', class: '10-B', section: 'Commerce', dateOfBirth: '2008-03-10', gender: 'Male', email: 'farhan@example.com', phone: '+91 98765 43214', address: '789 Elm St, Village', parentName: 'Akram Ahmed', parentPhone: '+91 98765 43215', parentEmail: 'akram.ahmed@example.com', status: 'Active', attendance: '95%' },
  { id: 4, firstName: 'Shoaib', lastName: 'Khan', rollNo: 'STU004', class: '10-A', section: 'Science', dateOfBirth: '2008-11-05', gender: 'Male', email: 'shoaib@example.com', phone: '+91 98765 43216', address: '321 Pine Rd, City', parentName: 'Iqbal Khan', parentPhone: '+91 98765 43217', parentEmail: 'iqbal.khan@example.com', status: 'Active', attendance: '85%' },
  { id: 5, firstName: 'Saif', lastName: 'Ali', rollNo: 'STU005', class: '9-A', section: 'Arts', dateOfBirth: '2009-01-20', gender: 'Male', email: 'saif@example.com', phone: '+91 98765 43218', address: '654 Maple Dr, Town', parentName: 'Ali Hassan', parentPhone: '+91 98765 43219', parentEmail: 'ali.hassan@example.com', status: 'Inactive', attendance: '78%' },
  { id: 6, firstName: 'Siddiqui', lastName: 'Hassan', rollNo: 'STU006', class: '10-B', section: 'Commerce', dateOfBirth: '2008-07-12', gender: 'Male', email: 'siddiqui@example.com', phone: '+91 98765 43220', address: '789 Cedar Ln, Village', parentName: 'Hassan Siddiqui', parentPhone: '+91 98765 43221', parentEmail: 'hassan.siddiqui@example.com', status: 'Active', attendance: '91%' },
  { id: 7, firstName: 'Mohammad', lastName: 'Amin', rollNo: 'STU007', class: '11-A', section: 'Science', dateOfBirth: '2007-02-18', gender: 'Male', email: 'mohammad@example.com', phone: '+91 98765 43222', address: '234 Birch Ave, City', parentName: 'Amin Mohammad', parentPhone: '+91 98765 43223', parentEmail: 'amin.mohammad@example.com', status: 'Active', attendance: '89%' },
  { id: 8, firstName: 'Rashid', lastName: 'Karim', rollNo: 'STU008', class: '10-B', section: 'Science', dateOfBirth: '2008-06-30', gender: 'Male', email: 'rashid@example.com', phone: '+91 98765 43224', address: '456 Maple Dr, Town', parentName: 'Karim Rashid', parentPhone: '+91 98765 43225', parentEmail: 'karim.rashid@example.com', status: 'Active', attendance: '94%' },
  { id: 9, firstName: 'Komal', lastName: 'Sharma', rollNo: 'STU009', class: '9-B', section: 'Commerce', dateOfBirth: '2009-09-12', gender: 'Female', email: 'komal@example.com', phone: '+91 98765 43226', address: '567 Oak St, Village', parentName: 'Ramesh Sharma', parentPhone: '+91 98765 43227', parentEmail: 'ramesh.sharma@example.com', status: 'Active', attendance: '81%' },
  { id: 10, firstName: 'Ram', lastName: 'Prasad', rollNo: 'STU010', class: '11-B', section: 'Arts', dateOfBirth: '2007-04-25', gender: 'Male', email: 'ramprasad@example.com', phone: '+91 98765 43228', address: '678 Pine Rd, City', parentName: 'Prasad Rao', parentPhone: '+91 98765 43229', parentEmail: 'prasad.rao@example.com', status: 'Active', attendance: '87%' },
  { id: 11, firstName: 'Shyam', lastName: 'Verma', rollNo: 'STU011', class: '10-A', section: 'Commerce', dateOfBirth: '2008-10-08', gender: 'Male', email: 'shyamverma@example.com', phone: '+91 98765 43230', address: '789 Elm Ave, Town', parentName: 'Vikram Verma', parentPhone: '+91 98765 43231', parentEmail: 'vikram.verma@example.com', status: 'Active', attendance: '93%' },
  { id: 12, firstName: 'Farhan', lastName: 'Hassan', rollNo: 'STU012', class: '9-A', section: 'Science', dateOfBirth: '2009-03-14', gender: 'Male', email: 'farhanhasan@example.com', phone: '+91 98765 43232', address: '890 Cedar Ln, Village', parentName: 'Hassan Malik', parentPhone: '+91 98765 43233', parentEmail: 'hassan.malik@example.com', status: 'Active', attendance: '86%' },
  { id: 13, firstName: 'Shoaib', lastName: 'Malik', rollNo: 'STU013', class: '10-B', section: 'Arts', dateOfBirth: '2008-12-27', gender: 'Male', email: 'shoaibmalik@example.com', phone: '+91 98765 43234', address: '901 Maple Ave, City', parentName: 'Malik Ahmed', parentPhone: '+91 98765 43235', parentEmail: 'malik.ahmed@example.com', status: 'Active', attendance: '80%' },
  { id: 14, firstName: 'Saif', lastName: 'Hussain', rollNo: 'STU014', class: '11-A', section: 'Commerce', dateOfBirth: '2007-01-19', gender: 'Male', email: 'saifhussain@example.com', phone: '+91 98765 43236', address: '012 Oak Ln, Town', parentName: 'Hussain Khan', parentPhone: '+91 98765 43237', parentEmail: 'hussain.khan@example.com', status: 'Active', attendance: '96%' },
  { id: 15, firstName: 'Siddiqui', lastName: 'Azad', rollNo: 'STU015', class: '10-A', section: 'Science', dateOfBirth: '2008-07-22', gender: 'Male', email: 'siddiquiazad@example.com', phone: '+91 98765 43238', address: '123 Birch Ave, Village', parentName: 'Azad Siddiqui', parentPhone: '+91 98765 43239', parentEmail: 'azad.siddiqui@example.com', status: 'Inactive', attendance: '84%' },
  { id: 16, firstName: 'Mohammad', lastName: 'Faisal', rollNo: 'STU016', class: '9-B', section: 'Science', dateOfBirth: '2009-05-10', gender: 'Male', email: 'mohammdfaisal@example.com', phone: '+91 98765 43240', address: '234 Cedar Ave, City', parentName: 'Faisal Ahmad', parentPhone: '+91 98765 43241', parentEmail: 'faisal.ahmad@example.com', status: 'Active', attendance: '90%' },
  { id: 17, firstName: 'Rashid', lastName: 'Nasir', rollNo: 'STU017', class: '11-B', section: 'Commerce', dateOfBirth: '2007-11-03', gender: 'Male', email: 'rashidnasir@example.com', phone: '+91 98765 43242', address: '345 Pine Ave, Town', parentName: 'Nasir Ahmed', parentPhone: '+91 98765 43243', parentEmail: 'nasir.ahmed@example.com', status: 'Active', attendance: '88%' },
  { id: 18, firstName: 'Komal', lastName: 'Verma', rollNo: 'STU018', class: '10-B', section: 'Science', dateOfBirth: '2008-09-16', gender: 'Female', email: 'komalverma@example.com', phone: '+91 98765 43244', address: '456 Elm Ave, Village', parentName: 'Anuj Verma', parentPhone: '+91 98765 43245', parentEmail: 'anuj.verma@example.com', status: 'Active', attendance: '92%' },
  { id: 19, firstName: 'Ram', lastName: 'Singh', rollNo: 'STU019', class: '10-A', section: 'Arts', dateOfBirth: '2008-04-21', gender: 'Male', email: 'ramsingh@example.com', phone: '+91 98765 43246', address: '567 Maple Ave, City', parentName: 'Ravi Singh', parentPhone: '+91 98765 43247', parentEmail: 'ravi.singh@example.com', status: 'Active', attendance: '79%' },
  { id: 20, firstName: 'Shyam', lastName: 'Patel', rollNo: 'STU020', class: '11-A', section: 'Science', dateOfBirth: '2007-08-09', gender: 'Male', email: 'shyampatel@example.com', phone: '+91 98765 43248', address: '678 Oak Ave, Town', parentName: 'Prakash Patel', parentPhone: '+91 98765 43249', parentEmail: 'prakash.patel@example.com', status: 'Active', attendance: '95%' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [students, setStudents] = useState<Student[]>(initialStudents as Student[]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleStatusChange = (studentId: number, newStatus: string) => {
    // Update local state
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
    
    // Update localStorage
    const storedDetails = localStorage.getItem('studentDetails');
    if (storedDetails) {
      const allStudents = JSON.parse(storedDetails);
      const updatedStudents = allStudents.map((s: any) =>
        s.id === studentId ? { ...s, status: newStatus } : s
      );
      localStorage.setItem('studentDetails', JSON.stringify(updatedStudents));
    }
  };

  // Initialize complete student data in localStorage on first load
  useEffect(() => {
    // Clear old data and always use the latest mock data
    localStorage.removeItem('studentStatusUpdates');
    localStorage.setItem('studentDetails', JSON.stringify(completeStudentData));
  }, []);

  // Load status updates and data changes from localStorage
  useEffect(() => {
    const storedDetails = localStorage.getItem('studentDetails');
    if (storedDetails) {
      const allStudents = JSON.parse(storedDetails);
      // Update display list from complete data
      setStudents(allStudents.map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        attendance: s.attendance,
        status: s.status,
        photo: s.photo || null
      })));
    } else {
      // Fallback to status updates if no complete data
      const statusUpdates = JSON.parse(localStorage.getItem('studentStatusUpdates') || '{}');
      if (Object.keys(statusUpdates).length > 0) {
        setStudents(prevStudents =>
          prevStudents.map(student => ({
            ...student,
            status: statusUpdates[student.id] || student.status
          }))
        );
      }
    }
  }, []);

  const stats = [
    { label: 'Total Students', value: '1,234', color: 'bg-blue-500' },
    { label: 'Active Today', value: '987', color: 'bg-green-500' },
    { label: 'Absent Today', value: '45', color: 'bg-red-500' },
    { label: 'Average Attendance', value: '89%', color: 'bg-[#A982D9]' },
  ];

  const handleDelete = () => {
    if (deleteId === null) return;
    setStudents(students.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  };

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query) ||
      student.section.toLowerCase().includes(query)
    );
  });

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
                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
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
                    parseInt(student.attendance) >= 90
                      ? 'bg-green-100 text-green-700'
                      : parseInt(student.attendance) >= 80
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
                    onClick={() => setDeleteId(student.id)}
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
