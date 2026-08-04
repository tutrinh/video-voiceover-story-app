export type FrameworkType = 'framework_a' | 'framework_b';
export type AIEngineType = 'claude' | 'codex' | 'web';

export interface ModelOption {
  id: string;
  name: string;
  default?: boolean;
}

export interface Beat {
  beatIndex: number;
  type: string; // HOOK, BEGINNING, MIDDLE, ENDING, CTA or HOOK, STATE PROBLEM, JOURNEY, SOLUTION, CTA
  header: string;
  text: string;
  estimatedSeconds: number;
  visualCue: string;
  highlightKeywords: string[];
  deliveryTip: string;
}

export interface ScriptData {
  id: string;
  title: string;
  hookHeadline: string;
  framework: FrameworkType;
  topic: string;
  audience: string;
  tone: string;
  estimatedDurationSeconds: number;
  suggestedVisualTheme: string;
  beats: Beat[];
  engineUsed: string;
  modelUsed: string;
  createdAt: number;
}

export interface VoiceTake {
  id: string;
  takeNumber: number;
  audioBlob: Blob;
  audioUrl: string;
  durationSeconds: number;
  createdAt: number;
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface SavedStory {
  id: string;
  script: ScriptData;
  takes: VoiceTake[];
  activeTakeId?: string;
  updatedAt: number;
  tags?: string[];
}
