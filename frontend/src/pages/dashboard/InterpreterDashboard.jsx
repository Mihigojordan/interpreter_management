import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronDown, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Filter, Grid3X3, List, Settings, Minimize2, Check, X as RejectIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import interpreterService from '../../services/interpreterService';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api/api';

const InterpreterDashboard = () => {
  const [interpreters, setInterpreters] = useState([]);
  const [allInterpreters, setAllInterpreters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInterpreter, setSelectedInterpreter] = useState(null);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allInterpreters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const interps = await interpreterService.getAllInterpreters();
      setAllInterpreters(Array.isArray(interps) ? interps : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load interpreters');
      setAllInterpreters([]);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allInterpreters];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (interpreter) =>
          interpreter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interpreter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interpreter?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interpreter?.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setInterpreters(filtered);
    setCurrentPage(1);
  };

  const totalInterpreters = allInterpreters.length;
  const pendingCount = allInterpreters.filter(i => i.status === 'PENDING').length;
  const acceptedCount = allInterpreters.filter(i => i.status === 'ACCEPTED').length;
  const rejectedCount = allInterpreters.filter(i => i.status === 'REJECTED').length;

  const handleViewInterpreter = (interpreter) => {
    if (!interpreter?.id) return;
    setSelectedInterpreter(interpreter);
    setShowViewModal(true);
  };

  const handleAcceptInterpreter = async (interpreter) => {
    if (!interpreter?.id) {
      showOperationStatus('error', 'Invalid interpreter ID');
      return;
    }
    try {
      setOperationLoading(true);
      await interpreterService.acceptInterpreter(interpreter.id);
      await loadData();
      showOperationStatus('success', `${interpreter.name} accepted successfully!`);
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to accept interpreter');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRejectInterpreter = async () => {
    if (!rejectConfirm?.id || !rejectReason.trim()) {
      setFormError('Reason is required');
      return;
    }
    try {
      setOperationLoading(true);
      await interpreterService.rejectInterpreter(rejectConfirm.id, rejectReason);
      setRejectConfirm(null);
      setRejectReason('');
      setFormError('');
      await loadData();
      showOperationStatus('success', `${rejectConfirm.name} rejected successfully!`);
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to reject interpreter');
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-GB');
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? new Date().toLocaleDateString('en-GB')
      : parsedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  };

  const formatLanguages = (languages) => {
    if (!languages) return 'N/A';
    try {
      const langs = typeof languages === 'string' ? JSON.parse(languages) : languages;
      return Array.isArray(langs) ? langs.join(', ') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const totalPages = Math.ceil(interpreters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterpreters = interpreters.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="text-left py-3 px-4 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('name');
                  setSortOrder(sortBy === 'name' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'name' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('email');
                  setSortOrder(sortBy === 'email' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'email' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden lg:table-cell">Phone</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden lg:table-cell">Country</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden xl:table-cell">Languages</th>
              <th
                className="text-left py-3 px-4 text-gray-600 font-semibold"
                onClick={() => {
                  setSortBy('status');
                  setSortOrder(sortBy === 'status' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'status' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-gray-600 font-semibold hidden md:table-cell"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentInterpreters.map((interpreter, index) => (
              <motion.tr
                key={interpreter.id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-medium text-gray-900">{interpreter.name || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600">{interpreter.email || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{interpreter.phone || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{interpreter.country || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600 hidden xl:table-cell">{formatLanguages(interpreter.languages)}</td>
                <td className="py-3 px-4">{getStatusBadge(interpreter.status)}</td>
                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{formatDate(interpreter.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleViewInterpreter(interpreter)}
                      className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
                      title="View Interpreter"
                      aria-label={`View ${interpreter.name} interpreter`}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    {interpreter.status === 'PENDING' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleAcceptInterpreter(interpreter)}
                          className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                          title="Accept Interpreter"
                          aria-label={`Accept ${interpreter.name} interpreter`}
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setRejectConfirm(interpreter)}
                          className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Reject Interpreter"
                          aria-label={`Reject ${interpreter.name} interpreter`}
                        >
                          <RejectIcon className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentInterpreters.map((interpreter) => (
        <motion.div
          key={interpreter.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3 mb-3">
            {interpreter.photoUrl ? (
              <img src={interpreter.photoUrl} alt={interpreter.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{interpreter.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs">{interpreter.email || 'N/A'}</div>
            </div>
          </div>
          <div className="mb-2">{getStatusBadge(interpreter.status)}</div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => handleViewInterpreter(interpreter)}
                className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
                title="View Interpreter"
                aria-label={`View ${interpreter.name} interpreter`}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
            {interpreter.status === 'PENDING' && (
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleAcceptInterpreter(interpreter)}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                  title="Accept Interpreter"
                  aria-label={`Accept ${interpreter.name} interpreter`}
                >
                  <Check className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setRejectConfirm(interpreter)}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Reject Interpreter"
                  aria-label={`Reject ${interpreter.name} interpreter`}
                >
                  <RejectIcon className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 divide-y divide-gray-100">
      {currentInterpreters.map((interpreter) => (
        <motion.div
          key={interpreter.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-4 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {interpreter.photoUrl ? (
                <img src={interpreter.photoUrl} alt={interpreter.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{interpreter.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs">{interpreter.email || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">{interpreter.phone || 'N/A'}</span>
              <span>{interpreter.country || 'N/A'}</span>
              <span>{getStatusBadge(interpreter.status)}</span>
              <span>{formatDate(interpreter.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => handleViewInterpreter(interpreter)}
                className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors"
                title="View Interpreter"
                aria-label={`View ${interpreter.name} interpreter`}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              {interpreter.status === 'PENDING' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleAcceptInterpreter(interpreter)}
                    className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                    title="Accept Interpreter"
                    aria-label={`Accept ${interpreter.name} interpreter`}
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setRejectConfirm(interpreter)}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Reject Interpreter"
                    aria-label={`Reject ${interpreter.name} interpreter`}
                  >
                    <RejectIcon className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-lg shadow">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, interpreters.length)} of {interpreters.length}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          {pages.map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 text-sm rounded ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 bg-white border border-gray-200 hover:bg-primary-50'
              }`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className=" mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50"
                title="Toggle Sidebar"
                aria-label="Toggle sidebar"
              >
                <Minimize2 className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Interpreter Management</h1>
                <p className="text-sm text-gray-500">Manage interpreters efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50"
                title="Refresh"
                aria-label="Refresh interpreters"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Interpreters', count: totalInterpreters, color: 'primary-600', icon: Settings },
            { title: 'Pending', count: pendingCount, color: 'yellow-600', icon: AlertCircle },
            { title: 'Accepted', count: acceptedCount, color: 'green-600', icon: CheckCircle },
            { title: 'Rejected', count: rejectedCount, color: 'red-600', icon: XCircle },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow border border-gray-100 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${stat.color.replace('600', '50')} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search interpreters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search interpreters"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-primary-50'
                }`}
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Sort interpreters"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('table')}
                  className={`p-2 text-sm transition-colors ${
                    viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
                  }`}
                  title="Table View"
                  aria-label="Switch to table view"
                >
                  <List className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 text-sm transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
                  }`}
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 text-sm transition-colors ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
                  }`}
                  title="List View"
                  aria-label="Switch to list view"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-8 text-center text-gray-600">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading interpreters...</span>
            </div>
          </div>
        ) : interpreters.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">
              {searchTerm ? 'No Interpreters Found' : 'No Interpreters Available'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No interpreters to manage.'}
            </p>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </div>
        )}

        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50"
            >
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg text-sm ${
                  operationStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : operationStatus.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-primary-50 border border-primary-200 text-primary-800'
                }`}
              >
                {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {operationStatus.type === 'info' && <AlertCircle className="w-5 h-5 text-primary-600" />}
                <span className="font-medium">{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setOperationStatus(null)}
                  className="hover:opacity-70"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {operationLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40"
            >
              <div className="bg-white rounded-lg p-4 shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-700 text-sm font-medium">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rejectConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Reject Interpreter</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to reject <span className="font-semibold">{rejectConfirm.name || 'N/A'}</span>?
                  </p>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
                    {formError}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter rejection reason"
                    rows={4}
                    aria-required="true"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setRejectConfirm(null);
                      setRejectReason('');
                      setFormError('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                    aria-label="Cancel rejection"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleRejectInterpreter}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    aria-label="Confirm rejection"
                  >
                    Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showViewModal && selectedInterpreter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interpreter Details</h3>
                <div className="space-y-4">
                  {selectedInterpreter.photoUrl && (
                    <div className="flex justify-center">
                      <img src={selectedInterpreter.photoUrl} alt={selectedInterpreter.name} className="w-24 h-24 rounded-full object-cover" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{selectedInterpreter.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedInterpreter.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{selectedInterpreter.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <p className="text-sm text-gray-900">{selectedInterpreter.country || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                    <p className="text-sm text-gray-900">{formatLanguages(selectedInterpreter.languages) || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {getStatusBadge(selectedInterpreter.status)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online</label>
                    <p className="text-sm text-gray-900">{selectedInterpreter.isOnline ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedInterpreter.createdAt)}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedInterpreter(null);
                    }}
                    className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                    aria-label="Close interpreter details"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterpreterDashboard;