import { Settings, Menu, X, Search, User, LogOut, Shield, FileText, DollarSign, BarChart3, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import OverviewStats from '../components/adminDashboard/OverviewStats';
import PartnersSection from '../components/adminDashboard/PartnersSection';
import EventsSection from '../components/adminDashboard/EventsSection';
import RecentActivity from '../components/adminDashboard/RecentActivity';
import PendingApprovals from '../components/adminDashboard/PendingApprovals';
import Reports from '../components/adminDashboard/Reports';
import Revenue from '../components/adminDashboard/Revenue';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'events' | 'settings' | 'reports' | 'revenue'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingPartners = [
    {
      id: '1',
      name: 'Tech Hub Africa',
      email: 'contact@techhub.africa',
      category: 'Technology',
      submittedDate: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Fitness Pro Kenya',
      email: 'info@fitnesspro.ke',
      category: 'Sports & Fitness',
      submittedDate: '5 hours ago',
      status: 'pending'
    }
  ];

  const pendingEvents = [
    {
      id: '1',
      title: 'Nairobi Innovation Week',
      partner: 'Tech Hub Africa',
      category: 'Technology',
      date: 'Nov 15, 2025',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Marathon for Health',
      partner: 'Fitness Pro Kenya',
      category: 'Sports',
      date: 'Nov 10, 2025',
      status: 'pending'
    }
  ];

  const approvedPartners = [
    {
      id: '3',
      name: 'Creative Arts Kenya',
      totalEvents: 12,
      totalRevenue: 'KES 284,700',
      rating: 4.8,
      status: 'active'
    },
    {
      id: '4',
      name: 'Music Matters',
      totalEvents: 8,
      totalRevenue: 'KES 156,000',
      rating: 4.6,
      status: 'active'
    }
  ];

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
                  <h2 className="font-bold text-gray-900 dark:text-white">Admin Portal</h2>
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
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'partners' && 'Partner Management'}
                    {activeTab === 'events' && 'Event Management'}
                    {activeTab === 'settings' && 'Platform Settings'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage platform operations</p>
                </div>
              </div>

              {/* Center - Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white border-0 rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Right - Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <img
                    src="https://i.pravatar.cc/150?img=60"
                    alt="Admin"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">System Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">System Admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@nikofree.com</p>
                    </div>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button 
                        onClick={() => onNavigate('landing')}
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
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <OverviewStats />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PendingApprovals
                  pendingPartners={pendingPartners}
                  pendingEvents={pendingEvents}
                  onReviewPartners={() => setActiveTab('partners')}
                  onReviewEvents={() => setActiveTab('events')}
                />
                <RecentActivity />
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <PartnersSection pendingPartners={pendingPartners} approvedPartners={approvedPartners} />
          )}

          {activeTab === 'events' && (
            <EventsSection pendingEvents={pendingEvents} />
          )}

          {activeTab === 'reports' && (
            <Reports />
          )}

          {activeTab === 'revenue' && (
            <Revenue />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Settings</h2>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Manage event categories and classifications</p>
                <button className="px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
                  Manage Categories
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Locations Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Add or remove supported locations</p>
                <button className="px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
                  Manage Locations
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Commission Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Current platform commission: 7%</p>
                <button className="px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
                  Adjust Commission
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
}
