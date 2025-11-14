import React from 'react';
import { BarChart3, FileText, Users, Calendar, DollarSign, Download } from 'lucide-react';

export default function Reports() {
	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
					<FileText className="w-6 h-6" /> Reports & Analytics
				</h2>
				<button className="flex items-center gap-2 px-5 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors">
					<Download className="w-4 h-4" />
					Export CSV
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
					<BarChart3 className="w-8 h-8 text-[#27aae2]" />
					<div>
						<p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">124</p>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
					<Users className="w-8 h-8 text-[#27aae2]" />
					<div>
						<p className="text-sm text-gray-500 dark:text-gray-400">Total Partners</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">38</p>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
					<DollarSign className="w-8 h-8 text-[#27aae2]" />
					<div>
						<p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">KES 2,480,000</p>
					</div>
				</div>
			</div>

			{/* Analytics Charts (Placeholder) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Calendar className="w-5 h-5" /> Events Over Time
					</h3>
					<div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
						{/* Replace with chart library */}
						<span>Bar chart placeholder</span>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Users className="w-5 h-5" /> Partner Growth
					</h3>
					<div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
						{/* Replace with chart library */}
						<span>Line chart placeholder</span>
					</div>
				</div>
			</div>

			{/* Recent Reports Table (Placeholder) */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<FileText className="w-5 h-5" /> Recent Reports
				</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead>
							<tr>
								<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Report</th>
								<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
								<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Type</th>
								<th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Download</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="px-4 py-2 text-sm text-gray-900 dark:text-white">October Revenue</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Nov 1, 2025</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Revenue</td>
								<td className="px-4 py-2">
									<button className="flex items-center gap-1 text-[#27aae2] hover:underline">
										<Download className="w-4 h-4" /> CSV
									</button>
								</td>
							</tr>
							<tr>
								<td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Partner Growth Q3</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Oct 15, 2025</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Partners</td>
								<td className="px-4 py-2">
									<button className="flex items-center gap-1 text-[#27aae2] hover:underline">
										<Download className="w-4 h-4" /> CSV
									</button>
								</td>
							</tr>
							<tr>
								<td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Event Attendance</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Oct 2, 2025</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Events</td>
								<td className="px-4 py-2">
									<button className="flex items-center gap-1 text-[#27aae2] hover:underline">
										<Download className="w-4 h-4" /> CSV
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
