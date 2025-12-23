import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X, Calendar, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import LoginModal from '../components/LoginModal';
import SEO from '../components/SEO';
import { getEvents, getCategories } from '../services/eventService';
import { API_BASE_URL } from '../config/api';

interface AllEventsPageProps {
  onNavigate: (page: string) => void;
  onEventClick: (eventId: string) => void;
}

export default function AllEventsPage({
  onNavigate,
  onEventClick
}: AllEventsPageProps) {
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 20;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories([
          { id: 'all', name: 'All Categories', slug: 'all' },
          ...(response.categories || [])
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch events based on filters
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        const params: any = {
          page: currentPage,
          per_page: eventsPerPage,
        };

        // Add enhanced search query - searches across multiple fields
        // Backend should search in: title, description, category name, location, tags, interests, partner name
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
          // Additional search parameters for comprehensive search
          params.search_categories = true;
          params.search_location = true;
          params.search_tags = true;
          params.search_interests = true;
          params.search_partners = true;
        }

        // Add category filter
        if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
          params.category = selectedCategory;
        }

        // Add location filter
        if (selectedLocation.trim()) {
          params.location = selectedLocation.trim();
          console.log('Location filter applied:', selectedLocation.trim());
        }

        // Add date filter
        if (selectedDate) {
          params.date = selectedDate;
        }

        // Add price filter
        if (priceFilter === 'free') {
          params.is_free = true;
        } else if (priceFilter === 'paid') {
          params.is_free = false;
        }

        console.log('Fetching events with params:', params);
        const response = await getEvents(params);
        
        const formattedEvents = (response.events || []).map((event: any) => {
          const startDate = event.start_date ? new Date(event.start_date) : new Date();
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          let dateStr = 'TBA';
          if (startDate) {
            if (daysDiff === 0) {
              dateStr = 'Today';
            } else if (daysDiff === 1) {
              dateStr = 'Tomorrow';
            } else if (daysDiff > 1) {
              dateStr = startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
            }
          }

          const timeStr = startDate
            ? startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'TBA';

          return {
            id: event.id.toString(),
            title: event.title,
            image: event.poster_image
              ? event.poster_image.startsWith('http')
                ? event.poster_image
                : `${API_BASE_URL}${event.poster_image.startsWith('/') ? '' : '/'}${event.poster_image}`
              : 'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=600',
            date: dateStr,
            time: timeStr,
            location: event.venue_name || event.venue_address || 'Online',
            attendees: event.attendee_count || 0,
            category: event.category?.name || 'General',
            categorySlug: event.category?.slug || event.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'general',
            price: event.is_free
              ? 'Free'
              : event.ticket_types?.[0]?.price
              ? `KES ${parseInt(event.ticket_types[0].price).toLocaleString()}`
              : 'TBA',
            is_free: event.is_free || false,
            inBucketlist: event.in_bucketlist || false,
          };
        });

        setEvents(formattedEvents);
        setTotalEvents(response.total || formattedEvents.length);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, selectedLocation, selectedCategory, selectedDate, priceFilter, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('all');
    setSelectedDate('');
    setPriceFilter('all');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  // Show full-page loader on initial load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={selectedCategory && selectedCategory !== 'all' 
          ? `${selectedCategory} Events in Kenya | Niko Free` 
          : "All Events - Discover Events in Kenya | Niko Free"}
        description={selectedCategory && selectedCategory !== 'all'
          ? `Browse ${selectedCategory} events happening in Kenya. Find and book tickets for ${selectedCategory.toLowerCase()} events on Niko Free.`
          : "Browse and search all events happening in Kenya. Filter by category, location, date, and price to find the perfect event for you."}
        keywords={`events kenya, ${selectedCategory || 'all events'}, search events, find events, event categories, kenya events, event search, filter events, ${selectedLocation || 'nairobi, mombasa'}, book tickets`}
        url={`https://niko-free.com/events${selectedCategory && selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
        category={selectedCategory && selectedCategory !== 'all' ? {
          name: selectedCategory,
          description: `Discover and book ${selectedCategory} events in Kenya`,
          eventCount: totalEvents
        } : undefined}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        {/* Navbar */}
        <Navbar onNavigate={onNavigate} currentPage="events" />

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Search by event name, category, location, tags, interests, or partner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bc3] transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Search Hints */}
            {!showFilters && !searchQuery && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Try searching:</span>
                <button
                  onClick={() => setSearchQuery('concerts')}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  concerts
                </button>
                <button
                  onClick={() => setSearchQuery('Nairobi')}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Nairobi
                </button>
                <button
                  onClick={() => setSearchQuery('technology')}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  technology
                </button>
                <button
                  onClick={() => setSearchQuery('networking')}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  networking
                </button>
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Any location"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.slug || cat.id} value={cat.slug || cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPriceFilter('all')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          priceFilter === 'all'
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setPriceFilter('free')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          priceFilter === 'free'
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Free
                      </button>
                      <button
                        onClick={() => setPriceFilter('paid')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          priceFilter === 'paid'
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Paid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(searchQuery || selectedLocation || (selectedCategory && selectedCategory !== 'all') || selectedDate || priceFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedLocation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm">
                    Location: {selectedLocation}
                    <button onClick={() => setSelectedLocation('')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm">
                    Date: {new Date(selectedDate).toLocaleDateString()}
                    <button onClick={() => setSelectedDate('')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#27aae2] text-white rounded-full text-sm">
                    Price: {priceFilter === 'free' ? 'Free Only' : 'Paid Only'}
                    <button onClick={() => setPriceFilter('all')} className="hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing {events.length === 0 ? 0 : (currentPage - 1) * eventsPerPage + 1} -{' '}
                {Math.min(currentPage * eventsPerPage, totalEvents)} of {totalEvents} events
              </span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking for
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-3 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bc3] transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} {...event} onClick={onEventClick} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#27aae2] text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <Footer onNavigate={onNavigate} onOpenLoginModal={() => setShowLoginModal(true)} />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}
