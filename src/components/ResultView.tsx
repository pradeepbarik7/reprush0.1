import React, { useEffect, useState } from 'react';
import { BattleResultData } from '../types';
import { BattleTerritoryBar } from './BattleTerritoryBar';
import { ShareModal } from './ShareModal';
import { playClickSound, playVictorySound, playDefeatSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Swords, 
  User, 
  Share2, 
  Sparkles, 
  Flame, 
  CheckCircle, 
  ShieldAlert, 
  Wallet, 
  ArrowRight 
} from 'lucide-react';

interface ResultViewProps {
  result: BattleResultData;
  onRematch: () => void;
  onNewBattle: () => void;
  onViewProfile: () => void;
  onContinueTournament?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onRematch,
  onNewBattle,
  onViewProfile,
  onContinueTournament,
}) => {
  const [animatedRating, setAnimatedRating] = useState(result.previousRating);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isUserWinner = result.winner === 'user';
  const isDraw = result.winner === 'tie' || result.winner === 'draw';
  const isTournament = result.isTournamentMatch;

  // Confetti and Fanfare / Defeat Sound
  useEffect(() => {
    if (isUserWinner) {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'],
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }
    } else if (!isDraw) {
      playDefeatSound();
    }

    // Number counting animation for rating (up or down)
    const duration = 1200;
    const delta = Math.abs(result.newRating - result.previousRating);
    const steps = Math.max(delta, 1);
    const stepTime = duration / steps;
    let current = result.previousRating;

    const interval = setInterval(() => {
      if (isUserWinner) {
        current += 1;
        if (current >= result.newRating) {
          setAnimatedRating(result.newRating);
          clearInterval(interval);
        } else {
          setAnimatedRating(current);
        }
      } else {
        current -= 1;
        if (current <= result.newRating) {
          setAnimatedRating(result.newRating);
          clearInterval(interval);
        } else {
          setAnimatedRating(current);
        }
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [result, isUserWinner, isDraw]);

  const stake = result.stakeAmount || 10;
  const reward = result.winnerReward || 0;
  const net = result.netResult || (isUserWinner ? reward - stake : -stake);
  const prevBal = result.prevBalance || 240;
  const newBal = result.newBalance || (prevBal + (isUserWinner ? reward : 0));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 select-none animate-fade-in">
      {/* Result Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-xl text-center relative overflow-hidden">
        {/* Subtle accent glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none ${
            isUserWinner ? 'bg-red-500/15' : isDraw ? 'bg-amber-500/15' : 'bg-blue-500/15'
          }`}
        />

        {/* Match Outcome Header */}
        <div className="relative z-10 mb-8 space-y-2">
          {/* Trophy / Result Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-xs mb-2 ${
              isUserWinner
                ? 'bg-red-50 border-red-200 text-red-800'
                : isDraw
                ? 'bg-gray-100 border-gray-300 text-gray-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {isUserWinner ? (
              <Trophy className="w-4 h-4 text-red-500" />
            ) : isDraw ? (
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            ) : (
              <Trophy className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-xs font-extrabold uppercase tracking-wider font-mono">
              {isTournament ? (
                isUserWinner ? (
                  result.tournamentRound === 'Final'
                    ? '🏆 NO MERCY TOURNAMENT CHAMPION'
                    : `🔥 ${result.tournamentRound?.toUpperCase()} VICTORY`
                ) : (
                  `💀 ${result.opponent.name.toUpperCase()} WINS (BLUE) • ELIMINATED`
                )
              ) : isUserWinner ? (
                '🏆 YOU WIN (RED)'
              ) : isDraw ? (
                'MATCH TIED • STAKE REFUNDED'
              ) : (
                `⚔️ ${result.opponent.name.toUpperCase()} WINS (BLUE)`
              )}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950">
            {isTournament
              ? isUserWinner
                ? result.tournamentRound === 'Final'
                  ? 'CHAMPION!'
                  : `${result.tournamentRound?.toUpperCase()} WON!`
                : `${result.opponent.name.toUpperCase()} WINS`
              : isUserWinner
              ? 'YOU WIN!'
              : isDraw
              ? 'MATCH DRAW'
              : `${result.opponent.name.toUpperCase()} WINS!`}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {isTournament
              ? isUserWinner
                ? result.tournamentRound === 'Final'
                  ? 'All 3 tournament bouts conquered! ₹50 Demo Champion Prize awarded.'
                  : result.tournamentRound === 'Quarterfinal'
                  ? `Dominant win against ${result.opponent.name}! You advance to the Semifinals.`
                  : `Semifinal triumph against ${result.opponent.name}! You advance to the Grand Final.`
                : `${result.opponent.name} (Blue) won the ${result.tournamentRound} with ${result.opponentReps} reps vs your ${result.userReps} reps.`
              : isUserWinner
              ? `Great battle! You (Red) scored ${result.userReps} reps against ${result.opponent.name}'s ${result.opponentReps} reps.`
              : isDraw
              ? `Exact rep tie (${result.userReps} - ${result.opponentReps})! Simulated entry stake refunded.`
              : `${result.opponent.name} (Blue) won the duel with ${result.opponentReps} reps vs your ${result.userReps} reps.`}
          </p>
        </div>

        {/* Rep Scores Breakdown */}
        <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-8 items-center max-w-xl mx-auto mb-6 bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
          {/* You (Red) */}
          <div className={`text-center p-3 rounded-xl transition-all ${isUserWinner ? 'bg-red-50/70 border border-red-200' : ''}`}>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-gray-900 mb-1 flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>YOU (RED)</span>
            </div>
            {isUserWinner && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white mb-1 shadow-xs">
                WINNER 👑
              </span>
            )}
            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-red-600">
              {result.userReps}
            </div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              REPS
            </div>
          </div>

          {/* Opponent (Blue) */}
          <div className={`text-center p-3 rounded-xl transition-all ${!isUserWinner && !isDraw ? 'bg-blue-50/70 border border-blue-200' : ''}`}>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-gray-900 mb-1 flex items-center justify-center gap-1.5">
              <span>{result.opponent.name.toUpperCase()} (BLUE)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            {!isUserWinner && !isDraw && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white mb-1 shadow-xs">
                WINNER 👑
              </span>
            )}
            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-blue-600">
              {result.opponentReps}
            </div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              REPS
            </div>
          </div>
        </div>

        {/* DEMO WALLET SIMULATION CARD */}
        <div className="relative z-10 max-w-xl mx-auto bg-[#0F172A] border border-gray-800 rounded-2xl p-5 mb-6 text-white text-left shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                Demo Payout Simulation
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              SIMULATED ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs font-mono">
            <div>
              <span className="text-gray-400 block text-[10px]">Demo Entry:</span>
              <span className="text-white font-extrabold text-sm sm:text-base">
                ₹{stake.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Demo Reward:</span>
              <span className={`font-extrabold text-sm sm:text-base ${isUserWinner ? 'text-emerald-400' : 'text-gray-400'}`}>
                ₹{reward.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Net Result:</span>
              <span className={`font-extrabold text-sm sm:text-base ${
                isUserWinner ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isUserWinner ? `+₹${net.toFixed(2)}` : isDraw ? '₹0.00' : `-₹${stake.toFixed(0)}`}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Demo Balance:</span>
              <span className="text-white font-extrabold text-xs sm:text-sm flex items-center gap-1">
                <span>₹{prevBal.toFixed(0)}</span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
                <span className="text-emerald-300">₹{newBal.toFixed(0)}</span>
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-gray-800 text-[10px] text-gray-400 leading-tight">
            No real money is involved. Balances and rewards are simulated for product demonstration only.
          </div>
        </div>

        {/* Frozen Territory Bar */}
        <div className="relative z-10 max-w-xl mx-auto mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">
            FINAL TERRITORIAL SPLIT
          </div>
          <BattleTerritoryBar
            userReps={result.userReps}
            opponentReps={result.opponentReps}
            userName="YOU"
            opponentName={result.opponent.name}
            isFrozen={true}
          />
        </div>

        {/* Rating Adjustment & Accolades */}
        <div className="relative z-10 max-w-xl mx-auto bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs mb-8">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rating Adjustment
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-extrabold text-gray-950">
                  {animatedRating}
                </span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded border ${
                    result.ratingDelta > 0
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : result.ratingDelta === 0
                      ? 'text-gray-600 bg-gray-50 border-gray-200'
                      : 'text-rose-600 bg-rose-50 border-rose-200'
                  }`}
                >
                  {result.ratingDelta > 0 ? `+${result.ratingDelta}` : result.ratingDelta} Rating
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 block">Previous: {result.previousRating}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                Gold Division
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2">
            {result.isPersonalBest && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                PERSONAL BEST (2-MIN)
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Peak Combo: x{result.maxCombo || 4}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              100% Rep Validity
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          {isTournament ? (
            <>
              {isUserWinner ? (
                result.tournamentRound === 'Final' ? (
                  <button
                    id="result-claim-trophy-btn"
                    onClick={() => {
                      playClickSound();
                      onContinueTournament?.();
                    }}
                    className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5 text-gray-950" />
                    <span>CLAIM CHAMPION TROPHY</span>
                  </button>
                ) : result.tournamentRound === 'Quarterfinal' ? (
                  <button
                    id="result-next-tournament-btn"
                    onClick={() => {
                      playClickSound();
                      onContinueTournament?.();
                    }}
                    className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Swords className="w-5 h-5" />
                    <span>CONTINUE TO SEMIFINALS</span>
                  </button>
                ) : (
                  <button
                    id="result-final-tournament-btn"
                    onClick={() => {
                      playClickSound();
                      onContinueTournament?.();
                    }}
                    className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-extrabold text-sm shadow-lg shadow-amber-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>ENTER CHAMPIONSHIP FINAL</span>
                  </button>
                )
              ) : (
                <button
                  id="result-tournament-bracket-btn"
                  onClick={() => {
                    playClickSound();
                    onContinueTournament?.();
                  }}
                  className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>VIEW TOURNAMENT BRACKET</span>
                </button>
              )}

              <button
                id="result-new-battle-btn"
                onClick={() => {
                  playClickSound();
                  onNewBattle();
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white text-gray-900 border border-gray-300 font-extrabold text-sm shadow-xs hover:bg-gray-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-gray-700" />
                <span>LEAVE ARENA</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="result-rematch-btn"
                onClick={() => {
                  playClickSound();
                  onRematch();
                }}
                className="w-full sm:w-auto flex-1 py-3.5 px-5 rounded-2xl bg-gray-950 text-white font-extrabold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>REMATCH</span>
              </button>

              <button
                id="result-new-battle-btn"
                onClick={() => {
                  playClickSound();
                  onNewBattle();
                }}
                className="w-full sm:w-auto flex-1 py-3.5 px-5 rounded-2xl bg-white text-gray-900 border border-gray-300 font-extrabold text-sm shadow-xs hover:bg-gray-50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-gray-700" />
                <span>NEW BATTLE</span>
              </button>
            </>
          )}

          <button
            id="result-view-profile-btn"
            onClick={() => {
              playClickSound();
              onViewProfile();
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-gray-700" />
            <span className="hidden sm:inline">PROFILE</span>
          </button>

          <button
            id="result-share-btn"
            onClick={() => {
              playClickSound();
              setIsShareModalOpen(true);
            }}
            className="w-full sm:w-auto p-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer flex items-center justify-center"
            title="Share Result"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={result}
      />
    </div>
  );
};
