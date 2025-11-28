import { MessageSquare, Clock, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSupportRequests, updateSupportStatus, SupportRequest } from '../../services/adminService';
import { formatTimeAgo } from '../../services/adminService';

export default function SupportPage() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchSupportRequests();
  }, [filter, page]);

  const fetchSupportRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getSupportRequests(filter === 'all' ? undefined : filter, page);
      setSupportRequests(response.support_requests || []);
      setTotal(response.total || 0);
      setPage(response.page || 1);
      setPages(response.pages || 1);
    } catch (err: any) {
      console.error('Error fetching support requests:', err);
      setError(err.message || 'Failed to load support requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: number, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      await updateSupportStatus(requestId, newStatus);
      // Refresh the list
      await fetchSupportRequests();
    } catch (err: any) {
      console.error('Error updating support request status:', err);
      alert(err.message || 'Failed to update support request status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const filteredRequests = supportRequests.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.message.toLowerCase().includes(query) ||
      request.subject?.toLowerCase().includes(query) ||
      request.partner?.business_name.toLowerCase().includes(query) ||
      request.partner?.email.toLowerCase().includes(query)
    );
  });

  const openCount = supportRequests.filter(r => r.status === 'open').length;
  const inProgressCount = supportRequests.filter(r => r.status === 'in_progress').length;
  const resolvedCount = supportRequests.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Requests</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage support requests from partners
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {total}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-[#27aae2]" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {openCount}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {inProgressCount}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {resolvedCount}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by message, subject, partner name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
        </div>
      )}

      {/* Support Requests List */}
      {!isLoading && filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No support requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? "There are no support requests at the moment."
              : `No ${filter.replace('_', ' ')} support requests found.`}
          </p>
        </div>
      )}

      {!isLoading && filteredRequests.length > 0 && (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-[#27aae2]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {request.subject && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.subject}
                      </h3>
                    )}
                  </div>
                  {request.partner && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">From:</span> {request.partner.business_name}
                      {request.partner.email && (
                        <span className="ml-2">({request.partner.email})</span>
                      )}
                    </div>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {request.message}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    {formatTimeAgo(request.created_at)}
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</span>
                {request.status !== 'open' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'open')}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  >
                    Mark as Open
                  </button>
                )}
                {request.status !== 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Mark as In Progress
                  </button>
                )}
                {request.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'resolved')}
                    className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

