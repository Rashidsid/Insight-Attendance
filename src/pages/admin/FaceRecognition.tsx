import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Camera, Scan, CheckCircle, User, Clock, Calendar } from 'lucide-react';

export default function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recognized, setRecognized] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    // Initialize camera (mock for demo)
    const initCamera = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.log('Camera not available in this environment');
        }
      }
    };
    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRecognize = () => {
    setIsScanning(true);
    
    // Mock face recognition
    setTimeout(() => {
      setIsScanning(false);
      setRecognized(true);
      setStudentData({
        name: 'Alex Johnson',
        rollNo: 'STU001',
        class: '10-A',
        section: 'Science',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'Present',
      });
    }, 2000);
  };

  const handleReset = () => {
    setRecognized(false);
    setStudentData(null);
  };

  return (
    <div className="p-8 h-full">
      <div className="mb-8">
        <h1>Face Recognition Attendance</h1>
        <p className="text-gray-600 mt-1">Position your face in the camera to mark attendance</p>
      </div>

      <div className="grid grid-cols-2 gap-8 h-[calc(100%-120px)]">
        {/* Camera View */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-gray-600" />
              <h3>Live Camera Feed</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-600">{isScanning ? 'Scanning...' : 'Ready'}</span>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Face Detection Overlay */}
            {!recognized && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-64 h-80 border-4 rounded-3xl ${
                  isScanning ? 'border-yellow-500 animate-pulse' : 'border-white/50'
                }`}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {recognized && (
              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                  <p className="text-white text-2xl">Recognition Successful!</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleRecognize}
              disabled={isScanning || recognized}
              className="flex-1 h-14 rounded-xl bg-[#A982D9] hover:bg-[#9770C8] gap-2"
            >
              <Scan className="w-5 h-5" />
              {isScanning ? 'Scanning...' : 'Recognize Face'}
            </Button>
            {recognized && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-14 rounded-xl px-8"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-6">Recognition Result</h3>

          {!recognized && !studentData && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500">No face detected yet</p>
                <p className="text-sm text-gray-400 mt-2">Click "Recognize Face" to start</p>
              </div>
            </div>
          )}

          {recognized && studentData && (
            <div className="space-y-6">
              {/* Student Info Card */}
              <div className="bg-gradient-to-br from-[#A982D9] to-[#8B5FBF] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">
                    {studentData.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-white mb-1">{studentData.name}</h2>
                    <p className="text-white/80">Roll No: {studentData.rollNo}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-white/70 text-sm mb-1">Class</p>
                    <p className="text-white">{studentData.class}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-white/70 text-sm mb-1">Section</p>
                    <p className="text-white">{studentData.section}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="text-green-900">Attendance Status</p>
                    <p className="text-green-700 text-sm">Marked as Present</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <Clock className="w-8 h-8 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">Time</p>
                    <p className="text-gray-600 text-sm">{studentData.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <Calendar className="w-8 h-8 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">Date</p>
                    <p className="text-gray-600 text-sm">{studentData.date}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  Your attendance has been recorded successfully. You may now leave.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
