import React from 'react';

interface AskSupportProps {
  onSent?: () => void;
}

export default function AskSupport({ onSent }: AskSupportProps) {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold text-[#27aae2] mb-4">Ask for Support</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Contact the admin directly or send a message below.</p>
      <div className="mb-4 text-left">
        <div className="mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">Admin Phone:</span>
          <a href="tel:+254700123456" className="ml-2 text-[#27aae2] hover:underline">+254 700 123 456</a>
        </div>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Admin Email:</span>
          <a href="mailto:admin@niko-free.com" className="ml-2 text-[#27aae2] hover:underline">admin@niko-free.com</a>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (onSent) onSent();
          alert('Your message has been sent to the admin!');
        }}
        className="mt-4"
      >
        <textarea
          rows={4}
          placeholder="Type your message to the admin..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2] mb-4"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#27aae2] text-white rounded-lg hover:bg-[#1e8bb8] font-semibold transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
