/**
 * RepRush Centralized Push-up Detection Configuration
 * 
 * Based on the HassanRasheed91 Pushup-Detection algorithm:
 * - Top / extended arms: angle > 155°
 * - Bottom / push-up depth: angle < 100°
 * - Complete movement cycle: READY -> TOP -> GOING_DOWN -> BOTTOM -> GOING_UP -> TOP
 */
import { PushupConfig } from './types';

export const PUSHUP_CONFIG: PushupConfig = {
  // Top of push-up (arms extended / lockout)
  topAngle: 152,

  // Bottom of push-up (chest depth reached)
  bottomAngle: 105,

  // Minimum duration for a humanly possible valid pushup (safeguard against glitch/flicker)
  minRepDurationMs: 500,

  // Maximum duration for a single rep cycle before resetting to avoid stuck state
  maxRepDurationMs: 6000,

  // Cooldown time immediately following a completed rep to prevent duplicate triggers
  cooldownMs: 350,

  // Moving average smoothing window (matching Hassan deque(maxlen=7))
  smoothingFrames: 6,

  // Minimum landmark presence/visibility score required from MediaPipe
  minLandmarkConfidence: 0.45,
};

// Model CDN URLs for MediaPipe Tasks Vision (matching @mediapipe/tasks-vision 1.0.1)
export const MEDIAPIPE_VISION_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';

export const MEDIAPIPE_POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
