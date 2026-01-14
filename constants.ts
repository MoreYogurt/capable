
import { QuadrantConfig } from './types';

export const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'DO',
    title: '重要且紧急',
    subtitle: '立即处理 (Important & Urgent)',
    color: 'text-orange-900',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    accentColor: 'bg-orange-500',
  },
  {
    id: 'SCHEDULE',
    title: '重要不紧急',
    subtitle: '制定计划 (Important & Not Urgent)',
    color: 'text-emerald-900',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'DELEGATE',
    title: '紧急不重要',
    subtitle: '授权他人 (Urgent & Not Important)',
    color: 'text-slate-700',
    borderColor: 'border-slate-200',
    bgColor: 'bg-slate-50',
    accentColor: 'bg-sky-500',
  },
  {
    id: 'ELIMINATE',
    title: '不重要不紧急',
    subtitle: '尽量减少 (Not Important & Not Urgent)',
    color: 'text-slate-600',
    borderColor: 'border-slate-200',
    bgColor: 'bg-slate-50',
    accentColor: 'bg-slate-400',
  },
];

export const ZEN_QUOTES = [
  "凡心所向，素履以往。",
  "不慌不忙，清风自来。",
  "心如止水，波澜不惊。",
  "万物有时，不必急于求成。",
  "专注于当下，便是最大的智慧。",
  "Capa 提醒你：休息也是一种前进。",
  "持之及恒，终有回响。",
  "顺其自然，随遇而安。",
  "静坐常思己过，闲谈莫论人非。",
  "大智若愚，稳如泰山。"
];

export const CAPY_CAPTIONS = {
  STRESS_LOW: [
    "心宽体胖，橘子稳当。",
    "世界很吵，但我们要保持安静。",
    "今天也是情绪稳定的一天。",
    "慢慢来，好运都在后面。"
  ],
  STRESS_MID: [
    "嗯...事情稍微有点排队了。",
    "深呼吸，橘子就不会掉。",
    "稳住，我们一个一个来。",
    "感受到压力了吗？别担心，我在呢。"
  ],
  STRESS_HIGH: [
    "救命！橘子在报警了！",
    "CPU 已过载，急需清空红色象限！",
    "这种时候，先摸摸我冷静一下？",
    "淡定...虽然我也快忍不住颤抖了。"
  ],
  CELEBRATE: [
    "✨ 这一波，稳如泰山！",
    "舒服了，感觉身心都轻盈了。",
    "太强了，你是懂执行的！",
    "为你点个赞，效率之王！"
  ],
  DRAGGING: [
    "搬运中，注意避让...",
    "这个位置不错，风水极佳。",
    "感受到你专注的磁场了。"
  ],
  INTERACTION: [
    "嘿嘿，好痒呀...",
    "你真有眼光，我的皮毛手感一流。",
    "摸摸我，好运一整天！",
    "嘿！这就是‘摸鱼’的最高境界吗？"
  ],
  IDLE: [
    "呼...发呆也是一种修行。",
    "稍微打个盹，你应该不介意吧？",
    "要是现在能泡个温泉就好了...",
    "我在观察空气中橘子的香气。"
  ],
  FOCUS_MODE: [
    "监督模式开启，我会看着你的。",
    "戴上眼镜，我就是最严厉的导师。",
    "专注执行，别被杂念带走了。"
  ],
  EDITING: [
    "让我想想怎么改更稳...",
    "字斟句酌，心境自明。",
    "修改也是一种重新出发。"
  ],
  DISCARD: [
    "这是要彻底‘断舍离’吗？",
    "旧的不去，新的不来。",
    "随缘而去，也是一种圆满。"
  ],
  HOT_TASK: [
    "呼！这任务好烫手...",
    "热火朝天，干劲十足呀！",
    "火烧眉毛啦，快动起来！"
  ],
  COLD_TASK: [
    "嘶...好冷，这任务结冰了。",
    "阿嚏！感觉该穿件毛衣了。",
    "任务都要冻僵了，给它加点温吧？"
  ],
  FANNING: [
    "呼——呼——帮你扇扇风降降温。",
    "太热了，心静自然凉...",
    "汗流浃背了，兄台稳住！"
  ],
  SHIVERING: [
    "好冷好冷...这任务是北极来的吗？",
    "牙齿都在打颤了，快暖和一下。",
    "给我也穿件毛衣吧，好凉快..."
  ]
};
