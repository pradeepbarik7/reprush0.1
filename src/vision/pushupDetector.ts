/**
 * RepRush Push-up State Machine
 *
 * Direct port of the tested HassanRasheed91 Python/OpenCV implementation:
 * - Landmark detection: shoulder -> elbow -> wrist on both arms
 * - calculate_angle: atan2 angle formula with 180° bound
 * - Both arms angle averaging: (left_angle + right_angle) / 2
 * - Angle smoothing: deque(maxlen=7) moving average
 * - 2-phase state machine with hysteresis:
 *     READY -> UP (when smooth_angle > 155°)
 *     UP -> DOWN (when smooth_angle < 100°)
 *     DOWN -> UP (when smooth_angle > 155°) => REPS += 1!
 * - Feedback messages matching Hassan:
 *     >150°: "Arms straight (Top)"
 *     <100°: "Good depth (Bottom)"
 *     Else:  "In motion..."
 */
import { PUSHUP_CONFIG } from './config';
import { calculateAngle, getArmConfidence, MovingAverageFilter } from './geometry';
import {
  BodySide,
  NormalizedLandmark,
  POSE_LANDMARKS,
  PushupConfig,
  PushupFrameResult,
  PushupState,
} from './types';

export class PushupDetector {
  private config: PushupConfig;
  private state: PushupState = 'READY';
  private repCount: number = 0;
  private activeSide: BodySide = 'left';

  // Angle smoothing buffer matching Hassan's deque(maxlen=7)
  private angleFilter: MovingAverageFilter;
  private leftFilter: MovingAverageFilter;
  private rightFilter: MovingAverageFilter;

  // Safeguard timestamps
  private repStartTime: number = 0;
  private lastRepCompleteTime: number = 0;

  // Callback for score integration
  public onRepCompleted?: (reps: number) => void;

  constructor(customConfig?: Partial<PushupConfig>) {
    this.config = { ...PUSHUP_CONFIG, ...customConfig };
    this.angleFilter = new MovingAverageFilter(this.config.smoothingFrames);
    this.leftFilter = new MovingAverageFilter(this.config.smoothingFrames);
    this.rightFilter = new MovingAverageFilter(this.config.smoothingFrames);
  }

  /**
   * Resets the detector state and counter
   */
  public reset(): void {
    this.state = 'READY';
    this.repCount = 0;
    this.repStartTime = 0;
    this.lastRepCompleteTime = 0;
    this.angleFilter.reset();
    this.leftFilter.reset();
    this.rightFilter.reset();
  }

