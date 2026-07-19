import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Check } from 'lucide-react';

export default function FocusTimer({ isOpen, onClose, task, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins default
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const intervalRef = useRef(null);

  const durations = [
    { label: '15m', value: 15 },
    { label: '25m', value: 25 },
    { label: '45m', value: 45 },
    { label: '60m', value: 60 },
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play a notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleW5...');
        audio.play().catch(() => {});
      } catch {}
      // Show a browser notification
      if (Notification.permission === 'granted') {
        new Notification('Focus Session Complete! 🎉', {
          body: task ? `Great job on "${task.title}"!` : 'Time to take a break.',
        });
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, task]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(selectedDuration * 60);
      setIsRunning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = selectedDuration * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 120;

  const handleDurationChange = (val) => {
    setSelectedDuration(val);
    setTimeLeft(val * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleComplete = () => {
    if (task && onComplete) {
      onComplete(task.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg text-on-surface font-semibold">Focus Timer</h2>
            {task && <p className="font-body text-sm text-secondary truncate mt-0.5">{task.title}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="p-8 flex flex-col items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 260 260">
              <circle className="text-surface-container-highest stroke-current" cx="130" cy="130" fill="transparent" r="120" strokeWidth="6"></circle>
              <circle 
                className="text-primary stroke-current transition-all duration-1000 ease-linear" 
                cx="130" cy="130" fill="transparent" r="120" 
                strokeDasharray={circumference} 
                strokeDashoffset={circumference - (circumference * progress) / 100} 
                strokeLinecap="round" 
                strokeWidth="6"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-6xl font-bold text-on-surface tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="font-label text-[11px] text-secondary uppercase tracking-wider mt-1">
                {timeLeft === 0 ? 'Complete!' : isRunning ? 'Focusing...' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Duration Presets */}
          {!isRunning && timeLeft === selectedDuration * 60 && (
            <div className="flex gap-2">
              {durations.map(d => (
                <button
                  key={d.value}
                  onClick={() => handleDurationChange(d.value)}
                  className={`px-4 py-1.5 rounded-full font-label text-[13px] border transition-colors ${
                    selectedDuration === d.value 
                      ? 'bg-primary-container text-on-primary-container border-primary/20 font-bold' 
                      : 'border-outline-variant text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {timeLeft === 0 ? (
              <button
                onClick={handleComplete}
                className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Check className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
            )}

            <div className="w-12 h-12" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>
    </div>
  );
}
