import React from 'react';
import { Bell } from 'lucide-react';

// Dummy notifications data
const notifications = [
  {
    id: '1',
    title: 'New Partner Request',
    description: 'Tech Hub Africa has requested to become a partner.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Event Approval Needed',
    description: 'Nairobi Innovation Week is pending your approval.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'User Flagged',
    description: 'Sarah Johnson was flagged for suspicious activity.',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-[#27aae2]" />
        Notifications
      </h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No notifications.</div>
        ) : (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border shadow-sm flex flex-col gap-1 ${note.read ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-lg ${note.read ? 'text-gray-900 dark:text-white' : 'text-[#27aae2]'}`}>{note.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{note.time}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{note.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
