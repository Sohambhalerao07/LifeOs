import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function EditSettingsModal({ isOpen, onClose, settings, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weeklygoal: '',
    reward: '',
    affirmation: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        weeklygoal: settings.weeklygoal || '',
        reward: settings.reward || '',
        affirmation: settings.affirmation || '',
      });
    }
  }, [settings]);

  if (!isOpen || !settings) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(null, formData);
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
          <h2 className="font-display text-xl text-on-surface font-semibold">Weekly Goals</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Weekly Goal</label>
            <input 
              required
              autoFocus
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.weeklygoal}
              onChange={e => setFormData({...formData, weeklygoal: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Reward</label>
            <input 
              required
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.reward}
              onChange={e => setFormData({...formData, reward: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Affirmation</label>
            <input 
              required
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.affirmation}
              onChange={e => setFormData({...formData, affirmation: e.target.value})}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-end gap-3">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
