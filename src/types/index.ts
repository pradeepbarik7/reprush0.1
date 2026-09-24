/**
 * RepRush Core Type Definitions
 */

export type ScreenType =
  | 'home'
  | 'matchmaking'
  | 'pre-match'
  | 'live-battle'
  | 'result'
  | 'profile'
  | 'leaderboard'
  | 'wallet'
  | 'no-mercy';

export type AppView =
  | 'landing'
  | 'matchmaking'
  | 'pre_match'
  | 'live_battle'
  | 'result'
  | 'tournament'
  | 'leaderboard'
  | 'profile'
  | 'wallet';

export interface Player {
  id: string;
  name: string;
  username: string;
  rating: number;
  division: 'Gold' | 'Diamond' | 'Platinum' | 'Silver' | string;
  avatar?: string;
  color: 'red' | 'blue';
}

export type PoseState =
  | 'READY'
  | 'TOP'
  | 'GOING_DOWN'
  | 'BOTTOM'
  | 'GOING_UP'
  | 'UP'
  | 'DOWN';

export interface PushUpMetrics {
  elbowAngle: number;
  smoothedElbowAngle: number;
  activeSide: 'left' | 'right';
  bodyAlignmentAngle?: number;
  confidence: number;
  isPlankHorizontal?: boolean;
  lastRepDurationMs?: number;
  fps?: number;
}

export interface BattleResultData {
  userReps: number;
  opponentReps: number;
  winner: 'user' | 'opponent' | 'draw' | 'tie';
  ratingDelta: number;
  newRating: number;
  previousRating: number;
  isPersonalBest?: boolean;
  maxCombo?: number;
  opponent: Player;
  stakeAmount?: number;
  winnerReward?: number;
  platformFee?: number;
  netResult?: number;
  prevBalance?: number;
  newBalance?: number;
  isTournamentMatch?: boolean;
  tournamentRound?: 'Quarterfinal' | 'Semifinal' | 'Final';
}

export interface RecentBattle {
  id: string;
  opponentName: string;
  opponentUsername: string;
  userScore: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
  date: string;
  ratingDelta: number;
  stake?: number;
  reward?: number;
}

export interface UserProfile {
  name: string;
  username: string;
  rating: number;
  previousRating?: number;
  division: string;
  noMercyTitles?: number;
  wins: number;
  losses: number;
  winRate: number;
  totalReps: number;
  demoBattles?: number;
  demoWinnings?: number;
  personalRecords: {
    twoMinPushUps: number;
    oneMinPushUps: number;
    longestWinStreak: number;
  };
  recentBattles: RecentBattle[];
}

export interface LeaderboardUser {
  rank?: number;
  name: string;
  username: string;
  rating: number;
  division: string;
  wins: number;
  reps?: number;
  noMercyTitles?: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  rating: number;
  division: string;
  wins: number;
  losses: number;
  reps: number;
  noMercyTitles: number;
  streak: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

export type LegalDocType =
  | 'privacy'
  | 'terms'
  | 'responsible-play'
  | 'community'
  | 'cookies'
  | 'about-aitia'
  | 'contact';

export interface DemoTransaction {
  id: string;
  label: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  balanceAfter: number;
}

export interface TournamentMatch {
  id: string;
  player1: Player;
  player2: Player;
  p1Score?: number;
  p2Score?: number;
  winnerId?: string;
  isUserMatch?: boolean;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TournamentRound {
  name: 'Quarterfinal' | 'Semifinal' | 'Final';
  matches: TournamentMatch[];
}

export interface TournamentBracket {
  id: string;
  status: 'lobby' | 'active' | 'champion' | 'eliminated';
  currentRoundIndex: number;
  rounds: TournamentRound[];
  userChampion?: boolean;
  userEliminated?: boolean;
}
