import React, { useState, useEffect } from 'react';
import { getToken } from '../../services/authService';
import { API_ENDPOINTS } from '../../config/api';

export default function UserDetailPage({ user, onBack }: { user: any, onBack: () => void }) {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [bookedEvents, setBookedEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_tickets: 0,
    confirmed_bookings: 0,
    total_spent: 0
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch(API_ENDPOINTS.admin.user(parseInt(user.id)), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user details');
        }

        setUserDetails(data.user);
        setBookedEvents(data.bookings || []);
        setTickets(data.tickets || []);
        setStats({
          total_bookings: data.total_bookings || 0,
          total_tickets: data.total_tickets || 0,
          confirmed_bookings: data.confirmed_bookings || 0,
          total_spent: data.total_spent || 0
        });
      } catch (err: any) {
        console.error('Error fetching user details:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      fetchUserDetails();
    }
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };
  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4 py-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Back to Users</button>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto px-4 py-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Back to Users</button>
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const displayUser = userDetails || user;
  const userName = displayUser?.name || `${displayUser?.first_name || ''} ${displayUser?.last_name || ''}`.trim() || 'User';
  const userEmail = displayUser?.email || user?.email || 'N/A';
  const userPhone = displayUser?.phone_number || user?.phone || 'No phone';
  const userJoined = displayUser?.created_at ? formatDate(displayUser.created_at) : (user?.joined || 'N/A');
  const userStatus = displayUser?.is_active ? 'Active' : 'Inactive';

  return (
    <div className="w-full mx-auto px-4 py-6">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Back to Users</button>
      
      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userName}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Phone: {userPhone}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Joined: {userJoined}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Status: {userStatus}</div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Bookings</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total_bookings}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Confirmed</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.confirmed_bookings}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Tickets</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total_tickets}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Spent</div>
            <div className="text-lg font-bold text-[#27aae2]">{formatPrice(stats.total_spent)}</div>
          </div>
        </div>
      </div>

      {/* Events Booked */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Events Booked ({bookedEvents.length})</h3>
        {bookedEvents.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No events booked yet</p>
        ) : (
          <ul className="space-y-2">
            {bookedEvents.map((event: any, index: number) => (
              <li key={event.booking_id || `event-${event.id}-${index}`} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0">
                <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {formatDate(event.date)} &middot; {event.location}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Booking: {event.booking_number} &middot; Quantity: {event.quantity} &middot; 
                  Status: <span className={`font-semibold ${event.status === 'confirmed' ? 'text-green-600' : event.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {event.status}
                  </span>
                  {event.payment_status && (
                    <> &middot; Payment: <span className={`font-semibold ${event.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.payment_status}
                    </span></>
                  )}
                  {event.total_amount > 0 && (
                    <> &middot; Amount: {formatPrice(event.total_amount)}</>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tickets Bought */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Tickets Bought ({tickets.length})</h3>
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No tickets purchased yet</p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket: any, index: number) => (
              <li key={ticket.id || `ticket-${ticket.ticket_number}-${index}`} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0">
                <div className="font-semibold text-gray-900 dark:text-white">{ticket.event_title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Type: {ticket.ticket_type} &middot; Price: {formatPrice(ticket.price)} &middot; 
                  Status: <span className={`font-semibold ${ticket.status === 'paid' ? 'text-green-600' : ticket.status === 'unpaid' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ticket #: {ticket.ticket_number} &middot; Booking: {ticket.booking_number} &middot;
                  {ticket.is_scanned ? (
                    <span className="text-green-600 font-semibold"> Scanned</span>
                  ) : (
                    <span className="text-gray-600"> Not Scanned</span>
                  )}
                  {ticket.is_checked_in && (
                    <span className="text-green-600 font-semibold"> &middot; Checked In</span>
                  )}
                  {!ticket.is_valid && (
                    <span className="text-red-600 font-semibold"> &middot; Invalid</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
