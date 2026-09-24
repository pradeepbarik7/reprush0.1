import { Player, TournamentBracket, TournamentRound, TournamentMatch } from '../types';
import { creditDemoWinnings } from './demoWalletService';
import { TOURNAMENT_CONFIG } from '../config/stakesConfig';

const BRACKET_STORAGE_KEY = 'reprush_tournament_bracket';

const TOURNAMENT_AI_ROSTER: Player[] = [
  {
    id: 't-alex',
    name: 'Alex Morgan',
    username: '@alex_m',
    rating: 1345,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-ryan',
    name: 'Ryan Lee',
    username: '@ryan_l',
    rating: 1380,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-chris',
    name: 'Chris Walker',
    username: '@chris_w',
    rating: 1320,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-sam',
    name: 'Sam Patel',
    username: '@sam_p',
    rating: 1395,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-jordan',
    name: 'Jordan Smith',
    username: '@jsmith',
    rating: 1355,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-mike',
    name: 'Mike Ross',
    username: '@mross',
    rating: 1410,
    division: 'Gold',
    color: 'blue',
  },
  {
    id: 't-david',
    name: 'David Chen',
    username: '@dchen_fit',
    rating: 1330,
    division: 'Gold',
    color: 'blue',
  },
];

export function getSavedTournamentBracket(): TournamentBracket | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(BRACKET_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveBracket(bracket: TournamentBracket): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(bracket));
}

export function initializeTournamentBracket(user: Player): TournamentBracket {
  const r = [...TOURNAMENT_AI_ROSTER].sort(() => Math.random() - 0.5);

  const qfMatches: TournamentMatch[] = [
    {
      id: 'qf-1',
      player1: user,
      player2: r[0],
      isUserMatch: true,
      status: 'pending',
    },
    {
      id: 'qf-2',
      player1: r[1],
      player2: r[2],
      isUserMatch: false,
      status: 'pending',
    },
    {
      id: 'qf-3',
      player1: r[3],
      player2: r[4],
      isUserMatch: false,
      status: 'pending',
    },
    {
      id: 'qf-4',
      player1: r[5],
      player2: r[6],
      isUserMatch: false,
      status: 'pending',
    },
  ];

  const sfMatches: TournamentMatch[] = [
    {
      id: 'sf-1',
      player1: user,
      player2: r[1],
      isUserMatch: true,
      status: 'pending',
    },
    {
      id: 'sf-2',
      player1: r[3],
      player2: r[5],
      isUserMatch: false,
      status: 'pending',
    },
  ];

  const finalMatches: TournamentMatch[] = [
    {
      id: 'fn-1',
      player1: user,
      player2: r[3],
      isUserMatch: true,
      status: 'pending',
    },
  ];

  const bracket: TournamentBracket = {
    id: `tourney-${Date.now()}`,
    status: 'active',
    currentRoundIndex: 0,
    rounds: [
      { name: 'Quarterfinal', matches: qfMatches },
      { name: 'Semifinal', matches: sfMatches },
      { name: 'Final', matches: finalMatches },
    ],
  };

  saveBracket(bracket);
  return bracket;
}

export function simulateOtherMatches(round: TournamentRound): TournamentRound {
  const updatedMatches = round.matches.map((match) => {
    if (match.isUserMatch || match.status === 'completed') {
      return match;
    }
    const p1Score = Math.floor(Math.random() * 8) + 24;
    let p2Score = Math.floor(Math.random() * 8) + 24;
    if (p1Score === p2Score) p2Score += 1;

    const winnerId = p1Score > p2Score ? match.player1.id : match.player2.id;
    return {
      ...match,
      p1Score,
      p2Score,
      winnerId,
      status: 'completed' as const,
    };
  });

  return {
    ...round,
    matches: updatedMatches,
  };
}

