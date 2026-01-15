
import React, { useState, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, QuadrantType } from '../types';
import { QUADRANTS } from '../constants';
import TaskItem from './TaskItem';

interface FocusListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, text: string) => void;
  onAddTask: (text: string, quadrant: QuadrantType) => void;
  onDraggingChange: (isDragging: boolean) => void;
  onInputInteraction?: () => void;
  onEditingChange: (isEditing: boolean) => void;
  onThermalHover?: (thermal: 'HOT' | 'COLD' | null) => void;
}

const FocusList: React.FC<FocusListProps> = ({ 
  tasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onDraggingChange, onInputInteraction, onEditingChange, onThermalHover
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantType>('DO');
  const [isInputActive, setIsInputActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim(), selectedQuadrant);
      setInputValue('');
      onInputInteraction?.();
    }
  };

  const handleQuadrantChange = (q: QuadrantType) => {
    setSelectedQuadrant(q);
    onInputInteraction?.();
  };

  const currentConfig = QUADRANTS.find(q => q.id === selectedQuadrant);
  const completedCount = tasks.filter(t => t.completed).length;
  const isAllDone = tasks.length > 0 && completedCount === tasks.length;

  if (tasks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-8 text-center bg-white/40 backdrop-blur-sm rounded-[3rem] border border-amber-100 shadow-xl shadow-amber-900/5 animate-fade-in">
        <div className="flex flex-col items-center max-w-md w-full">
          <div className="w-40 h-40 opacity-95 animate-capy-breathing drop-shadow-2xl mb-4">
             <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="170" rx="95" ry="35" fill="#81D4FA" fillOpacity="0.3" />
                <ellipse cx="100" cy="120" rx="70" ry="50" fill="#B08D57" />
                <path d="M140 80C140 60 120 50 100 50C80 50 60 60 60 80C60 100 80 110 100 110C120 110 140 100 140 80Z" fill="#B08D57" />
                <g className="animate-orange-glow">
                  <circle cx="100" cy="45" r="10" fill="#FFA500" />
                  <path d="M100 35L100 30" stroke="#2D5A27" strokeWidth="2" strokeLinecap="round" />
                </g>
             </svg>
          </div>
          <div className="flex flex-col gap-2 mb-8">
            <h3 className="text-2xl font-black text-amber-950 tracking-tight">万事具备，只欠东风</h3>
            <p className="text-stone-400 font-bold italic text-sm">稳如泰山，专注当下。</p>
          </div>
          <div className="w-full space-y-6">
            <div className="flex justify-center gap-6">
              {QUADRANTS.map(q => (
                <button key={q.id} type="button" onClick={() => handleQuadrantChange(q.id)} className={`w-4 h-4 rounded-full transition-all duration-300 ${q.accentColor} ${selectedQuadrant === q.id ? 'ring-4 ring-amber-200 scale-125' : 'opacity-20 hover:opacity-100'}`} />
              ))}
            </div>
            <form onSubmit={handleSubmit} className="relative group">
              <input type="text" value={inputValue} onFocus={() => setIsInputActive(true)} onBlur={() => setIsInputActive(false)} onChange={(e) => setInputValue(e.target.value)} placeholder="记录一段新缘分..." className={`w-full bg-white/80 border-2 rounded-3xl px-8 py-5 text-lg focus:outline-none transition-all duration-500 text-center font-bold tracking-tight ${currentConfig?.borderColor.replace('border-', 'border-') || 'border-amber-100'} focus:ring-8 focus:ring-amber-200/20 shadow-lg group-hover:shadow-xl`} />
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-32 animate-fade-in">
      <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-amber-100/50 shadow-2xl shadow-amber-900/5 transition-all">
        {isAllDone && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-3xl border-2 border-emerald-200 animate-fade-in">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl animate-bounce">🎉</span>
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-emerald-900 tracking-tight">圆满收工！</h3>
                <p className="text-sm text-emerald-700 font-bold">今日所有任务已完成，稳如泰山！</p>
              </div>
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 px-2">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-amber-950 tracking-tight">执行流</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">沉浸专注 · 稳定执行</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-stone-50/50 px-5 py-2.5 rounded-2xl border border-stone-100 shadow-inner self-start md:self-auto">
            <span className="text-stone-900 font-black text-sm tabular-nums">{completedCount} / {tasks.length}</span>
            <div className="w-px h-3 bg-stone-200" />
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">今日进度</span>
          </div>
        </div>
        <div className="space-y-1">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task, index) => (
              <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                <TaskItem task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} onDraggingChange={onDraggingChange} onEditingChange={onEditingChange} onThermalHover={onThermalHover} showQuadrantIndicator ambientRefinement />
              </div>
            ))}
          </SortableContext>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-100/50">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">象限投递</span>
              <div className="flex gap-4">
                {QUADRANTS.map(q => (
                  <button key={q.id} type="button" onClick={() => handleQuadrantChange(q.id)} className="group relative">
                    <div className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${q.accentColor} ${selectedQuadrant === q.id ? 'ring-[3px] ring-amber-200 scale-125 shadow-lg' : 'opacity-20 hover:opacity-100'}`} />
                    <div className={`absolute -inset-2 rounded-full opacity-0 group-hover:opacity-10 transition-opacity ${q.accentColor}`} />
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="relative group">
              <input type="text" value={inputValue} onFocus={() => setIsInputActive(true)} onBlur={() => setIsInputActive(false)} onChange={(e) => setInputValue(e.target.value)} placeholder={`投递到 [${currentConfig?.title || '任务'}] ...`} className={`relative w-full bg-stone-50/50 border-2 rounded-[1.75rem] px-6 py-5 text-base focus:outline-none focus:bg-white transition-all duration-500 font-bold pr-16 shadow-inner ${currentConfig?.borderColor.replace('border-', 'border-') || 'border-stone-100'} focus:ring-8 focus:ring-amber-100/10`} />
              <button type="submit" disabled={!inputValue.trim()} className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 text-white rounded-2xl transition-all shadow-md active:scale-90 ${inputValue.trim() ? `${currentConfig?.accentColor || 'bg-amber-500'} scale-100 opacity-100` : 'bg-stone-200 scale-90 opacity-0 pointer-events-none'}`}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusList;
