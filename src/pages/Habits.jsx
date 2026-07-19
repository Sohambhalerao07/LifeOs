import React, { useState } from 'react';
import { PieChart, Flame, Trophy, Droplets, Dumbbell, Flower2, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useApi } from '../hooks/useApi';
import { generateWeekDays } from '../utils/dateUtils';

const iconMap = {
  Droplets: Droplets,
  Dumbbell: Dumbbell,
  Flower2: Flower2,
};

export default function Habits() {
  const { data: habits, loading: habitsLoading } = useApi('habits');
  const { data: habitLogs, loading: logsLoading, addItem, deleteItem } = useApi('habitLogs');
  const [weekOffset, setWeekOffset] = useState(0);
  
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const days = generateWeekDays(baseDate);

  if (habitsLoading || logsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const safeHabits = habits || [];
  const safeLogs = habitLogs || [];

  const handleToggleHabit = async (habitId, dateStr) => {
    // Check if it exists
    const existingLog = safeLogs.find(log => log.habitid === habitId && log.date === dateStr);
    if (existingLog) {
      await deleteItem(existingLog.id);
    } else {
      await addItem({ habitid: habitId, date: dateStr });
    }
  };

  const getCompletionsForWeek = (habitId) => {
    const weekDates = days.map(d => d.fullDate);
    return safeLogs.filter(log => log.habitid === habitId && weekDates.includes(log.date)).length;
  };

  const getIndividualStreak = (habitId) => {
    const hLogs = safeLogs.filter(log => log.habitid === habitId).map(log => log.date).sort((a, b) => new Date(b) - new Date(a));
    if (hLogs.length === 0) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    const getLocalISOString = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    let dateStr = getLocalISOString(checkDate);
    
    if (!hLogs.includes(dateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = getLocalISOString(checkDate);
    }
    
    while (hLogs.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = getLocalISOString(checkDate);
    }
    return streak;
  };

  // Compute dynamic stats
  const weekDates = days.map(d => d.fullDate);
  const weekLogsCount = safeLogs.filter(log => weekDates.includes(log.date)).length;
  const totalPossible = safeHabits.length * 7;
  const completionRate = totalPossible > 0 ? Math.round((weekLogsCount / totalPossible) * 100) : 0;

  const uniqueLogDates = [...new Set(safeLogs.map(log => log.date))].sort((a, b) => new Date(b) - new Date(a));
  
  let currentStreak = 0;
  let longestStreak = 0;
  
  if (uniqueLogDates.length > 0) {
    let checkDate = new Date();
    
    // Offset by timezone to get local date string properly
    const getLocalISOString = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    let dateStr = getLocalISOString(checkDate);
    
    // If today is not logged, check yesterday
    if (!uniqueLogDates.includes(dateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = getLocalISOString(checkDate);
    }
    
    while (uniqueLogDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = getLocalISOString(checkDate);
    }

    const sortedDatesAsc = [...uniqueLogDates].reverse();
    let currentCount = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDatesAsc.length; i++) {
      const prevDate = new Date(sortedDatesAsc[i-1]);
      const currDate = new Date(sortedDatesAsc[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentCount++;
        if (currentCount > longestStreak) longestStreak = currentCount;
      } else {
        currentCount = 1;
      }
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-[1200px] mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-on-surface mb-2 font-semibold">Habits</h1>
        <p className="text-on-surface-variant font-body text-base">Track your daily routines and build lasting momentum.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between hover:bg-surface transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label text-[13px] text-secondary">Completion Rate</span>
            <PieChart className="w-6 h-6 text-primary-container" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl text-on-surface font-semibold">{completionRate}%</span>
            <span className="font-body text-sm text-on-surface-variant">this week</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between hover:bg-surface transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label text-[13px] text-secondary">Current Streak</span>
            <Flame className="w-6 h-6 text-primary-container fill-primary-container" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl text-on-surface font-semibold">{currentStreak}</span>
            <span className="font-body text-sm text-on-surface-variant">days</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between hover:bg-surface transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label text-[13px] text-secondary">Longest Streak</span>
            <Trophy className="w-6 h-6 text-primary-container" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl text-on-surface font-semibold">{longestStreak}</span>
            <span className="font-body text-sm text-on-surface-variant">days</span>
          </div>
        </div>
      </div>

      {/* Split Layout: Habit Cards & Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Habit Cards List */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="font-display text-2xl text-on-surface mb-2 font-medium">Daily Goals</h2>
          
          {safeHabits.map(habit => {
            const Icon = iconMap[habit.icon] || Droplets;
            const weekCompletions = getCompletionsForWeek(habit.id);
            const percent = Math.round((weekCompletions / 7) * 100);
            const streak = getIndividualStreak(habit.id);
            
            const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const isCompletedToday = safeLogs.some(log => log.habitid === habit.id && log.date === todayStr);

            return (
              <div key={habit.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group hover:border-primary-fixed-dim transition-colors">
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer relative z-10 mr-2">
                    <input 
                      className="peer sr-only" 
                      type="checkbox" 
                      checked={isCompletedToday}
                      onChange={() => handleToggleHabit(habit.id, todayStr)}
                    />
                    <div className="w-6 h-6 border-2 border-outline-variant rounded peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                      <Check className="text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </label>
                  
                  <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", isCompletedToday ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-body text-lg text-on-surface font-medium">{habit.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="font-label text-[11px] text-secondary">Streak</span>
                    <span className="font-body text-sm font-medium">{streak}d</span>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between font-label text-[11px] text-secondary mb-1">
                      <span>W</span>
                      <span>{weekCompletions}/7</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {safeHabits.length === 0 && (
            <p className="text-secondary text-sm">No habits added yet. Click Quick Add to create one!</p>
          )}
        </div>

        {/* Weekly Grid */}
        <div className="lg:w-80 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-on-surface font-medium">Weekly Overview</h2>
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
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[240px]">
              <thead>
                <tr>
                  <th className="font-label text-[11px] text-secondary pb-2 font-normal"></th>
                  {days.map((dayObj, i) => (
                    <th key={i} className={clsx("font-label text-[11px] pb-2 font-normal text-center", dayObj.active ? 'text-primary font-bold' : 'text-secondary')}>
                      {dayObj.day.charAt(0)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeHabits.map(habit => {
                  const Icon = iconMap[habit.icon] || Droplets;
                  return (
                    <tr key={habit.id} className="border-t border-surface-container-highest">
                      <td className="py-2 pr-2">
                        <Icon className="w-[18px] h-[18px] text-on-surface-variant" />
                      </td>
                      {days.map(dayObj => {
                        const isCompleted = safeLogs.some(log => log.habitid === habit.id && log.date === dayObj.fullDate);
                        return (
                          <td key={dayObj.fullDate} className="py-2 text-center">
                            <button 
                              onClick={() => handleToggleHabit(habit.id, dayObj.fullDate)}
                              className={clsx(
                                "w-5 h-5 mx-auto rounded-sm flex items-center justify-center transition-colors border",
                                isCompleted ? "bg-primary border-primary" : "border-outline-variant hover:border-primary/50"
                              )}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5 text-on-primary" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
