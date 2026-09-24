/**
 * CameraPanel Component
 * Displays live camera feed with overlayed pose skeleton, state badges,
 * rep celebration banner, and graceful permission error handling.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { PoseOverlay } from './PoseOverlay';
import { BodySide, NormalizedLandmark, PushupState } from '../vision/types';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: NormalizedLandmark[] | null;
  activeSide: BodySide;
  state: PushupState;
  angle: number;
  poseDetected: boolean;
  repCompleted: boolean;
  feedbackMessage: string;
  isCameraActive: boolean;
  cameraError: string | null;
  permissionDenied: boolean;
  isModelLoading: boolean;
  modelError: string | null;
  isDemoMode?: boolean;
  onRetryCamera?: () => void;
  onSwitchToDemo?: () => void;
  onManualRep?: () => void;
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef,
  landmarks,
  activeSide,
  state,
  angle,
  poseDetected,
  repCompleted,
  feedbackMessage,
  isCameraActive,
  cameraError,
  permissionDenied,
  isModelLoading,
  modelError,
  isDemoMode = false,
  onRetryCamera,
  onSwitchToDemo,
  onManualRep,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [showRepBurst, setShowRepBurst] = useState(false);

  // Resize canvas according to container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 640,
          height: containerRef.current.clientHeight || 480,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Trigger burst flash on valid rep
  useEffect(() => {
    if (repCompleted) {
      setShowRepBurst(true);
      const timer = setTimeout(() => setShowRepBurst(false), 900);
      return () => clearTimeout(timer);
    }
  }, [repCompleted]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-h-[520px] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/80 shadow-md flex items-center justify-center"
    >
      {/* 1. Normal Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        onLoadedMetadata={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
        className={`w-full h-full object-cover transform -scale-x-100 ${
          isDemoMode || !isCameraActive || cameraError ? 'hidden' : 'block'
        }`}
      />

      {/* 2. Pose Overlay Canvas */}
      {!isDemoMode && isCameraActive && !cameraError && (
        <div className="absolute inset-0 pointer-events-none transform -scale-x-100">
          <PoseOverlay
            landmarks={landmarks}
            activeSide={activeSide}
            state={state}
            angle={angle}
            width={dimensions.width}
            height={dimensions.height}
            repCompletedBurst={showRepBurst}
          />
        </div>
      )}

      {/* 3. Demo Mode Simulated View */}
      {isDemoMode && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            DEMO MODE (Simulation)
          </span>
          <p className="text-sm text-neutral-300 max-w-sm mb-6">
            Testing UI without live camera. Use the manual rep button to simulate Player 1 reps and inspect territory mechanics.
          </p>

          <button
            onClick={onManualRep}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer text-base"
          >
            <span>+ COUNT REP (DEMO)</span>
          </button>
        </div>
      )}

      {/* 4. Model Loading Screen */}
      {!isDemoMode && isCameraActive && isModelLoading && !cameraError && (
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-20">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-3" />
          <p className="font-bold text-base">Loading MediaPipe Pose Engine...</p>
          <p className="text-xs text-neutral-400 mt-1">Downloading browser-local vision model</p>
        </div>
      )}

      {/* 5. Camera Permission / Error Fallback */}
      {!isDemoMode && (cameraError || permissionDenied || modelError) && (
        <div className="absolute inset-0 bg-neutral-900/95 flex flex-col items-center justify-center p-8 text-center text-white z-30">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
            <CameraOff className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-extrabold mb-1">
            {permissionDenied ? 'Camera Access Required' : 'Camera Connection Issue'}
          </h4>
          <p className="text-sm text-neutral-300 max-w-md mb-6 leading-relaxed">
            {cameraError || modelError || 'Camera access is required for live rep detection.'}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {onRetryCamera && (
              <button
                onClick={onRetryCamera}
                className="px-5 py-2.5 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-colors flex items-center gap-2 text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
            )}

            {onSwitchToDemo && (
              <button
                onClick={onSwitchToDemo}
                className="px-5 py-2.5 bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold rounded-xl hover:bg-neutral-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Switch to Demo Mode</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Top Status Bar Overlays */}
      {!isDemoMode && isCameraActive && !cameraError && (
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
          {/* Left: Camera & Pose status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-xs font-semibold shadow-xs border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Camera Active</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-xs border ${
                poseDetected
                  ? 'bg-neutral-900/80 text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-900/80 text-amber-400 border-amber-500/30'
              }`}
            >
              {poseDetected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pose Detected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Searching for Pose...</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Active Tracking Arm */}
          {poseDetected && (
            <div className="px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-neutral-300 text-xs font-mono font-medium border border-white/10">
              Tracking: <span className="text-white font-bold uppercase">{activeSide} Arm</span>
            </div>
          )}
        </div>
      )}

      {/* 7. Bottom Center Live Feedback Pill */}
      {!isDemoMode && isCameraActive && !cameraError && feedbackMessage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div
            className={`px-4 py-2 rounded-full backdrop-blur-md text-xs font-bold tracking-wide shadow-lg border flex items-center gap-2 ${
              state === 'BOTTOM' || state === 'DOWN'
                ? 'bg-emerald-600/90 text-white border-emerald-400/40'
                : 'bg-neutral-900/85 text-white border-white/10'
            }`}
          >
            <span>{feedbackMessage}</span>
          </div>
        </div>
      )}

      {/* 8. Full-screen "+1 REP" Celebration Burst */}
      {showRepBurst && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30 animate-in fade-in zoom-in-75 duration-200">
          <div className="px-8 py-4 rounded-3xl bg-red-600/90 backdrop-blur-md text-white shadow-2xl border border-red-400 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
            <span className="font-black text-4xl tracking-tight font-mono">+1 REP!</span>
          </div>
        </div>
      )}
    </div>
  );
};
