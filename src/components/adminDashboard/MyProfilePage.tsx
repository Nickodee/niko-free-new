import React from 'react';
import { User } from 'lucide-react';

export default function MyProfilePage() {
  // Dummy profile data
  const profile = {
    name: 'System Admin',
    email: 'admin@nikofree.com',
    role: 'Administrator',
    joined: '2022-08-10',
    avatar: 'https://i.pravatar.cc/150?img=60',
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-4">
      <div className="flex flex-col items-center gap-4">
        <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[#27aae2]" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#27aae2]" />
          {profile.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{profile.email}</p>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{profile.role}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">Joined: {profile.joined}</p>
      </div>
    </div>
  );
}
