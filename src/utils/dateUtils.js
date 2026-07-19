/**
 * Utility functions for generating dynamic dates across the application.
 */

// Get today's date formatted like "Tuesday, Oct 24"
export function getTodayFormatted() {
  const today = new Date();
  return today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Get the ISO week number of the year (1-53)
export function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

// Get the date of the Monday for the current week
export function getStartOfWeek(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(current.setDate(diff));
}

// Get a formatted range like "Oct 23 - 29, 2023"
export function getCurrentWeekRange(baseDate = new Date()) {
  const start = getStartOfWeek(baseDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

// Generate the array of days for the Weekly Planner
export function generateWeekDays(baseDate = new Date()) {
  const start = getStartOfWeek(baseDate);
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDaysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    current.setHours(0, 0, 0, 0);

    const isToday = current.getTime() === today.getTime();
    const isPast = current.getTime() < today.getTime();

    // Format as YYYY-MM-DD in local time
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;

    days.push({
      day: weekDaysLabels[i],
      date: current.getDate().toString(),
      progress: isPast ? 'Completed' : isToday ? 'In Progress' : 'Planned',
      percent: isPast ? '100%' : isToday ? '50%' : '0%',
      active: isToday,
      opacityClass: isPast ? 'opacity-60' : 'opacity-100',
      isWeekend: i >= 5,
      fullDate
    });
  }

  return days;
}

// Array of abbreviated days for simple headers (e.g., M, T, W, T, F, S, S)
export function getShortWeekDays() {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}

// Calculate the overall streak based on habit logs
export function calculateOverallStreak(habitLogs = []) {
  if (!habitLogs || habitLogs.length === 0) return 0;
  
  const uniqueLogDates = [...new Set(habitLogs.map(log => log.date))].sort((a, b) => new Date(b) - new Date(a));
  if (uniqueLogDates.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date();
  
  const getLocalISOString = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  let dateStr = getLocalISOString(checkDate);
  
  if (!uniqueLogDates.includes(dateStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = getLocalISOString(checkDate);
  }
  
  while (uniqueLogDates.includes(dateStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = getLocalISOString(checkDate);
  }
  
  return streak;
}
