import { X, Mail } from 'lucide-react';
import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function LoginModal({ isOpen, onClose, onNavigate }: LoginModalProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  if (!isOpen) return null;

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
    onClose();
    onNavigate('user-dashboard');
  };

  const handleEmailLogin = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Continue with Email:', email);
    // Send verification code to email
    setShowEmailModal(false);
    setShowSignupForm(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmail('');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up with:', { email, firstName, lastName, verificationCode });
    // Handle signup logic here
    setShowSignupForm(false);
    onClose();
    onNavigate('user-dashboard');
  };

  const handleCancelSignup = () => {
    setShowSignupForm(false);
    setFirstName('');
    setLastName('');
    setVerificationCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {!showEmailModal && !showSignupForm && (
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          ></div>

          {/* Center modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">Quick Sign In</h2>
              
              {/* Subtitle */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Join events, get recommendations based on your interest. Find where your friends are going.
              </p>

              {/* Social login buttons */}
              <div className="space-y-3 mb-6">
                {/* Facebook */}
                <button 
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Facebook</span>
                </button>

                {/* Apple */}
                <button 
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Apple</span>
                </button>

                {/* Google */}
                <button 
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                </button>

                {/* Email */}
                <button 
                  onClick={handleEmailLogin}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Email</span>
                </button>
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                By Signing In, I agree to AllEvents's{' '}
                <button 
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button 
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Terms of Service
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal - Shows on top of Sign In modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80"
              onClick={handleCloseEmailModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              {/* Close button */}
              <button
                onClick={handleCloseEmailModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Let's get started</h2>
                
                {/* Subtitle */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Use email to get started
                </p>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Continue button */}
                  <button
                    type="submit"
                    className="w-full px-4 py-3.5 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signup Form Modal - Shows after email is entered */}
      {showSignupForm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80"
              onClick={handleCancelSignup}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              {/* Close button */}
              <button
                onClick={handleCancelSignup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Welcome</h2>
                
                {/* Subtitle */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Let's create your account!
                </p>

                {/* Signup Form */}
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Email (read-only) */}
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      value={email}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl cursor-not-allowed"
                    />
                  </div>

                  {/* First Name and Last Name in a row */}
                  <div className="flex gap-3">
                    {/* First Name */}
                    <div className="flex-1">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="flex-1">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Verification Code"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Verification code has been sent to the provided email
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelSignup}
                      className="flex-1 px-4 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3.5 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
