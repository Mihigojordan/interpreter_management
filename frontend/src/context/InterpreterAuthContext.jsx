import React, { createContext, useContext, useEffect, useState } from 'react';
import interpreterAuthService from '../services/interpreterAuthService';

export const InterpreterAuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  updateProfile: () => Promise.resolve({}),
  isAuthenticated: false,
  isLoading: true,
});

export const InterpreterAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
  };

  // Login interpreter
  const login = async (data) => {
    try {
      const response = await interpreterAuthService.login(data);
      if (response?.interpreter) {
        updateAuthState({ user: response.interpreter, isAuthenticated: true });
      }
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Logout interpreter
  const logout = async () => {
    try {
      await interpreterAuthService.logout();
      updateAuthState({ user: null, isAuthenticated: false });
    } catch (error) {
      updateAuthState({ user: null, isAuthenticated: false });
      throw new Error(error.message);
    }
  };

  // Register interpreter
  const register = async (data) => {
    try {
      const response = await interpreterAuthService.registerInterpreter(data);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Update interpreter profile
  const updateProfile = async (id, data) => {
    if (!user?.id) throw new Error('No logged-in interpreter to update');
    const updated = await interpreterAuthService.updateProfile(id, data);
    updateAuthState({ user: updated, isAuthenticated: true });
    return updated;
  };

  // Check authentication status on mount
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await interpreterAuthService.getProfile();
      if (response) {
        updateAuthState({ user: response, isAuthenticated: true });
      } else {
        updateAuthState({ user: null, isAuthenticated: false });
      }
    } catch {
      updateAuthState({ user: null, isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const values = {
    login,
    logout,
    register,
    updateProfile,
    user,
    isAuthenticated,
    isLoading,
  };

  return (
    <InterpreterAuthContext.Provider value={values}>
      {children}
    </InterpreterAuthContext.Provider>
  );
};

export default function useInterpreterAuth() {
  const context = useContext(InterpreterAuthContext);
  if (!context) {
    throw new Error(
      'useInterpreterAuth must be used within InterpreterAuthContextProvider'
    );
  }
  return context;
}
