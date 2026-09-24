/**
 * LobbyScreen Component
 * Pre-match arena setup: difficulty selection, camera pre-check,
 * positioning guidance, and match start trigger.
 */
import React, { useState } from 'react';
import {
  Swords,
  Flame,
  Camera,
  Play,
  Shield,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { OpponentDifficulty } from '../hooks/usePushupBattle';

interface LobbyScreenProps {
  onStartBattle: (mode: 'camera' | 'demo', difficulty: OpponentDifficulty) => void;
  isCameraSupported: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onStartBattle,
  isCameraSupported,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<OpponentDifficulty>('contender');
  const [selectedMode, setSelectedMode] = useState<'camera' | 'demo'>('camera');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-2xl tracking-tight text-neutral-900 leading-none">
                REPRUSH
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 tracking-wider">
                1v1 ARENA
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Turn every rep into a battle.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-neutral-500" />
          <span>Rules &amp; Detection</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full my-6 space-y-6">
        {/* Rules & Detection Dropdown Card */}
        {showHowItWorks && (
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-extrabold text-neutral-900 text-base mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              How the 1v1 Battle &amp; CV Detection Works
            </h3>

            <div className="grid sm:grid-cols-3 gap-4 text-xs text-neutral-600">
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                <div className="font-bold text-neutral-900 mb-1 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Angle Tracking
                </div>
                MediaPipe tracks your Shoulder → Elbow → Wrist angle in real-time right in your browser.
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                <div className="font-bold text-neutral-900 mb-1 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  Full Cycle Rep
                </div>
                You must start at Top (&gt;155°), push down to Bottom (&lt;100°), and push back up to Top lockout.
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                <div className="font-bold text-neutral-900 mb-1 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-mono">
                    3
                  </span>
                  Territory Tug-of-War
                </div>
                Every valid rep shifts the central arena line. The player with more reps at 2:00 wins the match!
              </div>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-red-500/10 to-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 border border-red-200/60 mb-3">
              <Swords className="w-3.5 h-3.5" />
              1v1 Push-Up Territory Battle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              2 Minutes. Pure Reps. Only One Victor.
            </h2>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed font-medium">
              Battle Player 2 head-to-head. Reps are verified by real-time camera computer vision. Complete each rep with full range of motion.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider block">
              Select Rival Difficulty (Player 2 Blue)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'rookie' as OpponentDifficulty,
                  label: 'Rookie',
                  pace: '~20 reps',
                  desc: 'Beginner pace (~4.5s/rep)',
                },
                {
                  id: 'contender' as OpponentDifficulty,
                  label: 'Contender',
                  pace: '~34 reps',
                  desc: 'Standard athletic pace (~3.2s/rep)',
                },
                {
                  id: 'elite' as OpponentDifficulty,
                  label: 'Elite',
                  pace: '~50 reps',
                  desc: 'Fierce competition (~2.4s/rep)',
                },
              ].map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-black text-sm ${
                          isSelected ? 'text-blue-700' : 'text-neutral-800'
                        }`}
                      >
                        {diff.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-blue-600 fill-blue-100" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-neutral-500 mt-1">{diff.pace}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{diff.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Mode Selector */}
          <div className="space-y-3 mb-8">
            <label className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider block">
              Rep Detection Mode
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode('camera')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedMode === 'camera'
                    ? 'bg-red-50/70 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedMode === 'camera'
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-neutral-900 flex items-center gap-1.5">
                    Live Camera Detection
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-snug font-medium">
                    Uses your webcam / phone camera with on-device MediaPipe pose estimation.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('demo')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedMode === 'demo'
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedMode === 'demo'
                      ? 'bg-amber-500 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-neutral-900 flex items-center gap-1.5">
                    Demo Mode (Simulation)
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      TESTING
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-snug font-medium">
                    Test the battle UI and territory system with manual rep increments.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Camera Positioning Tip Banner */}
          {selectedMode === 'camera' && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 mb-8 flex items-start gap-3 text-xs text-neutral-600">
              <Camera className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 block mb-0.5">
                  Camera Setup Tip for Best Detection:
                </span>
                Place your phone or laptop on the floor angled at ~45° or side profile. Ensure your shoulder, elbow, and wrist remain in view throughout the push-up cycle.
              </div>
            </div>
          )}

          {/* Start Battle Button */}
          <button
            onClick={() => onStartBattle(selectedMode, selectedDifficulty)}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-base tracking-wide shadow-xl shadow-red-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START 1v1 PUSH-UP BATTLE (2:00)</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-neutral-400 py-2">
        RepRush &bull; Turn every rep into a battle &bull; Browser-local AI Pose Vision
      </footer>
    </div>
  );
};
