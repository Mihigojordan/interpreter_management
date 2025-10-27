import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Calendar, FileText, Image, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import interpreterService from '../../services/interpreterService';
import { useParams } from 'react-router-dom';


export default function InterpreterDetailView() {
  const [interpreter, setInterpreter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {id:interpreterId} = useParams()

  useEffect(() => {
    fetchInterpreter();
  }, []);

  const fetchInterpreter = async () => {
    try {
      setLoading(true);
      const data = await interpreterService.getInterpreterById(interpreterId);
      setInterpreter(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = () => {
    setActionType('accept');
    setShowActionModal(true);
  };

  const handleRejectClick = () => {
    setActionType('reject');
    setRejectReason('');
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (actionType === 'reject' && !rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      if (actionType === 'accept') {
        await interpreterService.acceptInterpreter(interpreterId);
        setSuccess('Interpreter accepted successfully!');
        setInterpreter(prev => ({ ...prev, status: 'ACCEPTED' }));
      } else {
        await interpreterService.rejectInterpreter(interpreterId, rejectReason);
        setSuccess('Interpreter rejected successfully!');
        setInterpreter(prev => ({ ...prev, status: 'REJECTED', reason: rejectReason }));
      }
      
      setShowActionModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentClick = () => {
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await interpreterService.updateInterpreter(interpreterId, {
        amount: amount,
        paymentStatus: 'PAID'
      });
      
      setSuccess('Payment recorded successfully!');
      setInterpreter(prev => ({ ...prev, amount, paymentStatus: 'PAID' }));
      setShowPaymentModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interpreter details...</p>
        </div>
      </div>
    );
  }

  if (!interpreter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <p>Failed to load interpreter details</p>
        </div>
      </div>
    );
  }

  const languages = Array.isArray(interpreter.languages) 
    ? interpreter.languages 
    : JSON.parse(interpreter.languages || '[]');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Interpreter Details</h1>
          <p className="text-gray-600 mt-1">Review and manage interpreter application</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-white p-1">
                {interpreter.photoUrl ? (
                  <img 
                    src={interpreter.photoUrl} 
                    alt={interpreter.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{interpreter.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    interpreter.type === 'PRO' 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-green-400 text-green-900'
                  }`}>
                    {interpreter.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    interpreter.status === 'PENDING' ? 'bg-orange-400 text-orange-900' :
                    interpreter.status === 'ACCEPTED' ? 'bg-green-400 text-green-900' :
                    'bg-red-400 text-red-900'
                  }`}>
                    {interpreter.status}
                  </span>
                  {interpreter.isOnline && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-400 text-green-900">
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{interpreter.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">{interpreter.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="text-gray-900 font-medium">{interpreter.country}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
              
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {languages.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(interpreter.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Information</h3>
              
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    interpreter.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {interpreter.paymentStatus}
                  </span>
                </div>
              </div>

              {interpreter.amount && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-gray-900 font-medium text-xl">RWF{interpreter.amount.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents</h3>
              
              {interpreter.cvUrl && (
                <a 
                  href={interpreter.cvUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-5 h-5" />
                  <span>View CV</span>
                </a>
              )}

              {interpreter.supportingFile && (
                <a 
                  href={interpreter.supportingFile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-5 h-5" />
                  <span>View Supporting Documents</span>
                </a>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {interpreter.status === 'REJECTED' && interpreter.reason && (
            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Rejection Reason</h4>
                <p className="text-red-800">{interpreter.reason}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
            {interpreter.status === 'PENDING' && (
              <>
                <button
                  onClick={handleRejectClick}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleAcceptClick}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept</span>
                </button>
              </>
            )}
            
            {interpreter.status === 'ACCEPTED' && interpreter.type === 'PRO' && interpreter.paymentStatus === 'PENDING' && (
              <button
                onClick={handlePaymentClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}

            {interpreter.paymentStatus === 'PAID' && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-6 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Payment Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                {actionType === 'accept' ? 'Accept Interpreter?' : 'Reject Interpreter?'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {actionType === 'accept' 
                  ? 'Are you sure you want to accept this interpreter? They will be notified via email.'
                  : 'Please provide a reason for rejecting this interpreter application.'}
              </p>

              {actionType === 'reject' && (
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                  rows="4"
                />
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                    actionType === 'accept' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Record Payment</h3>
              
              <p className="text-gray-600 mb-4">
                Enter the amount paid to this interpreter. This will update their payment status to PAID.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (RWF)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}