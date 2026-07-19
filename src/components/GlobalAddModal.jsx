import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { getTodayFormatted } from '../utils/dateUtils';
import { useApi } from '../hooks/useApi';

export default function GlobalAddModal({ isOpen, onClose, initialDate }) {
  const { addItem: addTask } = useApi('tasks');
  const { addItem: addHabit } = useApi('habits');
  const [type, setType] = useState('task'); // 'task' or 'habit'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    category: 'Work',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '',
    recurring: 'none',
  });

  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        date: initialDate || new Date().toISOString().split('T')[0]
      }));
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(null);

    try {
      const basePayload = type === 'task' ? {
        title: formData.title,
        priority: formData.priority,
        category: formData.category,
        completed: false,
        recurring: formData.recurring !== 'none',
        ...(formData.time ? { time: formData.time } : {}),
        ...(formData.duration ? { duration: formData.duration } : {}),
      } : {
        title: formData.title,
        icon: 'Droplets',
        completed: false
      };

      if (type === 'task' && formData.recurring !== 'none') {
        // Generate dates for the recurring pattern within the current week
        const startDate = new Date(formData.date);
        const dates = [];
        
        if (formData.recurring === 'daily') {
          // 7 days from the start date
          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
          }
        } else if (formData.recurring === 'weekdays') {
          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) {
              dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
            }
          }
        } else if (formData.recurring === 'weekly') {
          // Create for this week and next 3 weeks
          for (let w = 0; w < 4; w++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + w * 7);
            dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
          }
        }
        
        for (const dateStr of dates) {
          await addTask({ ...basePayload, date: dateStr });
        }
      } else {
        // Try with date field first, fall back without it if column doesn't exist
        let payload = type === 'task' && formData.date 
          ? { ...basePayload, date: formData.date } 
          : basePayload;

        if (type === 'task') {
          await addTask(payload);
        } else {
          await addHabit(payload);
        }
      }

      window.dispatchEvent(new Event('refetch-data'));
      onClose();
      setFormData({ title: '', priority: 'Medium', category: 'Work', date: new Date().toISOString().split('T')[0], time: '', duration: '', recurring: 'none' });
    } catch (err) {
      console.error('Quick Add error:', err);
      setSaveError(err.message || 'Failed to save. Check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-xl text-on-surface font-semibold">Quick Add</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex p-4 gap-2 border-b border-surface-container-highest">
          <button 
            type="button"
            onClick={() => setType('task')}
            className={clsx(
              "flex-1 py-2 font-label text-[13px] rounded-lg transition-colors border",
              type === 'task' ? "bg-primary-container text-on-primary-container border-primary/20 font-bold" : "bg-transparent text-secondary border-outline-variant hover:bg-surface-container"
            )}
          >
            Add Task
          </button>
          <button 
            type="button"
            onClick={() => setType('habit')}
            className={clsx(
              "flex-1 py-2 font-label text-[13px] rounded-lg transition-colors border",
              type === 'habit' ? "bg-primary-container text-on-primary-container border-primary/20 font-bold" : "bg-transparent text-secondary border-outline-variant hover:bg-surface-container"
            )}
          >
            Add Habit
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Title</label>
            <input 
              required
              autoFocus
              type="text" 
              placeholder={type === 'task' ? "e.g., Finalize Q3 Report" : "e.g., Read 10 Pages"}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {type === 'task' && (
            <>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-label text-[11px] text-secondary uppercase">Priority</label>
                  <select 
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-label text-[11px] text-secondary uppercase">Category</label>
                  <select 
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Work">Work</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-label text-[11px] text-secondary uppercase">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                    <input 
                      type="date" 
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-2.5 w-full font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-label text-[11px] text-secondary uppercase">Time (Optional)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                    <input 
                      type="text" 
                      placeholder="e.g., 2:00 PM"
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-2.5 w-full font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-label text-[11px] text-secondary uppercase">Duration (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 45m"
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 w-full font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-[11px] text-secondary uppercase flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Repeat
                </label>
                <select 
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                  value={formData.recurring}
                  onChange={e => setFormData({...formData, recurring: e.target.value})}
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily (next 7 days)</option>
                  <option value="weekdays">Weekdays Only (next 7 days)</option>
                  <option value="weekly">Weekly (next 4 weeks)</option>
                </select>
              </div>
            </>
          )}

          {saveError && (
            <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg font-body text-sm">
              {saveError}
            </div>
          )}

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
              disabled={loading || !formData.title.trim()}
              className="px-6 py-2 bg-primary text-on-primary font-label text-[13px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save {type === 'task' ? 'Task' : 'Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
