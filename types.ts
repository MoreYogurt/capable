
export type QuadrantType = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';
export type ViewMode = 'MATRIX' | 'FOCUS';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  quadrant: QuadrantType;
  createdAt: number;
}

export type TaskMap = Record<string, Task[]>;

export interface StreakInfo {
  count: number;
  lastCompletionDate: string | null;
}

export interface QuadrantConfig {
  id: QuadrantType;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  bgColor: string;
  accentColor: string; // Added for Focus Mode side bar
}
