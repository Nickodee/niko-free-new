import React from 'react';

// Dummy data for demonstration
const userDetails = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 555-123-4567',
  joined: '2024-01-15',
  status: 'Active',
};

const bookedEvents = [
  {
    id: 'e1',
    title: 'Music Festival 2025',
    date: '2025-06-10',
    location: 'Central Park',
  },
  {
    id: 'e2',
    title: 'Tech Conference',
    date: '2025-08-21',
    location: 'Expo Center',
  },
];

const tickets = [
  {
    id: 't1',
    event: 'Music Festival 2025',
    type: 'VIP',
    price: '$25',
    status: 'Paid',
  },
  {
    id: 't2',
    event: 'Tech Conference',
    type: 'Regular',
    price: '$10',
    status: 'Unpaid',
  },
];

export default function UserDetailPage({ user, onBack }: { user: any, onBack: () => void }) {
  return (
    <div className="w-full  mx-auto px-4 py-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Back to Users</button>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Phone: {user.phone}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Joined: {user.joined}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Status: {user.status}</div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Events Booked</h3>
        <ul className="space-y-2">
          {bookedEvents.map(event => (
            <li key={event.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
              <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">{event.date} &middot; {event.location}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Tickets Bought</h3>
        <ul className="space-y-2">
          {tickets.map(ticket => (
            <li key={ticket.id} className="border-b border-gray-100 dark:border-gray-700 pb-2">
              <div className="font-semibold text-gray-900 dark:text-white">{ticket.event}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Type: {ticket.type} &middot; Price: {ticket.price} &middot; Status: {ticket.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
