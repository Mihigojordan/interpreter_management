import api from '../api/api'; // your configured Axios instance

class InterpreterService {
  // Create a new interpreter (admin action)
  async createInterpreter(data) {
    try {
      const response = await api.post('/interpreters', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create interpreter';
      throw new Error(msg);
    }
  }

  // Get all interpreters
  async getAllInterpreters() {
    try {
      const response = await api.get('/interpreters');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch interpreters';
      throw new Error(msg);
    }
  }

  // Get interpreter by ID
  async getInterpreterById(id) {
    try {
      const response = await api.get(`/interpreters/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch interpreter';
      throw new Error(msg);
    }
  }

  // Update interpreter details
  async updateInterpreter(id, data) {
    try {
      const response = await api.patch(`/interpreters/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update interpreter';
      throw new Error(msg);
    }
  }

  // Delete interpreter
  async deleteInterpreter(id) {
    try {
      const response = await api.delete(`/interpreters/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete interpreter';
      throw new Error(msg);
    }
  }

  // ✅ Accept interpreter
  async acceptInterpreter(id) {
    try {
      const response = await api.patch(`/interpreters/accept/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to accept interpreter';
      throw new Error(msg);
    }
  }

  // ✅ Reject interpreter
async rejectInterpreter(id, reason) {
  try {
    const response = await api.patch(`/interpreters/reject/${id}`, { reason });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to reject interpreter';
    throw new Error(msg);
  }
}

}

const interpreterService = new InterpreterService();
export default interpreterService;

// Optional named exports
export const {
  createInterpreter,
  getAllInterpreters,
  getInterpreterById,
  updateInterpreter,
  deleteInterpreter,
  acceptInterpreter,
  rejectInterpreter,
} = interpreterService;
