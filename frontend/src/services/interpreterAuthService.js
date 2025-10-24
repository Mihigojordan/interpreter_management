import api from '../api/api'; // your configured Axios instance

class InterpreterAuthService {
  // ✅ Register a new interpreter
  async registerInterpreter(data) {
    try {
      const response = await api.post('/interpreter-auth/register', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register interpreter';
      throw new Error(msg);
    }
  }

  // ✅ Login interpreter
  async login({ email, password }) {
    try {
      const response = await api.post('/interpreter-auth/login', { email, password }, { withCredentials: true });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      throw new Error(msg);
    }
  }

  // ✅ Logout interpreter
  async logout() {
    try {
      const response = await api.post('/interpreter-auth/logout', {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Logout failed';
      throw new Error(msg);
    }
  }

  // ✅ Get profile
  async getProfile() {
    try {
      const response = await api.get('/interpreter-auth/profile', { withCredentials: true });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(msg);
    }
  }

  // ✅ Update profile
  async updateProfile(id, data) {
    try {
      const response = await api.put(`/interpreter-auth/edit-profile/${id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      throw new Error(msg);
    }
  }
}

const interpreterAuthService = new InterpreterAuthService();
export default interpreterAuthService;

// Optional named exports
export const {
  registerInterpreter,
  login,
  logout,
  getProfile,
  updateProfile,
} = interpreterAuthService;
