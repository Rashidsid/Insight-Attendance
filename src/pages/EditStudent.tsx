import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';

interface ClassSection {
  id: string;
  name: string;
  section: string;
}

// Mock student data - in real app, this would come from API/database
const getStudentData = (studentId: number) => {
  // Try to get from localStorage first
  const stored = localStorage.getItem('studentDetails');
  if (stored) {
    const allStudents = JSON.parse(stored);
    const found = allStudents.find((s: any) => s.id === studentId);
    if (found) return found;
  }
  
  // Fallback to mock data
  const mockStudents = [
    { id: 1, firstName: 'Ram', lastName: 'Kumar', rollNo: 'STU001', class: '10-A', section: 'Science', dateOfBirth: '2008-05-15', gender: 'Male', email: 'ram@example.com', phone: '+91 98765 43210', address: '123 Main St, City', parentName: 'Raj Kumar', parentPhone: '+91 98765 43211', parentEmail: 'raj.kumar@example.com' },
    { id: 2, firstName: 'Shyam', lastName: 'Singh', rollNo: 'STU002', class: '10-A', section: 'Science', dateOfBirth: '2008-08-22', gender: 'Male', email: 'shyam@example.com', phone: '+91 98765 43212', address: '456 Oak Ave, Town', parentName: 'Vikram Singh', parentPhone: '+91 98765 43213', parentEmail: 'vikram.singh@example.com' },
    { id: 3, firstName: 'Farhan', lastName: 'Ahmed', rollNo: 'STU003', class: '10-B', section: 'Commerce', dateOfBirth: '2008-03-10', gender: 'Male', email: 'farhan@example.com', phone: '+91 98765 43214', address: '789 Elm St, Village', parentName: 'Akram Ahmed', parentPhone: '+91 98765 43215', parentEmail: 'akram.ahmed@example.com' },
    { id: 4, firstName: 'Shoaib', lastName: 'Khan', rollNo: 'STU004', class: '10-A', section: 'Science', dateOfBirth: '2008-11-05', gender: 'Male', email: 'shoaib@example.com', phone: '+91 98765 43216', address: '321 Pine Rd, City', parentName: 'Iqbal Khan', parentPhone: '+91 98765 43217', parentEmail: 'iqbal.khan@example.com' },
    { id: 5, firstName: 'Saif', lastName: 'Ali', rollNo: 'STU005', class: '9-A', section: 'Arts', dateOfBirth: '2009-01-20', gender: 'Male', email: 'saif@example.com', phone: '+91 98765 43218', address: '654 Maple Dr, Town', parentName: 'Ali Hassan', parentPhone: '+91 98765 43219', parentEmail: 'ali.hassan@example.com' },
    { id: 6, firstName: 'Siddiqui', lastName: 'Hassan', rollNo: 'STU006', class: '10-B', section: 'Commerce', dateOfBirth: '2008-07-12', gender: 'Male', email: 'siddiqui@example.com', phone: '+91 98765 43220', address: '789 Cedar Ln, Village', parentName: 'Hassan Siddiqui', parentPhone: '+91 98765 43221', parentEmail: 'hassan.siddiqui@example.com' },
  ];
  
  return mockStudents.find(s => s.id === studentId);
};

export default function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNo: '',
    class: '',
    section: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    password: '',
  });

  // Load student data
  useEffect(() => {
    const studentId = parseInt(id || '0');
    const student = getStudentData(studentId);
    if (student) {
      setFormData({
        ...student,
        password: '', // Don't show actual password
      });
    }
  }, [id]);

  // Load classes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('classes');
    if (stored) {
      setClasses(JSON.parse(stored));
    } else {
      // Default classes if none exist
      const defaultClasses = [
        { id: '1', name: '9', section: 'A' },
        { id: '2', name: '9', section: 'B' },
        { id: '3', name: '10', section: 'A' },
        { id: '4', name: '10', section: 'B' },
        { id: '5', name: '11', section: 'A' },
        { id: '6', name: '11', section: 'B' },
        { id: '7', name: '12', section: 'A' },
        { id: '8', name: '12', section: 'B' },
      ];
      setClasses(defaultClasses);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save updated student data to localStorage
    const studentId = parseInt(id || '0');
    const storedDetails = localStorage.getItem('studentDetails');
    
    if (storedDetails) {
      const allStudents = JSON.parse(storedDetails);
      const updatedStudents = allStudents.map((student: any) => {
        if (student.id === studentId) {
          return {
            ...student,
            firstName: formData.firstName,
            lastName: formData.lastName,
            rollNo: formData.rollNo,
            class: formData.class,
            section: formData.section,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            parentEmail: formData.parentEmail,
          };
        }
        return student;
      });
      
      localStorage.setItem('studentDetails', JSON.stringify(updatedStudents));
    }
    
    // Navigate back to student list
    navigate('/students');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/students')}
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
        <h1>Edit Student</h1>
        <p className="text-gray-600 mt-1">Update student information below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Photo Upload */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <Label className="mb-4 block">Student Photo</Label>
              <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-[#E7D7F6] rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-[#A982D9]" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Upload student photo</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full rounded-xl gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-xl gap-2">
                  <Upload className="w-4 h-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-6">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    className="h-12 rounded-xl mt-2"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    className="h-12 rounded-xl mt-2"
                    value={formData.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rollNo">Roll Number *</Label>
                  <Input
                    id="rollNo"
                    placeholder="e.g., STU001"
                    className="h-12 rounded-xl mt-2"
                    value={formData.rollNo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, rollNo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="h-12 rounded-xl mt-2"
                    value={formData.dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Select value={formData.class} onValueChange={(value: string) => setFormData({ ...formData, class: value })}>
                    <SelectTrigger className="h-12 rounded-xl mt-2">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={`${cls.name}-${cls.section}`}>
                          {cls.name}-{cls.section}
                        </SelectItem>
                      ))}
                      {classes.length === 0 && (
                        <div className="px-2 py-3 text-sm text-gray-500 text-center">
                          No classes available.
                          <button
                            type="button"
                            onClick={() => navigate('/manage-classes')}
                            className="text-[#A982D9] hover:underline block mt-1"
                          >
                            Add classes here
                          </button>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Select value={formData.section} onValueChange={(value: string) => setFormData({ ...formData, section: value })}>
                    <SelectTrigger className="h-12 rounded-xl mt-2">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: string) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="h-12 rounded-xl mt-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-6">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    className="h-12 rounded-xl mt-2"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-xl mt-2"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    className="rounded-xl mt-2 min-h-[100px]"
                    value={formData.address}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-6">Parent/Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    placeholder="Enter parent name"
                    className="h-12 rounded-xl mt-2"
                    value={formData.parentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, parentName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Parent Phone Number *</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-xl mt-2"
                    value={formData.parentPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, parentPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parentEmail">Parent Email Address</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@example.com"
                    className="h-12 rounded-xl mt-2"
                    value={formData.parentEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => navigate('/students')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#A982D9] hover:bg-[#9770C8]"
              >
                Update Student
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}