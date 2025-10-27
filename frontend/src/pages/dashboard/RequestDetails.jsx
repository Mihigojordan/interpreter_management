import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Mail, Phone, Globe, MessageSquare, FileText, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import interpretationRequestService from '../../services/interpretationRequestService';
import messageService from '../../services/messageService';

const RequestDetailsPage = () => {
  const { id } = useParams(); // Get request ID from URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch request details
        const requestData = await interpretationRequestService.getRequestById(id);
        setRequest(requestData);

        // Fetch messages for the request
        const messagesData = await messageService.getMessagesByRequest(id);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load request details or messages');
        setRequest(null);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || colors.pending;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-primary-100 text-primary-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[urgency] || colors.medium;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = {
        content: newMessage,
        requestId: id,
        // interpreterId is assumed to be handled by the backend via authentication
      };
      await messageService.createMessage(message);
      // Refresh messages after sending
      const messagesData = await messageService.getMessagesByRequest(id);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setNewMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          <div className="inline-flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading request details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-sm">
          {error || 'Request not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Request #{request.id.slice(0, 8)}</h1>
                <p className="text-gray-600">
                  Created {formatDateTime(request.createdAt)} | Updated {formatDateTime(request.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUrgencyColor(request.urgencyLevel)}`}>
                {request.urgencyLevel.charAt(0).toUpperCase() + request.urgencyLevel.slice(1)} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="inline w-4 h-4 mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="inline w-4 h-4 mr-2" />
                Messages
                {messages.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                    {messages.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Client Information */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary-600" />
                    Client Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="text-gray-900 font-medium">{request.fullName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-gray-900 font-medium flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        {request.email || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-gray-900 font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {request.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Preferred Contact</p>
                      <p className="text-gray-900 font-medium capitalize">{request.preferredContactMethod || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                {/* Service Details */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-primary-600" />
                    Service Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Language From</p>
                      <p className="text-gray-900 font-medium">{request.languageFrom || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Language To</p>
                      <p className="text-gray-900 font-medium">{request.languageTo || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Service Type</p>
                      <p className="text-gray-900 font-medium">{request.serviceType || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Interpreter Type</p>
                      <p className="text-gray-900 font-medium">{request.interpreterType || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                {/* Appointment Details */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    Appointment Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="text-gray-900 font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        {formatDateTime(request.dateTime)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="text-gray-900 font-medium">{request.durationMinutes || 0} minutes</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="text-gray-900 font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {request.location || 'N/A'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Additional Information */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-primary-600" />
                    Additional Information
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Reason for Request</p>
                      <p className="text-gray-900">{request.reason || 'N/A'}</p>
                    </div>
                    {request.specialRequirements && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium mb-2">Special Requirements</p>
                        <p className="text-amber-900">{request.specialRequirements}</p>
                      </div>
                    )}
                    {request.additionalNotes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Additional Notes</p>
                        <p className="text-gray-900">{request.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Assigned Interpreter */}
                {request.interpreter && (
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-600" />
                      Assigned Interpreter
                    </h2>
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                      <p className="text-gray-900 font-medium">{request.interpreter.name || 'N/A'}</p>
                      <p className="text-gray-600 text-sm flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        {request.interpreter.email || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {request.interpreter.phone || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Type: {request.interpreter.type || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Languages: {request.interpreter.languages ? JSON.stringify(request.interpreter.languages) : 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Country: {request.interpreter.country || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Status: {request.interpreter.status || 'N/A'}
                      </p>
                      {request.interpreter.photoUrl && (
                        <img
                          src={request.interpreter.photoUrl}
                          alt={`${request.interpreter.name}'s profile`}
                          className="w-16 h-16 rounded-full mt-2"
                        />
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Email Notification</p>
                    <p className="text-sm text-primary-700">
                      Messages sent here will be delivered to the client's email:{' '}
                      <span className="font-semibold">{request.email || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Messages List */}
                <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${
                          message.interpreterId === request.interpreterId ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                            {message.interpreter?.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div
                          className={`flex-1 ${
                            message.interpreterId === request.interpreterId ? 'text-right' : ''
                          }`}
                        >
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {message.interpreter?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.interpreterId === request.interpreterId
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-900 shadow-sm'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="Type your message"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </motion.button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Messages are sent to Request ID: {request.id.slice(0, 8)} and Interpreter ID:{' '}
                  {request.interpreterId ? request.interpreterId.slice(0, 8) : 'Not assigned'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RequestDetailsPage;