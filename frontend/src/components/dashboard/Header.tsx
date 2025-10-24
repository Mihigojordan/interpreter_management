
import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Menu, Settings, User, Lock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAdminAuth from '../../context/AdminAuthContext';
import useInterpreterAuth from '../../context/InterpreterAuthContext';
import { API_URL } from '../../api/api';

const Header = ({ onToggle, role }) => {
  const navigate = useNavigate();
  const { user: adminUser, logout: adminLogout, lockAdmin } = useAdminAuth();
  const { user: interpreterUser, logout: interpreterLogout } = useInterpreterAuth();

  // Select user and logout function based on role
  const user = role === 'admin' ? adminUser : interpreterUser;
  const logout = role === 'admin' ? adminLogout : interpreterLogout;
  const lock = role === 'admin' ? lockAdmin : null; // Interpreters don't have lock functionality

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const dropdownRef = useRef(null);

  const onLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate(role === 'admin' ? '/admin/login' : '/interpreter/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLock = async () => {
    if (role !== 'admin') return; // Lock only available for admins
    setIsLocking(true);
    try {
      await lock();
      setIsDropdownOpen(false);
      navigate('/admin/lock');
    } catch (error) {
      console.error('Lock error:', error);
    } finally {
      setIsLocking(false);
    }
  };

  // Get display name based on role
  const getDisplayName = () => {
    if (role === 'admin') {
      return adminUser?.adminName || 'Administrator';
    }
    return interpreterUser?.name || 'Interpreter';
  };

  // Get profile image based on role
  const getProfileImage = () => {
    if (role === 'admin') {
      return adminUser?.profileImage;
    }
    return interpreterUser?.photoUrl;
  };

  // Get email based on role
  const getEmail = () => {
    if (role === 'admin') {
      return adminUser?.adminEmail;
    }
    return interpreterUser?.email;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-20">
      <div className=" mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="lg:hidden flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg cursor-pointer"
              onClick={onToggle}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-xl font-semibold text-gray-900">
              {role === 'admin' ? 'Admin Dashboard' : 'Interpreter Portal'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="Settings"
              onClick={() => navigate(role === 'admin' ? '/admin/settings' : '/interpreter/settings')}
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                disabled={isLocking}
                aria-label="User profile"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {getProfileImage() ? (
                    <img
                      src={`${API_URL}${getProfileImage()}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700">{getDisplayName()}</div>
                  <div className="text-xs text-primary-600">
                    {role === 'admin' ? 'Administrator' : 'Interpreter'}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    <div className="py-1">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-primary-50">
                        <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
                        <div className="text-xs text-gray-600 truncate">{getEmail()}</div>
                        <div className="text-xs font-medium text-primary-600">
                          {role === 'admin' ? 'Administrator' : 'Interpreter'}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            navigate(
                              role === 'admin' ? '/admin/dashboard/profile' : '/interpreter/dashboard/profile'
                            );
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                          aria-label="View profile"
                        >
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </motion.button>

                        {role === 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={handleLock}
                            disabled={isLocking}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Lock screen"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            {isLocking ? 'Locking...' : 'Lock Screen'}
                          </motion.button>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={onLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Sign out"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
