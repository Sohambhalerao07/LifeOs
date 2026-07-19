import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2, Loader2, FileText } from 'lucide-react';

export default function TaskDetailModal({ isOpen, onClose, task, onSave }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setNotes(task.notes || '');
      try {
        setSubtasks(task.subtasks ? JSON.parse(task.subtasks) : []);
      } catch {
        setSubtasks([]);
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now(), text: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const removeSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(task.id, {
        notes,
        subtasks: JSON.stringify(subtasks),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = subtasks.filter(s => s.done).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl text-on-surface font-semibold truncate">{task.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              {task.priority && (
                <span className={`font-label text-[11px] px-2 py-0.5 rounded-full ${task.priority === 'High Priority' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                  {task.priority}
                </span>
              )}
              {task.category && (
                <span className="font-label text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant">
                  {task.category}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-label text-[13px] text-secondary uppercase tracking-wider">
                Subtasks {totalCount > 0 && `(${completedCount}/${totalCount})`}
              </h3>
              {totalCount > 0 && (
                <span className="font-label text-[11px] text-primary">{progress}%</span>
              )}
            </div>

            {totalCount > 0 && (
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mb-3">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            <div className="space-y-1.5">
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      className="peer sr-only" 
                      type="checkbox" 
                      checked={sub.done}
                      onChange={() => toggleSubtask(sub.id)}
                    />
                    <div className="w-4 h-4 border-2 border-outline-variant rounded-sm peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                      <Check className="text-white w-3 h-3 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </label>
                  <span className={`flex-1 font-body text-sm ${sub.done ? 'line-through text-secondary' : 'text-on-surface'}`}>
                    {sub.text}
                  </span>
                  <button 
                    onClick={() => removeSubtask(sub.id)} 
                    className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add a subtask..."
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-secondary" />
              <h3 className="font-label text-[13px] text-secondary uppercase tracking-wider">Notes</h3>
            </div>
            <textarea
              placeholder="Add notes, links, or details..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[120px]"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 font-label text-[13px] text-secondary hover:bg-surface-container rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-on-primary font-label text-[13px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