export function advanceTournamentWithMatchResult(
  bracket: TournamentBracket,
  userScore: number,
  opponentScore: number,
  user: Player
): TournamentBracket {
  const currentRoundIdx = bracket.currentRoundIndex;
  const currentRound = bracket.rounds[currentRoundIdx];
  if (!currentRound) return bracket;

  const userWon = userScore > opponentScore;

  // 1. Mark user match as completed with scores
  const updatedMatches = currentRound.matches.map((m) => {
    if (m.isUserMatch) {
      return {
        ...m,
        p1Score: userScore,
        p2Score: opponentScore,
        winnerId: userWon ? user.id : m.player2.id,
        status: 'completed' as const,
      };
    }
    return m;
  });

  const updatedRounds = [...bracket.rounds];
  updatedRounds[currentRoundIdx] = {
    ...currentRound,
    matches: updatedMatches,
  };

  let nextRoundIdx = currentRoundIdx;
  let userEliminated = false;
  let userChampion = false;

  if (!userWon) {
    userEliminated = true;
  } else {
    // If user won the final
    if (currentRoundIdx === 2) {
      userChampion = true;
      creditDemoWinnings(
        TOURNAMENT_CONFIG.winnerReward,
        'No Mercy Tournament Champion Reward (₹50 Demo)',
        'tournament_win'
      );
    } else if (currentRoundIdx === 0) {
      // User won Quarterfinal -> Setup Semifinal with actual QF winners!
      nextRoundIdx = 1;
      const qfMatches = updatedMatches;

      // QF-2 winner plays User in SF-1
      const qf2 = qfMatches.find((m) => m.id === 'qf-2');
      const sf1Opponent = qf2
        ? qf2.winnerId === qf2.player1.id
          ? qf2.player1
          : qf2.player2
        : TOURNAMENT_AI_ROSTER[1];

      // QF-3 and QF-4 winners play each other in SF-2
      const qf3 = qfMatches.find((m) => m.id === 'qf-3');
      const qf4 = qfMatches.find((m) => m.id === 'qf-4');
      const sf2P1 = qf3
        ? qf3.winnerId === qf3.player1.id
          ? qf3.player1
          : qf3.player2
        : TOURNAMENT_AI_ROSTER[3];
      const sf2P2 = qf4
        ? qf4.winnerId === qf4.player1.id
          ? qf4.player1
          : qf4.player2
        : TOURNAMENT_AI_ROSTER[5];

      // Simulate SF-2 match so its winner is ready for Final
      const sf2P1Score = Math.floor(Math.random() * 8) + 25;
      let sf2P2Score = Math.floor(Math.random() * 8) + 25;
      if (sf2P1Score === sf2P2Score) sf2P2Score += 1;
      const sf2WinnerId = sf2P1Score > sf2P2Score ? sf2P1.id : sf2P2.id;

      const newSfMatches: TournamentMatch[] = [
        {
          id: 'sf-1',
          player1: user,
          player2: sf1Opponent,
          isUserMatch: true,
          status: 'pending',
        },
        {
          id: 'sf-2',
          player1: sf2P1,
          player2: sf2P2,
          p1Score: sf2P1Score,
          p2Score: sf2P2Score,
          winnerId: sf2WinnerId,
          isUserMatch: false,
          status: 'completed',
        },
      ];

      updatedRounds[1] = {
        name: 'Semifinal',
        matches: newSfMatches,
      };
    } else if (currentRoundIdx === 1) {
      // User won Semifinal -> Setup Final with SF-2 winner!
      nextRoundIdx = 2;
      const sfMatches = updatedMatches;
      const sf2 = sfMatches.find((m) => m.id === 'sf-2');
      const finalOpponent = sf2
        ? sf2.winnerId === sf2.player1.id
          ? sf2.player1
          : sf2.player2
        : TOURNAMENT_AI_ROSTER[3];

      const newFinalMatches: TournamentMatch[] = [
        {
          id: 'fn-1',
          player1: user,
          player2: finalOpponent,
          isUserMatch: true,
          status: 'pending',
        },
      ];

      updatedRounds[2] = {
        name: 'Final',
        matches: newFinalMatches,
      };
    }
  }

  const updatedBracket: TournamentBracket = {
    ...bracket,
    currentRoundIndex: nextRoundIdx,
    rounds: updatedRounds,
    userEliminated,
    userChampion,
    status: userChampion ? 'champion' : userEliminated ? 'eliminated' : 'active',
  };

  saveBracket(updatedBracket);
  return updatedBracket;
}
