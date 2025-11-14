import React from 'react';
import { Users, Calendar, DollarSign, BarChart3 } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '15,234', icon: Users, color: 'from-[#27aae2] to-[#1e8bb8]', change: '+12% this month' },
  { label: 'Active Partners', value: '342', icon: Users, color: 'from-green-500 to-green-600', change: '+8% this month' },
  { label: 'Total Events', value: '1,847', icon: Calendar, color: 'from-gray-700 to-gray-900', change: '+156 this month' },
  { label: 'Platform Revenue', value: 'KES 1.2M', icon: DollarSign, color: 'from-orange-500 to-orange-600', change: '7% commission' }
];

export default function OverviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
