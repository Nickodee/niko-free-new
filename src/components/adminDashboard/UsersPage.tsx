import React from 'react';
import { User } from 'lucide-react';

// Dummy user data for demonstration
const users = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    joined: '2024-01-15',
    status: 'Active',
    flagged: false,
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john.doe@email.com',
    joined: '2024-03-22',
    status: 'Active',
    flagged: false,
  },
];

export default function UsersPage() {
  // Only show users who are not partners or admins
  const regularUsers = users.filter(user => !user.email.includes('admin') && !user.email.includes('partner'));

  const [userList, setUserList] = React.useState(regularUsers);

  const handleFlag = (id: string) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, flagged: !u.flagged } : u));
  };

  const handleDelete = (id: string) => {
    setUserList(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-4 lg:px-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-[#27aae2]" />
        All Users
      </h2>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {userList.map(user => (
          <div key={user.id} className="rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{user.status}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Joined: {user.joined}</div>
            {user.flagged && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 w-fit">Flagged</span>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleFlag(user.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold ${user.flagged ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors`}
              >
                {user.flagged ? 'Unflag' : 'Flag'}
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Name</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Email</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Joined</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Status</th>
              <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">{user.name}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.email}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.joined}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.status}
                  </span>
                  {user.flagged && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Flagged</span>
                  )}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 flex flex-col sm:flex-row gap-2 whitespace-nowrap">
                  <button
                    onClick={() => handleFlag(user.id)}
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold ${user.flagged ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors`}
                  >
                    {user.flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
