import { Settings, Menu, X, Search, User, LogOut, Shield, FileText, DollarSign, BarChart3, Users, Calendar, HelpCircle, Loader } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Users as UsersIcon } from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import MessagesPage from '../components/adminDashboard/MessagesPage';
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, getToken } from '../services/authService';
import { getUserNotifications } from '../services/userService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import OverviewStats from '../components/adminDashboard/OverviewStats';
import UsersPage from '../components/adminDashboard/UsersPage';
import PartnersSection from '../components/adminDashboard/PartnersSection';
import EventsSection from '../components/adminDashboard/EventsSection';
import RecentActivity from '../components/adminDashboard/RecentActivity';
import PendingApprovals from '../components/adminDashboard/PendingApprovals';
import Reports from '../components/adminDashboard/Reports';
import Revenue from '../components/adminDashboard/Revenue';
import MyProfilePage from '../components/adminDashboard/MyProfilePage';
import SettingsPage from '../components/adminDashboard/SettingsPage';
import NotificationsPage from '../components/adminDashboard/NotificationsPage';
import SupportPage from '../components/adminDashboard/SupportPage';
import InboxPage from '../components/adminDashboard/InboxPage';

interface SearchResult {
  id: string;
  type: 'user' | 'partner' | 'event';
  title: string;
  subtitle: string;
  image?: string;
}

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user: authUser, logout } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Dynamic notification count based on unread notifications
  const [notificationCount, setNotificationCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'events' | 'settings' | 'reports' | 'revenue' | 'users' | 'profile' | 'notifications' | 'messages' | 'support' | 'inbox'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // Ref for account menu
  const accountMenuRef = useRef<HTMLDivElement>(null);
  // Selected item ID to filter in child components
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    // Get admin user from auth context or localStorage
    const user = authUser || getUser();
    setAdminUser(user);
  }, [authUser]);

  // Fetch unread notification count
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes instead of 30 seconds

    const fetchUnreadCount = async () => {
      try {
        const response = await getUserNotifications(true); // true = unread only
        const unreadCount = response.notifications?.filter((n: any) => !n.is_read).length || 0;
        setNotificationCount(unreadCount);
        retryCount = 0; // Reset retry count on success
      } catch (error: any) {
        console.error('Error fetching notification count:', error);
        
        // Stop polling if rate limited (429) or unauthorized (401)
        if (error.message?.includes('429') || error.message?.includes('Too many requests') || 
            error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.warn('Stopping notification polling due to rate limit or auth error');
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          return;
        }
        
        // Exponential backoff on other errors
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          console.warn('Max retries reached, stopping notification polling');
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      }
    };

    fetchUnreadCount();
    // Refresh notification count every 2 minutes (reduced from 30 seconds)
    interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Refresh notification count when returning from notifications tab
  useEffect(() => {
    if (activeTab !== 'notifications') {
      const fetchUnreadCount = async () => {
        try {
          const response = await getUserNotifications(true);
          const unreadCount = response.notifications?.filter((n: any) => !n.is_read).length || 0;
          setNotificationCount(unreadCount);
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };
      fetchUnreadCount();
    }
  }, [activeTab]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  // Handle navigation to events from notifications
  useEffect(() => {
    function handleNavigateEvent(event: CustomEvent) {
      const { eventId } = event.detail;
      if (eventId) {
        // Switch to events tab
        setActiveTab('events');
        // Dispatch another event to EventsSection to highlight/select the event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('events-section-select-event', { 
            detail: { eventId: eventId } 
          }));
        }, 100);
      }
    }
    
    window.addEventListener('admin-navigate-event', handleNavigateEvent as EventListener);
    return () => {
      window.removeEventListener('admin-navigate-event', handleNavigateEvent as EventListener);
    };
  }, []);

  // Search functionality with debounce
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);

      try {
        const token = getToken();
        if (!token) return;

        const searchLower = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Search Users
        try {
          const usersResponse = await fetch(API_ENDPOINTS.admin.users, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const usersData = await usersResponse.json();
          
          if (usersData.users) {
            usersData.users
              .filter((u: any) => 
                `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchLower) ||
                u.email?.toLowerCase().includes(searchLower)
              )
              .slice(0, 3)
              .forEach((u: any) => {
                results.push({
                  id: u.id.toString(),
                  type: 'user',
                  title: `${u.first_name} ${u.last_name}`,
                  subtitle: u.email,
                  image: u.profile_picture,
                });
              });
          }
        } catch (err) {
          console.error('Error searching users:', err);
        }

        // Search Partners
        try {
          const partnersResponse = await fetch(API_ENDPOINTS.admin.partners, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const partnersData = await partnersResponse.json();
          
          if (partnersData.partners) {
            partnersData.partners
              .filter((p: any) => 
                p.business_name?.toLowerCase().includes(searchLower) ||
                p.email?.toLowerCase().includes(searchLower)
              )
              .slice(0, 3)
              .forEach((p: any) => {
                results.push({
                  id: p.id.toString(),
                  type: 'partner',
                  title: p.business_name,
                  subtitle: p.email || p.category,
                  image: p.profile_picture,
                });
              });
          }
        } catch (err) {
          console.error('Error searching partners:', err);
        }

        // Search Events
        try {
          const eventsResponse = await fetch(API_ENDPOINTS.admin.events, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const eventsData = await eventsResponse.json();
          
          if (eventsData.events) {
            eventsData.events
              .filter((e: any) => 
                e.title?.toLowerCase().includes(searchLower) ||
                e.description?.toLowerCase().includes(searchLower)
              )
              .slice(0, 3)
              .forEach((e: any) => {
                results.push({
                  id: e.id.toString(),
                  type: 'event',
                  title: e.title,
                  subtitle: e.venue_name || e.venue_address || 'Event',
                  image: e.poster_image,
                });
              });
          }
        } catch (err) {
          console.error('Error searching events:', err);
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    
    // Navigate to appropriate tab and set selected ID
    switch (result.type) {
      case 'user':
        setSelectedUserId(result.id);
        setSelectedPartnerId(null);
        setSelectedEventId(null);
        setActiveTab('users');
        break;
      case 'partner':
        setSelectedPartnerId(result.id);
        setSelectedUserId(null);
        setSelectedEventId(null);
        setActiveTab('partners');
        break;
      case 'event':
        setSelectedEventId(result.id);
        setSelectedUserId(null);
        setSelectedPartnerId(null);
        setActiveTab('events');
        break;
    }
  };

  // Removed hardcoded data - components now fetch their own data

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10 flex min-h-screen w-full">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">System Control</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('partners')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'partners'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Partners</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <UsersIcon className="w-5 h-5" />
                <span>Users</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'events'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('revenue')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'revenue'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Revenue</span>
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'support'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>Support</span>
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-[#27aae2] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Inbox</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Left - Menu & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Center - Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users, partners, events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                  {isSearching && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                        setSearchResults([]);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                      {isSearching ? (
                        <div className="p-6 text-center">
                          <Loader className="w-6 h-6 text-[#27aae2] animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-6 text-center">
                          <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try searching for users, partners, or events</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {/* Group results by type */}
                          {['user', 'partner', 'event'].map(type => {
                            const typeResults = searchResults.filter(r => r.type === type);
                            if (typeResults.length === 0) return null;

                            return (
                              <div key={type}>
                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  {type === 'user' ? 'Users' : type === 'partner' ? 'Partners' : 'Events'}
                                </div>
                                {typeResults.map(result => (
                                  <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    {result.image ? (
                                      <img
                                        src={result.image.startsWith('http') ? result.image : `${API_BASE_URL}${result.image}`}
                                        alt={result.title}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=27aae2&color=fff&size=128`;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                          {result.title.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex-1 text-left">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {result.title}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {result.subtitle}
                                      </p>
                                    </div>
                                    {result.type === 'user' && <UsersIcon className="w-4 h-4 text-gray-400" />}
                                    {result.type === 'partner' && <Users className="w-4 h-4 text-gray-400" />}
                                    {result.type === 'event' && <Calendar className="w-4 h-4 text-gray-400" />}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Account Menu */}
              <div className="flex items-center space-x-2">
                {/* Dark/Light Mode Toggle */}
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    document.documentElement.classList.toggle('dark');
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                </button>
                {/* Message Icon */}
                {/* <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Messages"
                  onClick={() => setActiveTab('messages')}
                >
                  <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button> */}
                {/* Notification Icon with Counter */}
                <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Notifications"
                  onClick={() => setActiveTab('notifications')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shadow">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <img
                      src={adminUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser?.first_name + ' ' + adminUser?.last_name || 'Admin')}&background=27aae2&color=fff`}
                      alt="Admin"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {adminUser?.first_name && adminUser?.last_name 
                          ? `${adminUser.first_name} ${adminUser.last_name}`
                          : 'System Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminUser?.email || 'Administrator'}
                      </p>
                    </div>
                  </button>

                  {/* Account Dropdown */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {adminUser?.first_name && adminUser?.last_name 
                            ? `${adminUser.first_name} ${adminUser.last_name}`
                            : 'System Admin'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {adminUser?.email || 'admin@nikofree.com'}
                        </p>
                      </div>
                      <button onClick={() => { setActiveTab('profile'); setAccountMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button onClick={() => { setActiveTab('settings'); setAccountMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button 
                          onClick={() => {
                            logout();
                            onNavigate('landing');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          {activeTab === 'messages' && <MessagesPage />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'users' && <UsersPage selectedUserId={selectedUserId} onClearSelection={() => setSelectedUserId(null)} />}
          {activeTab === 'inbox' && <InboxPage />}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <OverviewStats onNavigate={(tab) => setActiveTab(tab)} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PendingApprovals
                  onReviewPartners={() => setActiveTab('partners')}
                  onReviewEvents={() => setActiveTab('events')}
                />
                <RecentActivity />
              </div>
            </div>
          )}
          {activeTab === 'partners' && <PartnersSection selectedPartnerId={selectedPartnerId} onClearSelection={() => setSelectedPartnerId(null)} />}
          {activeTab === 'events' && <EventsSection selectedEventId={selectedEventId} onClearSelection={() => setSelectedEventId(null)} />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'revenue' && <Revenue />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'profile' && <MyProfilePage />}
          {activeTab === 'support' && <SupportPage />}
        </main>
      </div>
      </div>
    </div>
  );
}
