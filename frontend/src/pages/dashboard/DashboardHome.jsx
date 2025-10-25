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
} from 'lucide-react';

// Mock contexts and services for demonstration
const InterpreterAuthContext = React.createContext({ user: { id: '1', name: 'John Doe' }, isAuthenticated: true });
const AdminAuthContext = React.createContext({ user: null, isAuthenticated: false });

const mockServices = {
  interpretationRequestService: {
    getAllRequests: async () => [
      { id: '1', fullName: 'Alice Johnson', languageFrom: 'English', languageTo: 'Spanish', status: 'pending', urgencyLevel: 'high', createdAt: new Date().toISOString(), dateTime: new Date().toISOString() }
    ],
    getAllRequestsByInterpreters: async () => [
      { id: '1', fullName: 'Alice Johnson', languageFrom: 'English', languageTo: 'Spanish', status: 'pending', urgencyLevel: 'high', createdAt: new Date().toISOString(), dateTime: new Date().toISOString() }
    ]
  },
  interpreterService: {
    getAllInterpreters: async () => [
      { id: '1', name: 'John Doe', languages: ['English', 'Spanish'] }
    ]
  },
  messageService: {
    getAllMessages: async () => [
      { id: '1', content: 'Hello', requestId: '1', interpreter: { name: 'John Doe' }, createdAt: new Date().toISOString() }
    ],
    getMessagesByRequest: async () => [
      { id: '1', content: 'Hello', requestId: '1', interpreter: { name: 'John Doe' }, createdAt: new Date().toISOString() }
    ]
  }
};

const DashboardSummary = ({ role = 'interpreter' }) => {
  const { user: interpreterUser, isAuthenticated: isInterpreterAuthenticated } = useContext(InterpreterAuthContext);
  const { user: adminUser, isAuthenticated: isAdminAuthenticated } = useContext(AdminAuthContext);
  
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
      recentActivity: 0,
      uniqueInterpreters: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = role === 'admin' && isAdminAuthenticated;
  const isAuthenticated = isAdmin ? isAdminAuthenticated : isInterpreterAuthenticated;
  const currentUser = isAdmin ? adminUser : interpreterUser;

  useEffect(() => {
    // Early return if not authenticated - stop loading
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

        // Fetch requests based on role
        if (isAdmin) {
          const [requests, interpreters, messages] = await Promise.all([
            mockServices.interpretationRequestService.getAllRequests(),
            mockServices.interpreterService.getAllInterpreters(),
            mockServices.messageService.getAllMessages()
          ]);
          requestsData = requests;
          interpretersData = interpreters;
          messagesData = messages;
        } else {
          requestsData = await mockServices.interpretationRequestService.getAllRequestsByInterpreters();
          
          // Fetch messages only for assigned requests
          const requestIds = requestsData.map((req) => req.id);
          if (requestIds.length > 0) {
            const messagePromises = requestIds.map((id) => 
              mockServices.messageService.getMessagesByRequest(id)
            );
            const messagesArrays = await Promise.all(messagePromises);
            messagesData = messagesArrays.flat();
          }
        }

        // Sort by createdAt descending
        const sortedRequests = requestsData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        const sortedMessages = messagesData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Recent activity (last 30 days)
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
          recentActivity,
          uniqueInterpreters: isAdmin
            ? new Set(interpretersData.map((int) => int.id)).size
            : requestsData.filter((req) => req.interpreterId).length,
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
  }, [isAuthenticated, isAdmin, currentUser?.id]); // Simplified dependencies

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
      change: '+12%',
      icon: FileText,
      color: 'bg-blue-500',
      trend: 'up',
    },
    {
      label: 'Pending Requests',
      value: dashboardData.stats.pendingRequests,
      change: '+5%',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'up',
    },
    {
      label: 'Accepted Requests',
      value: dashboardData.stats.acceptedRequests,
      change: '-3%',
      icon: Users,
      color: 'bg-green-500',
      trend: 'down',
    },
    {
      label: isAdmin ? 'Unique Interpreters' : 'Assigned Requests',
      value: isAdmin
        ? dashboardData.stats.uniqueInterpreters
        : dashboardData.stats.totalRequests,
      change: '+8%',
      icon: Globe,
      color: 'bg-purple-500',
      trend: 'up',
    },
  ];

  // Show loading spinner only while actually loading
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

  // Show error if not authenticated
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
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