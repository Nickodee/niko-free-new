import { Calendar, MapPin, Users, Clock, Tag, ExternalLink, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import TicketSelector from '../components/TicketSelector';
import EventActions from '../components/EventActions';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (page: string) => void;
}

export default function EventDetailPage({ onNavigate }: EventDetailPageProps) {
  const [isRSVPed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [copyLinkText, setCopyLinkText] = useState('Copy Link');

  // Example event with different ticket type configurations
  // ticketType can be: 'uniform', 'class', 'loyalty', 'season', 'timeslot'
  const event: {
    title: string;
    image: string;
    description: string;
    fullDescription: string;
    date: string;
    time: string;
    location: string;
    category: string;
    interests: string[];
    attendees: number;
    host: { name: string; avatar: string; role: string };
    ticketType: 'uniform' | 'class' | 'loyalty' | 'season' | 'timeslot';
    tickets: {
      class: Array<{ id: string; name: string; price: number; available: number; features: string[] }>;
      loyalty: Array<{ id: string; name: string; price: number; available: number; discount: string; deadline: string; features: string[] }>;
      season: Array<{ id: string; name: string; price: number; date: string; available: number; discount?: string; popular?: boolean }>;
      timeslot: Array<{ id: string; name: string; price: number; available: number }>;
      uniform: Array<{ id: string; name: string; price: number; available: number }>;
    };
  } = {
    title: 'Nairobi Tech Summit 2025',
    image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Join us for the biggest tech summit in East Africa! Connect with industry leaders, innovative startups, and tech enthusiasts. Experience keynote speeches, panel discussions, networking sessions, and hands-on workshops covering AI, blockchain, cloud computing, and more. This is your opportunity to shape the future of technology in Africa.',
    fullDescription: `The Nairobi Tech Summit 2025 brings together the brightest minds in technology for three days of innovation, learning, and networking.

What to Expect:
• Keynote speeches from global tech leaders
• Interactive workshops on emerging technologies
• Startup pitch competitions with prizes
• Networking sessions with investors and industry experts
• Exhibition hall featuring the latest tech innovations
• Panel discussions on Africa's digital future

Who Should Attend:
• Software developers and engineers
• Entrepreneurs and startup founders
• Technology students and researchers
• Investors and venture capitalists
• Anyone passionate about technology and innovation

Don't miss this opportunity to be part of Africa's tech revolution!`,
    date: 'Saturday, November 2, 2025',
    time: '9:00 AM - 6:00 PM',
    location: 'Kenyatta International Convention Centre, Nairobi',
    category: 'Technology',
    interests: ['AI & Machine Learning', 'Blockchain', 'Cloud Computing', 'Startups', 'Innovation'],
    attendees: 847,
    host: {
      name: 'Tech Hub Africa',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
      role: 'Technology Community'
    },
    // Ticket configuration
    ticketType: 'timeslot', // Options: 'uniform', 'class', 'loyalty', 'season', 'timeslot'
    tickets: {
      // For 'class' tickets (VVIP, VIP, Regular)
      class: [
        { id: 'vvip', name: 'VVIP', price: 5000, available: 20, features: ['Front row seating', 'VIP lounge access', 'Meet & greet with speakers', 'Exclusive networking dinner', 'Event swag bag'] },
        { id: 'vip', name: 'VIP', price: 3500, available: 50, features: ['Premium seating', 'VIP lounge access', 'Lunch included', 'Event swag bag'] },
        { id: 'regular', name: 'Regular', price: 2500, available: 200, features: ['General admission', 'Access to all sessions', 'Coffee breaks included'] }
      ],
      // For 'loyalty' tickets (Die Hard, Early Bird, Advance, Gate)
      loyalty: [
        { id: 'diehard', name: 'Die Hard Fan', price: 1800, available: 30, discount: '40% OFF', deadline: '15 days left', features: ['Exclusive fan perks', 'Priority seating'] },
        { id: 'earlybird', name: 'Early Bird', price: 2000, available: 100, discount: '33% OFF', deadline: '30 days left', features: ['Early access', 'Discounted rate'] },
        { id: 'advance', name: 'Advance', price: 2300, available: 150, discount: '15% OFF', deadline: '7 days left', features: ['Pre-event access'] },
        { id: 'gate', name: 'Gate Ticket', price: 3000, available: 50, discount: 'Regular Price', deadline: 'At the door', features: ['Walk-in admission'] }
      ],
      // For 'season' tickets (3-day event example)
      season: [
        { id: 'day1', name: 'Day 1 Only', price: 1500, date: 'Nov 2, 2025', available: 100 },
        { id: 'day2', name: 'Day 2 Only', price: 1500, date: 'Nov 3, 2025', available: 100 },
        { id: 'day3', name: 'Day 3 Only', price: 1500, date: 'Nov 4, 2025', available: 100 },
        { id: 'season', name: '3-Day Season Pass', price: 4000, date: 'Nov 2-4, 2025', available: 80, discount: 'Save KES 500!', popular: true }
      ],
      // For 'timeslot' tickets (hourly bookings)
      timeslot: [
        { id: 'slot1', name: '9:00 AM - 10:00 AM', price: 500, available: 10 },
        { id: 'slot2', name: '10:00 AM - 11:00 AM', price: 500, available: 10 },
        { id: 'slot3', name: '11:00 AM - 12:00 PM', price: 500, available: 8 },
        { id: 'slot4', name: '2:00 PM - 3:00 PM', price: 500, available: 10 },
        { id: 'slot5', name: '3:00 PM - 4:00 PM', price: 500, available: 10 },
        { id: 'slot6', name: '4:00 PM - 5:00 PM', price: 500, available: 5 },
        { id: 'slot7', name: '5:00 PM - 6:00 PM', price: 500, available: 10 },
        { id: 'slot8', name: '6:00 PM - 7:00 PM', price: 500, available: 10 }
      ],
      // For 'uniform' tickets (single price)
      uniform: [
        { id: 'standard', name: 'Standard Ticket', price: 2500, available: 300 }
      ]
    }
  };

  // Share functionality
  const eventUrl = window.location.href;
  const shareText = `Check out this event: ${event.title}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${eventUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopyLinkText('Link Copied!');
      setTimeout(() => {
        setCopyLinkText('Copy Link');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyLinkText('Link Copied!');
        setTimeout(() => {
          setCopyLinkText('Copy Link');
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
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
        <Navbar onNavigate={onNavigate} />

      <button
        onClick={() => onNavigate('landing')}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#27aae2] transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">Back to Events</span>
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-96">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-[#27aae2] text-white text-sm font-semibold rounded-full">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{event.title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#27aae2]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#27aae2]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#27aae2]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#27aae2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#27aae2]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attendees</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          <img
                            src="https://i.pravatar.cc/150?img=15"
                            alt="Attendee"
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <img
                            src="https://i.pravatar.cc/150?img=22"
                            alt="Attendee"
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <img
                            src="https://i.pravatar.cc/150?img=35"
                            alt="Attendee"
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                        </div>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="text-[#27aae2] hover:text-[#1e8bb8] font-semibold text-sm transition-colors"
                        >
                          See All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{event.description}</p>
                  <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {event.fullDescription}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Interests & Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-[#27aae2]/10 hover:text-[#27aae2] transition-colors cursor-pointer"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hosted By</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={event.host.avatar}
                      alt={event.host.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{event.host.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{event.host.role}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reviews</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="Reviewer"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">2 weeks ago</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Amazing event! The speakers were incredibly insightful and the networking opportunities were fantastic. Learned so much about AI and blockchain applications in Africa.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <img
                        src="https://i.pravatar.cc/150?img=33"
                        alt="Reviewer"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Michael Omondi</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">1 month ago</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4].map((star) => (
                              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                            <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Great summit with lots of valuable content. The venue was perfect and well-organized. Would have loved more hands-on workshop time though.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <img
                        src="https://i.pravatar.cc/150?img=27"
                        alt="Reviewer"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Amina Hassan</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">3 weeks ago</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Exceeded my expectations! Made valuable connections with investors and fellow entrepreneurs. The pitch competition was particularly inspiring. Definitely attending next year!
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="w-full py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-[#27aae2] hover:text-[#27aae2] transition-all"
                    >
                      Load More Reviews
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Event Map */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-[#27aae2]" />
                    <span>Event Venue</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.location}</p>
                </div>
                <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=36.8170%2C-1.2930%2C36.8270%2C-1.2830&layer=mapnik&marker=-1.2880%2C36.8220"
                    allowFullScreen
                    title="Event Location Map"
                  ></iframe>
                  <a
                    href="https://www.openstreetmap.org/?mlat=-1.2880&mlon=36.8220#map=16/-1.2880/36.8220"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-[#27aae2] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Maps</span>
                  </a>
                </div>
              </div>

              {/* Ticketing Section */}
              <TicketSelector
                ticketType={event.ticketType}
                tickets={event.tickets}
                selectedTicketType={selectedTicketType}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTicketType={setSelectedTicketType}
                onSelectTimeSlot={setSelectedTimeSlot}
                isRSVPed={isRSVPed}
                onBuyTicket={() => setShowLoginModal(true)}
              />

              {/* Event Actions (Favorite, Share, Download, Add to Calendar) */}
              <EventActions />

              <div className="bg-gradient-to-br from-[#27aae2]/10 to-[#27aae2]/20 dark:from-[#27aae2]/20 dark:to-[#27aae2]/30 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#27aae2] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Special Offer</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Use code EARLY25 for 20% off</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Valid for the first 100 tickets only</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Share Event</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleWhatsAppShare}
                    className="w-full py-2.5 px-4 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors text-sm"
                  >
                    Share on WhatsApp
                  </button>
                  <button 
                    onClick={handleLinkedInShare}
                    className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Share on LinkedIn
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="w-full py-2.5 px-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:border-[#27aae2] hover:text-[#27aae2] transition-colors text-sm"
                  >
                    {copyLinkText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNavigate={onNavigate}
      />
      </div>
    </div>
  );
}
