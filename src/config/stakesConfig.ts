export interface StakeRule {
  entry: number;
  label: string;
  prizePool: number;
  winnerReward: number;
  platformFee: number;
}

export const DEMO_STAKES_CONFIG: StakeRule[] = [
  {
    entry: 1,
    label: '₹1',
    prizePool: 2,
    winnerReward: 1.8,
    platformFee: 0.2,
  },
  {
    entry: 2,
    label: '₹2',
    prizePool: 4,
    winnerReward: 3.6,
    platformFee: 0.4,
  },
  {
    entry: 5,
    label: '₹5',
    prizePool: 10,
    winnerReward: 9.0,
    platformFee: 1.0,
  },
  {
    entry: 10,
    label: '₹10',
    prizePool: 20,
    winnerReward: 18.0,
    platformFee: 2.0,
  },
];

export const DEFAULT_STAKE: StakeRule = DEMO_STAKES_CONFIG[3]; // ₹10

export const TOURNAMENT_CONFIG = {
  entryFee: 10,
  prizePool: 70,
  winnerReward: 50,
  runnerUpReward: 20,
  playersCount: 8,
};

export function getBattlePrizeCalculation(entryAmount: number): {
  prizePool: number;
  winnerReward: number;
  platformFee: number;
} {
  const prizePool = entryAmount * 2;
  const platformFee = Math.round(prizePool * 0.1 * 100) / 100;
  const winnerReward = Math.round((prizePool - platformFee) * 100) / 100;
  return { prizePool, winnerReward, platformFee };
}
