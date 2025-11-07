import { Calendar, Users, Zap, Home, Bell, UserPlus, QrCode, Award, Menu, X, Search, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import Overview from '../components/partnerDashboard/Overview';
import MyEvents from '../components/partnerDashboard/MyEvents';
import Attendees from '../components/partnerDashboard/Attendees';
import BoostEvent from '../components/partnerDashboard/BoostEvent';
import NotificationSettings from '../components/partnerDashboard/NotificationSettings';
import AssignRoles from '../components/partnerDashboard/AssignRoles';
import TicketScanner from '../components/partnerDashboard/TicketScanner';
import PartnerVerification from '../components/partnerDashboard/PartnerVerification';

interface PartnerDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PartnerDashboard({ onNavigate }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'attendees' | 'boost' | 'notifications' | 'roles' | 'scanner' | 'verification'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'boost', label: 'Boost Event', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'roles', label: 'Assign Roles', icon: UserPlus },
    { id: 'scanner', label: 'Scan Tickets', icon: QrCode },
    { id: 'verification', label: 'Partner Verification', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
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
      
      <div className="relative z-10">
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Partner Portal</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id as typeof activeTab);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#27aae2] text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-sm">
            <div className="px-2 sm:px-4 lg:px-8 py-2 sm:py-3 md:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Section - Menu & Title */}
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="hidden sm:block">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {menuItems.find(item => item.id === activeTab)?.label}
                    </h1>
                  </div>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events, attendees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Section - Actions & Account */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {/* Account Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Tech Hub Africa</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Partner Account</p>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Tech Hub Africa</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">partner@techhub.com</p>
                        </div>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                          <button 
                            onClick={() => onNavigate('landing')}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3"
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

              {/* Mobile Search Bar */}
              <div className="mt-2 md:hidden">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 pt-[7.5rem] sm:pt-32 md:pt-20 lg:pt-24">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'events' && <MyEvents />}
            {activeTab === 'attendees' && <Attendees />}
            {activeTab === 'boost' && <BoostEvent />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'roles' && <AssignRoles />}
            {activeTab === 'scanner' && <TicketScanner />}
            {activeTab === 'verification' && <PartnerVerification />}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
