import { Bell, Mail, MessageSquare, Calendar, Settings } from 'lucide-react';
import { useState } from 'react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    newBookings: true,
    eventReminders: true,
    messages: true,
    promotions: false,
    weeklyReport: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationTypes = [
    {
      id: 'newBookings',
      title: 'New Bookings',
      description: 'Get notified when someone books your event',
      icon: Calendar
    },
    {
      id: 'eventReminders',
      title: 'Event Reminders',
      description: 'Reminders about upcoming events',
      icon: Bell
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Notifications for new messages from attendees',
      icon: MessageSquare
    },
    {
      id: 'promotions',
      title: 'Promotions & Tips',
      description: 'Marketing tips and promotional opportunities',
      icon: Mail
    },
    {
      id: 'weeklyReport',
      title: 'Weekly Reports',
      description: 'Weekly summary of your event performance',
      icon: Settings
    }
  ];

  const deliveryMethods = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email'
    },
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Browser and mobile push notifications'
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Text message notifications (standard rates apply)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage how you receive updates about your events
        </p>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Types
        </h3>
        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#27aae2]/10 rounded-lg">
                  <type.icon className="w-5 h-5 text-[#27aae2]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {type.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(type.id as keyof typeof settings)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[type.id as keyof typeof settings]
                    ? 'bg-[#27aae2]'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[type.id as keyof typeof settings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Delivery Methods
        </h3>
        <div className="space-y-4">
          {deliveryMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {method.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {method.description}
                </p>
              </div>
              <button
                onClick={() => toggleSetting(method.id as keyof typeof settings)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[method.id as keyof typeof settings]
                    ? 'bg-[#27aae2]'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[method.id as keyof typeof settings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-[#27aae2] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e8bc3] transition-all shadow-lg">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
