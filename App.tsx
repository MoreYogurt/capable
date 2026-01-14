import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskMap, QuadrantType, StreakInfo, ViewMode } from './types';
import { QUADRANTS, ZEN_QUOTES, CAPY_CAPTIONS } from './constants';
import Quadrant from './components/Quadrant';
import FocusList from './components/FocusList';
import Capybara from './components/Capybara';
import DateNavigator from './components/DateNavigator';

const STORAGE_KEYS = {
  TASKS_MAP: 'capable_tasks_map',
  STREAK: 'capable_streak',
  MUTED: 'capable_muted',
  VIEW_MODE: 'capable_view_mode',
};

const SFX_URLS = {
  CHECK: 'https://oss-pai-sgvys5h6jxh6a4o68m-cn-shanghai.oss-cn-shanghai.aliyuncs.com/res/pop.mp3?Expires=1767946299&OSSAccessKeyId=TMP.3KmaTV1bA4puo9CeN9qkgdn4hmw9Vk5LzoRwHjaj49Vso4EYLAiXCof65DwKjHQQk3AiWHj8Z18YeeXZLvBmWHvXRDpRMZ&Signature=rIeCODfGTgDsI94vMDP22w5%2B7KU%3D',
  WASH: 'https://oss-pai-sgvys5h6jxh6a4o68m-cn-shanghai.oss-cn-shanghai.aliyuncs.com/res/swoosh.mp3?Expires=1767946395&OSSAccessKeyId=TMP.3KmaTV1bA4puo9CeN9qkgdn4hmw9Vk5LzoRwHjaj49Vso4EYLAiXCof65DwKjHQQk3AiWHj8Z18YeeXZLvBmWHvXRDpRMZ&Signature=y1kuFOAC1pP6FCsGGNW0%2F6BrAJI%3D',
  BG_MUSIC: 'https://oss-pai-sgvys5h6jxh6a4o68m-cn-shanghai.oss-cn-shanghai.aliyuncs.com/res/bg.mp3?Expires=1767946425&OSSAccessKeyId=TMP.3KmaTV1bA4puo9CeN9qkgdn4hmw9Vk5LzoRwHjaj49Vso4EYLAiXCof65DwKjHQQk3AiWHj8Z18YeeXZLvBmWHvXRDpRMZ&Signature=uM1KXIIxayRbSw1CBAuIdVbHoig%3D',
  SQUEAK: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  CRACK: 'https://assets.mixkit.co/active_storage/sfx/2592/2592-preview.mp3',
  STEAM: 'https://assets.mixkit.co/active_storage/sfx/285/285-preview.mp3',
};

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const getRelativeDateString = (dateStr: string, offsetDays: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
};

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [isSliding, setIsSliding] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [hoveredThermal, setHoveredThermal] = useState<'HOT' | 'COLD' | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return (saved as ViewMode) || 'MATRIX';
  });
  
  const [tasksMap, setTaskMap] = useState<TaskMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS_MAP);
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [streak, setStreak] = useState<StreakInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
    return saved ? JSON.parse(saved) : { count: 0, lastCompletionDate: null };
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MUTED);
    return saved === 'true';
  });

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentQuote, setCurrentQuote] = useState(ZEN_QUOTES[0]);
  const [audioStarted, setAudioStarted] = useState(false);
  const [rolloverVisible, setRolloverVisible] = useState(false);
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const growthStage = useMemo(() => {
    if (streak.count >= 7) return 3;
    if (streak.count >= 3) return 2;
    return 1;
  }, [streak.count]);

  const startAudioEngine = () => {
    if (audioStarted) return;
    if (!bgMusicRef.current) {
      const bg = new Audio(SFX_URLS.BG_MUSIC);
      bg.loop = true;
      bg.volume = 0.6;
      bg.crossOrigin = "anonymous";
      bgMusicRef.current = bg;
    }
    if (!isMuted) {
      bgMusicRef.current.play().catch(e => console.warn("BG Music failed to play:", e));
    }
    setAudioStarted(true);
  };

  const playSFX = (url: string, volume: number = 1.0) => {
    if (!audioStarted) startAudioEngine();
    if (isMuted) return;
    const sound = new Audio(url);
    sound.volume = volume;
    sound.crossOrigin = "anonymous";
    sound.play().catch(e => console.warn("SFX failed to play:", e));
  };

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
      if (viewMode === 'FOCUS' && offset > 120) {
        setIsHeaderHidden(true);
      } else {
        setIsHeaderHidden(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  useEffect(() => {
    if (bgMusicRef.current) {
      if (isMuted) bgMusicRef.current.pause();
      else if (audioStarted) bgMusicRef.current.play().catch(() => {});
    }
    localStorage.setItem(STORAGE_KEYS.MUTED, isMuted.toString());
  }, [isMuted, audioStarted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS_MAP, JSON.stringify(tasksMap));
  }, [tasksMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  const handleDateChange = (newDate: string) => {
    if (newDate === selectedDate) return;
    setIsSliding(true);
    setTimeout(() => {
      setSelectedDate(newDate);
      setIsSliding(false);
    }, 150);
  };

  useEffect(() => {
    const today = getLocalDateString();
    if (selectedDate === today) {
      const yesterday = getRelativeDateString(today, -1);
      const yesterdayTasks = tasksMap[yesterday] || [];
      const todayTasks = tasksMap[today] || [];
      const hasUnfinished = yesterdayTasks.some(t => !t.completed);
      const noTodayTasks = todayTasks.length === 0;
      if (hasUnfinished && noTodayTasks) {
        setRolloverVisible(true);
      }
    } else {
      setRolloverVisible(false);
    }
  }, [selectedDate, tasksMap]);

  const currentDayTasks = useMemo(() => tasksMap[selectedDate] || [], [tasksMap, selectedDate]);

  const urgentTaskCount = useMemo(() => {
    return currentDayTasks.filter(t => t.quadrant === 'DO' && !t.completed).length;
  }, [currentDayTasks]);

  const sortedTasksForFocus = useMemo(() => {
    const priority = { 'DO': 0, 'SCHEDULE': 1, 'DELEGATE': 2, 'ELIMINATE': 3 };
    return [...currentDayTasks].sort((a, b) => priority[a.quadrant] - priority[b.quadrant]);
  }, [currentDayTasks]);

  const addTask = (text: string, quadrant: QuadrantType) => {
    startAudioEngine();
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      quadrant,
      createdAt: Date.now(),
    };
    setTaskMap(prev => {
      const dayTasks = prev[selectedDate] || [];
      return { ...prev, [selectedDate]: [newTask, ...dayTasks] };
    });
  };

  const updateTaskText = (id: string, newText: string) => {
    if (!newText.trim()) {
      deleteTask(id);
      const discards = CAPY_CAPTIONS.DISCARD;
      setCurrentQuote(discards[Math.floor(Math.random() * discards.length)]);
      return;
    }
    setTaskMap(prev => {
      const dayTasks = prev[selectedDate] || [];
      return { ...prev, [selectedDate]: dayTasks.map(t => t.id === id ? { ...t, text: newText.trim() } : t) };
    });
  };

  const toggleTask = (id: string) => {
    startAudioEngine();
    setTaskMap(prev => {
      const dayTasks = prev[selectedDate] || [];
      const updatedDayTasks = dayTasks.map(task => {
        if (task.id === id) {
          const newStatus = !task.completed;
          if (newStatus) {
            setIsCelebrating(true);
            setTimeout(() => setIsCelebrating(false), 800);
            updateStreak();
            
            if (task.quadrant === 'DO') playSFX(SFX_URLS.STEAM, 0.6);
            else {
              const ageInDays = (Date.now() - task.createdAt) / (1000 * 60 * 60 * 24);
              if (ageInDays > 3) playSFX(SFX_URLS.CRACK, 0.5);
              else playSFX(SFX_URLS.CHECK);
            }
            
            setCurrentQuote(ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)]);
          }
          return { ...task, completed: newStatus };
        }
        return task;
      });
      return { ...prev, [selectedDate]: updatedDayTasks };
    });
  };

  const deleteTask = (id: string) => {
    setTaskMap(prev => {
      const dayTasks = prev[selectedDate] || [];
      return { ...prev, [selectedDate]: dayTasks.filter(task => task.id !== id) };
    });
  };

  const handleRollover = () => {
    startAudioEngine();
    const today = getLocalDateString();
    const yesterday = getRelativeDateString(today, -1);
    const yesterdayTasks = tasksMap[yesterday] || [];
    const unfinished = yesterdayTasks.filter(t => !t.completed);
    if (unfinished.length > 0) {
      playSFX(SFX_URLS.WASH);
      setTaskMap(prev => {
        const todayTasks = prev[today] || [];
        const rolledOverTasks = unfinished.map(t => ({ ...t, id: crypto.randomUUID(), createdAt: Date.now() }));
        const updatedYesterday = yesterdayTasks.filter(t => t.completed);
        return { ...prev, [yesterday]: updatedYesterday, [today]: [...rolledOverTasks, ...todayTasks] };
      });
      setRolloverVisible(false);
      setCurrentQuote("昨日因缘已随行，慢慢来吧。");
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 1200);
    }
  };

  const updateStreak = () => {
    const today = getLocalDateString();
    const yesterday = getRelativeDateString(today, -1);
    setStreak(prev => {
      if (prev.lastCompletionDate === today) return prev;
      if (prev.lastCompletionDate === yesterday || prev.count === 0) {
        return { count: prev.count + 1, lastCompletionDate: today };
      } 
      return { count: 1, lastCompletionDate: today };
    });
  };

  const handleClearCompleted = () => {
    startAudioEngine();
    const count = currentDayTasks.filter(t => t.completed).length;
    if (count === 0) {
      setIsShaking(true);
      setCurrentQuote("🧹 别急，目前还没有需要清理的杂物。");
      setTimeout(() => setIsShaking(false), 600);
      return;
    }
    const clearAction = () => {
      playSFX(SFX_URLS.WASH);
      setTaskMap(prev => ({ ...prev, [selectedDate]: currentDayTasks.filter(t => !t.completed) }));
      setCurrentQuote("🌊 心如明镜，杂念已随水流去。");
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 1200);
    };
    if (count > 5) {
      if (window.confirm(`确定要清理这 ${count} 项已完成的任务吗？`)) clearAction();
    } else clearAction();
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeTask = currentDayTasks.find(t => t.id === activeId);
    if (!activeTask) return;
    if (viewMode === 'MATRIX') {
      const isOverQuadrant = QUADRANTS.some(q => q.id === overId);
      const overTask = currentDayTasks.find(t => t.id === overId);
      const targetQuadrant = isOverQuadrant ? (overId as QuadrantType) : overTask?.quadrant;
      if (targetQuadrant && activeTask.quadrant !== targetQuadrant) {
        setTaskMap(prev => {
          const dayTasks = prev[selectedDate] || [];
          const activeIndex = dayTasks.findIndex(t => t.id === activeId);
          const newDayTasks = [...dayTasks];
          newDayTasks[activeIndex] = { ...activeTask, quadrant: targetQuadrant };
          if (overTask) {
            const overIndex = dayTasks.findIndex(t => t.id === overId);
            return { ...prev, [selectedDate]: arrayMove(newDayTasks, activeIndex, overIndex) };
          }
          return { ...prev, [selectedDate]: newDayTasks };
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    if (over && active.id !== over.id) {
      const activeIndex = currentDayTasks.findIndex(t => t.id === active.id);
      const overIndex = currentDayTasks.findIndex(t => t.id === over.id);
      if (activeIndex !== -1 && overIndex !== -1) {
        setTaskMap((prev) => ({ ...prev, [selectedDate]: arrayMove(prev[selectedDate], activeIndex, overIndex) }));
      }
    }
  };

  const handleInputInteraction = () => {
    if (!audioStarted) startAudioEngine();
    setIsThinking(true);
    setTimeout(() => setIsThinking(false), 500);
  };

  const isCompletedToday = streak.lastCompletionDate === getLocalDateString();
  const tasksByQuadrant = useMemo(() => {
    return QUADRANTS.reduce((acc, q) => {
      acc[q.id] = currentDayTasks.filter(t => t.quadrant === q.id);
      return acc;
    }, {} as Record<QuadrantType, Task[]>);
  }, [currentDayTasks]);

  return (
    <div 
      className={`min-h-screen flex flex-col items-center select-none transition-all duration-700 ease-in-out ${viewMode === 'FOCUS' ? 'bg-[#F2F4F5]' : 'bg-[#F5F5DC]'}`}
      onClick={() => { if (!audioStarted) startAudioEngine(); }}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* Fixed Solid Header Container */}
      <div className={`sticky top-0 z-[500] w-full flex justify-center transition-all duration-500 border-b ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'} ${viewMode === 'FOCUS' ? 'bg-[#F2F4F5] border-stone-200/50' : 'bg-[#F5F5DC] border-amber-200/30'} ${isScrolled ? 'shadow-md shadow-amber-900/5' : 'border-transparent'}`}>
        <header className="w-full max-w-4xl px-4 py-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight">Capa-ble</h1>
              <div className="flex items-center gap-2 bg-white/40 px-2 py-1 rounded-full shadow-inner">
                <span className="text-[10px] font-bold text-orange-800 uppercase px-1.5 py-0.5 bg-orange-200 rounded-full">Lv {growthStage}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); if (!audioStarted) startAudioEngine(); }}
                  className={`p-1.5 rounded-full transition-all duration-300 ${isMuted ? 'text-stone-400 bg-stone-100' : 'text-orange-600 bg-white shadow-sm ring-1 ring-orange-100'}`}
                >
                  {isMuted ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-stone-200 shadow-inner">
              <button
                onClick={() => { setViewMode('MATRIX'); if (!audioStarted) startAudioEngine(); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'MATRIX' ? 'bg-amber-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
              >
                四象限
              </button>
              <button
                onClick={() => { setViewMode('FOCUS'); if (!audioStarted) startAudioEngine(); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'FOCUS' ? 'bg-amber-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
              >
                执行流
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center px-4 py-1.5 bg-white rounded-2xl shadow-sm border border-stone-100 min-w-[100px] transition-all hover:shadow-md">
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">坚持</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xl font-black transition-colors ${isCompletedToday ? 'text-orange-500' : 'text-stone-600'}`}>
                    {streak.count}
                  </span>
                  <span className={`transition-all ${isCompletedToday ? 'text-orange-500 scale-110' : 'text-stone-300'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </span>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleClearCompleted(); }}
                className={`text-stone-400 hover:text-orange-600 transition-all text-xs font-bold flex items-center gap-1.5 group ${isShaking ? 'animate-wiggle text-orange-500' : ''}`}
              >
                <div className="p-2 bg-stone-100 rounded-full group-hover:bg-orange-100 transition-colors">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                清理
              </button>
            </div>
          </div>
        </header>
      </div>

      <div className={`w-full max-w-4xl px-4 md:px-8 relative z-[150] transition-all duration-500 mt-4 ${isHeaderHidden ? '-translate-y-8 scale-95' : 'translate-y-0'}`}>
        <DateNavigator selectedDate={selectedDate} onDateChange={handleDateChange} tasksMap={tasksMap} />
      </div>

      <main className={`w-full max-w-4xl px-4 md:px-8 slide-container transition-all duration-300 mt-6 ${isSliding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={() => { if (!audioStarted) startAudioEngine(); setIsDragging(true); }}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {viewMode === 'MATRIX' ? (
            <div className="quadrant-grid pb-24">
              {QUADRANTS.map(config => (
                <Quadrant
                  key={`${selectedDate}-${config.id}`}
                  config={config}
                  tasks={tasksByQuadrant[config.id] || []}
                  onAddTask={addTask}
                  onUpdateTask={updateTaskText}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onDraggingChange={setIsDragging}
                  onEditingChange={setIsEditingGlobal}
                  onThermalHover={setHoveredThermal}
                />
              ))}
            </div>
          ) : (
            <FocusList 
              tasks={sortedTasksForFocus}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTaskText}
              onAddTask={addTask}
              onDraggingChange={setIsDragging}
              onInputInteraction={handleInputInteraction}
              onEditingChange={setIsEditingGlobal}
              onThermalHover={setHoveredThermal}
            />
          )}
        </DndContext>
      </main>

      <Capybara 
        isCelebrating={isCelebrating} 
        quote={rolloverVisible ? "带上昨天的缘分继续前行吗？" : currentQuote} 
        isDragging={isDragging} 
        mousePos={mousePos}
        growthStage={growthStage as 1 | 2 | 3}
        focusMode={viewMode === 'FOCUS'}
        isThinking={isThinking}
        isEditing={isEditingGlobal}
        thermalState={hoveredThermal}
        urgentTaskCount={urgentTaskCount}
        lastActivity={lastActivity}
        onSqueak={() => playSFX(SFX_URLS.SQUEAK, 0.4)}
        extraAction={rolloverVisible ? { label: "一键搬移", onClick: handleRollover } : undefined}
      />

      <footer className={`mt-12 text-stone-400 text-[10px] font-black pb-8 flex flex-col items-center gap-3 transition-opacity duration-500 ${isHeaderHidden ? 'opacity-0' : 'opacity-100'}`}>
        <p className="tracking-[0.4em] uppercase">© 2026 Capa-ble · 保持定力，专注当下</p>
      </footer>
    </div>
  );
};

export default App;