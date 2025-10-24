
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import InterpreterProfileSettings from '../../components/dashboard/profile/interpreter/InterpreterProfileSettings';

const InterpreterProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['profile'] ; // Only profile tab for interpreters
  const initialTab = validTabs.includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'profile';
  const [activeTab, setActiveTab] = useState('profile');

  // Sync activeTab with URL params
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  return (
    <div className="bg-gray-50 overflow-y-auto h-[90vh]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r h-full border-gray-200">
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-label="Profile Settings"
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </motion.button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full overflow-y-auto flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900">
                  Profile Settings
                </h1>
              </div>
              <div className="p-4">
                {activeTab === 'profile' && <InterpreterProfileSettings />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterpreterProfilePage;
