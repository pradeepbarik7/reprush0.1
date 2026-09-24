import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Swords, Medal, Shield, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onStartBattle: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentUserId,
  onStartBattle,
}) => {
  const [filter, setFilter] = useState<'global' | 'friends'>('global');

  const filteredEntries = filter === 'friends'
    ? entries.filter((e) => e.isFriend || e.isCurrentUser)
    : entries;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 select-none animate-fade-in">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Ranked Push-Up Ladder
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Top ranked calisthenics competitors by Elo rating.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex p-1 rounded-2xl bg-gray-100 border border-gray-200/80 self-start sm:self-auto">
          <button
            onClick={() => {
              playClickSound();
              setFilter('global');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filter === 'global'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Global Arena
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilter('friends');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filter === 'friends'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Friends & Rivals
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {filter === 'global' && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 items-end max-w-2xl mx-auto pt-6">
          {/* Rank 2 (Silver) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 text-gray-700 font-extrabold text-xl flex items-center justify-center border-2 border-gray-300">
                {entries[1].name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-gray-300 text-gray-800 font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                2
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-gray-950 truncate max-w-[90px]">
              {entries[1].name}
            </h4>
            <span className="text-[10px] text-gray-500 font-semibold mb-2">
              {entries[1].division}
            </span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-gray-950">
              {entries[1].rating}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">ELO</span>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md text-center flex flex-col items-center -translate-y-2">
            <div className="relative mb-2">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-amber-300 shadow-md">
                {entries[0].name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-400 text-gray-950 font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                👑
              </span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-gray-950 truncate max-w-[110px]">
              {entries[0].name}
            </h4>
            <span className="text-xs text-amber-700 font-bold mb-2">
              {entries[0].division}
            </span>
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-gray-950">
              {entries[0].rating}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">ELO</span>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center border-2 border-amber-300">
                {entries[2].name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                3
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-gray-950 truncate max-w-[90px]">
              {entries[2].name}
            </h4>
            <span className="text-[10px] text-gray-500 font-semibold mb-2">
              {entries[2].division}
            </span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-gray-950">
              {entries[2].rating}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">ELO</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredEntries.map((entry) => {
            const isSelf = entry.isCurrentUser || entry.id === currentUserId;

            return (
              <div
                key={entry.id}
                className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${
                  isSelf
                    ? 'bg-red-50/60 hover:bg-red-50'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Left side: Rank + Avatar + Name */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Rank indicator */}
                  <span
                    className={`w-7 text-center font-mono font-extrabold text-sm sm:text-base ${
                      entry.rank === 1
                        ? 'text-amber-500'
                        : entry.rank === 2
                        ? 'text-gray-500'
                        : entry.rank === 3
                        ? 'text-amber-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {entry.rank <= 3 ? (
                      <Medal className="w-5 h-5 mx-auto" />
                    ) : (
                      `#${entry.rank}`
                    )}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs ${
                      isSelf ? 'bg-red-600' : 'bg-gray-800'
                    }`}
                  >
                    {isSelf ? 'YOU' : entry.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>

                  {/* Name and Handle */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-950">
                        {entry.name}
                      </span>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{entry.username}</span>
                  </div>
                </div>

                {/* Right side: Division + Rating + Win Rate */}
                <div className="flex items-center gap-4 sm:gap-8">
                  {/* Division Badge */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/60 text-xs font-bold text-gray-700">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span>{entry.division}</span>
                  </div>

                  {/* Win / Loss Record */}
                  <div className="hidden md:block text-right">
                    <span className="text-xs font-mono font-bold text-gray-900 block">
                      {entry.wins}W - {entry.losses}L
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">
                      {((entry.wins / (entry.wins + entry.losses || 1)) * 100).toFixed(0)}% Win Rate
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-mono text-base sm:text-lg font-extrabold text-gray-950 block leading-tight">
                      {entry.rating}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      RATING
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating CTA to battle */}
      <div className="mt-8 text-center">
        <button
          id="leaderboard-queue-battle-btn"
          onClick={() => {
            playClickSound();
            onStartBattle();
          }}
          className="px-8 py-3.5 rounded-2xl bg-gray-950 text-white font-extrabold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
        >
          <Swords className="w-4 h-4 text-red-400" />
          <span>Queue For 1v1 Battle</span>
        </button>
      </div>
    </div>
  );
};
