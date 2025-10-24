import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Eye, EyeOff, Users, Building2, Shield, Zap, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAdminAuth from '../../../context/AdminAuthContext';
import Logo from '../../../assets/trans.png';

const AdminLogin = () => {
  const { login, loginWithGoogle, isLoading: authLoading, isAuthenticated } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
      title: 'Empowering People with Fine Fish',
      subtitle: 'Simplify workforce management and empower growth'
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
      title: 'Seamless Team Collaboration',
      subtitle: 'Foster harmony across your organization'
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
      title: 'Advanced Admin Control',
      subtitle: 'Powerful tools for modern management'
    }
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (touched[name] || value !== '') {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      password: true,
    });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const response = await login({
        adminEmail: formData.email,
        password: formData.password,
      });
      if (response.authenticated) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from);
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      loginWithGoogle(false);
    } catch (error) {
      setErrors({ general: 'Google login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return !!formData.email && !!formData.password && !errors.email && !errors.password;
  };

  return (
    <div className="flex h-screen w-full flex-row-reverse overflow-hidden bg-white">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
        
        <div className="w-full max-w-xl relative z-10" data-aos="zoom-in">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={Logo} alt="Fine Fish Logo" className="h-16" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your admin dashboard</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <p className="text-red-700 text-sm font-medium flex items-center">
                <span className="mr-2">⚠️</span> {errors.general}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Fully verified and authenticated</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>Status-based workflow management</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="    p-8 ">
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2/3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 outline-none ${
                      errors.email
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    placeholder="admin@example.com"
                    disabled={isLoading || authLoading}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2/3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 outline-none ${
                      errors.password
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading || authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    disabled={isLoading || authLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || authLoading || !isFormValid()}
                className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-800 hover:via-blue-800 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isLoading || authLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || authLoading}
                className="w-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading || authLoading ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in with Google...
                  </span>
                ) : (
                  'Sign in with Google'
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Need access?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Administrator
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Background Slideshow */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/90 to-purple-800/95" />
            
            {/* Animated Background Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <div className="mb-6 flex justify-start gap-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                {slide.subtitle}
              </p>
              
              {/* Slide Indicators */}
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-8 bg-white' : 'w-6 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLogin;