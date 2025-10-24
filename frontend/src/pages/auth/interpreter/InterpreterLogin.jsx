import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Languages, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useInterpreterAuth from '../../../context/InterpreterAuthContext';



const InterpreterLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useInterpreterAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
      title: 'Professional Language Services',
      subtitle: 'Connect with verified interpreters worldwide',
    },
    {
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80',
      title: 'Secure & Authenticated',
      subtitle: 'Administrative management with full verification',
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
      title: 'Seamless Workflow',
      subtitle: 'Status-based management with automated notifications',
    },
  ];

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/interpreter/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (touched[name]) {
      setErrors({
        ...errors,
        [name]: validateForm()[name],
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    setErrors({
      ...errors,
      [name]: validateForm()[name],
    });
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
        email: formData.email,
        password: formData.password,
      });
      if (response.authenticated) {
        const from = location.state?.from?.pathname || '/interpreter/dashboard';
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interpreter Portal
            </h1>
            <p className="text-gray-600">
              Secure access for verified professionals
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 py-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Fully verified and authenticated</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>Status-based workflow management</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm"
              >
                {errors.general}
              </motion.div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2/3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="interpreter@example.com"
                />
              </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2/3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-4xl font-bold mb-4 transform transition-all duration-700">
                {slide.title}
              </h2>
              <p className="text-xl text-gray-200 mb-8 transform transition-all duration-700">
                {slide.subtitle}
              </p>
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

export default InterpreterLogin;