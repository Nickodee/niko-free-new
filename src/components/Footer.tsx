import { Calendar, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from '../images/VERTICAL TRANSPARENT 1.png';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenLoginModal?: () => void;
}

export default function Footer({ onNavigate, onOpenLoginModal }: FooterProps) {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Social Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={Logo} alt="Niko Free Logo" className="w-50 h-40" />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Discover amazing events and connect with your community. Join us in creating unforgettable experiences.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://www.facebook.com/NikoFree-Leisure" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com/NikoFreeLeisure" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/_nikofree" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/niko-free-5381a83a3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover and Company Sections - 2 columns on mobile, separate columns on desktop */}
          <div className="md:contents grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Discover</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button 
                    onClick={() => onOpenLoginModal?.()}
                    className="hover:text-white transition-colors"
                  >
                    Quick Log In
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('this-weekend')}
                    className="hover:text-white transition-colors"
                  >
                    This Weekend
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('calendar')}
                    className="hover:text-white transition-colors"
                  >
                    Event Calendar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      onNavigate?.('landing');
                      // Scroll to categories section after a short delay to allow page navigation
                      setTimeout(() => {
                        const categoriesSection = document.getElementById('categories-section');
                        if (categoriesSection) {
                          categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Browse Categories
                  </button>
                </li>
              </ul>
            </div>

            

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button 
                    onClick={() => onNavigate?.('about')}
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
                {/* <li><button className="hover:text-white transition-colors">Careers</button></li> */}
                <li>
                  <button 
                    onClick={() => onNavigate?.('contact')}
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('privacy')}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('terms')}
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('feedback')}
                    className="hover:text-white transition-colors"
                  >
                    Feedback
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>&copy; 2025 Niko Free. All rights reserved. Making connections, creating memories.</p>
        </div>
      </div>
    </footer>
  );
}
