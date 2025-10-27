import React, { useState, useEffect, useContext } from 'react';
import {
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Globe,
  Eye,
  DollarSign,
  Power,
} from 'lucide-react';
import interpretationRequestService from '../../services/interpretationRequestService';
import interpreterService from '../../services/interpreterService';
import messageService from '../../services/messageService';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { InterpreterAuthContext } from '../../context/InterpreterAuthContext';
import { useOutletContext } from 'react-router-dom';

const DashboardSummary = () => {
  const { user: interpreterUser, isAuthenticated: isInterpreterAuthenticated } = useContext(InterpreterAuthContext);
  const { user: adminUser, isAuthenticated: isAdminAuthenticated } = useContext(AdminAuthContext);
  const {role} = useOutletContext()

  const [dashboardData, setDashboardData] = useState({
    requests: [],
    interpreters: [],
    messages: [],
    keyMetrics: [],
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      assignedRequests: 0,
      paidRequests: 0,
      totalInterpreters: 0,
      pendingInterpreters: 0,
      acceptedInterpreters: 0,
      rejectedInterpreters: 0,
      paidInterpreters: 0,
      onlineInterpreters: 0,
      offlineInterpreters: 0,
      activeInterpreters: 0,
      deactivatedInterpreters: 0,
      totalAmountRequests: 0,
      totalAmountInterpreters: 0,
      recentActivity: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = role === 'admin' && isAdminAuthenticated;
  const isAuthenticated = isAdmin ? isAdminAuthenticated : isInterpreterAuthenticated;
  const currentUser = isAdmin ? adminUser : interpreterUser;
  // alert(role)

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let requestsData = [];
        let interpretersData = [];
        let messagesData = [];

        // Fetch interpreter data for both roles (admin sees all, interpreter sees none)
        interpretersData = isAdmin ? await interpreterService.getAllInterpreters() : [];

        // Fetch requests and messages based on role
        if (isAdmin) {
          const [requests, messages] = await Promise.all([
            interpretationRequestService.getAllRequests(),
            messageService.getAllMessages(),
          ]);
          requestsData = requests;
          messagesData = messages;
        } else {
          // For interpreters, fetch only requests assigned to their interpreterId
          requestsData = await interpretationRequestService.getAllRequestsByInterpreters(currentUser.id);
          const requestIds = requestsData.map((req) => req.id);
          if (requestIds.length > 0) {
            const messagePromises = requestIds.map((id) =>
              messageService.getMessagesByRequest(id)
            );
            const messagesArrays = await Promise.all(messagePromises);
            messagesData = messagesArrays.flat();
          }
        }

        // Sort data
        const sortedRequests = requestsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const sortedMessages = messagesData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Calculate recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentActivity = [...requestsData, ...messagesData].filter(
          (item) => new Date(item.createdAt) >= thirtyDaysAgo
        ).length;

        // Key metrics (top 3 urgent requests)
        const keyMetrics = requestsData
          .filter((req) => req.urgencyLevel === 'high')
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
          .slice(0, 3)
          .map((req) => ({
            id: req.id,
            title: `${req.languageFrom} -> ${req.languageTo}`,
            fullName: req.fullName,
            urgencyLevel: req.urgencyLevel,
            createdAt: req.createdAt,
          }));

        // Calculate stats
        const stats = {
          totalRequests: requestsData.length,
          pendingRequests: requestsData.filter((req) => req.status === 'pending').length,
          acceptedRequests: requestsData.filter((req) => req.status === 'accepted').length,
          rejectedRequests: requestsData.filter((req) => req.status === 'rejected').length,
          assignedRequests: requestsData.filter((req) => req.interpreterId).length,
          paidRequests: requestsData.filter((req) => req.paymentStatus === 'PAID').length,
          totalInterpreters: isAdmin ? interpretersData.length : 0,
          pendingInterpreters: isAdmin ? interpretersData.filter((int) => int.status === 'PENDING').length : 0,
          acceptedInterpreters: isAdmin ? interpretersData.filter((int) => int.status === 'ACCEPTED').length : 0,
          rejectedInterpreters: isAdmin ? interpretersData.filter((int) => int.status === 'REJECTED').length : 0,
          paidInterpreters: isAdmin ? interpretersData.filter((int) => int.paymentStatus === 'PAID').length : 0,
          onlineInterpreters: isAdmin ? interpretersData.filter((int) => int.isOnline).length : 0,
          offlineInterpreters: isAdmin ? interpretersData.filter((int) => !int.isOnline).length : 0,
          activeInterpreters: isAdmin ? interpretersData.filter((int) => int.status === 'ACCEPTED').length : 0,
          deactivatedInterpreters: isAdmin ? interpretersData.filter((int) => int.status !== 'ACCEPTED').length : 0,
          totalAmountRequests: isAdmin
            ? requestsData.reduce((sum, req) => sum + (req.amount || 0), 0)
            : 0,
          totalAmountInterpreters: isAdmin
            ? interpretersData.reduce((sum, int) => sum + (int.amount || 0), 0)
            : 0,
          recentActivity,
        };

        setDashboardData({
          requests: sortedRequests.slice(0, 3),
          interpreters: isAdmin ? interpretersData.slice(0, 3) : [],
          messages: sortedMessages.slice(0, 3),
          keyMetrics,
          stats,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, currentUser?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const statsCards = [
    {
      label: 'Total Requests',
      value: dashboardData.stats.totalRequests,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Requests',
      value: dashboardData.stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Accepted Requests',
      value: dashboardData.stats.acceptedRequests,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Rejected Requests',
      value: dashboardData.stats.rejectedRequests,
      icon: Users,
      color: 'bg-red-500',
    },
    {
      label: 'Assigned Requests',
      value: dashboardData.stats.assignedRequests,
      icon: Globe,
      color: 'bg-purple-500',
    },
    {
      label: 'Paid Requests',
      value: dashboardData.stats.paidRequests,
      icon: DollarSign,
      color: 'bg-teal-500',
    },
    ...(isAdmin
      ? [
          {
            label: 'Total Interpreters',
            value: dashboardData.stats.totalInterpreters,
            icon: Users,
            color: 'bg-indigo-500',
          },
          {
            label: 'Pending Interpreters',
            value: dashboardData.stats.pendingInterpreters,
            icon: Clock,
            color: 'bg-orange-500',
          },
          {
            label: 'Accepted Interpreters',
            value: dashboardData.stats.acceptedInterpreters,
            icon: Users,
            color: 'bg-green-600',
          },
          {
            label: 'Rejected Interpreters',
            value: dashboardData.stats.rejectedInterpreters,
            icon: Users,
            color: 'bg-red-600',
          },
          {
            label: 'Paid Interpreters',
            value: dashboardData.stats.paidInterpreters,
            icon: DollarSign,
            color: 'bg-blue-600',
          },
          {
            label: 'Online Interpreters',
            value: dashboardData.stats.onlineInterpreters,
            icon: Power,
            color: 'bg-teal-600',
          },
          {
            label: 'Offline Interpreters',
            value: dashboardData.stats.offlineInterpreters,
            icon: Power,
            color: 'bg-gray-500',
          },
          {
            label: 'Active Interpreters',
            value: dashboardData.stats.activeInterpreters,
            icon: Users,
            color: 'bg-green-700',
          },
          {
            label: 'Deactivated Interpreters',
            value: dashboardData.stats.deactivatedInterpreters,
            icon: Users,
            color: 'bg-red-700',
          },
          {
            label: 'Total Amount (Requests)',
            value: `RWF ${dashboardData.stats.totalAmountRequests.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-pink-500',
          },
          {
            label: 'Total Amount (Interpreters)',
            value: `RWF ${dashboardData.stats.totalAmountInterpreters.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-600',
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          <div className="inline-flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 font-medium">Authentication required</p>
          <p className="text-sm text-gray-600 mt-2">Please log in to view the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Interpretation Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {isAdmin ? adminUser?.adminName || 'Admin' : interpreterUser?.name || 'Interpreter'}!
                Here's your overview.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Requests</h3>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.requests.length > 0 ? (
                  dashboardData.requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.fullName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{`${request.languageFrom} -> ${request.languageTo}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Request"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-gray-600">{formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent requests</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm py-2">
                  View All Requests →
                </button>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Messages</h3>
                <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{dashboardData.messages.length}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.messages.length > 0 ? (
                  dashboardData.messages.map((message) => (
                    <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{message.interpreter?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{message.content}</p>
                            <p className="text-sm text-gray-400">Request #{message.requestId.slice(0, 8)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Request"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-500 mt-1">{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent messages</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm py-2">
                  View All Messages →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;