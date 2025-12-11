import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';

interface ClassSection {
  id: string;
  name: string;
  section: string;
}

export default function AddStudent() {
  const navigate = useNavigate();
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
    // Mock submit - navigate back to student list
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
        <h1>Add New Student</h1>
        <p className="text-gray-600 mt-1">Fill in the student information below</p>
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
                <div>
                  
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
                <div className="col-span-2">
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
                  <Label htmlFor="parentPhone">Parent Phone *</Label>
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
                  <Label htmlFor="parentEmail">Parent Email</Label>
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
                Add Student
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
