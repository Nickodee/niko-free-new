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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-2xl font-bold"
              onClick={() => setSelectedEvent(null)}
            >
              &times;
            </button>
            {/* Event Image - full width */}
            <div className="w-full mb-6">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Event"
                className="w-full h-56 sm:h-72 object-cover rounded-xl border border-gray-200 dark:border-gray-800"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Details for Approval</h2>
            <div className="space-y-6">
              {/* Event Name & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-xl text-gray-900 dark:text-white mb-1">{selectedEvent.title}</p>
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold mr-2">{selectedEvent.status?.toUpperCase() || 'PENDING'}</span>
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mr-2">{selectedEvent.category}</span>
                </div>
              </div>

              {/* Category & Partner */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Category:</p>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mr-2">{selectedEvent.category}</span>
                <p className="font-semibold mb-1 mt-2 text-gray-900 dark:text-white">Partner:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium mr-2">{selectedEvent.partner}</span>
              </div>

              {/* Date & Time */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Date & Time:</p>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium mr-2">{selectedEvent.date}</span>
              </div>

              {/* Description (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Description:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">This is a sample event description. The real description will be shown here.</span>
              </div>

              {/* Attendee Limit (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Attendee Limit:</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited</span>
              </div>

              {/* Ticket Types (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Ticket Types:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">Regular - $10</span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">VIP - $25</span>
                </div>
              </div>

              {/* Hosts (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Hosts:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">@annalane (Verified)</span>
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">@victormuli (Verified)</span>
                </div>
              </div>

              {/* Promo Codes (mocked for demo) */}
              <div>
                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Promo Codes:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">EARLYBIRD - 20% off</span>
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
