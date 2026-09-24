/**
 * BattleBar Component
 *
 * The central battle territory tug-of-war meter in RepRush.
 * Visually contracts and expands based on the rep difference between
 * Player 1 (Red) and Opponent (Blue).
 */
import React from 'react';
import { Swords, ShieldAlert, Trophy } from 'lucide-react';

interface BattleBarProps {
  userReps: number;
  opponentReps: number;
  territoryPercentUser: number;
  leader: 'user' | 'opponent' | 'tie';
  repDifference: number;
}

export const BattleBar: React.FC<BattleBarProps> = ({
  userReps,
  opponentReps,
  territoryPercentUser,
  leader,
  repDifference,
}) => {
  const territoryPercentOpponent = 100 - territoryPercentUser;
  const absDiff = Math.abs(repDifference);

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80">
      {/* Top Labels */}
      <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-red-600">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>YOU (RED) — {territoryPercentUser}%</span>
        </div>

        {/* Center Dynamic Status Badge */}
        <div className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-semibold flex items-center gap-1 shadow-2xs">
          {leader === 'user' ? (
            <>
              <Trophy className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-600">+{absDiff} REP LEAD</span>
            </>
          ) : leader === 'opponent' ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-blue-600">BEHIND BY {absDiff}</span>
            </>
          ) : (
            <>
              <Swords className="w-3.5 h-3.5 text-neutral-500" />
              <span>TERRITORY TIED (50/50)</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-blue-600">
          <span>{territoryPercentOpponent}% — OPPONENT (BLUE)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* Dynamic Territory Tug-of-War Bar */}
      <div className="relative h-6 w-full bg-neutral-200 rounded-xl overflow-hidden p-0.5 flex">
        {/* User Territory (Red) */}
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-l-lg transition-all duration-500 ease-out relative flex items-center justify-start px-2"
          style={{ width: `${territoryPercentUser}%` }}
        >
          {territoryPercentUser >= 15 && (
            <span className="text-[11px] font-extrabold text-white/90 drop-shadow-xs font-mono">
              {userReps} REPS
            </span>
          )}
        </div>

        {/* Dynamic Center Clash Indicator */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md z-10 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${territoryPercentUser}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 border border-white rounded-full flex items-center justify-center">
            <span className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>

        {/* Opponent Territory (Blue) */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-lg transition-all duration-500 ease-out relative flex items-center justify-end px-2"
          style={{ width: `${territoryPercentOpponent}%` }}
        >
          {territoryPercentOpponent >= 15 && (
            <span className="text-[11px] font-extrabold text-white/90 drop-shadow-xs font-mono">
              {opponentReps} REPS
            </span>
          )}
        </div>
      </div>

      {/* Territory Control Context */}
      <div className="flex justify-between items-center mt-2 text-[11px] text-neutral-400">
        <span>Push deeper and lock out to capture territory</span>
        <span>2:00 Competitive Territory Match</span>
      </div>
    </div>
  );
};
