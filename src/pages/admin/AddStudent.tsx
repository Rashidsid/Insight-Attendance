import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { addStudent, uploadStudentImage } from '../../services/studentService';
import { getUniqueClassNames, getSectionsForClass } from '../../services/classService';
import { notifyStudentCreated } from '../../services/emailService';
import { enrollStudentFace } from '../../services/faceRecognitionService';
import FaceCaptureModal from '../../components/FaceCaptureModal';

export default function AddStudent() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [classNames, setClassNames] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [faceImages, setFaceImages] = useState<{ front: string | null; left: string | null; right: string | null; up: string | null; down: string | null } | null>(null);
  const [showFaceCaptureModal, setShowFaceCaptureModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNo: '',
    class: '',
    section: '',
    dateOfBirth: '',
    admissionDate: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  // Load class names from Firebase
  useEffect(() => {
    loadClassNames();
  }, []);

  const loadClassNames = async () => {
    try {
      const names = await getUniqueClassNames();
      setClassNames(names);
    } catch (error) {
      console.error('Error loading class names:', error);
      toast.error('Failed to load classes');
    }
  };

  // Load sections when class changes
  useEffect(() => {
    if (formData.class) {
      loadSectionsForClass();
    } else {
      setSections([]);
    }
  }, [formData.class]);

  const loadSectionsForClass = async () => {
    try {
      const sectionsForClass = await getSectionsForClass(formData.class);
      setSections(sectionsForClass);
      // Reset section when class changes
      setFormData(prev => ({ ...prev, section: '' }));
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load sections');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Step 1: Upload images to Firebase Storage and get URLs
      let photoURL: string | null = null;
      let faceImageURLs: Record<string, string> = {};

      // Upload primary photo if provided
      if (photoPreview && typeof photoPreview === 'string') {
        try {
          console.log('[DEBUG] Uploading photo...');
          photoURL = await uploadStudentImage(formData.rollNo, photoPreview, 'photo');
          console.log('[DEBUG] Photo uploaded, URL:', photoURL);
        } catch (error) {
          console.warn('Warning: Could not upload profile photo:', error);
        }
      }

      // Upload face images if provided
      if (faceImages && typeof faceImages === 'object') {
        console.log('[DEBUG] Uploading face images...');
        for (const [angle, base64] of Object.entries(faceImages)) {
          if (base64 && typeof base64 === 'string') {
            try {
              const url = await uploadStudentImage(
                formData.rollNo,
                base64,
                angle as 'front' | 'left' | 'right' | 'up' | 'down'
              );
              faceImageURLs[angle] = url;
              console.log(`[DEBUG] ${angle} uploaded:`, url);
            } catch (error) {
              console.warn(`Warning: Could not upload ${angle} face image:`, error);
            }
          }
        }
      }

      console.log('[DEBUG] All uploads complete. Creating student object...');

      // Step 2: Create CLEAN student object with URLs ONLY (explicitly no base64)
      const newStudent = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNo: formData.rollNo,
        class: formData.class,
        section: formData.section,
        dateOfBirth: formData.dateOfBirth,
        admissionDate: formData.admissionDate,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        status: 'Active' as const,
        attendance: '0%',
        recentAttendance: [],
        photo: photoURL, // Only URL string or null
        faceImages: Object.keys(faceImageURLs).length > 0 ? faceImageURLs : null, // Only URLs or null
      };

      console.log('[DEBUG] Student object created:', {
        ...newStudent,
        photo: newStudent.photo ? '[URL]' : null,
        faceImages: newStudent.faceImages ? `{${Object.keys(newStudent.faceImages).join(',')}}` : null,
      });

      // Step 3: Add student to Firebase (with only URLs)
      console.log('[DEBUG] Calling addStudent...');
      await addStudent(newStudent as any);
      console.log('[DEBUG] Student added successfully');
      
      // Step 4: Enroll face in Python API if available
      const enrollImage = photoURL || faceImageURLs.front;
      if (enrollImage && formData.rollNo) {
        try {
          console.log('[DEBUG] Starting face enrollment for:', formData.rollNo);
          const enrollResult = await enrollStudentFace(formData.rollNo, enrollImage);
          console.log('[DEBUG] Enrollment result:', enrollResult);
          toast.success('Face enrolled for recognition!');
        } catch (error) {
          console.error('Warning: Could not enroll face in Python API:', error);
          toast.warning('Student added but face enrollment failed. Please check Python API status.');
        }
      }
      
      // Step 5: Send welcome email notification
      if (formData.email && formData.email.trim()) {
        const emailResult = await notifyStudentCreated({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          rollNo: formData.rollNo,
          class: formData.class,
          section: formData.section,
          instituteName: 'Herald College Kathmandu',
        });

        if (emailResult.success) {
          if (emailResult.method === 'brevo') {
            toast.success('Student added and welcome email sent!');
          } else {
            toast.success('Student added! Email will be sent shortly.');
          }
        } else {
          toast.warning('Student added! (Email could not be sent - will retry)');
        }
      } else {
        toast.success('Student added successfully!');
      }

      setFormData({
        firstName: '',
        lastName: '',
        rollNo: '',
        class: '',
        section: '',
        dateOfBirth: '',
        admissionDate: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
      });
      setPhotoPreview(null);
      setFaceImages(null);
      navigate('/admin/students');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add student');
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
      
      // Read file for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setPhotoPreview(previewUrl);
        toast.success('Photo selected successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/admin/students')}
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8 space-y-4">
              <div>
                <Label className="mb-4 block">Student Photo</Label>
                <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-300 overflow-hidden">
                  {photoPreview || faceImages?.front ? (
                    <img src={photoPreview || faceImages?.front || ''} alt="Student preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: theme.sidebarBg }}
                      >
                        <Upload className="w-8 h-8" style={{ color: theme.primaryColor }} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Upload student photo</p>
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
                  {(photoPreview || faceImages?.front) && (
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

              {/* Multi-Angle Face Capture */}
              <div className="border-t pt-4">
                <Label className="mb-4 block">Multi-Angle Face Capture</Label>
                <Button
                  type="button"
                  className="w-full rounded-xl gap-2"
                  style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                  onClick={() => setShowFaceCaptureModal(true)}
                  disabled={loading}
                >
                  <Camera className="w-4 h-4" />
                  Capture Face Images
                </Button>
                
                {/* Show captured face angles status */}
                {faceImages && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-2">✓ Face images captured:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                      {faceImages.front && <div>✓ Front</div>}
                      {faceImages.left && <div>✓ Left</div>}
                      {faceImages.right && <div>✓ Right</div>}
                      {faceImages.up && <div>✓ Up</div>}
                      {faceImages.down && <div>✓ Down</div>}
                    </div>
                  </div>
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
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    className="h-12 rounded-xl mt-2"
                    value={formData.admissionDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, admissionDate: e.target.value })}
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
                      {classNames.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                      {classNames.length === 0 && (
                        <div className="px-2 py-3 text-sm text-gray-500 text-center">
                          No classes available.
                          <button
                            type="button"
                            onClick={() => navigate('/admin/manage-classes')}
                            className="hover:underline block mt-1"
                            style={{ color: theme.primaryColor }}
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
                  <Select 
                    value={formData.section} 
                    onValueChange={(value: string) => setFormData({ ...formData, section: value })}
                    disabled={!formData.class}
                  >
                    <SelectTrigger className="h-12 rounded-xl mt-2">
                      <SelectValue placeholder={formData.class ? "Select section" : "Select class first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                      {sections.length === 0 && formData.class && (
                        <div className="px-2 py-3 text-sm text-gray-500 text-center">
                          No sections available for this class
                        </div>
                      )}
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
                onClick={() => navigate('/admin/students')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: theme.primaryColor }}
                className="flex-1 h-12 rounded-xl hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Face Capture Modal */}
      {showFaceCaptureModal && (
        <FaceCaptureModal
          userType="Student"
          onComplete={(images) => {
            setFaceImages(images);
            setShowFaceCaptureModal(false);
            toast.success('Face images captured! You can now submit the form.');
          }}
          onCancel={() => setShowFaceCaptureModal(false)}
        />
      )}
    </div>
  );
}
