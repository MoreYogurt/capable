import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CAPY_CAPTIONS } from '../constants';

interface CapybaraProps {
  isCelebrating: boolean;
  quote: string;
  isDragging?: boolean;
  mousePos?: { x: number; y: number };
  growthStage: 1 | 2 | 3;
  extraAction?: { label: string; onClick: () => void };
  focusMode?: boolean;
  isThinking?: boolean;
  isEditing?: boolean;
  thermalState?: 'HOT' | 'COLD' | null;
  urgentTaskCount: number;
  lastActivity: number;
  onSqueak?: () => void;
}

const IDLE_TIMEOUT = 15000; // 15 seconds

const Capybara: React.FC<CapybaraProps> = ({ 
  isCelebrating, quote, isDragging, mousePos, growthStage, extraAction, focusMode, isThinking, isEditing, thermalState, urgentTaskCount, lastActivity, onSqueak 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headRotation, setHeadRotation] = useState(0);
  const [nodding, setNodding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [currentAction, setCurrentAction] = useState<'IDLE' | 'SHY' | 'ROLL' | 'HEART' | 'YAWN' | 'EAT' | 'SCRATCH' | 'DIVE' | 'STRETCH'>('IDLE');
  const [isFloatingOranges, setIsFloatingOranges] = useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isSweating = (urgentTaskCount >= 3 && urgentTaskCount < 6) || thermalState === 'HOT';
  const isNervous = urgentTaskCount >= 6;

  const displayCaption = useMemo(() => {
    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    if (isCelebrating) return getRandom(CAPY_CAPTIONS.CELEBRATE);
    if (isDragging) return getRandom(CAPY_CAPTIONS.DRAGGING);
    if (thermalState === 'HOT') return getRandom(CAPY_CAPTIONS.FANNING);
    if (thermalState === 'COLD') return getRandom(CAPY_CAPTIONS.SHIVERING);
    if (isEditing) return getRandom(CAPY_CAPTIONS.EDITING);
    if (isNervous) return getRandom(CAPY_CAPTIONS.STRESS_HIGH);
    if (isSweating) return getRandom(CAPY_CAPTIONS.STRESS_MID);
    if (isHovered) return getRandom(CAPY_CAPTIONS.INTERACTION);
    if (focusMode && urgentTaskCount > 0) return getRandom(CAPY_CAPTIONS.FOCUS_MODE);
    if (currentAction !== 'IDLE') return getRandom(CAPY_CAPTIONS.IDLE);
    
    return quote || getRandom(CAPY_CAPTIONS.STRESS_LOW);
  }, [isCelebrating, isDragging, thermalState, isEditing, isNervous, isSweating, isHovered, focusMode, currentAction, urgentTaskCount, quote]);

  useEffect(() => {
    const checkIdle = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > IDLE_TIMEOUT && currentAction === 'IDLE' && Math.random() < 0.2) {
        const actions: Array<'YAWN' | 'EAT' | 'SCRATCH' | 'DIVE'> = ['YAWN', 'EAT', 'SCRATCH', 'DIVE'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        setCurrentAction(randomAction);
        setTimeout(() => setCurrentAction('IDLE'), 2500);
      }
    }, 5000);
    return () => clearInterval(checkIdle);
  }, [lastActivity, currentAction]);

  useEffect(() => {
    setNodding(true);
    const timer = setTimeout(() => setNodding(false), 400);
    return () => clearTimeout(timer);
  }, [isThinking, focusMode]);

  useEffect(() => {
    if (isDragging && mousePos && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const capyCenterX = rect.left + rect.width / 2;
      const capyCenterY = rect.top + rect.height / 2;
      const dx = mousePos.x - capyCenterX;
      const dy = mousePos.y - capyCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const maxEyeOffset = 4;
      setEyeOffset({ x: (dx / dist) * maxEyeOffset, y: (dy / dist) * maxEyeOffset });
      const maxRotation = 10;
      setHeadRotation((dx / window.innerWidth) * maxRotation * -1);
    } else if (isThinking || isEditing) {
      setHeadRotation(isEditing ? -8 : -5);
      setTimeout(() => setHeadRotation(0), 300);
    } else {
      setEyeOffset({ x: 0, y: 0 });
      setHeadRotation(0);
    }
  }, [isDragging, mousePos, isThinking, isEditing]);

  const handleInteraction = () => {
    if (currentAction !== 'IDLE') return;
    onSqueak?.();
    const interactions: Array<'SHY' | 'ROLL' | 'HEART'> = ['SHY', 'ROLL', 'HEART'];
    const randomInt = interactions[Math.floor(Math.random() * interactions.length)];
    setCurrentAction(randomInt);
    setTimeout(() => setCurrentAction('IDLE'), 1500);
  };

  const startLongPress = () => {
    const timeout = setTimeout(() => {
      setIsFloatingOranges(true);
      onSqueak?.();
      setTimeout(() => setIsFloatingOranges(false), 3000);
    }, 2000);
    setLongPressTimeout(timeout);
  };

  const cancelLongPress = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  const emoji = useMemo(() => {
    if (isFloatingOranges) return "🍊🍊🍊";
    if (currentAction === 'HEART') return "❤️";
    if (currentAction === 'EAT') return "😋";
    if (currentAction === 'SHY') return "😊";
    if (thermalState === 'HOT') return "💦";
    if (thermalState === 'COLD') return "❄️";
    return null;
  }, [isFloatingOranges, currentAction, thermalState]);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col items-end z-[600] pointer-events-none sm:pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onClick={handleInteraction}
    >
      <div className={`bg-white p-4 rounded-2xl shadow-2xl border border-stone-100 mb-2 transition-all duration-500 max-w-[240px] text-sm text-stone-700 font-medium ${isCelebrating || isDragging || extraAction || isHovered || isNervous || isEditing || thermalState ? 'opacity-100 translate-y-0 scale-100' : 'opacity-80 translate-y-2 scale-95'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
             <span className={`${isCelebrating ? 'text-orange-600 font-bold' : isNervous ? 'text-red-500 font-bold' : isEditing ? 'text-amber-600 font-medium' : ''}`}>
               {displayCaption}
             </span>
          </div>
          {extraAction && (
            <button onClick={(e) => { e.stopPropagation(); extraAction.onClick(); }} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-amber-200 pointer-events-auto">
              {extraAction.label}
            </button>
          )}
        </div>
        <div className="absolute right-6 -bottom-2 w-4 h-4 bg-white border-r border-b border-stone-100 transform rotate-45"></div>
      </div>
      
      <div className={`relative transition-all duration-500 ease-out transform origin-bottom 
          ${isCelebrating ? 'animate-jelly-jump' : ''} 
          ${nodding ? 'scale-110' : 'scale-100'} 
          ${currentAction === 'ROLL' ? 'animate-[spin_1s_ease-in-out]' : ''}
          ${thermalState === 'COLD' ? 'animate-wiggle' : ''}
          ${isHovered ? 'scale-105' : ''}
          cursor-pointer
        `}
        style={{ transform: `rotate(${headRotation}deg)` }}
      >
        <div className="animate-capy-breathing relative">
          {(isNervous || thermalState === 'HOT') && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-[30%] top-[-10px] w-3 h-8 bg-stone-300/40 blur-sm rounded-full animate-steam" />
              <div className="absolute left-[60%] top-[-25px] w-4 h-10 bg-stone-300/40 blur-sm rounded-full animate-steam [animation-delay:0.8s]" />
            </div>
          )}

          <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hot Spring Water (LV3) */}
            {growthStage >= 3 && (
              <g>
                <ellipse cx="100" cy="170" rx="95" ry="35" fill="#81D4FA" fillOpacity="0.8" />
                <path d="M20 170Q100 150 180 170" stroke="white" strokeWidth="2" strokeOpacity="0.4" fill="none" />
              </g>
            )}

            <ellipse cx="100" cy={currentAction === 'DIVE' ? 140 : 120} rx={currentAction === 'STRETCH' ? 80 : 70} ry={currentAction === 'YAWN' ? 55 : 50} fill="#B08D57" className="transition-all duration-500" />
            
            <g transform={currentAction === 'DIVE' ? 'translate(0, 20)' : ''}>
              <path d="M140 80C140 60 120 50 100 50C80 50 60 60 60 80C60 100 80 110 100 110C120 110 140 100 140 80Z" fill="#B08D57" className="transition-all duration-500" />
              <path d="M145 85C145 78 135 72 125 72V98C135 98 145 92 145 85Z" fill="#917346" />
              
              <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
                 {isEditing ? (<g><path d="M80 78L95 82" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" /><path d="M105 82L120 78" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" /></g>) : isNervous ? (<g><path d="M80 80L90 75" stroke="#4A3728" strokeWidth="3" /><path d="M110 75L120 80" stroke="#4A3728" strokeWidth="3" /></g>) : (<g><path d="M85 78Q90 73 95 78" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" className="transition-all duration-300" /><path d="M115 78Q120 73 125 78" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" className="transition-all duration-300" /></g>)}
                 {focusMode && (<g><circle cx="85" cy="80" r="8" stroke="#333" strokeWidth="1.5" fill="none" /><circle cx="115" cy="80" r="8" stroke="#333" strokeWidth="1.5" fill="none" /><path d="M93 80L107 80" stroke="#333" strokeWidth="1.5" /></g>)}
              </g>
              {isSweating && (<g className="animate-pulse"><path d="M70 60Q72 65 74 60" stroke="#81D4FA" strokeWidth="2" strokeLinecap="round" fill="#81D4FA" /><path d="M130 60Q132 65 134 60" stroke="#81D4FA" strokeWidth="2" strokeLinecap="round" fill="#81D4FA" /></g>)}
              
              <g className={`transition-all duration-500 ${isHovered ? '-translate-y-4' : ''} ${isNervous ? 'animate-[wiggle_0.5s_infinite]' : ''}`}>
                {currentAction !== 'EAT' && (
                  <g className={`${growthStage >= 2 ? 'animate-orange-glow' : ''}`}>
                    <circle cx="100" cy="45" r="10" fill="#FFA500" />
                    <path d="M100 35L100 30" stroke="#2D5A27" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="97" cy="42" r="2" fill="white" fillOpacity="0.4" />
                  </g>
                )}
              </g>
            </g>
          </svg>
          {emoji && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-bounce">{emoji}</div>}
        </div>
      </div>
    </div>
  );
};

export default Capybara;