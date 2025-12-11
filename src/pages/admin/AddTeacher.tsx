import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function AddTeacher() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    teacherId: '',
    subject: '',
    classes: [] as string[],
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    joiningDate: '',
  });

  // Load subjects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('subjects');
    if (stored) {
      setSubjects(JSON.parse(stored));
    } else {
      // Default subjects if none exist
      const defaultSubjects = [
        { id: '1', name: 'Mathematics', code: 'MATH' },
        { id: '2', name: 'Physics', code: 'PHY' },
        { id: '3', name: 'Chemistry', code: 'CHEM' },
        { id: '4', name: 'Biology', code: 'BIO' },
        { id: '5', name: 'English', code: 'ENG' },
        { id: '6', name: 'History', code: 'HIST' },
        { id: '7', name: 'Geography', code: 'GEO' },
        { id: '8', name: 'Computer Science', code: 'CS' },
      ];
      setSubjects(defaultSubjects);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit - navigate back to teacher list
    navigate('/teachers');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/teachers')}
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teachers
        </Button>
        <h1>Add New Teacher</h1>
        <p className="text-gray-600 mt-1">Fill in the teacher information below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Photo Upload */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <Label className="mb-4 block">Teacher Photo</Label>
              <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-[#E7D7F6] rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-[#A982D9]" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Upload teacher photo</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full rounded-xl gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
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
                  <Label htmlFor="teacherId">Teacher ID *</Label>
                  <Input
                    id="teacherId"
                    placeholder="e.g., TCH001"
                    className="h-12 rounded-xl mt-2"
                    value={formData.teacherId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, teacherId: e.target.value })}
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
                <div>
                  <Label htmlFor="joiningDate">Joining Date *</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    className="h-12 rounded-xl mt-2"
                    value={formData.joiningDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, joiningDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-6">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value: string) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger className="h-12 rounded-xl mt-2">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                      {subjects.length === 0 && (
                        <div className="px-2 py-3 text-sm text-gray-500 text-center">
                          No subjects available.
                          <button
                            type="button"
                            onClick={() => navigate('/manage-subjects')}
                            className="text-[#A982D9] hover:underline block mt-1"
                          >
                            Add subjects here
                          </button>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g., 5"
                    className="h-12 rounded-xl mt-2"
                    value={formData.experience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="qualification">Highest Qualification *</Label>
                  <Input
                    id="qualification"
                    placeholder="e.g., M.Sc. in Mathematics"
                    className="h-12 rounded-xl mt-2"
                    value={formData.qualification}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="mb-6">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@example.com"
                    className="h-12 rounded-xl mt-2"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-xl mt-2"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    required
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

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => navigate('/teachers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#A982D9] hover:bg-[#9770C8]"
              >
                Add Teacher
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
