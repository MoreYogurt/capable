import React from 'react';

interface EvolutionManualProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  streakCount: number;
  nextLevelDays: number;
}

const EvolutionManual: React.FC<EvolutionManualProps> = ({ isOpen, onClose, currentLevel, streakCount, nextLevelDays }) => {
  if (!isOpen) return null;

  const stages = [
    { level: 1, title: '初探', days: '1-2天', desc: '刚接触修行的卡皮巴拉，独自发呆思考。', icon: '🐾' },
    { level: 2, title: '定心', days: '3-6天', desc: '在禅意蒲团上打坐，定力初显。', icon: '🧘' },
    { level: 3, title: '入定', days: '7-14天', desc: '在室外温泉中沉浸，心如止水。', icon: '♨️' },
    { level: 4, title: '共生', days: '15-29天', desc: '吸引小友相伴，万物共生，竹影摇曳。', icon: '🎋' },
    { level: 5, title: '觉醒', days: '30天+', desc: '星空之下，神圣琥珀觉醒，身心皆极乐。', icon: '✨' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl fade-in-scale flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 bg-amber-500 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-3xl font-black mb-1">修行图鉴</h3>
          <p className="opacity-80 font-bold uppercase tracking-widest text-sm">记录你的进化轨迹</p>
          
          <div className="mt-6 p-4 bg-white/20 rounded-2xl flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60">当前等级</span>
                <span className="text-xl font-black">Lv.{currentLevel} {stages[currentLevel-1]?.title}</span>
             </div>
             <div className="text-right flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60">累积天数</span>
                <span className="text-xl font-black">{streakCount} 天</span>
             </div>
          </div>
        </div>

        {/* List */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-[#FDFCF0]">
          <div className="space-y-4">
            {stages.map((stage) => {
              const isActive = currentLevel === stage.level;
              const isLocked = currentLevel < stage.level;
              return (
                <div 
                  key={stage.level}
                  className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6 
                    ${isActive ? 'bg-white border-amber-500 shadow-xl scale-[1.02] z-10' : 
                      isLocked ? 'bg-stone-50 border-stone-100 opacity-60 grayscale' : 'bg-white/50 border-stone-100 opacity-90'}`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner
                    ${isActive ? 'bg-amber-100' : 'bg-stone-100'}`}>
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-lg font-black text-stone-800">Lv.{stage.level} {stage.title}</h4>
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{stage.days}</span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium leading-relaxed">{stage.desc}</p>
                  </div>
                  {isActive && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-md">修行中</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Hint */}
        {currentLevel < 5 && (
          <div className="p-6 bg-white border-t border-stone-100 text-center">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              距离下一阶段还需要坚持 <span className="text-amber-500">{nextLevelDays}</span> 天
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolutionManual;