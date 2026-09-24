/**
 * PlayerCard Component
 * Displays individual player metrics, rep counts, and real-time movement state
 */
import React from 'react';
import { User, Bot, Flame, Activity } from 'lucide-react';
import { PushupState } from '../vision/types';

interface PlayerCardProps {
  type: 'user' | 'opponent';
  name: string;
  reps: number;
  state?: PushupState;
  repProgress?: number;
  feedback?: string;
  isWinning: boolean;
  difficulty?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  type,
  name,
  reps,
  state,
  repProgress = 0,
  feedback,
  isWinning,
  difficulty,
}) => {
  const isUser = type === 'user';

  // Format State Label with clean colors
  const getStateColor = (s?: PushupState) => {
    switch (s) {
      case 'DOWN':
      case 'BOTTOM':
        return 'bg-emerald-500 text-white';
      case 'GOING_DOWN':
        return 'bg-amber-500 text-white';
      case 'GOING_UP':
        return 'bg-cyan-500 text-white';
      case 'UP':
      case 'TOP':
        return 'bg-neutral-800 text-white';
      case 'READY':
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  return (
    <div
      className={`relative rounded-3xl p-5 border transition-all duration-300 ${
        isUser
          ? isWinning
            ? 'bg-white border-red-400 shadow-md shadow-red-100 ring-2 ring-red-400/20'
            : 'bg-white border-neutral-200 shadow-sm'
          : isWinning
          ? 'bg-white border-blue-400 shadow-md shadow-blue-100 ring-2 ring-blue-400/20'
          : 'bg-white border-neutral-200 shadow-sm'
      }`}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
              isUser ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-neutral-900 text-base">{name}</h3>
              {isUser ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                  P1 RED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                  {difficulty || 'P2 BLUE'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              {isUser ? 'Live Camera Detection' : 'Simulated Rival'}
            </p>
          </div>
        </div>

        {/* Momentum / Winning Tag */}
        {isWinning && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              isUser ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>LEAD</span>
          </div>
        )}
      </div>

      {/* Main Rep Counter */}
      <div className="flex items-baseline justify-between py-2 border-y border-neutral-100 mb-3">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Valid Reps
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-5xl font-black font-mono tracking-tight ${
              isUser ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {reps}
          </span>
          <span className="text-sm font-bold text-neutral-400">REP</span>
        </div>
      </div>

      {/* Dynamic Feedback & State for User */}
      {isUser ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              Movement Cycle:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide uppercase transition-colors ${getStateColor(
                state
              )}`}
            >
              {state?.replace('_', ' ') || 'READY'}
            </span>
          </div>

          {/* Depth progress bar */}
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                state === 'BOTTOM' ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, repProgress))}%` }}
            />
          </div>

          {feedback && (
            <p className="text-[11px] text-neutral-500 truncate text-center font-medium">
              {feedback}
            </p>
          )}
        </div>
      ) : (
        /* Opponent Status */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Target Pace:</span>
            <span className="font-mono text-neutral-800 font-bold text-xs">
              ~{difficulty === 'rookie' ? '18-22' : difficulty === 'elite' ? '45-55' : '32-38'} reps/2m
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, reps * 3.5)}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 text-center font-medium">
            AI pacing dynamically simulated
          </p>
        </div>
      )}
    </div>
  );
};
