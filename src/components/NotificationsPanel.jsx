import React, { useRef, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function NotificationsPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);
  const { data: tasks, updateItem } = useApi('tasks');
  const { data: settings } = useApi('settings');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const overdueTasks = (tasks || []).filter(t => !t.completed && t.date && t.date < todayStr).slice(0, 5);
  const upcomingTasks = (tasks || []).filter(t => !t.completed && t.date === todayStr && t.time).slice(0, 5);
  
  const totalNotifications = overdueTasks.length + upcomingTasks.length;

  const handleMarkDone = async (task) => {
    await updateItem(task.id, { completed: true });
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-12 right-0 w-80 max-h-[80vh] overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface sticky top-0 z-10">
        <h3 className="font-display font-semibold text-on-surface flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h3>
        {totalNotifications > 0 && (
          <span className="font-label text-xs bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
            {totalNotifications} new
          </span>
        )}
      </div>

      <div className="p-2 flex flex-col">
        {totalNotifications === 0 ? (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-2 text-secondary">
            <Check className="w-8 h-8 text-primary opacity-50" />
            <p className="font-body text-sm">You're all caught up!</p>
          </div>
        ) : (
          <>
            {overdueTasks.length > 0 && (
              <div className="mb-2">
                <h4 className="px-3 py-1 font-label text-[10px] text-error uppercase tracking-wider">Overdue</h4>
                {overdueTasks.map(task => (
                  <div key={task.id} className="p-3 hover:bg-surface-container rounded-xl transition-colors flex gap-3 group">
                    <div className="mt-0.5">
                      <AlertCircle className="w-4 h-4 text-error" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm text-on-surface line-clamp-2">{task.title}</p>
                      <p className="font-label text-[11px] text-secondary mt-1">{task.date}</p>
                    </div>
                    <button 
                      onClick={() => handleMarkDone(task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-fit text-primary hover:bg-primary-container rounded-md"
                      title="Mark as done"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div>
                <h4 className="px-3 py-1 font-label text-[10px] text-primary uppercase tracking-wider">Today's Schedule</h4>
                {upcomingTasks.map(task => (
                  <div key={task.id} className="p-3 hover:bg-surface-container rounded-xl transition-colors flex gap-3 group">
                    <div className="mt-0.5">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm text-on-surface line-clamp-2">{task.title}</p>
                      <p className="font-label text-[11px] text-secondary mt-1">{task.time}</p>
                    </div>
                    <button 
                      onClick={() => handleMarkDone(task)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-fit text-primary hover:bg-primary-container rounded-md"
                      title="Mark as done"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
