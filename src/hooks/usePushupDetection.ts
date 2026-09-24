/**
 * Push-up detection hook
 *
 * Coordinates MediaPipe Tasks Vision and the Hassan-style PushupStateMachine.
 * Runs outside React's high-frequency render path with requestAnimationFrame.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { poseDetectorService } from '../vision/poseDetector';
import { PushupDetector } from '../vision/pushupDetector';
import { NormalizedLandmark, PushupFrameResult } from '../vision/types';

export interface UsePushupDetectionOptions {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  onRepCompleted?: (reps: number) => void;
}

export interface UsePushupDetectionReturn {
  frameResult: PushupFrameResult;
  landmarks: NormalizedLandmark[] | null;
  fps: number;
  isModelLoading: boolean;
  modelError: string | null;
  resetDetector: () => void;
  manualIncrementRep: () => void;
}

const INITIAL_FRAME_RESULT: PushupFrameResult = {
  poseDetected: false,
  state: 'READY',
  angle: 0,
  rawAngle: 0,
  leftAngle: 0,
  rightAngle: 0,
  activeSide: 'left',
  confidence: 0,
  repCompleted: false,
  reps: 0,
  feedbackMessage: 'Starting detector...',
  repProgress: 0,
};

export function usePushupDetection({
  videoElement,
  isActive,
  onRepCompleted,
}: UsePushupDetectionOptions): UsePushupDetectionReturn {
  const detectorRef = useRef<PushupDetector>(new PushupDetector());
  const [frameResult, setFrameResult] = useState<PushupFrameResult>(INITIAL_FRAME_RESULT);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Performance & loop refs
  const animFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());
  const onRepCompletedRef = useRef(onRepCompleted);

  useEffect(() => {
    onRepCompletedRef.current = onRepCompleted;
    detectorRef.current.onRepCompleted = (count) => {
      if (onRepCompletedRef.current) {
        onRepCompletedRef.current(count);
      }
    };
  }, [onRepCompleted]);

  // Load MediaPipe Model once
  useEffect(() => {
    let isMounted = true;

    async function initModel() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        await poseDetectorService.getLandmarker();
        if (isMounted) {
          setIsModelLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsModelLoading(false);
          setModelError(
            err instanceof Error ? err.message : 'Failed to load MediaPipe Pose model'
          );
        }
      }
    }

    initModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Frame processing loop
  useEffect(() => {
    if (!isActive || !videoElement || isModelLoading || modelError) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    let isRunning = true;

    const processLoop = () => {
      if (!isRunning) return;

      if (
        videoElement &&
        videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        !videoElement.paused &&
        videoElement.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = videoElement.currentTime;
        const now = performance.now();

        // 1. Detect Pose Landmarks via MediaPipe
        const mpResult = poseDetectorService.detectVideoFrame(videoElement, now);

        if (mpResult && mpResult.landmarks && mpResult.landmarks.length > 0) {
          const currentLandmarks = mpResult.landmarks[0];
          setLandmarks(currentLandmarks);

          // 2. Feed landmarks to Push-up State Machine
          const result = detectorRef.current.processFrame(currentLandmarks, now);
          setFrameResult(result);
        } else {
          setLandmarks(null);
          const result = detectorRef.current.processFrame(undefined, now);
          setFrameResult(result);
        }

        // 3. Compute FPS
        frameCountRef.current++;
        if (now - lastFpsUpdateRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)));
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = now;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(processLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isActive, videoElement, isModelLoading, modelError]);

  const resetDetector = useCallback(() => {
    detectorRef.current.reset();
    setFrameResult(INITIAL_FRAME_RESULT);
    setLandmarks(null);
  }, []);

  // Used strictly in Demo Mode for UI testing without camera
  const manualIncrementRep = useCallback(() => {
    const currentReps = detectorRef.current.getRepCount() + 1;
    detectorRef.current.setRepCount(currentReps);
    setFrameResult((prev) => ({
      ...prev,
      reps: currentReps,
      repCompleted: true,
      feedbackMessage: 'Demo Rep Counted (+1)',
    }));
    if (onRepCompletedRef.current) {
      onRepCompletedRef.current(currentReps);
    }
  }, []);

  return {
    frameResult,
    landmarks,
    fps,
    isModelLoading,
    modelError,
    resetDetector,
    manualIncrementRep,
  };
}
