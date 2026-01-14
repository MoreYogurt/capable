
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, QuadrantConfig, QuadrantType } from '../types';
import TaskItem from './TaskItem';

interface QuadrantProps {
  config: QuadrantConfig;
  tasks: Task[];
  onAddTask: (text: string, quadrant: QuadrantType) => void;
  onUpdateTask: (id: string, text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDraggingChange: (isDragging: boolean) => void;
  onEditingChange: (isEditing: boolean) => void;
  onThermalHover?: (thermal: 'HOT' | 'COLD' | null) => void;
}

const Quadrant: React.FC<QuadrantProps> = ({ 
  config, tasks, onAddTask, onUpdateTask, onToggleTask, onDeleteTask, onDraggingChange, onEditingChange, onThermalHover
}) => {
  const [inputValue, setInputValue] = useState('');
  const { setNodeRef, isOver } = useDroppable({
    id: config.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim(), config.id);
      setInputValue('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-[400px] md:h-[calc(45vh-20px)] rounded-3xl border-2 transition-all duration-300 overflow-hidden ${config.borderColor} ${config.bgColor} ${isOver ? 'scale-[1.01] shadow-xl brightness-95 ring-4 ring-amber-100/50' : 'shadow-sm'}`}
    >
      <div className="p-4 border-b border-inherit flex justify-between items-center">
        <div>
          <h3 className={`text-lg font-bold ${config.color}`}>{config.title}</h3>
          <p className="text-xs text-stone-400 font-medium">{config.subtitle}</p>
        </div>
        <span className="text-[10px] font-bold bg-white/60 px-2 py-0.5 rounded-full text-stone-500">{tasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-300 italic text-sm pointer-events-none">
              <p>暂无任务</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onDraggingChange={onDraggingChange}
                onEditingChange={onEditingChange}
                onThermalHover={onThermalHover}
              />
            ))
          )}
        </SortableContext>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white/50 backdrop-blur-sm border-t border-inherit">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="添加任务..."
            className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Quadrant;
