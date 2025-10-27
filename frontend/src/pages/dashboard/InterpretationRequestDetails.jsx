/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, CheckCircle, AlertCircle, Calendar, Clock, MapPin, User, Mail, Phone, Globe, FileText, Zap, MessageSquare, Briefcase, DollarSign } from 'lucide-react';
import interpretationRequestService from '../../services/interpretationRequestService';
import interpreterService from '../../services/interpreterService';

const InterpretationRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [interpreters, setInterpreters] = useState([]);
  const [selectedInterpreter, setSelectedInterpreter] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [approveAmount, setApproveAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requestData = await interpretationRequestService.getRequestById(id);
        setRequest(requestData);
        const interpreterData = await interpreterService.getAllInterpreters();
        const acceptedInterpreters = interpreterData.filter((i) => i.status === 'ACCEPTED');
        setInterpreters(acceptedInterpreters);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRequestPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      await interpretationRequestService.requestPayment(id, parseFloat(paymentAmount));
      const updatedRequest = await interpretationRequestService.getRequestById(id);
      setRequest(updatedRequest);
      setSuccessMessage('Payment request submitted successfully!');
      setPaymentAmount('');
      setIsPaymentModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to request payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedInterpreter) {
      setError('Please select an interpreter');
      return;
    }
    if (!approveAmount || isNaN(approveAmount) || approveAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      await interpretationRequestService.approveRequest(id, selectedInterpreter, parseFloat(approveAmount));
      const updatedRequest = await interpretationRequestService.getRequestById(id);
      setRequest(updatedRequest);
      setSuccessMessage('Request approved successfully!');
      setSelectedInterpreter('');
      setApproveAmount('');
      setIsApproveModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      await interpretationRequestService.rejectRequest(id, rejectionReason);
      const updatedRequest = await interpretationRequestService.getRequestById(id);
      setRequest(updatedRequest);
      setSuccessMessage('Request rejected successfully!');
      setRejectionReason('');
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? 'N/A'
      : parsedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-gradient-to-r from-yellow-400 to-orange-500', text: 'text-white', label: 'Pending Review', icon: Clock },
      accepted: { bg: 'bg-gradient-to-r from-green-400 to-emerald-500', text: 'text-white', label: 'Approved', icon: CheckCircle },
      rejected: { bg: 'bg-gradient-to-r from-red-400 to-rose-500', text: 'text-white', label: 'Rejected', icon: AlertCircle },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const InfoCard = ({ icon: Icon, label, value, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${gradient} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${gradient.replace('bg-', 'text-').replace('-100', '-600')}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900 break-words">{value || 'N/A'}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/interpretation-requests')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back to Requests</span>
            </button>
            <button
              onClick={() => navigate('/interpretation-requests')}
              className="p-2 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
          <p className="text-gray-600 mt-1">Manage interpretation request information</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4 shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading request details...</p>
            </div>
          </motion.div>
        ) : request ? (
          <div className="space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className={`${getStatusConfig(request.status).bg} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {React.createElement(getStatusConfig(request.status).icon, { className: "w-8 h-8" })}
                    <div>
                      <p className="text-sm font-medium opacity-90">Current Status</p>
                      <p className="text-2xl font-bold">{getStatusConfig(request.status).label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Request ID</p>
                    <p className="text-lg font-mono font-semibold">#{id}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Client Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-indigo-600" />
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={User} label="Full Name" value={request.fullName} gradient="bg-blue-100" />
                <InfoCard icon={Mail} label="Email" value={request.email} gradient="bg-purple-100" />
                <InfoCard icon={Phone} label="Phone" value={request.phone} gradient="bg-green-100" />
                <InfoCard icon={MessageSquare} label="Preferred Contact" value={request.preferredContactMethod} gradient="bg-pink-100" />
              </div>
            </motion.div>

            {/* Service Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-indigo-600" />
                Service Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={Globe} label="Language Pair" value={`${request.languageFrom} → ${request.languageTo}`} gradient="bg-indigo-100" />
                <InfoCard icon={Briefcase} label="Service Type" value={request.serviceType} gradient="bg-cyan-100" />
                <InfoCard icon={User} label="Interpreter Type" value={request.interpreterType} gradient="bg-teal-100" />
                <InfoCard icon={Calendar} label="Date & Time" value={formatDate(request.dateTime)} gradient="bg-orange-100" />
                <InfoCard icon={MapPin} label="Location" value={request.location} gradient="bg-red-100" />
                <InfoCard icon={Clock} label="Duration" value={request.durationMinutes ? `${request.durationMinutes} minutes` : 'N/A'} gradient="bg-yellow-100" />
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InfoCard icon={Zap} label="Urgency Level" value={request.urgencyLevel} gradient="bg-rose-100" />
                <InfoCard icon={FileText} label="Reason" value={request.reason} gradient="bg-amber-100" />
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Special Requirements</p>
                  <p className="text-sm text-gray-900">{request.specialRequirements || 'None specified'}</p>
                </div>
               {
                request.status == 'rejected' &&
                 <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reject Notes</p>
                  <p className="text-sm text-gray-900">{request.additionalNotes || 'None provided'}</p>
                </div>
               }
              </div>
            </motion.div>

            {/* Assigned Interpreter */}
            {request.interpreter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-6 text-white"
              >
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Assigned Interpreter
                </h2>
                <p className="text-2xl font-bold">{request.interpreter.name}</p>
              </motion.div>
            )}

            {/* Manage Request Section */}
            {request.status.toLowerCase() === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
                  Manage Request
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Request Payment Button */}
               <div className="div">
                   <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Request Payment
                  </motion.button>

                  {/* Approve Request Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsApproveModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve Request
                  </motion.button>
               </div>

                  {/* Reject Section */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Reject Request
                    </h3>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white mb-4 resize-none"
                      rows="4"
                      placeholder="Provide a detailed reason for rejection..."
                      disabled={actionLoading}
                    ></textarea>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-2" />
                      )}
                      Reject Request
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Request Modal */}
            <AnimatePresence>
              {isPaymentModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 max-w-md w-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        Request Payment
                      </h3>
                      <button
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount ($)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white mb-4"
                      placeholder="Enter amount"
                      disabled={actionLoading}
                    />
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequestPayment}
                        disabled={actionLoading || !paymentAmount}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <DollarSign className="w-5 h-5 mr-2" />
                        )}
                        Send
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Approve Request Modal */}
            <AnimatePresence>
              {isApproveModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 max-w-md w-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Approve Request
                      </h3>
                      <button
                        onClick={() => setIsApproveModalOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Interpreter
                    </label>
                    <select
                      value={selectedInterpreter}
                      onChange={(e) => setSelectedInterpreter(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white mb-4"
                      disabled={actionLoading}
                    >
                      <option value="">Choose an interpreter...</option>
                      {interpreters.map((interpreter) => (
                        <option key={interpreter.id} value={interpreter.id}>
                          {interpreter.name} ({interpreter.email})
                        </option>
                      ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Amount ($)
                    </label>
                    <input
                      type="number"
                      value={approveAmount}
                      onChange={(e) => setApproveAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white mb-4"
                      placeholder="Enter amount"
                      disabled={actionLoading}
                    />
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApprove}
                        disabled={actionLoading || !selectedInterpreter || !approveAmount}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Approve Request
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsApproveModalOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-600"
            >
              <p>Created: {formatDate(request.createdAt)} • Updated: {formatDate(request.updatedAt)}</p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">No Request Found</p>
            <p className="text-gray-600">The request you're looking for doesn't exist or couldn't be loaded.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterpretationRequestDetails;