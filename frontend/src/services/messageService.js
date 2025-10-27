  import api from '../api/api'; // Your Axios setup

  class MessageService {
    
    // ✅ Create a message
    async createMessage({ content, interpreterId, requestId }) {
      try {
        const response = await api.post('/messages', {
          content,
          interpreterId,
          requestId
        });
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to send message';
        throw new Error(msg);
      }
    }

    // ✅ Get all messages
    async getAllMessages() {
      try {
        const response = await api.get('/messages');
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to fetch messages';
        throw new Error(msg);
      }
    }

    // ✅ Get a single message
    async getMessageById(id) {
      try {
        const response = await api.get(`/messages/${id}`);
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Message not found';
        throw new Error(msg);
      }
    }

    // ✅ Get messages for a specific request
    async getMessagesByRequest(requestId) {
      try {
        const response = await api.get(`/messages/request/${requestId}`);
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to load messages';
        throw new Error(msg);
      }
    }

    // ✅ Update message content
    async updateMessage(id, content) {
      try {
        const response = await api.patch(`/messages/${id}`, { content });
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update message';
        throw new Error(msg);
      }
    }

    // ✅ Delete message
    async deleteMessage(id) {
      try {
        const response = await api.delete(`/messages/${id}`);
        return response.data;
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to delete message';
        throw new Error(msg);
      }
    }
  }

  const messageService = new MessageService();
  export default messageService;

  // Optional named exports
  export const {
    createMessage,
    getAllMessages,
    getMessageById,
    getMessagesByRequest,
    updateMessage,
    deleteMessage
  } = messageService;
