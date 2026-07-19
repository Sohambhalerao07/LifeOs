import React from 'react';
import { clsx } from 'clsx';

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 (24 hours)

function parseTimeToHour(timeStr) {
  if (!timeStr) return null;
  // Try to parse formats like "2:00 PM", "2 PM", "14:00", "2am", "7Am"
  const str = timeStr.trim().toLowerCase();
  
  const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = parseInt(match12[2] || '0');
    const period = match12[3];
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    return h + m / 60;
  }
  
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1]) + parseInt(match24[2]) / 60;
  }
  
  return null;
}

function parseDurationToHours(durStr) {
  if (!durStr) return 1; // Default 1 hour
  const str = durStr.trim().toLowerCase();
  
  const mMatch = str.match(/^(\d+)\s*m(?:in)?s?$/);
  if (mMatch) return parseInt(mMatch[1]) / 60;
  
  const hMatch = str.match(/^(\d+(?:\.\d+)?)\s*h(?:r)?s?$/);
  if (hMatch) return parseFloat(hMatch[1]);
  
  const numMatch = str.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]) / 60; // Assume minutes
  
  return 1;
}

export default function TimeBlockView({ tasks = [], onToggle }) {
  const scheduledTasks = tasks
    .filter(t => !t.completed && t.time)
    .map(t => ({
      ...t,
      startHour: parseTimeToHour(t.time),
      durationHours: parseDurationToHours(t.duration),
    }))
    .filter(t => t.startHour !== null);

  const unscheduledTasks = tasks.filter(t => !t.completed && !t.time);
  const hourHeight = 64; // pixels per hour

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="relative" style={{ height: `${hours.length * hourHeight}px` }}>
          {/* Hour lines */}
          {hours.map((hour, i) => (
            <div 
              key={hour} 
              className="absolute w-full border-t border-outline-variant/50 flex"
              style={{ top: `${i * hourHeight}px`, height: `${hourHeight}px` }}
            >
              <div className="w-16 flex-shrink-0 px-2 pt-1">
                <span className="font-label text-[10px] text-secondary">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex-1 border-l border-outline-variant/30"></div>
            </div>
          ))}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const currentHour = now.getHours() + now.getMinutes() / 60;
            if (currentHour >= hours[0] && currentHour <= hours[hours.length - 1] + 1) {
              const topOffset = (currentHour - hours[0]) * hourHeight;
              return (
                <div className="absolute left-16 right-0 z-20 flex items-center" style={{ top: `${topOffset}px` }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-error -ml-1.5"></div>
                  <div className="flex-1 h-px bg-error"></div>
                </div>
              );
            }
            return null;
          })()}

          {/* Scheduled task blocks */}
          {scheduledTasks.map(task => {
            const topOffset = (task.startHour - hours[0]) * hourHeight;
            const height = Math.max(task.durationHours * hourHeight, 28);
            
            return (
              <div
                key={task.id}
                className={clsx(
                  "absolute left-16 right-2 rounded-lg px-3 py-1.5 z-10 cursor-pointer transition-all hover:shadow-md overflow-hidden border-l-4",
                  task.priority === 'High Priority' 
                    ? 'bg-error-container/50 border-error text-on-error-container' 
                    : task.priority === 'Medium' 
                      ? 'bg-tertiary-fixed/30 border-tertiary-fixed-dim text-on-tertiary-fixed' 
                      : 'bg-primary-fixed/30 border-primary text-on-primary-fixed'
                )}
                style={{ top: `${topOffset}px`, height: `${height}px` }}
                onClick={() => onToggle && onToggle(task.id, task.completed)}
              >
                <p className="font-body text-sm font-medium truncate">{task.title}</p>
                {height > 36 && (
                  <p className="font-label text-[10px] opacity-75 mt-0.5">
                    {task.time}{task.duration ? ` · ${task.duration}` : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled tasks */}
      {unscheduledTasks.length > 0 && (
        <div>
          <h3 className="font-label text-[11px] text-secondary uppercase tracking-wider mb-2">Unscheduled</h3>
          <div className="space-y-1.5">
            {unscheduledTasks.map(task => (
              <div 
                key={task.id} 
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 flex items-center gap-3 text-sm font-body text-on-surface"
              >
                <div className={`w-1 h-8 rounded-full ${task.priority === 'High Priority' ? 'bg-error' : task.priority === 'Medium' ? 'bg-tertiary-fixed-dim' : 'bg-primary'}`}></div>
                {task.title}
                {task.category && (
                  <span className="ml-auto font-label text-[10px] text-secondary bg-surface-container px-2 py-0.5 rounded-full">{task.category}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
