import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PendingEvent {
  id: string;
  title: string;
  partner: string;
  category: string;
  date: string;
  status: string;
}

interface EventsSectionProps {
  pendingEvents: PendingEvent[];
}

export default function EventsSection({ pendingEvents }: EventsSectionProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<PendingEvent | null>(null);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Event Approvals</h2>
      <div className="space-y-4">
        {pendingEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
            onClick={(e) => {
              // Only open modal if the card itself is clicked, not a button inside
              if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'SPAN') {
                setSelectedEvent(event);
              }
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                  <span className="px-3 py-1 bg-[#27aae2]/20 text-[#27aae2] rounded-full text-xs font-semibold">
                    {event.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>By: {event.partner}</span>
                  <span>Date: {event.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Add approve logic here
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Add reject logic here
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Event Details Modal (Redesigned for Approval) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
              onClick={() => setSelectedEvent(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Details for Approval</h2>
            <div className="space-y-6">
              {/* Event Name & Status */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">{selectedEvent.title.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedEvent.title}</p>
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 font-semibold">{selectedEvent.status?.toUpperCase() || 'PENDING'}</span>
                </div>
              </div>

              {/* Category & Partner */}
              <div>
                <p className="font-semibold mb-1">Category:</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">{selectedEvent.category}</span>
                <p className="font-semibold mb-1 mt-2">Partner:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mr-2">{selectedEvent.partner}</span>
              </div>

              {/* Date & Time */}
              <div>
                <p className="font-semibold mb-1">Date & Time:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mr-2">{selectedEvent.date}</span>
              </div>

              {/* Description (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1">Description:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">This is a sample event description. The real description will be shown here.</span>
              </div>

              {/* Attendee Limit (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1">Attendee Limit:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited</span>
              </div>

              {/* Ticket Types (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1">Ticket Types:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Regular - $10</span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">VIP - $25</span>
                </div>
              </div>

              {/* Hosts (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1">Hosts:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">@annalane (Verified)</span>
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">@victormuli (Verified)</span>
                </div>
              </div>

              {/* Promo Codes (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1">Promo Codes:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">EARLYBIRD - 20% off</span>
                </div>
              </div>

              {/* Approve/Reject Buttons */}
              <div className="flex gap-4 mt-6 justify-end">
                <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
