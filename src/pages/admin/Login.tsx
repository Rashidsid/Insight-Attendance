import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set page title for login page
    document.title = 'Admin Login - Insight Attendance System';
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate credentials
    if (email === 'admin@gmail.com' && password === 'admin123') {
      // Store login status in localStorage
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminEmail', email);
      if (rememberMe) {
        localStorage.setItem('rememberAdmin', 'true');
      }
      
      // Redirect to admin panel
      setTimeout(() => {
        navigate('/admin');
        setIsLoading(false);
      }, 500);
    } else {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div 
        className="w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(/images/login-bg.jpg)',
        }}
      >
        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-12">
          {/* Header */}
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">College Admin Panel</h1>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex items-center">
            <div>
              <h2 className="text-white text-4xl font-light mb-2">Welcome to</h2>
              <h3 className="text-yellow-400 text-5xl font-bold">Herald College Kathmandu</h3>
            </div>
          </div>

          {/* Bottom Info Card */}
          <div className="bg-teal-500/90 backdrop-blur-sm rounded-2xl p-6 max-w-md">
            <p className="text-white text-lg leading-relaxed">
              Access the Insight Attendance System Admin Panel to efficiently manage attendance, monitor student records, and ensure smooth academic administration.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back!</h2>
            <p className="text-gray-600 text-base">Enter your Credentials to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-900 font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-900 font-medium">
                  Password
                </label>
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  forgot password
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="remember" className="ml-2 text-gray-700 text-sm">
                Remember for 30 days
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
