import React, { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight, CheckCircle2, Check, Clock, Calendar as CalendarIcon, Edit3, Loader2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getCurrentWeekNumber, generateWeekDays, calculateOverallStreak } from '../utils/dateUtils';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { data: settings } = useApi('settings');
  const { data: tasks, loading: tasksLoading, updateItem: updateTask } = useApi('tasks');
  const { data: activityFeed, loading: activityLoading } = useApi('activityFeed');
  const { data: habits } = useApi('habits');
  const { data: habitLogs } = useApi('habitLogs');

  const [weekOffset, setWeekOffset] = useState(0);
  const navigate = useNavigate();

  if (tasksLoading || activityLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks?.filter(t => !t.completed && t.time && t.date === todayStr) || [];
  const completedTasks = tasks?.filter(t => t.completed) || [];
  const totalTasks = tasks?.length || 0;
  
  const totalHabits = habits?.length || 0;
  const habitsCompleted = habitLogs?.filter(log => log.date === new Date().toISOString().split('T')[0])?.length || 0;

  // Calculate dynamic streak based on logs
  const streak = calculateOverallStreak(habitLogs);
  const score = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const days = generateWeekDays(baseDate).slice(0, 4); // First 4 days for dashboard

  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-8">
      {/* Hero Section / Weekly Summary */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-center">
        {/* Background decorative element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div className="flex flex-col gap-4 z-10 w-full md:w-1/2">
          <div>
            <span className="font-label text-xs text-primary bg-primary-container/20 px-2 py-1 rounded-full inline-block mb-2">Week {getCurrentWeekNumber()}</span>
            <h2 className="font-display text-4xl font-semibold text-on-surface">Hi, {settings?.name ? settings.name.split(' ')[0] : 'there'}! 👋</h2>
            <p className="font-body text-lg text-secondary mt-1">You're making solid progress this week.</p>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="bg-surface p-2 rounded-lg border border-outline-variant flex-1">
              <p className="font-label text-[11px] text-secondary uppercase tracking-wider">Tasks</p>
              <p className="font-display text-2xl text-on-surface font-semibold">{completedTasks.length}<span className="text-sm text-secondary font-normal">/{totalTasks}</span></p>
            </div>
            <div className="bg-surface p-2 rounded-lg border border-outline-variant flex-1">
              <p className="font-label text-[11px] text-secondary uppercase tracking-wider">Habits</p>
              <p className="font-display text-2xl text-on-surface font-semibold">{habitsCompleted}<span className="text-sm text-secondary font-normal">/{totalHabits}</span></p>
            </div>
            <div className="bg-surface p-2 rounded-lg border border-outline-variant flex-1">
              <p className="font-label text-[11px] text-secondary uppercase tracking-wider">Streak</p>
              <p className="font-display text-2xl text-primary font-semibold flex items-center gap-1">
                {streak} <Flame className="w-4 h-4 fill-primary" />
              </p>
            </div>
          </div>
        </div>

        <div className="z-10 flex flex-col items-center justify-center gap-4 bg-surface p-6 rounded-xl border border-outline-variant w-full md:w-auto min-w-[280px]">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
              <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
              <circle className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (251.2 * score) / 100}`} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-on-surface">{score}%</span>
              <span className="font-label text-xs text-secondary">Score</span>
            </div>
          </div>
          <div className="w-full flex justify-between text-sm font-body border-t border-outline-variant pt-2 mt-2">
            <div className="text-center">
              <p className="text-secondary text-xs">Goal</p>
              <p className="text-on-surface font-medium truncate w-24" title={settings?.weeklygoal}>{settings?.weeklygoal || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-secondary text-xs">Reward</p>
              <p className="text-on-surface font-medium truncate w-24" title={settings?.reward}>{settings?.reward || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Grid: Days */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-2xl font-medium text-on-surface">This Week</h3>
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {days.map((day) => {
              const dayTasks = tasks?.filter(t => t.date === day.fullDate) || [];
              const completedDayTasks = dayTasks.filter(t => t.completed).length;
              const totalDayTasks = dayTasks.length;
              
              const dayLogs = habitLogs?.filter(log => log.date === day.fullDate) || [];
              const completedDayHabits = dayLogs.length;
              const totalActiveHabits = habits?.length || 0;

              const taskScore = totalDayTasks ? (completedDayTasks / totalDayTasks) : (completedDayTasks > 0 ? 1 : 0);
              const habitScore = totalActiveHabits ? (completedDayHabits / totalActiveHabits) : 0;
              let dayScore = 0;
              if (totalDayTasks > 0 || totalActiveHabits > 0) {
                dayScore = Math.round(((taskScore + habitScore) / (totalActiveHabits > 0 ? 2 : 1)) * 100) || 0;
              }
              
              return (
                <div 
                  key={day.fullDate} 
                  onClick={() => navigate(`/daily?date=${day.fullDate}`)}
                  className={clsx(
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
                  <div className="flex w-full justify-between font-label text-[11px] text-secondary">
                    <span>{totalDayTasks > 0 ? `${completedDayTasks}/${totalDayTasks} T` : "0/0 T"}</span>
                    <span>{totalActiveHabits > 0 ? `${completedDayHabits}/${totalActiveHabits} H` : "0/0 H"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sidebar (Upcoming & Activity) */}
        <aside className="flex flex-col gap-8">
          {/* Upcoming Tasks */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-body text-base font-semibold text-on-surface">Up Next</h3>
              <button 
                onClick={() => navigate('/daily')}
                className="text-primary font-label text-[11px] hover:underline"
              >
                View All
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {upcomingTasks.map(task => (
                <li key={task.id} className="flex items-start gap-2 p-2 hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer">
                  <label className="flex items-center cursor-pointer relative z-10 mt-0.5">
                    <input 
                      className="peer sr-only" 
                      type="checkbox" 
                      checked={task.completed || false}
                      onChange={() => updateTask(task.id, { completed: !task.completed })}
                    />
                    <div className="w-5 h-5 border border-outline-variant rounded peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all group-hover:border-primary">
                      <Check className="text-white w-3 h-3 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </label>
                  <div className="flex-1">
                    <p className="font-body text-sm text-on-surface line-clamp-1">{task.title}</p>
                    <p className="font-label text-[11px] text-secondary mt-0.5 flex items-center gap-1">
                      {task.time?.includes('Tomorrow') ? <CalendarIcon className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {task.time}
                    </p>
                  </div>
                </li>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-secondary py-2 text-center">No upcoming tasks.</p>
              )}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2">
            <h3 className="font-body text-base font-semibold text-on-surface mb-1">Activity Feed</h3>
            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-2.5 before:w-px before:bg-outline-variant before:z-0">
              {activityFeed?.map(activity => (
                <div key={activity.id} className="flex gap-2 relative z-10">
                  <div className="w-5 h-5 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activity.type.includes('completed') ? (
                      <CheckCircle2 className="w-3 h-3 text-primary fill-primary" />
                    ) : (
                      <Edit3 className="w-3 h-3 text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-body text-sm text-on-surface">{activity.text} <span className="font-medium">{activity.highlight}</span></p>
                    <p className="font-label text-[11px] text-secondary">{activity.time}</p>
                  </div>
                </div>
              ))}
              {!activityFeed?.length && (
                 <p className="text-sm text-secondary z-10 bg-surface">No recent activity.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
