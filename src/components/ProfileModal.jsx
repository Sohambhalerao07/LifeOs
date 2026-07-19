import React, { useState, useEffect } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export default function ProfileModal({ isOpen, onClose, settings, onSave }) {
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || 'Soham',
    avatarUrl: profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw',
    affirmation: "You're making solid progress this week.",
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        name: profile?.name || 'Soham',
        avatarUrl: profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw',
        affirmation: settings.affirmation || prev.affirmation,
      }));
    }
  }, [settings, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setProfile({ name: formData.name, avatarUrl: formData.avatarUrl });
      await onSave(null, { affirmation: formData.affirmation });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-xl text-on-surface font-semibold">Your Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-surface-container-high overflow-hidden border-4 border-surface shadow-sm">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Display Name</label>
            <input 
              required
              autoFocus
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Avatar Image URL</label>
            <input 
              type="url" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.avatarUrl}
              onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Motivation Phrase</label>
            <input 
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.affirmation}
              onChange={e => setFormData({...formData, affirmation: e.target.value})}
              placeholder="e.g. You're making solid progress this week!"
            />
          </div>

          <div className="mt-2 pt-4 border-t border-outline-variant flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 font-label text-[13px] text-secondary hover:bg-surface-container rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-primary text-on-primary font-label text-[13px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
