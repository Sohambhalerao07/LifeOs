import React, { useState } from 'react';
import { Filter, Check, Clock, Edit3, Trash2, RefreshCw, ChevronDown, Plus, Loader2, ChevronLeft, ChevronRight, Play, List, CalendarDays } from 'lucide-react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import EditTaskModal from '../components/EditTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import FocusTimer from '../components/FocusTimer';
import TimeBlockView from '../components/TimeBlockView';

export default function DailyPlanner() {
  const { openAddModal } = useOutletContext();
  const { data: tasks, loading, updateItem, deleteItem } = useApi('tasks');
  const { data: stats } = useApi('stats');
  const { data: settings } = useApi('settings');
  const [searchParams] = useSearchParams();
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterPriority, setFilterPriority] = useState(false);
  const [taskToDetail, setTaskToDetail] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const navigate = useNavigate();

  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  // Format the selected date for display (e.g. "Tuesday, Oct 24")
  const parsedDate = new Date(selectedDate);
  const displayDate = new Date(parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const navigateDays = (direction) => {
    const newDate = new Date(parsedDate);
    newDate.setDate(newDate.getDate() + direction);
    // Format YYYY-MM-DD local time
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    navigate(`?date=${year}-${month}-${day}`);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  let dateTasks = tasks?.filter(t => t.date === selectedDate || (!t.date && selectedDate === new Date().toISOString().split('T')[0])) || [];
  if (filterPriority) {
    dateTasks = dateTasks.filter(t => t.priority === 'High Priority');
  }
  const remainingTasks = dateTasks.filter(t => !t.completed);
  const completedTasks = dateTasks.filter(t => t.completed);
  const totalTasks = dateTasks.length;
  const score = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const handleToggle = (id, currentStatus) => {
    updateItem(id, { completed: !currentStatus });
  };

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full relative">
      <div className="max-w-3xl mx-auto space-y-8 pb-32">
        {/* Top Section: Progress & Date */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex-1 w-full space-y-2 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateDays(-1)} className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-secondary">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display text-4xl text-on-surface font-semibold">{displayDate}</h1>
              <button onClick={() => navigateDays(1)} className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-secondary">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <p className="font-body text-lg text-on-surface-variant">{settings?.affirmation || "You're making great progress today."}</p>
            
            <div className="flex gap-4 pt-4">
              <div className="flex flex-col">
                <span className="font-display text-2xl text-primary font-medium">{completedTasks.length}</span>
                <span className="font-label text-[13px] text-secondary uppercase tracking-wider">Completed</span>
              </div>
              <div className="w-px bg-outline-variant my-1"></div>
              <div className="flex flex-col">
                <span className="font-display text-2xl text-on-surface font-medium">{remainingTasks.length}</span>
                <span className="font-label text-[13px] text-secondary uppercase tracking-wider">Remaining</span>
              </div>
            </div>
          </div>

          <div className="relative w-32 h-32 flex-shrink-0 z-10 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
              <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
              <circle className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (251.2 * score) / 100}`} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-display text-2xl text-on-surface font-medium">{score}%</span>
            </div>
          </div>
        </section>

        {/* Task List / Timeline Toggle */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-label text-[13px] text-secondary uppercase tracking-wider">Remaining Tasks</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'}`}
                  title="Timeline View"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setFilterPriority(!filterPriority)}
                className={filterPriority ? "text-primary" : "text-secondary hover:text-primary transition-colors"}
                title="Toggle High Priority Filter"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {viewMode === 'timeline' ? (
            <TimeBlockView tasks={dateTasks} onToggle={handleToggle} />
          ) : (
            <>
          
          <div className="space-y-2">
            {remainingTasks.map(task => (
              <div key={task.id} className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'High Priority' ? 'bg-error' : task.priority === 'Medium' ? 'bg-tertiary-fixed-dim' : 'bg-primary'}`}></div>
                
                <label className="flex items-center cursor-pointer relative z-10">
                  <input 
                    className="peer sr-only" 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => handleToggle(task.id, task.completed)}
                  />
                  <div className="w-5 h-5 border-2 border-outline rounded-sm peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                    <Check className="text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </label>
                
                <div className="flex-1 flex flex-col gap-1 min-w-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 
                      onClick={() => setTaskToDetail(task)}
                      className="font-body text-lg text-on-surface truncate group-hover:text-primary transition-colors cursor-pointer hover:underline"
                    >
                      {task.title}
                    </h3>
                    {task.recurring && <RefreshCw className="text-secondary w-4 h-4" title="Recurring Task" />}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
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
                    {(task.duration || task.time) && (
                      <div className="flex items-center gap-1 text-secondary font-label text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> {task.duration || task.time}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                  <button 
                    onClick={() => setFocusTask(task)}
                    className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all"
                    title="Start Focus Timer"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setTaskToEdit(task)}
                    className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteItem(task.id)}
                    className="p-2 text-secondary hover:text-error hover:bg-error-container rounded-full transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {remainingTasks.length === 0 && (
              <p className="text-secondary text-sm text-center py-4">All caught up for today!</p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-8 mb-2 pt-4 border-t border-outline-variant">
            <h2 className="font-label text-[13px] text-secondary uppercase tracking-wider">Completed ({completedTasks.length})</h2>
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-secondary hover:text-primary transition-colors font-label text-[11px] flex items-center gap-1"
            >
              {showCompleted ? 'Hide' : 'Show'} <ChevronDown className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4 opacity-75 hover:opacity-100 transition-opacity relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-variant"></div>
                  
                  <label className="flex items-center cursor-pointer relative z-10">
                    <input 
                      className="peer sr-only" 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleToggle(task.id, task.completed)}
                    />
                    <div className="w-5 h-5 border-2 border-primary rounded-sm bg-primary flex items-center justify-center transition-all">
                      <Check className="text-white w-3.5 h-3.5" />
                    </div>
                  </label>
                  
                  <div className="flex-1 flex flex-col gap-1 min-w-0 z-10">
                    <h3 className="font-body text-lg text-on-surface-variant truncate line-through">{task.title}</h3>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                    <button 
                      onClick={() => deleteItem(task.id)}
                      className="p-2 text-secondary hover:text-error hover:bg-error-container rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </section>
      </div>

      {/* Floating Action Button (Mobile Overlay) */}
      <button 
        onClick={openAddModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <EditTaskModal 
        isOpen={!!taskToEdit} 
        onClose={() => setTaskToEdit(null)}
        task={taskToEdit}
        onSave={(id, updates) => updateItem(id, updates)}
      />

      <TaskDetailModal
        isOpen={!!taskToDetail}
        onClose={() => setTaskToDetail(null)}
        task={taskToDetail}
        onSave={(id, updates) => updateItem(id, updates)}
      />

      <FocusTimer
        isOpen={!!focusTask}
        onClose={() => setFocusTask(null)}
        task={focusTask}
        onComplete={(id) => updateItem(id, { completed: true })}
      />
    </div>
  );
}
