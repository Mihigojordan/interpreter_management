import api from '../api/api'; // your configured Axios instance

class InterpretationRequestService {
    // Create a new interpretation request
    async createRequest(data) {
        try {
            const response = await api.post('/interpreter-requests', data);
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to create interpretation request';
            throw new Error(msg);
        }
    }

    // Get all interpretation requests
    async getAllRequests() {
        try {
            const response = await api.get('/interpreter-requests');
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to fetch interpretation requests';
            throw new Error(msg);
        }
    }
    async getAllRequestsByInterpreters() {
        try {
            const response = await api.get('/interpreter-requests/my-requests');
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to fetch interpretation requests';
            throw new Error(msg);
        }
    }

    // Get interpretation request by ID
    async getRequestById(id) {
        try {
            const response = await api.get(`/interpreter-requests/${id}`);
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to fetch interpretation request';
            throw new Error(msg);
        }
    }

    // Update interpretation request details
    async updateRequest(id, data) {
        try {
            const response = await api.patch(`/interpreter-requests/${id}`, data);
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to update interpretation request';
            throw new Error(msg);
        }
    }

    // Delete interpretation request
    async deleteRequest(id) {
        try {
            const response = await api.delete(`/interpreter-requests/${id}`);
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to delete interpretation request';
            throw new Error(msg);
        }
    }

    // Accept interpretation request
    async acceptRequest(id) {
        try {
            const response = await api.patch(`/interpreter-requests/accept/${id}`);
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to accept interpretation request';
            throw new Error(msg);
        }
    }

    // Approve interpretation request
    async approveRequest(id, interpreterId) {
        try {
            const response = await api.post(`/interpreter-requests/${id}/approve`, { interpreterId });
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to approve interpretation request';
            throw new Error(msg);
        }
    }

    // Reject interpretation request
    async rejectRequest(id, reason) {
        try {
            const response = await api.post(`/interpreter-requests/${id}/reject`, { reason });
            return response.data;
        } catch (error) {
            const msg = error.response.data.message || 'Failed to reject interpretation request';
            throw new Error(msg);
        }
    }
}

const interpretationRequestService = new InterpretationRequestService();
export default interpretationRequestService;

// Optional named exports
export const {
    createRequest,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
    acceptRequest,
    rejectRequest,
} = interpretationRequestService;