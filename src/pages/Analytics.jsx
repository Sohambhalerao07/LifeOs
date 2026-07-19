import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, Flag, Zap, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { generateWeekDays } from '../utils/dateUtils';
import { clsx } from 'clsx';

export default function Analytics() {
  const { data: tasks, loading: tasksLoading } = useApi('tasks');
  const { data: habits, loading: habitsLoading } = useApi('habits');
  const { data: habitLogs, loading: logsLoading } = useApi('habitLogs');
  const [weekOffset, setWeekOffset] = useState(0);
  
  if (tasksLoading || habitsLoading || logsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const completedTasks = tasks?.filter(t => t.completed) || [];
  const totalTasks = tasks?.length || 0;
  
  // Calculate Task Categories Breakdown
  const categories = {};
  tasks?.forEach(t => {
    if (!categories[t.category]) categories[t.category] = 0;
    categories[t.category]++;
  });
  const getCatPercent = (cat) => totalTasks ? Math.round(((categories[cat] || 0) / totalTasks) * 100) : 0;
  
  // Calculate Habit Stats
  const activeHabitsCount = habits?.length || 0;
  const thisWeekLogs = habitLogs?.filter(log => {
    // Basic check if log is within last 7 days
    const logDate = new Date(log.date);
    const today = new Date();
    const diffTime = Math.abs(today - logDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }) || [];
  
  const totalHabitPossible = activeHabitsCount * 7;
  const habitScore = totalHabitPossible ? (thisWeekLogs.length / totalHabitPossible) : 0;
  
  const taskScore = totalTasks ? (completedTasks.length / totalTasks) : 0;
  
  // Combined Score
  const score = Math.round(((taskScore + habitScore) / (activeHabitsCount > 0 ? 2 : 1)) * 100) || 0;

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const days = generateWeekDays(baseDate);
  
  const getDailyScore = (dateStr) => {
    // Tasks for this date
    const dayTasks = tasks?.filter(t => t.date === dateStr) || [];
    const completedDayTasks = dayTasks.filter(t => t.completed);
    const dayTaskScore = dayTasks.length ? (completedDayTasks.length / dayTasks.length) : (completedDayTasks.length > 0 ? 1 : 0);

    // Habits for this date
    const dayHabitLogs = habitLogs?.filter(log => log.date === dateStr) || [];
    const dayHabitScore = activeHabitsCount ? (dayHabitLogs.length / activeHabitsCount) : 0;

    if (dayTasks.length === 0 && activeHabitsCount === 0) return 0;
    
    return Math.round(((dayTaskScore + dayHabitScore) / (activeHabitsCount > 0 ? 2 : 1)) * 100) || 0;
  };

  return (
    <div className="flex-1 p-6 lg:p-12 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="font-display text-4xl text-on-surface font-semibold">Performance Overview</h2>
          <p className="font-body text-base text-secondary mt-2">Your productivity metrics based on actual data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label text-[13px] text-secondary">Tasks Completed</span>
            <CheckCircle2 className="w-6 h-6 text-outline" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl text-on-surface">{completedTasks.length}</span>
            <span className="font-label text-[11px] text-primary mb-2 flex items-center">
              Total {totalTasks}
            </span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label text-[13px] text-secondary">Habits Logged</span>
            <RefreshCw className="w-6 h-6 text-outline" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl text-on-surface">{habitLogs?.length || 0}</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label text-[13px] text-secondary">Active Habits</span>
            <Flag className="w-6 h-6 text-outline" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl text-on-surface">{activeHabitsCount}</span>
          </div>
        </div>
        
        <div className="bg-surface-tint rounded-xl p-6 flex flex-col justify-between h-[140px] text-on-primary">
          <div className="flex justify-between items-start">
            <span className="font-label text-[13px] text-primary-fixed-dim">Productivity Score</span>
            <Zap className="w-6 h-6 text-primary-fixed-dim" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl">{score}%</span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl text-on-surface font-medium">Weekly Performance</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {days.map((day) => {
            const dayScore = getDailyScore(day.fullDate);
            
            return (
              <div key={day.fullDate} className={clsx(
                "bg-surface-container-lowest border rounded-xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer group shadow-sm relative",
                day.active ? "border-primary" : "border-outline-variant hover:border-primary",
                day.opacityClass
              )}>
                {day.active && <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-surface-container-lowest"></div>}
                <p className={clsx("font-label text-sm", day.active ? "text-primary font-bold" : "text-secondary")}>{day.day}</p>
                
                <div className="relative w-16 h-16 flex items-center justify-center my-2">
                  <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
                    <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                    <circle className={clsx("stroke-current", dayScore > 0 ? "text-primary" : "text-outline-variant")} cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (251.2 * dayScore) / 100}`} strokeLinecap="round" strokeWidth="8"></circle>
                  </svg>
                  {dayScore === 100 ? (
                    <Check className="absolute text-primary w-6 h-6" />
                  ) : dayScore > 0 ? (
                    <span className="absolute font-label text-sm text-on-surface font-semibold">{dayScore}%</span>
                  ) : (
                    <span className="absolute font-label text-sm text-outline-variant">--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="font-display text-2xl text-on-surface mb-6 font-medium">Task Categories</h3>
          <div className="flex flex-col gap-4">
            {Object.keys(categories).map(cat => {
              const percent = getCatPercent(cat);
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body text-base text-on-surface flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary block"></span> {cat}
                    </span>
                    <span className="font-label text-[13px] text-secondary">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{width: `${percent}%`}}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(categories).length === 0 && (
              <p className="text-secondary text-sm">No tasks added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
