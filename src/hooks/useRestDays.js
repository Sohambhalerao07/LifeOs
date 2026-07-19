import { useState } from 'react';

export function useRestDays() {
  const [restDays, setRestDays] = useState(() => {
    try {
      const stored = localStorage.getItem('restDays');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleRestDay = (dateStr) => {
    setRestDays(prev => {
      const newRestDays = prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr];
      localStorage.setItem('restDays', JSON.stringify(newRestDays));
      return newRestDays;
    });
  };

  return { restDays, toggleRestDay };
}
