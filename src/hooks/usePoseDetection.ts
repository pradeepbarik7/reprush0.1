/**
 * usePoseDetection Hook
 *
 * Connects the live camera video stream, MediaPipe Tasks Vision,
 * and the proven Hassan push-up detection engine to the RepRush live battle view.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamera } from './useCamera';
import { poseLandmarkerService } from '../vision/poseDetector';
import { PushupDetector } from '../vision/pushupDetector';
import { PushUpMetrics, PoseState } from '../types';
import { NormalizedLandmark, PushupFrameResult } from '../vision/types';

export type CameraStatus =
  | 'IDLE'
  | 'STARTING'
  | 'ACTIVE'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'STOPPED';

export interface DebugTelemetry {
  fps: number;
  poseDetected: boolean;
  leftElbow: number;
  rightElbow: number;
  averageElbow: number;
  bodyAlignment: number;
  confidence: number;
  state: string;
  form: string;
  reps: number;
  lastEvent: string;
}

export interface UsePoseDetectionOptions {
  onValidRep: (count: number, metrics?: PushUpMetrics) => void;
}

export function usePoseDetection({ onValidRep }: UsePoseDetectionOptions) {
  const {
    videoRef,
    attachVideoRef,
    stream,
    isLoading: isCameraStarting,
    error: cameraError,
    permissionDenied,
    startCamera: startCamInternal,
    stopCamera: stopCamInternal,
  } = useCamera();

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('IDLE');
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [poseState, setPoseState] = useState<PoseState>('READY');
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'good' | 'action' | 'warning' | 'neutral';
  }>({
    text: 'POSITION YOUR CAMERA SIDEWAYS',
    type: 'neutral',
  });
  const [metrics, setMetrics] = useState<PushUpMetrics | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [detectionResult, setDetectionResult] = useState<PushupFrameResult | null>(null);
  const [debugTelemetry, setDebugTelemetry] = useState<DebugTelemetry | null>(null);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 640,
    height: 480,
  });

  // Pushup detector instance (Hassan engine)
  const detectorRef = useRef<PushupDetector | null>(null);
  if (!detectorRef.current) {
    detectorRef.current = new PushupDetector();
  }

  const animationFrameIdRef = useRef<number | null>(null);
  const lastFpsTimestampRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  const currentFpsRef = useRef<number>(30);
  const lastEventRef = useRef<string>('Detector Ready');

  // Wire detector callback
  useEffect(() => {
    if (detectorRef.current) {
      detectorRef.current.onRepCompleted = (count: number) => {
        lastEventRef.current = `+1 REP (#${count})`;
        const currentMetrics: PushUpMetrics = {
          elbowAngle: detectorRef.current?.getConfig().topAngle || 155,
          smoothedElbowAngle: 155,
          activeSide: 'left',
          confidence: 0.9,
          fps: currentFpsRef.current,
        };
        onValidRep(count, currentMetrics);
      };
    }
  }, [onValidRep]);

  // Pre-load MediaPipe PoseLandmarker model once on mount
  useEffect(() => {
    let isMounted = true;
    async function initModel() {
      try {
        setIsModelLoading(true);
        await poseLandmarkerService.init();
        if (isMounted) {
          setIsModelLoading(false);
        }
      } catch (err) {
        console.error('RepRush: Error initializing MediaPipe Landmarker:', err);
        if (isMounted) {
          setIsModelLoading(false);
        }
      }
    }
    initModel();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update camera status when stream or errors change
  useEffect(() => {
    if (permissionDenied) {
      setCameraStatus('DENIED');
    } else if (cameraError) {
      setCameraStatus('UNAVAILABLE');
    } else if (isCameraStarting) {
      setCameraStatus('STARTING');
    } else if (stream && stream.active) {
      setCameraStatus('ACTIVE');
    } else {
      setCameraStatus('IDLE');
    }
  }, [stream, isCameraStarting, cameraError, permissionDenied]);

  // Main Detection Loop (requestAnimationFrame)
  useEffect(() => {
    if (cameraStatus !== 'ACTIVE' || !videoRef.current) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    let isRunning = true;

    const runFrame = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      if (video) {
        if (stream && video.srcObject !== stream) {
          video.srcObject = stream;
        }
        if (video.srcObject && video.paused) {
          video.play().catch(() => {});
        }
      }

      if (video && video.readyState >= 2 && !video.paused && !video.ended) {
        const now = performance.now();

        // Update video dimensions if ready
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          if (
            videoDimensions.width !== video.videoWidth ||
            videoDimensions.height !== video.videoHeight
          ) {
            setVideoDimensions({
              width: video.videoWidth,
              height: video.videoHeight,
            });
          }
        }

        // Calculate FPS
        framesCountRef.current += 1;
        if (now - lastFpsTimestampRef.current >= 1000) {
          currentFpsRef.current = Math.round(
            (framesCountRef.current * 1000) / (now - lastFpsTimestampRef.current)
          );
          framesCountRef.current = 0;
          lastFpsTimestampRef.current = now;
        }

        try {
          // 1. MediaPipe Tasks Vision Detection
          const rawLandmarks = poseLandmarkerService.detectForVideo(video, now);

          if (rawLandmarks && rawLandmarks.length > 0) {
            setLandmarks(rawLandmarks);

            // 2. Hassan Push-up State Machine
            const frameResult = detectorRef.current!.processFrame(rawLandmarks, now);
            setDetectionResult(frameResult);
            setPoseState(frameResult.state);

            // 3. Format Feedback text
            let fbType: 'good' | 'action' | 'warning' | 'neutral' = 'action';
            if (frameResult.state === 'DOWN' || frameResult.state === 'BOTTOM') {
              fbType = 'good';
            } else if (frameResult.state === 'UP' || frameResult.state === 'TOP') {
              fbType = 'good';
            } else if (!frameResult.poseDetected) {
              fbType = 'warning';
            }

            setFeedback({
              text: frameResult.feedbackMessage || 'In motion...',
              type: fbType,
            });

            // 4. Update PushUpMetrics
            const m: PushUpMetrics = {
              elbowAngle: Math.round(frameResult.rawAngle),
              smoothedElbowAngle: Math.round(frameResult.angle),
              activeSide: frameResult.activeSide,
              bodyAlignmentAngle: 175,
              confidence: frameResult.confidence,
              isPlankHorizontal: true,
              lastRepDurationMs: frameResult.durationOfCurrentRepMs || 0,
              fps: currentFpsRef.current,
            };
            setMetrics(m);

            // 5. Update Debug Telemetry
            setDebugTelemetry({
              fps: currentFpsRef.current,
              poseDetected: frameResult.poseDetected,
              leftElbow: Math.round(frameResult.leftAngle),
              rightElbow: Math.round(frameResult.rightAngle),
              averageElbow: Math.round(frameResult.angle),
              bodyAlignment: 175,
              confidence: frameResult.confidence,
              state: frameResult.state,
              form: frameResult.feedbackMessage,
              reps: frameResult.reps,
              lastEvent: lastEventRef.current,
            });
          } else {
            setLandmarks(null);
            setFeedback({
              text: 'POSITION YOUR CAMERA SIDEWAYS',
              type: 'warning',
            });
          }
        } catch (e) {
          console.warn('RepRush: Pose loop frame error', e);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(runFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(runFrame);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [cameraStatus, videoRef, videoDimensions.width, videoDimensions.height]);

  const startCamera = useCallback(async (): Promise<boolean> => {
    detectorRef.current?.reset();
    return await startCamInternal();
  }, [startCamInternal]);

  const stopCamera = useCallback(() => {
    stopCamInternal();
    setCameraStatus('STOPPED');
  }, [stopCamInternal]);

  return {
    videoRef,
    attachVideoRef,
    stream,
    cameraStatus,
    cameraError,
    permissionDenied,
    isModelLoading,
    poseState,
    feedback,
    metrics,
    landmarks,
    detectionResult,
    debugTelemetry,
    showSkeleton,
    setShowSkeleton,
    videoDimensions,
    startCamera,
    stopCamera,
  };
}
