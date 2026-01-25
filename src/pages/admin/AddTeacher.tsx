import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { addTeacher } from '../../services/teacherService';
import { notifyTeacherCreated } from '../../services/emailService';

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function AddTeacher() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    teacherId: '',
    subject: '',
    classes: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    joiningDate: '',
  });

  // Load subjects from Firestore
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.teacherId.trim() || 
        !formData.subject.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create teacher object with base64 photo (stored directly in Firestore like students)
      const newTeacher = {
        ...formData,
        status: 'Active' as const,
        photo: photoPreview || null,
      };

      // Add to Firebase
      await addTeacher(newTeacher);
      
      // Send welcome email notification
      if (formData.email && formData.email.trim()) {
        const emailResult = await notifyTeacherCreated({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          teacherId: formData.teacherId,
          subject: formData.subject,
          instituteName: 'Herald College Kathmandu', // Update this with your institution name
        });

        if (emailResult.success) {
          if (emailResult.method === 'firebase') {
            toast.success('Teacher added and welcome email sent!');
          } else {
            toast.success('Teacher added! Email will be sent shortly.');
          }
        } else {
          toast.warning('Teacher added! (Email could not be sent - will retry)');
        }
      } else {
        toast.success('Teacher added successfully!');
      }

      navigate('/admin/teachers');
    } catch (error) {
      console.error('Error adding teacher:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add teacher: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Create base64 and store directly
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setPhotoPreview(base64String);
        toast.success('Photo selected successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/admin/teachers')}
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
              <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Teacher preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: theme.sidebarBg }}
                    >
                      <Upload className="w-8 h-8" style={{ color: theme.primaryColor }} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Upload teacher photo</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl gap-2"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={loading}
              >
                <Upload className="w-4 h-4" />
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl text-red-600 hover:text-red-700"
                  onClick={() => {
                    setPhotoPreview(null);
                  }}
                  disabled={loading}
                >
                  Remove Photo
                </Button>
              )}
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
                          onClick={() => navigate('/admin/manage-subjects')}
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
                onClick={() => navigate('/admin/teachers')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: theme.primaryColor }}
                className="flex-1 h-12 rounded-xl hover:opacity-90"
              >
                {loading ? 'Adding Teacher...' : 'Add Teacher'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
