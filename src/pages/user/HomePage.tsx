import { useState, useRef, useEffect } from 'react';
import { Camera, UserCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  recognizeFaceFromVideo,
  checkPythonAPIAvailability
} from '../../services/faceRecognitionService';
import { markAttendanceViaFaceRecognition, markTeacherAttendanceViaFaceRecognition } from '../../services/attendanceService';

interface RecognitionResult {
  id: string;
  firstName: string;
  lastName: string;
  rollNo: string;
  email: string;
  class: string;
  section: string;
  role: 'student' | 'teacher';
  photo?: string;
  matched: boolean;
  confidence: number;
  timestamp?: string;
}

export default function HomePage() {
  const { theme } = useTheme();
  const [cameraActive, setCameraActive] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check Python API availability on component mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        console.log('Checking Python Face API availability...');
        const isAvailable = await checkPythonAPIAvailability();
        if (!isAvailable) {
          setError('Python Face API is not running. Please start the Python API server at localhost:5000');
          console.warn('Python API not available');
        } else {
          console.log('✓ Python Face API is available');
        }
      } catch (err) {
        console.error('Failed to check API:', err);
      }
    };
    
    checkAPI();
    
    return () => {
      stopCamera();
    };
  }, []);

  const activateCamera = async () => {
    try {
      setError(null);
      setCameraActive(true);
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 960 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Play error:', err);
            setError('Failed to play video stream');
          });
        }

        // Start face detection after video is ready
        setTimeout(() => startFaceDetection(), 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied or not available';
      setError(`Camera Error: ${errorMessage}`);
      console.error('Camera Error:', err);
      setCameraActive(false);
    }
  };

  const startFaceDetection = () => {
    if (!videoRef.current) return;
    
    // Simple face detection - check if video is properly playing
    // Python API will handle actual face detection and recognition
    const checkVideo = () => {
      if (!videoRef.current) return;
      
      // Check if video has data and is playing
      const isPlaying = videoRef.current.currentTime > 0 && !videoRef.current.paused;
      setFaceDetected(isPlaying);
    };

    // Check video status every 500ms
    const interval = setInterval(checkVideo, 500);
    
    // Clean up on camera stop
    return () => clearInterval(interval);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
    setFaceDetected(false);
    setError(null);
  };

  const recognizeFace = async () => {
    if (!cameraActive) {
      setError('Camera is not active. Please activate the camera first.');
      return;
    }

    if (!videoRef.current) {
      setError('Video element not ready');
      return;
    }

    setIsRecognizing(true);
    setError(null);

    try {
      // Check if Python API is available
      const isAPIAvailable = await checkPythonAPIAvailability();
      if (!isAPIAvailable) {
        throw new Error('Python Face API is not running. Please start the API server at localhost:5000');
      }

      const result = await recognizeFaceFromVideo(videoRef.current);
      
      if (result && result.matched) {
        setRecognitionResult({
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          rollNo: result.rollNo,
          email: result.email,
          class: result.class,
          section: result.section,
          role: result.role,
          photo: result.photo,
          matched: result.matched,
          confidence: result.confidence,
          timestamp: result.timestamp
        });

        // Mark attendance for recognized person based on role
        try {
          let attendanceResult;
          if (result.role === 'teacher') {
            // Mark attendance for teacher
            attendanceResult = await markTeacherAttendanceViaFaceRecognition(
              result.id,
              `${result.firstName} ${result.lastName}`,
              result.confidence
            );
          } else {
            // Mark attendance for student
            attendanceResult = await markAttendanceViaFaceRecognition(
              result.id,
              `${result.firstName} ${result.lastName}`,
              result.class,
              result.confidence
            );
          }

          if (attendanceResult.success) {
            console.log('✓ Attendance marked:', attendanceResult.message);
          } else {
            console.warn('⚠ Attendance marking:', attendanceResult.message);
          }
        } catch (attendanceError) {
          console.error('Error marking attendance:', attendanceError);
        }
      } else if (result) {
        setRecognitionResult({
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          rollNo: result.rollNo,
          email: result.email,
          class: result.class,
          section: result.section,
          role: result.role,
          photo: result.photo,
          matched: result.matched,
          confidence: result.confidence,
          timestamp: result.timestamp
        });
      } else {
        setError('Failed to process face recognition');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Face recognition failed';
      setError(errorMessage);
      console.error('Recognition Error:', err);
    } finally {
      setIsRecognizing(false);
    }
  };

  const resetRecognition = () => {
    setRecognitionResult(null);
    setError(null);
    setFaceDetected(false);
  };

  useEffect(() => {
    // Set page title for home page
    document.title = 'Insight Attendance System - Face Recognition';
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Network Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="#60A5FA" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
          <line x1="30%" y1="40%" x2="50%" y2="30%" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
          <line x1="50%" y1="30%" x2="70%" y2="50%" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
          <line x1="70%" y1="50%" x2="90%" y2="35%" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex items-center justify-center px-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Camera */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Camera Frame */}
            <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl shadow-2xl border-4 border-slate-600 overflow-hidden">
              {!cameraActive ? (
                <button
                  onClick={activateCamera}
                  className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-slate-700/50 transition-colors group"
                >
                  <UserCircle 
                    className="w-32 h-32 text-slate-400 group-hover:transition-colors"
                    style={{ color: faceDetected ? theme.primaryColor : undefined }}
                  />
                  <span className="text-slate-300 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Click to activate camera
                  </span>
                </button>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      backgroundColor: '#000',
                      transform: 'scaleX(-1)' // Mirror the video
                    }}
                  />

                  {/* Loading Spinner */}
                  {isRecognizing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                          style={{ borderColor: `${theme.primaryColor}40`, borderTopColor: 'transparent' }}
                        ></div>
                        <p className="text-white text-lg font-semibold">Analyzing Face...</p>
                        <p className="text-slate-300 text-sm mt-2">Matching with database</p>
                      </div>
                    </div>
                  )}

                  {/* Face Detection Frame */}
                  {cameraActive && !isRecognizing && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div
                        className={`relative w-48 h-64 border-4 rounded-lg transition-all duration-300 ${
                          faceDetected
                            ? 'shadow-[0_0_30px_rgba(169,130,217,0.6)]'
                            : 'opacity-50'
                        }`}
                        style={{
                          borderColor: faceDetected ? theme.primaryColor : '#64748b'
                        }}
                      >
                        {/* Corner Brackets */}
                        <div
                          className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 transition-colors"
                          style={{
                            borderTopColor: faceDetected ? theme.primaryColor : '#64748b',
                            borderLeftColor: faceDetected ? theme.primaryColor : '#64748b'
                          }}
                        ></div>
                        <div
                          className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 transition-colors"
                          style={{
                            borderTopColor: faceDetected ? theme.primaryColor : '#64748b',
                            borderRightColor: faceDetected ? theme.primaryColor : '#64748b'
                          }}
                        ></div>
                        <div
                          className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 transition-colors"
                          style={{
                            borderBottomColor: faceDetected ? theme.primaryColor : '#64748b',
                            borderLeftColor: faceDetected ? theme.primaryColor : '#64748b'
                          }}
                        ></div>
                        <div
                          className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 transition-colors"
                          style={{
                            borderBottomColor: faceDetected ? theme.primaryColor : '#64748b',
                            borderRightColor: faceDetected ? theme.primaryColor : '#64748b'
                          }}
                        ></div>

                        {/* Face Detected Indicator */}
                        {faceDetected && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span 
                              className="px-3 py-1 text-white text-xs font-semibold rounded-full"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              Face Detected ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={recognizeFace}
                disabled={!cameraActive || isRecognizing}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-slate-200 to-white text-slate-900 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
              >
                {isRecognizing ? 'Processing...' : 'Recognize Face'}
              </button>

              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors font-semibold"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full max-w-md bg-red-900/50 border border-red-600 rounded-lg p-4">
                <p className="text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Results */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 leading-tight">
                Insight Attendance
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, #60a5fa)`
                  }}
                >
                  System
                </span>
              </h1>
              <p className="text-slate-300 text-lg">Face Recognition Based Attendance</p>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Recognized ID */}
              <div>
                <label className="text-white text-sm font-semibold uppercase tracking-wide mb-2 block">
                  {recognitionResult?.role === 'teacher' ? 'Teacher ID' : 'Roll No'}
                </label>
                <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700 backdrop-blur-sm">
                  {recognitionResult?.matched ? (
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: theme.primaryColor }}
                    >
                      {recognitionResult.role === 'teacher' 
                        ? recognitionResult.rollNo  // For teachers, rollNo contains teacherId
                        : recognitionResult.rollNo}
                    </p>
                  ) : recognitionResult && !recognitionResult.matched ? (
                    <p className="text-slate-500 text-lg">-- Not Recognized --</p>
                  ) : (
                    <p className="text-slate-500 text-lg">Waiting for recognition...</p>
                  )}
                </div>
              </div>

              {/* Recognized Name */}
              <div>
                <label className="text-white text-sm font-semibold uppercase tracking-wide mb-2 block">
                  Recognized Name
                </label>
                <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700 backdrop-blur-sm">
                  {recognitionResult?.matched ? (
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: theme.primaryColor }}
                    >
                      {recognitionResult.firstName} {recognitionResult.lastName}
                    </p>
                  ) : recognitionResult && !recognitionResult.matched ? (
                    <p className="text-slate-500 text-lg">-- Not Recognized --</p>
                  ) : (
                    <p className="text-slate-500 text-lg">Waiting for recognition...</p>
                  )}
                </div>
              </div>

              {/* Role */}
              {recognitionResult?.matched && (
                <div>
                  <label className="text-white text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Role
                  </label>
                  <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700 backdrop-blur-sm">
                    <p 
                      className="text-lg font-semibold capitalize"
                      style={{ color: theme.primaryColor }}
                    >
                      {recognitionResult.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Subject for Teachers */}
              {recognitionResult?.matched && recognitionResult.role === 'teacher' && (
                <div>
                  <label className="text-white text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Subject
                  </label>
                  <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700 backdrop-blur-sm">
                    <p 
                      className="text-lg font-semibold"
                      style={{ color: theme.primaryColor }}
                    >
                      {recognitionResult.class}
                    </p>
                  </div>
                </div>
              )}


              {/* Status Message */}
              <div>
                <label
                  className={`text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${
                    recognitionResult?.matched ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {recognitionResult?.matched ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {recognitionResult?.matched ? 'Success' : 'Status'}
                </label>
                <div
                  className={`rounded-lg p-4 border backdrop-blur-sm ${
                    recognitionResult?.matched
                      ? 'bg-green-900/30 border-green-600'
                      : 'bg-yellow-900/30 border-yellow-600'
                  }`}
                >
                  {recognitionResult?.matched ? (
                    <p className="text-green-300 font-medium">
                      ✓ Attendance marked successfully for {recognitionResult.role}
                    </p>
                  ) : recognitionResult && !recognitionResult.matched ? (
                    <p className="text-yellow-300 font-medium">
                      ⚠ Face does not match any record in the system. Please contact admin.
                    </p>
                  ) : (
                    <p className="text-slate-400 font-medium">
                      Ready to capture. Activate camera and position your face.
                    </p>
                  )}
                </div>
              </div>

              {/* Try Again Button - Only show on error or unmatched result */}
              {recognitionResult && !recognitionResult.matched && (
                <button
                  onClick={resetRecognition}
                  className="w-full px-6 py-3 text-white rounded-lg transition-colors font-semibold mt-4 transform hover:scale-105 hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Glows */}
      <div 
        className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${theme.primaryColor}10` }}
      ></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden Canvas for face capture (for future use) */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
