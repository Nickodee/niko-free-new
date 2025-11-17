import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#27aae2]" />
        Settings
      </h2>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Email</label>
          <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter new email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Password</label>
          <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter new password" />
        </div>
        <button type="submit" className="w-full px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">Save Changes</button>
      </form>
    </div>
  );
}
