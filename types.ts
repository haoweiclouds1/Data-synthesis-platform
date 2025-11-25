export enum TaskType {
  T2V = 'Text-to-Video',
  A2V = 'Audio-to-Video'
}

export enum PromptStatus {
  PENDING = 'PENDING',
  PILOT_RUNNING = 'PILOT_RUNNING',
  PILOT_COMPLETED = 'PILOT_COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum RejectReason {
  DISTORTION = 'Visual Distortion / Artifacts',
  SEMANTIC_MISMATCH = 'Semantic Mismatch',
  LOW_QUALITY = 'Blurry / Low Resolution',
  STYLE_MISMATCH = 'Style Inconsistency',
  OTHER = 'Other'
}

export interface VideoSample {
  id: string;
  uri?: string;
  status: 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  generatedAt: number;
}

export interface PromptItem {
  id: string;
  text: string;
  originalRequest: string;
  status: PromptStatus;
  pilotSamples: VideoSample[];
  rejectReason?: RejectReason;
  rejectNote?: string;
  batchConfig?: {
    count: number;
    completed: number;
  };
}

export interface TaskConfig {
  id: string;
  name: string;
  type: TaskType;
  baseModel: string; // e.g., 'veo-3.1-fast-generate-preview'
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1';
  pilotCount: number; // Number of videos to generate per prompt in pilot
}

export interface ProjectStats {
  totalPrompts: number;
  approvedPrompts: number;
  totalVideosGenerated: number;
  estimatedCost: number;
}
