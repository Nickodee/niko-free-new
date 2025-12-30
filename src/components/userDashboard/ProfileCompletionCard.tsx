import { AlertCircle, Phone, Calendar, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { toast } from 'react-toastify';

export default function ProfileCompletionCard() {
  const [isMissingInfo, setIsMissingInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      setIsLoading(true);
      const profileData = await getUserProfile();
      const userData = profileData.user || profileData;
      
      const missing: string[] = [];
      if (!userData.phone_number) {
        missing.push('phone_number');
      }
      if (!userData.date_of_birth) {
        missing.push('date_of_birth');
      }
      if (!userData.gender) {
        missing.push('gender');
      }
      
      setMissingFields(missing);
      setIsMissingInfo(missing.length > 0);
      setPhoneNumber(userData.phone_number || '');
      setDateOfBirth(userData.date_of_birth || '');
      setGender(userData.gender || '');
    } catch (err: any) {
      console.error('Error checking profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() && !dateOfBirth.trim() && !gender.trim()) {
      toast.error('Please fill in at least one field', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updateData: any = {};
      if (phoneNumber.trim()) {
        updateData.phone_number = phoneNumber.trim();
      }
      if (dateOfBirth.trim()) {
        updateData.date_of_birth = dateOfBirth.trim();
      }
      if (gender.trim()) {
        updateData.gender = gender.trim();
      }

      await updateUserProfile(updateData);
      
      toast.success('Profile updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      // Refresh to check if still missing info
      await checkProfileCompletion();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile', {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isMissingInfo) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Complete Your Profile
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Please add your {(() => {
              const fields = [];
              if (missingFields.includes('phone_number')) fields.push('phone number');
              if (missingFields.includes('date_of_birth')) fields.push('date of birth');
              if (missingFields.includes('gender')) fields.push('gender');
              if (fields.length === 0) return 'missing information';
              if (fields.length === 1) return fields[0];
              if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
              return `${fields.slice(0, -1).join(', ')}, and ${fields[fields.length - 1]}`;
            })()} to complete your profile.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Add Now
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {missingFields.includes('phone_number') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +254712345678"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={missingFields.includes('phone_number') && !dateOfBirth.trim()}
              />
            </div>
          )}

          {missingFields.includes('date_of_birth') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={missingFields.includes('date_of_birth') && !phoneNumber.trim() && !gender.trim()}
              />
            </div>
          )}

          {missingFields.includes('gender') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={missingFields.includes('gender') && !phoneNumber.trim() && !dateOfBirth.trim()}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                checkProfileCompletion();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

