import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useInterpreterAuth from '../../context/InterpreterAuthContext';

interface ProtectPrivateInterpreterRouteProps {
  children: ReactNode;
}

const ProtectPrivateInterpreterRoute: React.FC<ProtectPrivateInterpreterRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useInterpreterAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-inter">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to interpreter login page with the current location as state
    return <Navigate to="/auth/interpreter/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectPrivateInterpreterRoute;
