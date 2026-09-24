/**
 * RepRush Battle State Hook
 *
 * Coordinates match time (120 seconds), Player 1 score, simulated Opponent score,
 * territory calculation, and match lifecycle states.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEffects } from '../utils/audio';

export type OpponentDifficulty = 'rookie' | 'contender' | 'elite';
export type MatchStatus = 'lobby' | 'countdown' | 'active' | 'finished';

export interface BattleStats {
  userReps: number;
  opponentReps: number;
  timeRemainingSec: number;
  matchDurationSec: number;
  territoryPercentUser: number; // 0 to 100 (% belonging to Player 1 - Red)
  territoryPercentOpponent: number;
  leader: 'user' | 'opponent' | 'tie';
  repDifference: number;
  matchStatus: MatchStatus;
  winner: 'user' | 'opponent' | 'draw' | null;
  countdownValue: number;
}

export interface UsePushupBattleOptions {
  difficulty?: OpponentDifficulty;
  matchDurationSec?: number;
}

export function usePushupBattle({
  difficulty = 'contender',
  matchDurationSec = 120, // 2 minutes standard
}: UsePushupBattleOptions = {}) {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('lobby');
  const [userReps, setUserReps] = useState<number>(0);
  const [opponentReps, setOpponentReps] = useState<number>(0);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(matchDurationSec);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [currentDifficulty, setCurrentDifficulty] = useState<OpponentDifficulty>(difficulty);

  // Refs for timers and intervals to avoid stale closures
  const timerIntervalRef = useRef<number | null>(null);
  const opponentTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Dynamic Territory calculation
  // Base 50% split. Each rep difference shifts territory by 4.5%
  const repDifference = userReps - opponentReps;
  const territoryPercentUser = Math.min(
    95,
    Math.max(5, Math.round(50 + repDifference * 4.5))
  );
  const territoryPercentOpponent = 100 - territoryPercentUser;

  const leader: 'user' | 'opponent' | 'tie' =
    userReps > opponentReps ? 'user' : opponentReps > userReps ? 'opponent' : 'tie';

  const winner: 'user' | 'opponent' | 'draw' | null =
    matchStatus === 'finished'
      ? userReps > opponentReps
        ? 'user'
        : opponentReps > userReps
        ? 'opponent'
        : 'draw'
      : null;

  // Called when user completes a detected push-up
  const recordUserRep = useCallback((newCount?: number) => {
    setUserReps((prev) => {
      const nextCount = newCount !== undefined ? newCount : prev + 1;
      soundEffects.playRepSuccess();
      return nextCount;
    });
  }, []);

  // Opponent pace configuration (seconds per rep)
  const getOpponentPaceRange = useCallback((diff: OpponentDifficulty): [number, number] => {
    switch (diff) {
      case 'rookie':
        return [4.0, 5.5];
      case 'elite':
        return [2.0, 2.8];
      case 'contender':
      default:
        return [2.7, 3.8];
    }
  }, []);

  // Believable Opponent Rep Simulation
  const scheduleNextOpponentRep = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }

    const [minPace, maxPace] = getOpponentPaceRange(currentDifficulty);
    // Slight fatigue slowdown after first minute
    const fatigueMultiplier = timeRemainingSec < 45 ? 1.15 : 1.0;
    const delaySec = (minPace + Math.random() * (maxPace - minPace)) * fatigueMultiplier;

    opponentTimeoutRef.current = window.setTimeout(() => {
      setOpponentReps((prev) => {
        soundEffects.playOpponentRep();
        return prev + 1;
      });
      // Schedule subsequent rep if match is still running
      scheduleNextOpponentRep();
    }, delaySec * 1000);
  }, [currentDifficulty, timeRemainingSec, getOpponentPaceRange]);

  // Start 3-2-1 countdown
  const startMatchCountdown = useCallback(() => {
    setUserReps(0);
    setOpponentReps(0);
    setTimeRemainingSec(matchDurationSec);
    setCountdownValue(3);
    setMatchStatus('countdown');

    soundEffects.playCountdownTick(false);

    let count = 3;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
        soundEffects.playCountdownTick(false);
      } else if (count === 0) {
        setCountdownValue(0);
        soundEffects.playCountdownTick(true);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setMatchStatus('active');
      }
    }, 1000);
  }, [matchDurationSec]);

  // Main 2-minute Match Timer
  useEffect(() => {
    if (matchStatus === 'active') {
      // Begin opponent simulation
      scheduleNextOpponentRep();

      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemainingSec((prev) => {
          if (prev <= 1) {
            // Match over! Stop everything
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);
            setMatchStatus('finished');
            soundEffects.playVictory();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (opponentTimeoutRef.current) {
        clearTimeout(opponentTimeoutRef.current);
        opponentTimeoutRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);
    };
  }, [matchStatus, scheduleNextOpponentRep]);

  // Reset to Lobby
  const returnToLobby = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (opponentTimeoutRef.current) clearTimeout(opponentTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setMatchStatus('lobby');
    setUserReps(0);
    setOpponentReps(0);
    setTimeRemainingSec(matchDurationSec);
  }, [matchDurationSec]);

  return {
    matchStatus,
    userReps,
    opponentReps,
    timeRemainingSec,
    matchDurationSec,
    territoryPercentUser,
    territoryPercentOpponent,
    leader,
    repDifference,
    winner,
    countdownValue,
    currentDifficulty,
    setDifficulty: setCurrentDifficulty,
    startMatchCountdown,
    recordUserRep,
    returnToLobby,
  };
}
