
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TaskMap } from '../types';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  tasksMap: TaskMap;
}

type ViewMode = 'days' | 'months' | 'years';

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, tasksMap }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const [history, setHistory] = useState<string[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Track the date currently being viewed in the calendar UI
  const [browsingDate, setBrowsingDate] = useState(new Date(selectedDate));
  
  // Swipe gesture tracking
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === todayStr;

  // Track history when selectedDate changes
  useEffect(() => {
    setHistory(prev => {
      if (prev[0] === selectedDate) return prev;
      return [selectedDate, ...prev].slice(0, 2);
    });
    setBrowsingDate(new Date(selectedDate));
  }, [selectedDate]);

  // Handle outside click to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Reset view mode when closing
      if (!isCalendarOpen) setViewMode('days');
    };
  }, [isCalendarOpen]);

  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(browsingDate);
    next.setMonth(next.getMonth() + offset);
    setBrowsingDate(next);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const jumpToRelative = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
    setIsCalendarOpen(false);
  };

  // Swipe detection handlers
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) changeMonth(1); // Swipe left
    if (distance < -50) changeMonth(-1); // Swipe right
    setTouchStart(null);
    setTouchEnd(null);
  };

  const renderDaysView = () => {
    const year = browsingDate.getFullYear();
    const month = browsingDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = currentDayStr === selectedDate;
      const isTodayInCal = currentDayStr === todayStr;
      const dayTasks = tasksMap[currentDayStr] || [];
      const hasTasks = dayTasks.length > 0;
      const isAllDone = hasTasks && dayTasks.every(t => t.completed);

      days.push(
        <button
          key={d}
          onClick={() => {
            onDateChange(currentDayStr);
            setIsCalendarOpen(false);
          }}
          className={`h-10 w-10 flex flex-col items-center justify-center rounded-2xl relative transition-all text-sm font-bold
            ${isSelected ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-100 z-10' : 'hover:bg-amber-100 text-stone-700'}
            ${isTodayInCal && !isSelected ? 'text-amber-600 ring-2 ring-amber-200' : ''}`}
        >
          {isSelected && <span className="absolute -top-1 -right-1 text-[10px] animate-bounce">🍊</span>}
          {d}
          {hasTasks && (
            <div className="absolute bottom-1 flex items-center justify-center">
              {isAllDone ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={isSelected ? 'text-white' : 'text-emerald-500'}>
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-400'}`}></div>
              )}
            </div>
          )}
        </button>
      );
    }
    return (
      <div 
        className="calendar-grid"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="h-10 flex items-center justify-center text-[11px] font-black text-stone-400 uppercase">
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderMonthsView = () => {
    return (
      <div className="grid grid-cols-3 gap-3 p-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const isSelected = browsingDate.getMonth() === i;
          return (
            <button
              key={i}
              onClick={() => {
                const next = new Date(browsingDate);
                next.setMonth(i);
                setBrowsingDate(next);
                setViewMode('days');
              }}
              className={`py-4 rounded-2xl text-sm font-black transition-all ${isSelected ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50/50 text-stone-600 hover:bg-amber-100'}`}
            >
              {i + 1}月
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearsView = () => {
    const currentYear = browsingDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    return (
      <div className="grid grid-cols-3 gap-3 p-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const year = startYear - 1 + i;
          const isSelected = browsingDate.getFullYear() === year;
          const isMainRange = year >= startYear && year < startYear + 10;
          return (
            <button
              key={year}
              onClick={() => {
                const next = new Date(browsingDate);
                next.setFullYear(year);
                setBrowsingDate(next);
                setViewMode('months');
              }}
              className={`py-4 rounded-2xl text-sm font-black transition-all ${isSelected ? 'bg-amber-500 text-white shadow-md' : isMainRange ? 'bg-amber-50/50 text-stone-600 hover:bg-amber-100' : 'bg-stone-50 text-stone-300 hover:bg-stone-100'}`}
            >
              {year}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 flex flex-col items-center gap-2 relative z-[300]">
      <div className="grid grid-cols-[80px_1fr_80px] items-center w-full bg-white/60 backdrop-blur-md px-4 py-4 rounded-[2.5rem] border border-amber-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-start">
          <button 
            onClick={() => changeDay(-1)}
            className="p-3 hover:bg-amber-100 rounded-full transition-all text-amber-800 hover:scale-110 active:scale-90"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <button 
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="flex flex-col items-center gap-1 group px-8 py-2 rounded-3xl transition-all hover:bg-amber-50/80 active:scale-95 mx-auto"
        >
          <span className={`text-2xl font-black tracking-tight transition-colors ${isToday ? 'text-amber-900 underline decoration-amber-300 decoration-4 underline-offset-8' : 'text-stone-700'}`}>
            {formatDisplayDate(selectedDate)}
          </span>
          <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">点击展开日历</span>
          </div>
        </button>

        <div className="flex justify-end">
          <button 
            onClick={() => changeDay(1)}
            className="p-3 hover:bg-amber-100 rounded-full transition-all text-amber-800 hover:scale-110 active:scale-90"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {isCalendarOpen && (
        <div 
          ref={calendarRef}
          className="absolute top-24 left-1/2 -translate-x-1/2 bg-white border border-amber-200 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.4)] rounded-[3rem] p-8 w-[380px] fade-in-scale origin-top z-[400]"
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start px-2">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 text-stone-900 font-black">
                  <button 
                    onClick={() => setViewMode('years')}
                    className="text-xl hover:text-amber-500 transition-colors"
                  >
                    {browsingDate.getFullYear()}年
                  </button>
                  <button 
                    onClick={() => setViewMode('months')}
                    className="text-xl hover:text-amber-500 transition-colors"
                  >
                    {browsingDate.getMonth() + 1}月
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] text-emerald-700 font-black uppercase">圆满</span>
                  </div>
                </div>
              </div>
              
              {/* History Footprints */}
              <div className="flex gap-2">
                {history.map((date, idx) => (
                  <button
                    key={`${date}-${idx}`}
                    onClick={() => onDateChange(date)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all border border-amber-100"
                    title={`回到: ${date}`}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 11V5.25c0-.414-.336-.75-.75-.75h-4.5a.75.75 0 00-.75.75V11z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="min-h-[240px]">
              {viewMode === 'days' && renderDaysView()}
              {viewMode === 'months' && renderMonthsView()}
              {viewMode === 'years' && renderYearsView()}
            </div>

            <div className="flex flex-col gap-4 pt-2 border-t border-stone-100">
              <div className="flex gap-2">
                <button 
                  onClick={() => jumpToRelative(-1)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl transition-all active:scale-95 text-xs"
                >
                  昨天
                </button>
                <button 
                  onClick={() => { onDateChange(todayStr); setIsCalendarOpen(false); }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-200 text-xs"
                >
                  今天
                </button>
                <button 
                  onClick={() => jumpToRelative(1)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl transition-all active:scale-95 text-xs"
                >
                  明天
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateNavigator;
