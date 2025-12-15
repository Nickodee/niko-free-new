import { Mail, MessageSquare, Star, Trash2, Archive, Eye, Clock, User, Filter, Search, ThumbsUp, Lightbulb, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import { getToken } from '../../services/authService';

interface Message {
  id: number;
  type: 'contact' | 'feedback';
  name: string;
  email: string;
  subject?: string;
  title?: string;
  message?: string;
  description?: string;
  feedbackType?: 'suggestion' | 'bug' | 'compliment' | 'other';
  rating?: number;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'feedback'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = getToken();
        if (!token) {
          toast.error('Please log in to view messages');
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (filterType !== 'all') params.append('type', filterType);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (searchQuery) params.append('search', searchQuery);

        const url = `${API_ENDPOINTS.admin.inbox}${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast.error(error.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [filterType, filterStatus, searchQuery]);

  const filteredMessages = messages.filter((msg) => {
    if (msg.isArchived) return false;
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (filterStatus === 'unread' && msg.isRead) return false;
    if (filterStatus === 'starred' && !msg.isStarred) return false;
    if (searchQuery && !msg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !msg.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(msg.subject || msg.title)?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

  const markAsRead = async (id: number, type: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in');
        return;
      }

      const response = await fetch(API_ENDPOINTS.admin.markMessageRead(id, type), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      const data = await response.json();
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast.error(error.message || 'Failed to update message');
    }
  };

  const toggleStar = async (id: number, type: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in');
        return;
      }

      const response = await fetch(API_ENDPOINTS.admin.toggleMessageStar(id, type), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle star');
      }

      const data = await response.json();
      const newStarred = data.data.isStarred;
      setMessages(messages.map(m => m.id === id ? { ...m, isStarred: newStarred } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isStarred: newStarred });
      }
      toast.success(newStarred ? 'Added to starred' : 'Removed from starred');
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message || 'Failed to update message');
    }
  };

  const archiveMessage = async (id: number, type: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in');
        return;
      }

      const response = await fetch(API_ENDPOINTS.admin.archiveMessage(id, type), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to archive message');
      }

      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
      toast.success('Message archived');
    } catch (error: any) {
      console.error('Error archiving message:', error);
      toast.error(error.message || 'Failed to archive message');
    }
  };

  const deleteMessage = async (id: number, type: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in');
        return;
      }

      const response = await fetch(API_ENDPOINTS.admin.deleteMessage(id, type), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
      toast.success('Message deleted');
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const getFeedbackIcon = (type?: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'bug':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'compliment':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('contact')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'contact'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={() => setFilterType('feedback')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'feedback'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Feedback
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'unread'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterStatus('starred')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'starred'
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Starred
            </button>
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) markAsRead(msg.id, msg.type);
                  }}
                  className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${!msg.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-[#27aae2] to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-gray-900 dark:text-white truncate ${!msg.isRead ? 'font-bold' : ''}`}>
                            {msg.name}
                          </span>
                          {msg.type === 'feedback' && msg.feedbackType && (
                            <span className="flex-shrink-0">{getFeedbackIcon(msg.feedbackType)}</span>
                          )}
                        </div>
                        <p className={`text-sm text-gray-900 dark:text-white truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                          {msg.subject || msg.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {msg.message || msg.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(msg.date)}
                          </span>
                          {msg.type === 'feedback' && msg.rating && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{msg.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(msg.id, msg.type);
                      }}
                      className="flex-shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          msg.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#27aae2] to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedMessage.name}
                      </h2>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-sm text-[#27aae2] hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedMessage.type === 'contact'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {selectedMessage.type === 'contact' ? 'Contact' : 'Feedback'}
                        </span>
                        {selectedMessage.type === 'feedback' && selectedMessage.feedbackType && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {getFeedbackIcon(selectedMessage.feedbackType)}
                            <span className="capitalize">{selectedMessage.feedbackType}</span>
                          </span>
                        )}
                        {selectedMessage.rating && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= selectedMessage.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStar(selectedMessage.id, selectedMessage.type)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Star"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          selectedMessage.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => archiveMessage(selectedMessage.id, selectedMessage.type)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id, selectedMessage.type)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedMessage.subject || selectedMessage.title}
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.message || selectedMessage.description}
                  </p>
                </div>
              </div>

              {/* Footer - Reply */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || selectedMessage.title}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#27aae2] to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-[#27aae2] transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
