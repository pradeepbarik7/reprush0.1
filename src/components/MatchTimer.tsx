/**
 * MatchTimer Component
 * Prominent 2-minute match countdown display with time progression
 */
import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface MatchTimerProps {
  timeRemainingSec: number;
  totalDurationSec?: number;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({
  timeRemainingSec,
  totalDurationSec = 120,
}) => {
  const minutes = Math.floor(timeRemainingSec / 60);
  const seconds = timeRemainingSec % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeRemainingSec <= 30 && timeRemainingSec > 0;
  const progressPercent = (timeRemainingSec / totalDurationSec) * 100;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${
        isLowTime
          ? 'bg-amber-500/10 border-amber-500 text-amber-600 animate-pulse'
          : 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          isLowTime ? 'bg-amber-500 text-white' : 'bg-neutral-100 text-neutral-600'
        }`}
      >
        {isLowTime ? <AlertTriangle className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
      </div>

      <div>
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">
          {isLowTime ? 'FINAL SPRINT' : 'MATCH TIME'}
        </div>
        <div className="font-mono text-2xl font-black tracking-tight leading-none">
          {formattedTime}
        </div>
      </div>

      {/* Mini radial/linear indicator */}
      <div className="w-12 bg-neutral-100 h-1.5 rounded-full overflow-hidden ml-1">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isLowTime ? 'bg-amber-500' : 'bg-neutral-800'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
