import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Camera, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

interface FaceImages {
  front: string | null;
  left: string | null;
  right: string | null;
  up: string | null;
  down: string | null;
}

interface FaceCaptureCaptureModalProps {
  onComplete: (images: FaceImages) => void;
  onCancel: () => void;
  userType: 'Student' | 'Teacher';
}

const FACE_ANGLES = [
  { id: 'front', label: 'Front', direction: 'Look Straight', emoji: '📱' },
  { id: 'left', label: 'Left', direction: 'Turn Left', emoji: '👈' },
  { id: 'right', label: 'Right', direction: 'Turn Right', emoji: '👉' },
  { id: 'up', label: 'Up', direction: 'Look Up', emoji: '👆' },
  { id: 'down', label: 'Down', direction: 'Look Down', emoji: '👇' },
] as const;

export default function FaceCaptureModal({ onComplete, onCancel, userType }: FaceCaptureCaptureModalProps) {
  const { theme } = useTheme();
  const [images, setImages] = useState<FaceImages>({
    front: null,
    left: null,
    right: null,
    up: null,
    down: null,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = FACE_ANGLES[currentStep].id as keyof FaceImages;
  const currentAngleData = FACE_ANGLES[currentStep];

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture image
  const captureImage = async () => {
    try {
      setIsCapturing(true);
      if (canvasRef.current && videoRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          
          // Use Promise to get the image data
          const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95);
          
          setImages(prev => ({
            ...prev,
            [currentAngle]: imageData,
          }));

          toast.success(`${currentAngleData.label} face captured!`);
          
          // Move to next step after a short delay
          setTimeout(() => {
            if (currentStep < FACE_ANGLES.length - 1) {
              setCurrentStep(currentStep + 1);
              stopCamera();
              setIsCapturing(false);
            } else {
              stopCamera();
              setIsCapturing(false);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture image');
      setIsCapturing(false);
    }
  };

  // Retake current angle
  const retakeCurrent = () => {
    setImages(prev => ({
      ...prev,
      [currentAngle]: null,
    }));
    toast.success('Image cleared. Please retake.');
  };

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setImages(prev => ({
          ...prev,
          [currentAngle]: base64String,
        }));
        toast.success(`${currentAngleData.label} uploaded!`);
        
        // Move to next step
        setTimeout(() => {
          if (currentStep < FACE_ANGLES.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete capture
  const handleComplete = () => {
    onComplete(images);
  };

  // Go to previous step
  const goToPrevious = () => {
    if (currentStep > 0) {
      stopCamera();
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current angle is captured
  const isCurrentCaptured = images[currentAngle] !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Capture {userType} Face</h2>
            <p className="text-blue-100 text-sm mt-1">Step {currentStep + 1} of {FACE_ANGLES.length}</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-2 hover:bg-blue-400 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Camera Preview */}
          {!isCurrentCaptured ? (
            <div className="mb-8">
              <div className="bg-black rounded-3xl overflow-hidden aspect-video flex flex-col items-center justify-center relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Camera className="w-16 h-16 text-white opacity-50" />
                    <p className="text-white text-lg">Ready to capture</p>
                  </div>
                )}

                {isCameraActive && (
                  <>
                    {/* Instruction Overlay */}
                    <div className="absolute top-8 left-0 right-0 flex justify-center">
                      <div className="text-center">
                        <p className="text-white text-4xl mb-3">{currentAngleData.emoji}</p>
                        <p className="text-white text-2xl font-bold">{currentAngleData.direction}</p>
                        <p className="text-blue-100 text-sm mt-2">Position your face in the center</p>
                      </div>
                    </div>

                    {/* Capture Button */}
                    <button
                      onClick={captureImage}
                      disabled={isCapturing}
                      className="absolute bottom-8 w-20 h-20 rounded-full bg-white hover:bg-blue-50 flex items-center justify-center shadow-lg transform hover:scale-110 transition disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500" />
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {!isCameraActive ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl h-12 gap-2"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4" />
                      Start Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl h-12 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id={`upload-${currentStep}`}
                      />
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl h-12"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Captured Preview
            <div className="mb-8">
              <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
                <img
                  src={images[currentAngle] || ''}
                  alt={currentAngleData.label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                <span className="text-3xl">{currentAngleData.emoji}</span>
                <div>
                  <p className="font-bold text-green-900">{currentAngleData.label} captured!</p>
                  <p className="text-sm text-green-700">Proceed to next angle</p>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-red-600 hover:text-red-700"
                  onClick={retakeCurrent}
                >
                  Retake
                </Button>
                {currentStep < FACE_ANGLES.length - 1 ? (
                  <Button
                    type="button"
                    className="flex-1 rounded-xl h-12 gap-2 text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="flex-1 rounded-xl h-12 text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                    onClick={handleComplete}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="flex gap-2 justify-center mt-8">
            {FACE_ANGLES.map((angle, index) => (
              <div
                key={angle.id}
                className={`h-2 rounded-full transition-all ${
                  images[angle.id as keyof FaceImages]
                    ? 'bg-green-500'
                    : index <= currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
                style={{ width: index === currentStep ? '24px' : '12px' }}
              />
            ))}
          </div>

          {/* Navigation */}
          {isCurrentCaptured && (
            <div className="mt-8 flex gap-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={goToPrevious}
                >
                  Previous
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
