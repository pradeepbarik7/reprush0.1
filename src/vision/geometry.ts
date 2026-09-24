/**
 * Geometry and Math calculations for Pose Tracking
 *
 * Implements the angle calculation matching the OpenCV / MediaPipe Python implementation:
 * radians = atan2(c.y - b.y, c.x - b.x) - atan2(a.y - b.y, a.x - b.x)
 * angle = |radians * 180 / PI|
 * if angle > 180: angle = 360 - angle
 */
import { BodySide, NormalizedLandmark, POSE_LANDMARKS } from './types';

/**
 * Calculates the 2D interior angle at joint `b` formed by points `a`, `b`, and `c`.
 * Returns angle in degrees in the range [0, 180].
 */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle * 10) / 10;
}

/**
 * Calculates average visibility/presence confidence for the key pushup joints on a given body side.
 */
export function getArmConfidence(
  landmarks: NormalizedLandmark[],
  side: BodySide
): number {
  const shoulderIdx =
    side === 'left' ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
  const elbowIdx =
    side === 'left' ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW;
  const wristIdx =
    side === 'left' ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST;

  const shoulder = landmarks[shoulderIdx];
  const elbow = landmarks[elbowIdx];
  const wrist = landmarks[wristIdx];

  if (!shoulder || !elbow || !wrist) return 0;

  const getConf = (lm: NormalizedLandmark) =>
    lm.visibility !== undefined ? lm.visibility : (lm.presence ?? 0.8);

  const conf1 = getConf(shoulder);
  const conf2 = getConf(elbow);
  const conf3 = getConf(wrist);

  return (conf1 + conf2 + conf3) / 3;
}

/**
 * Moving average filter to stabilize noisy landmark angles across consecutive frames
 */
export class MovingAverageFilter {
  private windowSize: number;
  private samples: number[] = [];

  constructor(windowSize: number = 5) {
    this.windowSize = Math.max(1, windowSize);
  }

  public add(val: number): number {
    this.samples.push(val);
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }
    return this.getAverage();
  }

  public getAverage(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / this.samples.length) * 10) / 10;
  }

  public reset(): void {
    this.samples = [];
  }
}
