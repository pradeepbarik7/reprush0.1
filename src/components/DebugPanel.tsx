/**
 * DebugPanel Component
 * Developer telemetry panel showing real-time joint angles, confidence,
 * FPS, and Push-up State Machine variables.
 */
import React from 'react';
import { Terminal, X, Check, Activity } from 'lucide-react';
import { BodySide, PushupState } from '../vision/types';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  leftAngle: number;
  rightAngle: number;
  activeAngle: number;
  rawAngle: number;
  activeSide: BodySide;
  confidence: number;
  state: PushupState;
  reps: number;
  fps: number;
  repDuration?: number;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  leftAngle,
  rightAngle,
  activeAngle,
  rawAngle,
  activeSide,
  confidence,
  state,
  reps,
  fps,
  repDuration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-neutral-700 z-50 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
        <div className="flex items-center gap-2 font-bold text-neutral-200">
          <Terminal className="w-4 h-4 text-red-500" />
          <span>VISION DEBUG TELEMETRY</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Values */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">FPS / Processing:</span>
          <span className="font-bold text-emerald-400">{fps} fps</span>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Current State:</span>
          <span className="font-bold text-amber-300 px-1.5 py-0.5 bg-amber-500/20 rounded">
            {state}
          </span>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Active Side:</span>
          <span className="font-bold text-white uppercase">{activeSide} Arm</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-neutral-800/60 p-1.5 rounded-lg">
            <div className="text-[10px] text-neutral-400">LEFT ELBOW</div>
            <div className="font-bold text-sm text-neutral-200">{Math.round(leftAngle)}°</div>
          </div>
          <div className="bg-neutral-800/60 p-1.5 rounded-lg">
            <div className="text-[10px] text-neutral-400">RIGHT ELBOW</div>
            <div className="font-bold text-sm text-neutral-200">{Math.round(rightAngle)}°</div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Active Smoothed Angle:</span>
          <span className="font-bold text-red-400">{Math.round(activeAngle)}°</span>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Raw Unsmoothed Angle:</span>
          <span className="text-neutral-300">{Math.round(rawAngle)}°</span>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Confidence Score:</span>
          <span className="font-bold text-cyan-400">{(confidence * 100).toFixed(0)}%</span>
        </div>

        <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
          <span className="text-neutral-400">Rep Count:</span>
          <span className="font-bold text-white">{reps}</span>
        </div>

        {repDuration !== undefined && (
          <div className="flex justify-between items-center bg-neutral-800/60 p-1.5 rounded-lg">
            <span className="text-neutral-400">Rep Duration:</span>
            <span className="text-neutral-300">{repDuration} ms</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex justify-between">
        <span>TOP &gt; 155°</span>
        <span>BOTTOM &lt; 100°</span>
        <span>WINDOW: 5 f</span>
      </div>
    </div>
  );
};
