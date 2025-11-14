import React from 'react';

export default function RecentActivity() {
  const activities = [
    { action: 'Partner approved', name: 'Creative Arts Kenya', time: '1 hour ago' },
    { action: 'Event published', name: 'Jazz Night Live', time: '3 hours ago' },
    { action: 'New user registered', name: 'John Doe', time: '5 hours ago' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.name}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
