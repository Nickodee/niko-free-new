import { Search, Download, Users, Mail, Phone, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function Attendees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'regular'>('all');

  const attendees = [
    {
      id: 1,
      name: 'John Kamau',
      email: 'john***@gmail.com',
      phone: '+2547***890',
      age: 28,
      ticketType: 'VIP',
      event: 'Summer Music Festival',
      bookingDate: '2024-06-15',
      status: 'Confirmed'
    },
    {
      id: 2,
      name: 'Sarah Muthoni',
      email: 'sarah***@yahoo.com',
      phone: '+2547***234',
      age: 32,
      ticketType: 'Regular',
      event: 'Tech Conference Kenya',
      bookingDate: '2024-06-18',
      status: 'Confirmed'
    },
    {
      id: 3,
      name: 'David Ochieng',
      email: 'david***@gmail.com',
      phone: '+2547***567',
      age: 25,
      ticketType: 'VIP',
      event: 'Summer Music Festival',
      bookingDate: '2024-06-20',
      status: 'Confirmed'
    },
    {
      id: 4,
      name: 'Mary Njeri',
      email: 'mary***@outlook.com',
      phone: '+2547***901',
      age: 30,
      ticketType: 'Regular',
      event: 'Food & Wine Expo',
      bookingDate: '2024-06-10',
      status: 'Confirmed'
    },
    {
      id: 5,
      name: 'Peter Kimani',
      email: 'peter***@gmail.com',
      phone: '+2547***345',
      age: 35,
      ticketType: 'VIP',
      event: 'Tech Conference Kenya',
      bookingDate: '2024-06-22',
      status: 'Confirmed'
    }
  ];

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || attendee.ticketType.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Total Attendees',
      value: attendees.length.toString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'VIP Tickets',
      value: attendees.filter(a => a.ticketType === 'VIP').length.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Regular Tickets',
      value: attendees.filter(a => a.ticketType === 'Regular').length.toString(),
      icon: Users,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Average Age',
      value: Math.round(attendees.reduce((sum, a) => sum + a.age, 0) / attendees.length).toString(),
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendees</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your event attendees and their information
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-[#27aae2] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e8bc3] transition-all shadow-lg">
          <Download className="w-5 h-5" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'vip', label: 'VIP' },
            { id: 'regular', label: 'Regular' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === item.id
                  ? 'bg-[#27aae2] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ticket Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attendee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{attendee.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{attendee.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attendee.age} years
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attendee.event}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attendee.ticketType === 'VIP'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {attendee.ticketType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {attendee.bookingDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {attendee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No attendees found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
