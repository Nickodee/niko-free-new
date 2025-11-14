  // ...existing code...

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Removed broken interface declaration


// Helper to get start of week (Monday)
function getStartOfWeek(date: Date) {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper to get array of dates for the week
function getWeekDates(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekDaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export default function CalendarPage({ onNavigate }: CalendarPageProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getStartOfWeek(new Date()));
  const [activeDayIndex, setActiveDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [modalEvent, setModalEvent] = useState<null | typeof events[0]>(null);

  // Sample events data
  const events = [
    {
      id: '1',
      title: 'Tech Conference',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 17, 2025',
      time: '9:00 AM',
      location: 'KICC, Nairobi',
      attendees: 500,
      category: 'Technology',
      price: 'KES 2,000'
    },
    {
      id: '10',
      title: 'Tech Conference',
      image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 17, 2025',
      time: '9:00 AM',
      location: 'KICC, Nairobi',
      attendees: 500,
      category: 'Technology',
      price: 'KES 2,000'
    },
    
    {
      id: '2',
      title: 'Music Festival',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 18, 2025',
      time: '6:00 PM',
      location: 'Uhuru Park, Nairobi',
      attendees: 1000,
      category: 'Music',
      price: 'KES 1,500'
    },
    {
      id: '3',
      title: 'Fitness Bootcamp',
      image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 19, 2025',
      time: '7:00 AM',
      location: 'Karura Forest, Nairobi',
      attendees: 50,
      category: 'Sports & Fitness',
      price: 'KES 500'
    },
    {
      id: '4',
      title: 'Art Exhibition',
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 20, 2025',
      time: '10:00 AM',
      location: 'National Museum, Nairobi',
      attendees: 200,
      category: 'Arts & Culture',
      price: 'KES 300'
    },
    {
      id: '5',
      title: 'Startup Pitch Night',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 21, 2025',
      time: '5:00 PM',
      location: 'iHub, Nairobi',
      attendees: 150,
      category: 'Business',
      price: 'Free'
    },
    {
      id: '6',
      title: 'Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 23, 2025',
      time: '12:00 PM',
      location: 'Two Rivers Mall, Nairobi',
      attendees: 800,
      category: 'Food & Drink',
      price: 'KES 1,000'
    },
    {
      id: '7',
      title: 'Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 23, 2025',
      time: '12:00 PM',
      location: 'Two Rivers Mall, Nairobi',
      attendees: 800,
      category: 'Food & Drink',
      price: 'KES 1,000'
    },
    {
      id: '9',
      title: 'Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 23, 2025',
      time: '12:00 PM',
      location: 'Two Rivers Mall, Nairobi',
      attendees: 800,
      category: 'Food & Drink',
      price: 'KES 1,000'
    },
    {
      id: '11',
      title: 'Food Festival',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Nov 23, 2025',
      time: '12:00 PM',
      location: 'Two Rivers Mall, Nairobi',
      attendees: 800,
      category: 'Food & Drink',
      price: 'KES 1,000'
    }
  ];

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) setModalEvent(event);
  };

  const closeModal = () => setModalEvent(null);

  // Get week dates
  const weekDates = getWeekDates(selectedWeekStart);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format week range
  const formatWeekRange = (dates: Date[]) => {
    // Use short month on small screens, long month on large screens
    if (window.innerWidth < 640) {
      const options = { month: 'short', day: 'numeric', year: 'numeric' } as const;
      return `${dates[0].toLocaleDateString('en-US', options)} - ${dates[6].toLocaleDateString('en-US', options)}`;
    } else {
      const options = { month: 'long', day: 'numeric', year: 'numeric' } as const;
      return `${dates[0].toLocaleDateString('en-US', options)} - ${dates[6].toLocaleDateString('en-US', options)}`;
    }
  };

  // Next/Prev week handlers
  const nextWeek = () => {
    const next = new Date(selectedWeekStart);
    next.setDate(selectedWeekStart.getDate() + 7);
    setSelectedWeekStart(next);
    setActiveDayIndex(0);
  };
  const prevWeek = () => {
    const prev = new Date(selectedWeekStart);
    prev.setDate(selectedWeekStart.getDate() - 7);
    setSelectedWeekStart(prev);
    setActiveDayIndex(0);
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} currentPage="calendar" />

  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)', maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" data-aos="fade-down"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200" data-aos="fade-down">
              {formatWeekRange(weekDates)}
            </h2>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" data-aos="fade-down"
            >
              <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
          </div>

          {/* Responsive calendar week view */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200 flex-1"
            style={{ minHeight: '400px', maxHeight: '100%' }} data-aos="fade-up">
            {/* Large screens: days of week at top, events below; Small screens: days on right, events on left */}
            <div className="w-full h-full">
              {/* Large screens: days of week row at top */}
              <div className="hidden sm:flex w-full gap-2 mb-4">
                {weekDates.map((date, idx) => (
                  <button
                    key={idx}
                    className={`flex-1 text-center font-semibold py-2 rounded-lg transition-colors ${
                      activeDayIndex === idx
                        ? 'bg-[#27aae2] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-[#27aae2]/10'
                    }`}
                    onClick={() => setActiveDayIndex(idx)}
                  >
                    {weekDays[idx]}
                    <div className="text-xs font-normal mt-1 text-gray-500 dark:text-gray-400">
                      {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
              {/* Small screens: flex row, days left, events right */}
              <div className="flex sm:hidden w-full h-full">
                {/* Days of week column on left */}
                <div className="flex flex-col gap-2 w-14 pr-2 items-center justify-center">
                  {weekDates.map((date, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left font-semibold py-2 rounded-lg transition-colors ${
                        activeDayIndex === idx
                          ? 'bg-[#27aae2] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-[#27aae2]/10'
                      }`}
                      onClick={() => setActiveDayIndex(idx)}
                    >
                      {weekDaysShort[idx]}
                      <div className="text-xs font-normal mt-1 text-gray-500 dark:text-gray-400">
                        {date.getDate()} {monthsShort[date.getMonth()]}
                      </div>
                    </button>
                  ))}
                </div>
                {/* Events for selected day - small screens: 1 event per row, scrollable, max-height matches sidebar */}
                <div className="flex-1 pl-2 overflow-y-auto w-full min-h-0" style={{maxHeight: 'calc(7 * 48px + 65px)'}}>
                  <div className="grid grid-cols-1 gap-2">
                    {getEventsForDate(weekDates[activeDayIndex]).length === 0 && (
                      <div className="col-span-1 text-xs text-gray-400 dark:text-gray-500 text-center py-2">No events</div>
                    )}
                    {getEventsForDate(weekDates[activeDayIndex]).map((event) => (
                      <div
                        key={event.id}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-3"
                        onClick={() => handleEventClick(event.id)}
                        style={{ width: '100%', minWidth: '0', height: 'auto', background: 'none', boxShadow: 'none' }}
                      >
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[#1a8ec4] dark:text-[#27aae2] truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {event.time}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {event.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Events for selected day on large screens: grid rows, scrollable, max-height to prevent overflow */}
              <div className="hidden sm:flex flex-1 pl-2 overflow-y-auto min-h-0" style={{maxHeight: '500px'}}>
                <div className="grid grid-cols-3 gap-4">
                  {getEventsForDate(weekDates[activeDayIndex]).length === 0 && (
                    <div className="col-span-3 text-xs text-gray-400 dark:text-gray-500 text-center py-2">No events</div>
                  )}
                  {getEventsForDate(weekDates[activeDayIndex]).map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-3"
                      onClick={() => handleEventClick(event.id)}
                      style={{ width: '100%', minWidth: '0', height: 'auto', background: 'none', boxShadow: 'none' }}
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#1a8ec4] dark:text-[#27aae2] truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                          {event.time}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

      {/* Event Details Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 relative">
            <button
              className="absolute top-0 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-6xl sm:text-4xl"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={modalEvent.image}
              alt={modalEvent.title}
              className="w-full h-40 object-cover rounded-xl mb-4 border border-gray-200 dark:border-gray-700"
            />
            <div className="font-bold text-lg text-[#1a8ec4] dark:text-[#27aae2] mb-2">{modalEvent.title}</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1"><span className="font-semibold">Location:</span> {modalEvent.location}</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1"><span className="font-semibold">Date:</span> {modalEvent.date}</div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 rounded-lg bg-[#27aae2] text-white font-semibold hover:bg-[#1a8ec4] transition-colors">Add to Calendar</button>
              <button className="flex-1 py-2 rounded-lg border border-[#27aae2] text-[#27aae2] font-semibold hover:bg-[#e6f7ff] transition-colors">Buy Tickets</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
