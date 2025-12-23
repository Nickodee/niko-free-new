import React, { useState } from 'react';
import { sendSupportMessage } from '../../services/partnerService';
import { MessageCircle, Phone, Mail } from 'lucide-react';

interface AskSupportProps {
  onSent?: () => void;
}

export default function AskSupport({ onSent }: AskSupportProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsSubmitting(true);
      await sendSupportMessage('Partner Support Request', message.trim());
      setMessage('');
      if (onSent) onSent();
      alert('Your message has been sent to the admin!');
    } catch (err: any) {
      console.error('Error sending support message:', err);
      alert(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold text-[#27aae2] mb-4">Ask for Support</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Contact support team directly or send a message below.</p>
      <div className="mb-4 text-left">
        <div className="mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">Support Phone:</span>
          <a href="tel:+254700123456" className="ml-2 text-[#27aae2] hover:underline">+254 700 123 456</a>
        </div>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Support Email:</span>
          <a href="mailto:admin@niko-free.com" className="ml-2 text-[#27aae2] hover:underline">admin@niko-free.com</a>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          rows={4}
          placeholder="Type your message to the support team..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] mb-4"
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {/* Need More Help Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Need more help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* WhatsApp */}
          <a
            href="https://wa.me/254700123456"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-green-700 dark:text-green-400">WhatsApp</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to open WhatsApp</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">Message and data rates may apply</p>
            </div>
          </a>

          {/* Call Us */}
          <a
            href="tel:+254700123456"
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-blue-700 dark:text-blue-400">Call Us</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">+254 700 123 456</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Available 7:00am - 5:00pm</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:admin@niko-free.com"
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-purple-700 dark:text-purple-400">Send Email</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">We'd love to hear from you</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Email us anytime</p>
            </div>
          </a>

        </div>
      </div>
    </div>
  );
}
