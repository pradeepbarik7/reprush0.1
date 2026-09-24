/**
 * BattleScreen Component
 * The active 1v1 RepRush push-up arena.
 */
import React, { useEffect, useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Terminal,
  LogOut,
  Sparkles,
  Swords,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BattleBar } from './BattleBar';
import { CameraPanel } from './CameraPanel';
import { PlayerCard } from './PlayerCard';
import { MatchTimer } from './MatchTimer';
import { DebugPanel } from './DebugPanel';
import { ResultModal } from './ResultModal';
import { useCamera } from '../hooks/useCamera';
import { usePushupDetection } from '../hooks/usePushupDetection';
import { OpponentDifficulty, usePushupBattle } from '../hooks/usePushupBattle';
import { soundEffects } from '../utils/audio';

interface BattleScreenProps {
  mode: 'camera' | 'demo';
  difficulty: OpponentDifficulty;
  onExit: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  mode,
  difficulty,
  onExit,
}) => {
  const isDemoMode = mode === 'demo';

  // Audio mute state
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());
  // Debug panel open/close
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  // 1. Camera Hook
  const {
    videoRef,
    stream,
    isLoading: isCameraLoading,
    error: cameraError,
    permissionDenied,
    startCamera,
    stopCamera,
  } = useCamera();

  // 2. Battle State Hook
  const {
    matchStatus,
    userReps,
    opponentReps,
    timeRemainingSec,
    territoryPercentUser,
    leader,
    repDifference,
    winner,
    countdownValue,
    startMatchCountdown,
    recordUserRep,
    returnToLobby,
  } = usePushupBattle({ difficulty, matchDurationSec: 120 });

  // 3. Push-up Computer Vision Detection Hook
  const {
    frameResult,
    landmarks,
    fps,
    isModelLoading,
    modelError,
    resetDetector,
    manualIncrementRep,
  } = usePushupDetection({
    videoElement: videoRef.current,
    isActive: matchStatus === 'active' || matchStatus === 'countdown',
    onRepCompleted: (reps) => {
      // Connects valid computer vision rep event directly to RepRush battle score!
      recordUserRep(reps);
    },
  });

  // Start camera and launch match countdown on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isDemoMode) {
        await startCamera();
      }
      if (isMounted) {
        startMatchCountdown();
      }
    }

    init();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isDemoMode, startCamera, stopCamera, startMatchCountdown]);

  // Clean up camera when match completes
  useEffect(() => {
    if (matchStatus === 'finished') {
      stopCamera();
    }
  }, [matchStatus, stopCamera]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    soundEffects.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleRematch = async () => {
    resetDetector();
    if (!isDemoMode) {
      await startCamera();
    }
    startMatchCountdown();
  };

  const handleHome = () => {
    stopCamera();
    returnToLobby();
    onExit();
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 select-none">
      {/* 1. ARENA TOP NAVBAR */}
      <header className="max-w-6xl mx-auto w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-neutral-200/80 flex items-center justify-between mb-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-neutral-900 leading-none">
                REPRUSH
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 tracking-wider uppercase">
                {isDemoMode ? 'DEMO' : 'LIVE CV'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">1v1 Push-Up Territory</p>
          </div>
        </div>

        {/* Central 2-minute Countdown Clock */}
        <MatchTimer timeRemainingSec={timeRemainingSec} totalDurationSec={120} />

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dev Debug Telemetry toggle */}
          <button
            onClick={() => setIsDebugOpen(!isDebugOpen)}
            aria-label="Toggle CV Telemetry"
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isDebugOpen
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Forfeit / Exit */}
          <button
            onClick={handleHome}
            aria-label="Exit Match"
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-600 transition-colors cursor-pointer"
            title="Leave Match"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC TERRITORY BAR */}
      <section className="max-w-6xl mx-auto w-full mb-4">
        <BattleBar
          userReps={userReps}
          opponentReps={opponentReps}
          territoryPercentUser={territoryPercentUser}
          leader={leader}
          repDifference={repDifference}
        />
      </section>

      {/* 3. MAIN ARENA GRID */}
      <main className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-4 flex-1 items-start">
        {/* Left Column (User / Camera) - 7 cols on desktop */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Player 1 Card */}
          <PlayerCard
            type="user"
            name="You (Player 1)"
            reps={userReps}
            state={frameResult.state}
            repProgress={frameResult.repProgress}
            feedback={frameResult.feedbackMessage}
            isWinning={leader === 'user'}
          />

          {/* Camera & Pose Video Panel */}
          <CameraPanel
            videoRef={videoRef}
            landmarks={landmarks}
            activeSide={frameResult.activeSide}
            state={frameResult.state}
            angle={frameResult.angle}
            poseDetected={frameResult.poseDetected}
            repCompleted={frameResult.repCompleted}
            feedbackMessage={frameResult.feedbackMessage}
            isCameraActive={Boolean(stream) && !permissionDenied}
            cameraError={cameraError}
            permissionDenied={permissionDenied}
            isModelLoading={isModelLoading}
            modelError={modelError}
            isDemoMode={isDemoMode}
            onRetryCamera={startCamera}
            onSwitchToDemo={() => {
              stopCamera();
              // Restart in demo mode
              onExit();
            }}
            onManualRep={manualIncrementRep}
          />
        </div>

        {/* Right Column (Opponent / Battle Telemetry) - 5 cols on desktop */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Opponent Card */}
          <PlayerCard
            type="opponent"
            name="Apex Rival"
            reps={opponentReps}
            isWinning={leader === 'opponent'}
            difficulty={difficulty}
          />

          {/* Live Arena Intel Card */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h4 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-500" />
                Live Arena Intel
              </h4>
              <span className="text-[11px] font-mono font-bold text-neutral-500">
                P1 vs P2
              </span>
            </div>

            {/* Momentum Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-neutral-600">
                <span>Momentum:</span>
                <span
                  className={
                    leader === 'user'
                      ? 'text-red-600 font-extrabold'
                      : leader === 'opponent'
                      ? 'text-blue-600 font-extrabold'
                      : 'text-neutral-500'
                  }
                >
                  {leader === 'user'
                    ? 'Player 1 Conquering'
                    : leader === 'opponent'
                    ? 'Opponent Pressuring'
                    : 'Balanced Deadlock'}
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${territoryPercentUser}%` }}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${100 - territoryPercentUser}%` }}
                />
              </div>
            </div>

            {/* Push-up Form Standards */}
            <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 text-xs space-y-2">
              <span className="font-extrabold text-neutral-800 text-[11px] uppercase tracking-wider block">
                Push-Up Computer Vision Standard
              </span>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Top Lockout Angle:</span>
                <span className="font-mono font-bold text-neutral-900">&gt; 155°</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Bottom Depth Angle:</span>
                <span className="font-mono font-bold text-neutral-900">&lt; 100°</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Movement Validation:</span>
                <span className="font-bold text-emerald-600">Straight (&gt;155°) → Depth (&lt;100°) → Lockout (+1 REP)</span>
              </div>
            </div>

            {/* Active match motivation */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 text-xs text-neutral-700">
              {timeRemainingSec > 60 ? (
                <span>Maintain steady form! A fast descent without lockout won&apos;t count.</span>
              ) : timeRemainingSec > 30 ? (
                <span>Under 1 minute left! Every rep pushes the territory bar!</span>
              ) : (
                <span className="font-bold text-red-600">FINAL SPRINT! Empty the tank!</span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. PRE-MATCH 3-2-1 COUNTDOWN OVERLAY */}
      {matchStatus === 'countdown' && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="text-center text-white space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 font-mono text-xs uppercase tracking-widest font-extrabold">
              Get in position — Plank ready
            </span>
            <div className="font-black text-8xl sm:text-9xl font-mono tracking-tighter drop-shadow-2xl animate-pulse text-white">
              {countdownValue > 0 ? countdownValue : 'GO!'}
            </div>
            <p className="text-neutral-400 text-sm font-medium">
              Lock out arms at the top (&gt;155°) to begin!
            </p>
          </div>
        </div>
      )}

      {/* 5. POST-MATCH RESULT SCREEN */}
      {matchStatus === 'finished' && (
        <ResultModal
          userReps={userReps}
          opponentReps={opponentReps}
          territoryPercentUser={territoryPercentUser}
          winner={winner}
          repDifference={repDifference}
          onRematch={handleRematch}
          onHome={handleHome}
          isDemoMode={isDemoMode}
        />
      )}

      {/* 6. DEV DEBUG TELEMETRY DRAWER */}
      <DebugPanel
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        leftAngle={frameResult.leftAngle}
        rightAngle={frameResult.rightAngle}
        activeAngle={frameResult.angle}
        rawAngle={frameResult.rawAngle}
        activeSide={frameResult.activeSide}
        confidence={frameResult.confidence}
        state={frameResult.state}
        reps={userReps}
        fps={fps}
        repDuration={frameResult.durationOfCurrentRepMs}
      />
    </div>
  );
};
