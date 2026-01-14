import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { QUADRANTS } from '../constants';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDraggingChange?: (isDragging: boolean) => void;
  onEditingChange?: (isEditing: boolean) => void;
  onThermalHover?: (thermal: 'HOT' | 'COLD' | null) => void;
  showQuadrantIndicator?: boolean;
  ambientRefinement?: boolean;
}

const FlameEffect = () => (
  <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none overflow-visible">
    <div className="relative w-4 h-6 animate-ember-sway">
      {/* Abstract Zen Fire - Layered Blurry Blobs */}
      <div className="absolute inset-0 bg-orange-500 rounded-full blur-[6px] opacity-40 animate-ember-glow" />
      <div className="absolute inset-x-0.5 top-1 bottom-1 bg-amber-400 rounded-full blur-[3px] opacity-60 animate-ember-glow" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-x-1 top-2 bottom-2 bg-yellow-200 rounded-full blur-[1px] opacity-80 animate-ember-glow" style={{ animationDelay: '0.6s' }} />
      
      {/* Delicate Sparks */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-amber-300 rounded-full animate-ember-float" />
      <div className="absolute -top-4 left-1 w-1 h-1 bg-orange-400/50 blur-[0.5px] rounded-full animate-ember-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute -top-1 right-0 w-0.5 h-0.5 bg-yellow-100 rounded-full animate-ember-float" style={{ animationDelay: '1.2s' }} />
    </div>
  </div>
);

const FrostEffect = () => (
  <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
    <div className="absolute inset-0 border-[3px] border-blue-200/20 blur-[2px] animate-frost"></div>
    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-100/30 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-blue-100/30 to-transparent"></div>
  </div>
);

const SteamEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[...Array(4)].map((_, i) => (
      <div 
        key={i} 
        className="absolute w-8 h-12 bg-white/40 blur-lg rounded-full animate-steam"
        style={{ animationDelay: `${i * 0.2}s`, left: `${20 + i * 20}%` }}
      />
    ))}
  </div>
);

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, onToggle, onDelete, onUpdate, onDraggingChange, onEditingChange, onThermalHover, showQuadrantIndicator, ambientRefinement 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isCracking, setIsCracking] = useState(false);
  const [isSteaming, setIsSteaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, disabled: isEditing });

  // Thermal Logic
  const isHot = task.quadrant === 'DO' && !task.completed;
  const isCold = useMemo(() => {
    const ageInDays = (Date.now() - task.createdAt) / (1000 * 60 * 60 * 24);
    return ageInDays > 3 && !task.completed;
  }, [task.createdAt, task.completed]);

  useEffect(() => {
    onDraggingChange?.(isDragging);
  }, [isDragging, onDraggingChange]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.setSelectionRange(editText.length, editText.length);
      }
      if (isCold) {
        setIsCracking(true);
        setTimeout(() => setIsCracking(false), 500);
      }
    }
    onEditingChange?.(isEditing);
  }, [isEditing, isCold]);

  const handleToggle = () => {
    if (isHot && !task.completed) {
      setIsSteaming(true);
      setTimeout(() => {
        setIsSteaming(false);
        onToggle(task.id);
      }, 800);
    } else {
      if (isCold) {
        setIsCracking(true);
        setTimeout(() => setIsCracking(false), 500);
      }
      onToggle(task.id);
    }
  };

  const handleSave = () => {
    onUpdate(task.id, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const quadrantConfig = QUADRANTS.find(q => q.id === task.quadrant);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => onThermalHover?.(isHot ? 'HOT' : isCold ? 'COLD' : null)}
      onMouseLeave={() => onThermalHover?.(null)}
      className={`group relative flex items-stretch mb-2 rounded-2xl transition-all duration-300 border bg-white overflow-visible
        ${isDragging ? 'opacity-90 scale-[1.02] shadow-2xl border-amber-300 ring-4 ring-amber-100/50 cursor-grabbing' : `cursor-grab ${ambientRefinement ? 'border-amber-100/30 zen-card-shadow' : 'border-stone-100 shadow-sm hover:shadow-md'}`} 
        ${task.completed && !isDragging ? 'opacity-50 bg-stone-50/30' : ''}
        ${isEditing ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/20' : ''}
        ${isCold ? 'text-stone-400/80' : ''}
        ${isHot ? 'hot-glow' : ''}`}
    >
      {/* Thermal Visuals */}
      {isHot && <FlameEffect />}
      {isCold && <FrostEffect />}
      {isCracking && <div className="absolute inset-0 bg-white/40 animate-crack z-10 pointer-events-none" />}
      {isSteaming && <SteamEffect />}

      {/* Side Color Bar */}
      {showQuadrantIndicator && quadrantConfig && (
        <div className={`w-1 flex-shrink-0 ${quadrantConfig.accentColor} opacity-90`} title={quadrantConfig.title} />
      )}

      <div className="flex items-center justify-between p-4 flex-1 overflow-hidden h-full min-h-[56px] transition-all relative z-0">
        <div className="flex items-center gap-4 overflow-hidden flex-1" {...(isEditing ? {} : { ...attributes, ...listeners })}>
          {/* Custom Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            onPointerDown={(e) => e.stopPropagation()} 
            className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all relative z-10 ${task.completed ? 'bg-amber-500 border-amber-500 shadow-sm' : 'border-stone-200 bg-white hover:border-amber-400 group-hover:scale-110'}`}
          >
            {task.completed && (
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-base font-bold text-stone-800 p-0 focus:ring-0"
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex-1 flex items-center gap-2 overflow-hidden cursor-text" onClick={() => setIsEditing(true)}>
              <span className={`text-base truncate select-none transition-all duration-300 relative group/text ${task.completed ? 'line-through text-stone-300 font-medium' : 'text-stone-800 font-bold'}`}>
                {task.text}
                <span className="absolute left-0 bottom-0 w-full border-b-2 border-amber-400/0 border-dashed transition-all group-hover/text:border-amber-400/40" />
              </span>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-300 hover:text-amber-500"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;