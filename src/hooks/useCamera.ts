/**
 * Custom hook for Camera stream management
 * 
 * Handles user-facing camera permissions, video element binding,
 * and strict track stopping on exit or unmount.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  attachVideoRef: (node: HTMLVideoElement | null) => void;
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  permissionDenied: boolean;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // Callback ref to bind DOM video element immediately upon mounting
  const attachVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.setAttribute('playsinline', 'true');
      if (streamRef.current && node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
        node.play().catch((err) => {
          console.warn('RepRush: Autoplay on node attach failed:', err);
        });
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('RepRush: Error stopping camera track', e);
        }
      });
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported by your current browser.');
      return false;
    }

    // Stop existing stream if any
    stopCamera();

    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // Prefer front camera for pushup detection
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Attempt immediate binding if video element is already present in DOM
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play rejected:', e));
      }

      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err as { name?: string; message?: string };

      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission was denied. Camera access is required for live rep detection.');
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        setError('No camera found on this device. Please connect a webcam.');
      } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
        setError('Camera is currently in use by another application.');
      } else {
        setError(`Unable to access camera: ${errorObj.message || 'Unknown error'}`);
      }
      return false;
    }
  }, [stopCamera]);

  // Keep video element srcObject synchronized whenever stream or video element updates
  useEffect(() => {
    if (stream && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.muted = true;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.play().catch((err) => {
        console.warn('RepRush: Autoplay in stream effect prevented:', err);
      });
    }
  }, [stream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    attachVideoRef,
    stream,
    isLoading,
    error,
    startCamera,
    stopCamera,
    permissionDenied,
  };
}
