import React from 'react';

interface PendingPartner {
  id: string;
  name: string;
  email: string;
  category: string;
  submittedDate: string;
  status: string;
}

interface PendingEvent {
  id: string;
  title: string;
  partner: string;
  category: string;
  date: string;
  status: string;
}

interface PendingApprovalsProps {
  pendingPartners: PendingPartner[];
  pendingEvents: PendingEvent[];
  onReviewPartners: () => void;
  onReviewEvents: () => void;
}

export default function PendingApprovals({ pendingPartners, pendingEvents, onReviewPartners, onReviewEvents }: PendingApprovalsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Approvals</h3>
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
          {pendingPartners.length + pendingEvents.length}
        </span>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 dark:text-white">Partner Applications</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">{pendingPartners.length} pending</span>
          </div>
          <button
            onClick={onReviewPartners}
            className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
          >
            Review now →
          </button>
        </div>
        <div className="p-4 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 border border-[#27aae2]/30 dark:border-[#27aae2]/40 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 dark:text-white">Event Submissions</p>
            <span className="text-sm text-gray-600 dark:text-gray-400">{pendingEvents.length} pending</span>
          </div>
          <button
            onClick={onReviewEvents}
            className="text-sm text-[#27aae2] hover:text-[#1e8bb8] font-medium"
          >
            Review now →
          </button>
        </div>
      </div>
    </div>
  );
}
