/**
 * MediaPipe Tasks Vision Pose Landmarker Loader and Runner
 *
 * Provides a high-performance, browser-local pose estimation pipeline.
 * Initializes once, reuses instance across match rounds, supports GPU with CPU fallback.
 */
import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_POSE_MODEL_URL, MEDIAPIPE_VISION_WASM_URL } from './config';
import { NormalizedLandmark } from './types';

class PoseDetectorService {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<PoseLandmarker> | null = null;
  private loadError: string | null = null;
  private lastTimestamp: number = -1;

  /**
   * Initializes or returns the cached PoseLandmarker instance
   */
  public async init(): Promise<PoseLandmarker> {
    return this.getLandmarker();
  }

  public async getLandmarker(): Promise<PoseLandmarker> {
    if (this.landmarker) {
      return this.landmarker;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.loadError = null;

    this.initPromise = (async () => {
      try {
        // 1. Resolve WASM assets with primary CDN and fallback
        let vision;
        try {
          vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_VISION_WASM_URL);
        } catch (wasmErr) {
          console.warn('RepRush: Primary WASM path failed, trying fallback:', wasmErr);
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
          );
        }

        // 2. Attempt creation with GPU acceleration first
        try {
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MEDIAPIPE_POSE_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.45,
            minPosePresenceConfidence: 0.45,
            minTrackingConfidence: 0.45,
          });
        } catch (gpuError) {
          console.warn('RepRush: GPU delegate failed, falling back to CPU delegate:', gpuError);
          // Fallback to CPU delegate
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MEDIAPIPE_POSE_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.45,
            minPosePresenceConfidence: 0.45,
            minTrackingConfidence: 0.45,
          });
        }

        this.isInitializing = false;
        return this.landmarker;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.loadError = errorMsg;
        this.isInitializing = false;
        this.initPromise = null;
        console.error('RepRush: Failed to initialize MediaPipe PoseLandmarker:', err);
        throw new Error(`MediaPipe model could not load: ${errorMsg}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Detect pose in a video frame with a guaranteed strictly monotonic timestamp
   */
  public detectVideoFrame(
    video: HTMLVideoElement,
    timestamp: number
  ): PoseLandmarkerResult | null {
    if (!this.landmarker) return null;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    // Enforce strictly increasing integer milliseconds as required by MediaPipe Tasks Vision
    let safeTimestamp = Math.floor(timestamp);
    if (safeTimestamp <= this.lastTimestamp) {
      safeTimestamp = this.lastTimestamp + 1;
    }
    this.lastTimestamp = safeTimestamp;

    try {
      return this.landmarker.detectForVideo(video, safeTimestamp);
    } catch (err) {
      console.warn('RepRush: Frame detection warning:', err);
      return null;
    }
  }

  public detectForVideo(
    video: HTMLVideoElement,
    timestamp: number
  ): NormalizedLandmark[] | null {
    const result = this.detectVideoFrame(video, timestamp);
    if (result && result.landmarks && result.landmarks.length > 0) {
      return result.landmarks[0] as NormalizedLandmark[];
    }
    return null;
  }

  public isReady(): boolean {
    return this.landmarker !== null;
  }

  public getLoadError(): string | null {
    return this.loadError;
  }

  public release(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (e) {
        console.error('Error closing landmarker:', e);
      }
      this.landmarker = null;
      this.initPromise = null;
    }
  }
}

export const poseDetectorService = new PoseDetectorService();
export const poseLandmarkerService = poseDetectorService;
