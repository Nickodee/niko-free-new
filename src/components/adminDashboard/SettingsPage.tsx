import React, { useState } from 'react';
import { Settings, Mail, UserPlus, List, MapPin, DollarSign, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [categories, setCategories] = useState([
    { id: 1, name: 'Music' },
    { id: 2, name: 'Sports' },
    { id: 3, name: 'Technology' },
  ]);
  const [locations, setLocations] = useState([
    { id: 1, name: 'Nairobi' },
    { id: 2, name: 'Mombasa' },
    { id: 3, name: 'Kisumu' },
  ]);
  const [commissions, setCommissions] = useState([
    { id: 1, event: 'Concert', rate: '10%' },
    { id: 2, event: 'Marathon', rate: '15%' },
    { id: 3, event: 'Tech Expo', rate: '20%' },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      setMessage({ type: 'error', text: 'Please enter a new email' });
      return;
    }

    setLoading(true);
    try {
      setMessage({ type: 'success', text: 'Email updated successfully (dummy action)' });
      setNewEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating email (dummy action)' });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    try {
      setMessage({ type: 'success', text: `Admin invitation sent to ${adminEmail} (dummy action)` });
      setAdminEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Error inviting admin (dummy action)' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (id, newName) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name: newName } : cat)));
  };

  const handleAddCategory = () => {
    const newCategory = { id: Date.now(), name: '' };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDeleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const handleEditLocation = (id, newName) => {
    setLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, name: newName } : loc)));
  };

  const handleAddLocation = () => {
    const newLocation = { id: Date.now(), name: '' };
    setLocations((prev) => [...prev, newLocation]);
  };

  const handleDeleteLocation = (id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const handleEditCommission = (id, newRate) => {
    setCommissions((prev) => prev.map((com) => (com.id === id ? { ...com, rate: newRate } : com)));
  };

  const handleAddCommission = () => {
    const newCommission = { id: Date.now(), event: 'New Event', rate: '' };
    setCommissions((prev) => [...prev, newCommission]);
  };

  const handleDeleteCommission = (id) => {
    setCommissions((prev) => prev.filter((com) => com.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#27aae2]" />
          Settings
        </h2>

        {/* Change Email Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Change Email
          </h3>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Email</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                placeholder="Enter new email" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-6 py-2.5 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bb8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>


        {/* Invite Admin Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Admin
          </h3>
          <form onSubmit={handleInviteAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                placeholder="Enter email to invite as admin" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
