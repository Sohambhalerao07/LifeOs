import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flag, Star, ClipboardList, ArrowRight, BookOpen, Loader2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { generateWeekDays, getCurrentWeekRange } from '../utils/dateUtils';
import { useApi } from '../hooks/useApi';
import { useRestDays } from '../hooks/useRestDays';
import EditSettingsModal from '../components/EditSettingsModal';

export default function WeeklyPlanner() {
  const { data: settings, updateItem } = useApi('settings');
  const { data: tasks } = useApi('tasks');
  const { restDays, toggleRestDay } = useRestDays();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const navigate = useNavigate();
  const { openAddModal } = useOutletContext();
  
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  
  const days = generateWeekDays(baseDate);
  const todayStr = new Date().toISOString().split('T')[0];

  const processedDays = days.map(day => {
    let isRestDay = restDays.includes(day.fullDate);
    let progress = day.progress;
    let percent = day.percent;

    if (tasks) {
      const dayTasks = tasks.filter(t => t.date === day.fullDate || (!t.date && day.fullDate === todayStr));
      const totalTasks = dayTasks.length;
      const completedTasks = dayTasks.filter(t => t.completed).length;

      if (totalTasks > 0) {
        percent = `${Math.round((completedTasks / totalTasks) * 100)}%`;
        if (completedTasks === totalTasks) {
          progress = 'Completed';
        } else if (day.active) {
          progress = 'In Progress';
        } else if (day.opacityClass === 'opacity-60') {
          progress = `${completedTasks}/${totalTasks} Tasks`;
        } else {
          progress = 'Planned';
        }
      } else {
        percent = '0%';
        progress = day.active ? '0 Tasks' : (day.opacityClass === 'opacity-60' ? '0 Tasks' : 'Planned');
      }
    }

    return { ...day, isRestDay, progress, percent };
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Week Header & Context */}
        <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded hover:bg-surface-container-high transition-colors text-secondary"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="font-display text-4xl text-on-surface">{getCurrentWeekRange(baseDate)}</h1>
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-1 rounded hover:bg-surface-container-high transition-colors text-secondary"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                <span className="font-label text-[11px] text-secondary uppercase tracking-wider">Weekly Goal:</span>
                <span className="font-body text-sm font-medium">{settings?.weeklygoal || '-'}</span>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-tertiary-container" />
                <span className="font-label text-[11px] text-secondary uppercase tracking-wider">Reward:</span>
                <span className="font-body text-sm font-medium">{settings?.reward || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="text-right">
              <span className="font-label text-[11px] text-secondary block mb-1">Affirmation</span>
              <p className="font-body text-sm italic text-on-surface-variant">"{settings?.affirmation || '-'}"</p>
            </div>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full md:w-auto px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label text-[13px] hover:bg-surface-container-high transition-colors text-on-surface"
            >
              Edit Goals
            </button>
          </div>
        </section>

        {/* Days Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedDays.map((day) => {
            if (day.isRestDay) {
              return (
                <article key={day.day} className={clsx("bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary-fixed-dim transition-colors group flex flex-col h-full bg-surface", day.opacityClass || 'opacity-50')}>
                  <header className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={clsx("font-label text-[13px] uppercase", day.active ? "text-primary font-bold" : "text-secondary")}>{day.day}</h3>
                      <p className="font-display text-2xl mt-1">{day.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openAddModal(day.fullDate)}
                          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                          title="Add Task for this day"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className={clsx("w-10 h-10 rounded-full border flex items-center justify-center transition-colors", day.active ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-outline-variant")}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-secondary font-label uppercase">
                        <input type="checkbox" checked={true} onChange={() => toggleRestDay(day.fullDate)} className="accent-primary" />
                        Rest Day
                      </label>
                    </div>
                  </header>
                  <div className="flex-1 flex items-center justify-center mb-6">
                    <span className="font-body text-sm text-secondary italic">Rest Day</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/daily?date=${day.fullDate}`)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-secondary font-label text-[13px] border border-transparent rounded-lg group-hover:bg-surface-container-high transition-colors"
                  >
                    View Day
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </article>
              );
            }
            
            return (
              <article 
                key={day.day} 
                className={clsx(
                  "bg-surface-container-lowest border border-outline-variant rounded-xl p-4 transition-colors group flex flex-col h-full",
                  day.active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:border-primary-fixed-dim",
                  day.opacityClass || 'opacity-100'
                )}
              >
                <header className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={clsx("font-label text-[13px] uppercase", day.active ? "text-primary font-bold" : "text-secondary")}>
                      {day.day}
                    </h3>
                    <p className="font-display text-2xl mt-1">{day.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openAddModal(day.fullDate)}
                        className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                        title="Add Task for this day"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className={clsx(
                        "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
                        day.active ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-secondary group-hover:text-primary"
                      )}>
                        <ClipboardList className="w-5 h-5" />
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-secondary font-label uppercase">
                      <input type="checkbox" checked={false} onChange={() => toggleRestDay(day.fullDate)} className="accent-primary" />
                      Rest Day
                    </label>
                  </div>
                </header>
                <div className="mb-6 flex-1">
                  <div className="flex justify-between font-label text-[11px] mb-2">
                    <span className="text-secondary">Progress</span>
                    <span className="text-on-surface font-medium">{day.progress}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: day.percent }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/daily?date=${day.fullDate}`)}
                  className={clsx(
                    "w-full py-2 flex items-center justify-center gap-2 font-label text-[13px] border border-transparent rounded-lg transition-colors",
                    day.active ? "text-primary hover:bg-primary-container/10" : "text-secondary group-hover:text-primary group-hover:bg-primary-container/10"
                  )}
                >
                  View Day
                  <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            );
          })}
        </section>
      </div>

      <EditSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={updateItem}
      />
    </div>
  );
}
