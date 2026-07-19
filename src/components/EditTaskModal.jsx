import React, { useState, useEffect } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';

export default function EditTaskModal({ isOpen, onClose, task, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    category: 'Work',
    time: '',
    duration: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        priority: task.priority || 'Medium',
        category: task.category || 'Work',
        time: task.time || '',
        duration: task.duration || '',
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(task.id, formData);
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-xl text-on-surface font-semibold">Edit Task</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
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
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

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
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-label text-[11px] text-secondary uppercase">Time (Optional)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input 
                  type="text" 
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
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 w-full font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
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
              disabled={loading || !formData.title.trim()}
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
