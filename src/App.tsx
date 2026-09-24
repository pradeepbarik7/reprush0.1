import { useState, useEffect } from 'react';
import { 
  AppView, 
  Player, 
  BattleResultData, 
  UserProfile, 
  LegalDocType 
} from './types';
import { StakeRule, DEFAULT_STAKE, TOURNAMENT_CONFIG } from './config/stakesConfig';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { StakeSelectorModal } from './components/StakeSelectorModal';
import { MatchmakingView } from './components/MatchmakingView';
import { PreMatchView } from './components/PreMatchView';
import { LiveBattleView } from './components/LiveBattleView';
import { ResultView } from './components/ResultView';
import { NoMercyTournamentView } from './components/NoMercyTournamentView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { WalletView } from './components/WalletView';
import { Footer } from './components/Footer';
import { LegalPagesModal } from './components/LegalPagesModal';
import { 
  MOCK_CURRENT_USER, 
  MOCK_OPPONENT_ALEX, 
  MOCK_LEADERBOARD, 
  MOCK_USER_PROFILE 
} from './data/mockData';
import { 
  getDemoBalance, 
  creditDemoWinnings, 
  refundDemoStake 
} from './services/demoWalletService';
import { 
  getSavedTournamentBracket, 
  advanceTournamentWithMatchResult
} from './services/tournamentService';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser] = useState<Player>(MOCK_CURRENT_USER);
  const [currentOpponent, setCurrentOpponent] = useState<Player>(MOCK_OPPONENT_ALEX);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [selectedStake, setSelectedStake] = useState<StakeRule>(DEFAULT_STAKE);

  // Tournament flow state
  const [isTournamentMatch, setIsTournamentMatch] = useState(false);
  const [tournamentRoundName, setTournamentRoundName] = useState<'Quarterfinal' | 'Semifinal' | 'Final' | null>(null);

  // Modal states
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('privacy');

  // Completed match result
  const [lastBattleResult, setLastBattleResult] = useState<BattleResultData | null>(null);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Handle entering normal 1v1 battle flow (opens stake modal)
  const handleInitiate1v1Battle = () => {
    setIsTournamentMatch(false);
    setTournamentRoundName(null);
    setIsStakeModalOpen(true);
  };

  // When stake is confirmed from modal
  const handleConfirmStake = (stakeRule: StakeRule) => {
    setSelectedStake(stakeRule);
    setIsStakeModalOpen(false);
    setCurrentView('matchmaking');
  };

  // Matchmaking found opponent
  const handleOpponentFound = (opponent: Player) => {
    setCurrentOpponent(opponent);
    setCurrentView('pre_match');
  };

  // Start live battle from pre-match
  const handleStartLiveBattle = () => {
    setCurrentView('live_battle');
  };

  // Handle tournament match initiation
  const handleStartTournamentMatch = (opponent: Player, roundName: 'Quarterfinal' | 'Semifinal' | 'Final') => {
    setIsTournamentMatch(true);
    setTournamentRoundName(roundName);
    setCurrentOpponent(opponent);
    setCurrentView('pre_match');
  };

  // Live battle completion handler
  const handleBattleEnd = (userReps: number, opponentReps: number, maxCombo: number) => {
    const prevBalance = getDemoBalance();
    let winner: 'user' | 'opponent' | 'tie' = 'tie';
    let ratingDelta = 0;
    let winnerReward = 0;
    let netResult = 0;
    let finalBalance = prevBalance;

    if (userReps > opponentReps) {
      winner = 'user';
      ratingDelta = 18;
      if (!isTournamentMatch) {
        winnerReward = selectedStake.winnerReward;
        netResult = winnerReward - selectedStake.entry;
        finalBalance = creditDemoWinnings(
          winnerReward,
          `1v1 Battle Victory (+₹${winnerReward} Demo)`,
          'battle_win'
        );
      } else if (tournamentRoundName === 'Final') {
        winnerReward = TOURNAMENT_CONFIG.winnerReward;
        netResult = TOURNAMENT_CONFIG.winnerReward - TOURNAMENT_CONFIG.entryFee;
      }
    } else if (opponentReps > userReps) {
      winner = 'opponent';
      ratingDelta = -14;
      if (!isTournamentMatch) {
        winnerReward = 0;
        netResult = -selectedStake.entry;
      } else {
        winnerReward = 0;
        netResult = -TOURNAMENT_CONFIG.entryFee;
      }
    } else {
      winner = 'tie';
      ratingDelta = 0;
      if (!isTournamentMatch) {
        winnerReward = 0;
        netResult = 0;
        // Refund entry stake in case of tie
        finalBalance = refundDemoStake(
          selectedStake.entry,
          `1v1 Battle Draw Refund (+₹${selectedStake.entry} Demo)`
        );
      }
    }

    const previousRating = userProfile.rating;
    const newRating = Math.max(800, previousRating + ratingDelta);

    // Update user profile stats
    setUserProfile((prev) => {
      const wins = winner === 'user' ? prev.wins + 1 : prev.wins;
      const losses = winner === 'opponent' ? prev.losses + 1 : prev.losses;
      const totalReps = prev.totalReps + userReps;
      const winRate = ((wins / (wins + losses || 1)) * 100);
      const isNewPB = userReps > prev.personalRecords.twoMinPushUps;

      return {
        ...prev,
        rating: newRating,
        wins,
        losses,
        winRate,
        totalReps,
        personalRecords: {
          ...prev.personalRecords,
          twoMinPushUps: Math.max(prev.personalRecords.twoMinPushUps, userReps),
        },
        recentBattles: [
          {
            id: `b_${Date.now()}`,
            opponentName: currentOpponent.name,
            opponentUsername: currentOpponent.username,
            userScore: userReps,
            opponentScore: opponentReps,
            result: winner === 'user' ? 'win' : winner === 'opponent' ? 'loss' : 'draw',
            ratingDelta,
            date: 'Today',
          },
          ...prev.recentBattles.slice(0, 3),
        ],
      };
    });

    const isPB = userReps > userProfile.personalRecords.twoMinPushUps;

    // If part of tournament bracket, advance bracket
    if (isTournamentMatch) {
      const savedBracket = getSavedTournamentBracket();
      if (savedBracket) {
        advanceTournamentWithMatchResult(
          savedBracket,
          userReps,
          opponentReps,
          currentUser
        );
        finalBalance = getDemoBalance();
      }
    }

    const resultData: BattleResultData = {
      winner,
      userReps,
      opponentReps,
      ratingDelta,
      previousRating,
      newRating,
      isPersonalBest: isPB,
      maxCombo,
      opponent: currentOpponent,
      stakeAmount: isTournamentMatch ? TOURNAMENT_CONFIG.entryFee : selectedStake.entry,
      winnerReward,
      netResult,
      prevBalance,
      newBalance: finalBalance,
      isTournamentMatch,
      tournamentRound: tournamentRoundName ?? undefined,
    };

    setLastBattleResult(resultData);
    setCurrentView('result');
  };

  // Rematch action
  const handleRematch = () => {
    setCurrentView('pre_match');
  };

  // Open specific legal document
  const handleOpenLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartBattle={handleInitiate1v1Battle}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingView
            onStartBattle={handleInitiate1v1Battle}
            onEnterTournament={() => setCurrentView('tournament')}
            onExploreLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'matchmaking' && (
          <MatchmakingView
            opponent={currentOpponent}
            onOpponentFound={handleOpponentFound}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'pre_match' && (
          <PreMatchView
            user={currentUser}
            opponent={currentOpponent}
            onStartBattle={handleStartLiveBattle}
          />
        )}

        {currentView === 'live_battle' && (
          <LiveBattleView
            user={currentUser}
            opponent={currentOpponent}
            onBattleEnd={handleBattleEnd}
            isTournamentMatch={isTournamentMatch}
            tournamentRound={tournamentRoundName ?? undefined}
          />
        )}

        {currentView === 'result' && lastBattleResult && (
          <ResultView
            result={lastBattleResult}
            onRematch={handleRematch}
            onNewBattle={handleInitiate1v1Battle}
            onViewProfile={() => setCurrentView('profile')}
            onContinueTournament={() => {
              setIsTournamentMatch(false);
              setTournamentRoundName(null);
              setCurrentView('tournament');
            }}
          />
        )}

        {currentView === 'tournament' && (
          <NoMercyTournamentView
            currentUser={currentUser}
            onStartTournamentMatch={handleStartTournamentMatch}
            onNavigateHome={() => setCurrentView('landing')}
            onNavigateProfile={() => setCurrentView('profile')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            entries={MOCK_LEADERBOARD}
            currentUserId={currentUser.id}
            onStartBattle={handleInitiate1v1Battle}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            profile={userProfile}
            onStartBattle={handleInitiate1v1Battle}
            onEnterTournament={() => setCurrentView('tournament')}
          />
        )}

        {currentView === 'wallet' && (
          <WalletView
            onStartBattle={handleInitiate1v1Battle}
            onEnterTournament={() => setCurrentView('tournament')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Modals */}
      <StakeSelectorModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        onConfirmEntry={handleConfirmStake}
      />

      <LegalPagesModal
        isOpen={legalModalOpen}
        docType={activeLegalDoc}
        onClose={() => setLegalModalOpen(false)}
        onSelectDoc={(doc) => setActiveLegalDoc(doc)}
      />
    </div>
  );
}
