import React, { useState, useEffect } from 'react';
import { X, Loader2, Droplets, Dumbbell, Flower2 } from 'lucide-react';

const iconMap = {
  Droplets: Droplets,
  Dumbbell: Dumbbell,
  Flower2: Flower2,
};

export default function EditHabitModal({ isOpen, onClose, habit, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    icon: 'Droplets'
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        icon: habit.icon || 'Droplets'
      });
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(habit.id, formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-lg text-on-surface font-semibold">Edit Habit</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Habit Name</label>
            <input 
              autoFocus
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Icon</label>
            <div className="flex gap-2">
              {Object.keys(iconMap).map(iconName => {
                const IconComponent = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({...formData, icon: iconName})}
                    className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                      formData.icon === iconName 
                        ? 'bg-primary-container border-primary text-on-primary-container' 
                        : 'bg-surface-container-lowest border-outline-variant text-secondary hover:border-primary/50'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant">
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
              className="px-6 py-2 bg-primary text-on-primary font-label text-[13px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 flex items-center gap-2"
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
