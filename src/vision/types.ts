/**
 * RepRush Vision & Push-up Detection Type Definitions
 */

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
}

export type BodySide = 'left' | 'right';

export type PushupState =
  | 'READY'
  | 'UP'
  | 'DOWN'
  | 'TOP'
  | 'BOTTOM'
  | 'GOING_DOWN'
  | 'GOING_UP';

export interface PushupConfig {
  /** Elbow angle threshold for arms extended / top position (degrees) */
  topAngle: number;
  /** Elbow angle threshold for push-up depth / bottom position (degrees) */
  bottomAngle: number;
  /** Minimum duration of a valid rep in milliseconds (safeguard against jitter) */
  minRepDurationMs: number;
  /** Maximum duration of a valid rep in milliseconds (safeguard against stalled movement) */
  maxRepDurationMs: number;
  /** Cooldown time after completing a rep before next rep can start (ms) */
  cooldownMs: number;
  /** Number of frames for angle smoothing window */
  smoothingFrames: number;
  /** Minimum landmark visibility confidence */
  minLandmarkConfidence: number;
}

export interface PushupFrameResult {
  poseDetected: boolean;
  state: PushupState;
  angle: number;
  rawAngle: number;
  leftAngle: number;
  rightAngle: number;
  activeSide: BodySide;
  confidence: number;
  repCompleted: boolean;
  reps: number;
  feedbackMessage: string;
  repProgress: number; // 0 (top) to 100 (bottom)
  durationOfCurrentRepMs?: number;
}

export interface PoseLandmarksData {
  landmarks: NormalizedLandmark[];
  worldLandmarks?: NormalizedLandmark[];
}

export type ExerciseType = 'pushups' | 'squats' | 'situps' | 'burpees' | 'plank';

// MediaPipe Pose Landmark Indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;