  /**
   * Process a single frame of pose landmarks.
   * Returns a structured PushupFrameResult with detection telemetry.
   */
  public processFrame(
    landmarks: NormalizedLandmark[] | undefined | null,
    now: number = performance.now()
  ): PushupFrameResult {
    // 1. Check if landmarks are present
    if (!landmarks || landmarks.length < 33) {
      return {
        poseDetected: false,
        state: this.state,
        angle: 0,
        rawAngle: 0,
        leftAngle: 0,
        rightAngle: 0,
        activeSide: this.activeSide,
        confidence: 0,
        repCompleted: false,
        reps: this.repCount,
        feedbackMessage: 'POSE NOT DETECTED',
        repProgress: 0,
      };
    }

    // 2. Extract arm landmarks matching Hassan's Python script
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    // Calculate left elbow angle
    const rawLeftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const smoothedLeftAngle = this.leftFilter.add(rawLeftAngle);

    // Calculate right elbow angle
    const rawRightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const smoothedRightAngle = this.rightFilter.add(rawRightAngle);

    // Confidence of each arm
    const leftConf = getArmConfidence(landmarks, 'left');
    const rightConf = getArmConfidence(landmarks, 'right');

    // Hassan angle calculation:
    // When both arms are visible, average both arms: (left_angle + right_angle) / 2
    // If one arm is occluded / profile view, use the visible arm
    let rawElbowAngle: number;
    let chosenSide: BodySide;

    if (leftConf >= 0.35 && rightConf >= 0.35) {
      rawElbowAngle = (rawLeftAngle + rawRightAngle) / 2;
      chosenSide = leftConf >= rightConf ? 'left' : 'right';
    } else if (leftConf >= rightConf) {
      rawElbowAngle = rawLeftAngle;
      chosenSide = 'left';
    } else {
      rawElbowAngle = rawRightAngle;
      chosenSide = 'right';
    }

    this.activeSide = chosenSide;
    const confidence = Math.max(leftConf, rightConf);

    // Smooth angle with Hassan's 7-frame buffer
    const smoothAngle = this.angleFilter.add(rawElbowAngle);

    // Check hand placement relative to shoulders (hands must be on floor below/at shoulder level)
    const activeWrist = chosenSide === 'left' ? leftWrist : rightWrist;
    const activeShoulder = chosenSide === 'left' ? leftShoulder : rightShoulder;
    const isHandAboveShoulder = activeWrist.y < activeShoulder.y - 0.05;

    // Check torso posture (reject sitting or standing upright)
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const activeHip = chosenSide === 'left' ? leftHip : rightHip;

    let isUprightSitting = false;
    if (activeHip && activeShoulder && (activeHip.visibility ?? 1) > 0.35 && (activeShoulder.visibility ?? 1) > 0.35) {
      const dy = Math.abs(activeHip.y - activeShoulder.y);
      const dx = Math.abs(activeHip.x - activeShoulder.x);
      const torsoAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      // Torso > 68° indicates upright sitting/standing at desk rather than prone pushup position
      if (torsoAngle > 68 && dy > 0.16) {
        isUprightSitting = true;
      }
    }

    // If confidence is below minimum, alert user
    if (confidence < this.config.minLandmarkConfidence) {
      return {
        poseDetected: true,
        state: this.state,
        angle: smoothAngle,
        rawAngle: rawElbowAngle,
        leftAngle: smoothedLeftAngle,
        rightAngle: smoothedRightAngle,
        activeSide: chosenSide,
        confidence,
        repCompleted: false,
        reps: this.repCount,
        feedbackMessage: 'Keep arms visible in camera frame',
        repProgress: 0,
      };
    }

    // Reject non-pushup postures (sitting upright or hands raised in air)
    if (isUprightSitting) {
      this.state = 'READY';
      this.repStartTime = 0;
      return {
        poseDetected: true,
        state: 'READY',
        angle: smoothAngle,
        rawAngle: rawElbowAngle,
        leftAngle: smoothedLeftAngle,
        rightAngle: smoothedRightAngle,
        activeSide: chosenSide,
        confidence,
        repCompleted: false,
        reps: this.repCount,
        feedbackMessage: 'Get into plank / push-up position on floor',
        repProgress: 0,
      };
    }

    if (isHandAboveShoulder) {
      return {
        poseDetected: true,
        state: this.state,
        angle: smoothAngle,
        rawAngle: rawElbowAngle,
        leftAngle: smoothedLeftAngle,
        rightAngle: smoothedRightAngle,
        activeSide: chosenSide,
        confidence,
        repCompleted: false,
        reps: this.repCount,
        feedbackMessage: 'Keep hands on the floor for push-ups',
        repProgress: 0,
      };
    }

    // 3. PUSH-UP STATE MACHINE (Exact Hassan logic with strict biomechanics)
    let repCompleted = false;

    // Timeout safeguard: if in DOWN for more than 5s, reset state to avoid getting stuck
    if (this.state === 'DOWN' && this.repStartTime > 0 && now - this.repStartTime > this.config.maxRepDurationMs) {
      this.state = smoothAngle > this.config.topAngle ? 'UP' : 'READY';
      this.repStartTime = 0;
    }

    // State Transitions (matching Hassan Python code)
    // Arms relatively straight / Top position
    if (smoothAngle >= this.config.topAngle) {
      if (this.state === 'DOWN') {
        const repDuration = now - this.repStartTime;
        const cooldownElapsed = now - this.lastRepCompleteTime >= this.config.cooldownMs;
        // Verify minimum rep duration to prevent instant glitch jumps
        if (repDuration >= this.config.minRepDurationMs && cooldownElapsed) {
          this.repCount += 1;
          repCompleted = true;
          this.lastRepCompleteTime = now;
          this.state = 'UP';

          // Emit valid rep event to RepRush score system
          if (this.onRepCompleted) {
            this.onRepCompleted(this.repCount);
          }
        } else {
          this.state = 'UP';
        }
        this.repStartTime = 0;
      } else if (this.state === 'READY') {
        this.state = 'UP';
      }
    }
    // Arms bent / Down position (bottom depth reached)
    else if (smoothAngle <= this.config.bottomAngle) {
      if (this.state === 'UP') {
        this.state = 'DOWN';
        this.repStartTime = now;
      }
    }

    // 4. Form feedback with real-time angle and actionable coaching cues
    let feedbackMessage: string;
    const roundedAngle = Math.round(smoothAngle);
    if (smoothAngle >= this.config.topAngle) {
      feedbackMessage =
        this.state === 'UP'
          ? `Arms locked (${roundedAngle}°) • Lower chest down`
          : `Top lockout reached (${roundedAngle}°)`;
    } else if (smoothAngle <= this.config.bottomAngle) {
      feedbackMessage = `Good depth (${roundedAngle}°) • Now push up!`;
    } else if (this.state === 'DOWN') {
      feedbackMessage = `Push up to lockout (${roundedAngle}° / 152°)`;
    } else {
      feedbackMessage = `Lower down deeper (${roundedAngle}° / 105°)`;
    }

    // Calculate percentage progress from TOP (0%) to BOTTOM (100%)
    const angleRange = this.config.topAngle - this.config.bottomAngle;
    const clampedAngle = Math.max(
      this.config.bottomAngle,
      Math.min(this.config.topAngle, smoothAngle)
    );
    const progress = Math.round(
      ((this.config.topAngle - clampedAngle) / angleRange) * 100
    );

    return {
      poseDetected: true,
      state: this.state,
      angle: smoothAngle,
      rawAngle: rawElbowAngle,
      leftAngle: smoothedLeftAngle,
      rightAngle: smoothedRightAngle,
      activeSide: chosenSide,
      confidence,
      repCompleted,
      reps: this.repCount,
      feedbackMessage,
      repProgress: progress,
      durationOfCurrentRepMs:
        this.repStartTime > 0 ? Math.round(now - this.repStartTime) : undefined,
    };
  }

  public getState(): PushupState {
    return this.state;
  }

  public getRepCount(): number {
    return this.repCount;
  }

  public setRepCount(count: number): void {
    this.repCount = count;
  }

  public getConfig(): PushupConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PushupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.angleFilter = new MovingAverageFilter(this.config.smoothingFrames);
    this.leftFilter = new MovingAverageFilter(this.config.smoothingFrames);
    this.rightFilter = new MovingAverageFilter(this.config.smoothingFrames);
  }
}
