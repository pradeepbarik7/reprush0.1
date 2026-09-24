/**
 * ResultModal Component
 * Post-match victory and performance breakdown screen.
 */
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Flame, Swords, ShieldAlert, Award } from 'lucide-react';
import { BattleBar } from './BattleBar';

interface ResultModalProps {
  userReps: number;
  opponentReps: number;
  territoryPercentUser: number;
  winner: 'user' | 'opponent' | 'draw' | null;
  repDifference: number;
  onRematch: () => void;
  onHome: () => void;
  isDemoMode?: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  userReps,
  opponentReps,
  territoryPercentUser,
  winner,
  repDifference,
  onRematch,
  onHome,
  isDemoMode = false,
}) => {
  const isWin = winner === 'user';
  const isDraw = winner === 'draw';

  // Trigger celebration confetti on user victory
  useEffect(() => {
    if (isWin) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [isWin]);

  const userRepsPerMin = (userReps / 2).toFixed(1);
  const opponentRepsPerMin = (opponentReps / 2).toFixed(1);

  return (
    <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div
          className={`p-6 text-center text-white relative ${
            isWin
              ? 'bg-gradient-to-b from-red-600 to-red-500'
              : isDraw
              ? 'bg-gradient-to-b from-neutral-700 to-neutral-800'
              : 'bg-gradient-to-b from-blue-600 to-blue-700'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white/90 text-xs font-bold uppercase tracking-wider mb-2">
            RepRush Battle Ended
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            {isWin ? 'VICTORY!' : isDraw ? 'DRAW GAME!' : 'DEFEAT'}
          </h2>

          <p className="text-white/80 text-sm mt-1 max-w-md mx-auto font-medium">
            {isWin
              ? `You conquered ${territoryPercentUser}% of the arena with ${userReps} valid push-ups!`
              : isDraw
              ? 'Both warriors tied the battle with equal repetitions!'
              : `Opponent pushed ahead by ${Math.abs(repDifference)} reps. Train and take back your territory!`}
          </p>

          {isDemoMode && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-neutral-900 uppercase">
              Demo Simulation Record
            </span>
          )}
        </div>

        {/* Reps Scoreboard */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 (Red) */}
            <div className="bg-red-50/70 rounded-2xl p-4 border border-red-100 text-center">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                YOUR REPS (P1 RED)
              </span>
              <div className="text-5xl font-black font-mono text-red-600 my-1">
                {userReps}
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Pace: {userRepsPerMin} reps/min
              </span>
            </div>

            {/* Opponent (Blue) */}
            <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 text-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                OPPONENT (P2 BLUE)
              </span>
              <div className="text-5xl font-black font-mono text-blue-600 my-1">
                {opponentReps}
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Pace: {opponentRepsPerMin} reps/min
              </span>
            </div>
          </div>

          {/* Territory Result Bar */}
          <div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Final Territory Breakdown
            </div>
            <BattleBar
              userReps={userReps}
              opponentReps={opponentReps}
              territoryPercentUser={territoryPercentUser}
              leader={isWin ? 'user' : isDraw ? 'tie' : 'opponent'}
              repDifference={repDifference}
            />
          </div>

          {/* Detailed Match Stats */}
          <div className="grid grid-cols-3 gap-2 bg-neutral-50 rounded-2xl p-3 border border-neutral-100 text-center">
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase">DURATION</div>
              <div className="font-extrabold text-neutral-800 text-sm">2m 00s</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase">LEAD GAP</div>
              <div className="font-extrabold text-neutral-800 text-sm">
                {repDifference > 0 ? `+${repDifference}` : `${repDifference}`} reps
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase">CV SENSOR</div>
              <div className="font-extrabold text-emerald-600 text-sm">100% Valid</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onRematch}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-extrabold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REMATCH (2:00)</span>
            </button>

            <button
              onClick={onHome}
              className="py-3.5 px-6 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:scale-98 text-neutral-700 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Home className="w-4 h-4" />
              <span>BACK TO HOME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
