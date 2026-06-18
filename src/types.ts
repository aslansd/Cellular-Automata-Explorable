export type ModelType = 'life' | 'elementary' | 'fire' | 'sand' | 'epidemic';

export interface CellularAutomataState {
  grid: number[][];
  width: number;
  height: number;
  stepCount: number;
  isRunning: boolean;
  speedMs: number; // Interval in milliseconds
  modelType: ModelType;
  // Model specific settings
  lifeRules: {
    birth: number[];
    survival: number[];
  };
  elementaryRule: number; // 0 - 255
  fireProb: {
    regrowth: number; // Probability of tree growing
    lightning: number; // Probability of spontaneous combustion
  };
  epidemicProb: {
    infection: number; // Probability of spread
    recovery: number; // Probability of recovery per step
    mortality: number; // Probability of death if infected
  };
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  paragraphs: string[];
  challengeTitle?: string;
  challengeInstruction?: string;
  challengeGoalText?: string;
  modelType: ModelType;
  modelPreset?: string;
  checkCompletion: (state: CellularAutomataState, drawHistoryCount: number) => boolean;
  helpOverlay?: string;
}

export interface SavedTemplate {
  name: string;
  modelType: ModelType;
  grid: number[][];
}
