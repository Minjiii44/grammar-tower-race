import { useState, useEffect, useRef } from 'react';
import { TowerScene } from './three/TowerScene';
import { TitleScreen } from './components/TitleScreen';
import { GameplayHUD, HUDCompetitor } from './components/GameplayHUD';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { StudyHubModal } from './components/StudyHubModal';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { soundManager } from './audio/soundManager';
import { multiplayerClient } from './utils/multiplayerClient';
import {
  GameMode,
  GrammarQuestion,
  PlayerStats,
  CompetitorBot
} from './types/game';
import { RoomState, ChatMessage } from './types/multiplayer';
import { GRAMMAR_QUESTIONS, BOT_NAMES } from './data/grammarQuestions';
import {
  checkAnswer,
  calculateScore,
  calculateBlockGain,
  calculateLavaSpeed,
  checkWinCondition,
  checkLossCondition
} from './game/rules';
import { AvatarCustomization } from './three/RobloxAvatar';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const towerSceneRef = useRef<TowerScene | null>(null);

  // Game Lifecycle State
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameMode, setGameMode] = useState<GameMode>('race');
  const [isStudyHubOpen, setIsStudyHubOpen] = useState(false);
  const [isMultiplayerLobbyOpen, setIsMultiplayerLobbyOpen] = useState(false);
  const [isMultiplayerActive, setIsMultiplayerActive] = useState(false);
  const [multiplayerRoomState, setMultiplayerRoomState] = useState<RoomState | null>(null);
  const [multiplayerChat, setMultiplayerChat] = useState<ChatMessage[]>([]);
  const [playerName, setPlayerName] = useState('RobloxRacer');

  const [isMuted, setIsMuted] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Avatar Customization
  const [avatarCustomization, setAvatarCustomization] = useState<AvatarCustomization>({
    skinColor: '#FFD900', // Classic Roblox yellow
    torsoColor: '#0055BF', // Classic blue shirt
    legsColor: '#267326', // Classic green legs
    hatType: 'noob'
  });

  // Current Question
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionList, setQuestionList] = useState<GrammarQuestion[]>([]);
  const currentQuestion = questionList[questionIndex] || GRAMMAR_QUESTIONS[0];

  // Run Stats
  const [playerHeight, setPlayerHeight] = useState(2);
  const [lavaHeight, setLavaHeight] = useState(-2);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(performance.now());
  const [runStartTime, setRunStartTime] = useState(performance.now());
  const [finalTimeSeconds, setFinalTimeSeconds] = useState(0);

  // Pedagogical Educational Feedback
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    answer: string;
  } | null>(null);

  // Player Mastery & Analytics
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    height: 2,
    targetHeight: 100,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    categoryStats: {
      'subject-verb': { correct: 0, total: 0 },
      'verb-tenses': { correct: 0, total: 0 },
      'homophones': { correct: 0, total: 0 },
      'pronouns': { correct: 0, total: 0 },
      'comparatives': { correct: 0, total: 0 },
      'plurals': { correct: 0, total: 0 },
      'prepositions': { correct: 0, total: 0 },
      'apostrophes': { correct: 0, total: 0 }
    }
  });

  // Competitor Bots (Solo Mode) or Live Players (Multiplayer)
  const [competitors, setCompetitors] = useState<HUDCompetitor[]>([]);

  // Mirror gameState to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Mount 3D Three.js TowerScene once
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const scene = new TowerScene({
      container: canvasContainerRef.current,
      avatarCustomization,
      onLavaProximityChange: (proximity) => {
        soundManager.updateLavaRumble(proximity);
      }
    });

    towerSceneRef.current = scene;

    // Shuffle questions
    const shuffled = [...GRAMMAR_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestionList(shuffled);

    // Check for ?autostart=1 query param (ultra-mode testability requirement)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setTimeout(() => {
        handleStartSoloGame('race');
      }, 100);
    }

    return () => {
      scene.dispose();
      soundManager.dispose();
      multiplayerClient.disconnect();
      towerSceneRef.current = null;
    };
  }, []);

  // Wire WebSocket Multiplayer Events
  useEffect(() => {
    const offAscended = multiplayerClient.on('player_ascended', (data) => {
      if (data.playerId !== multiplayerClient.playerId) {
        soundManager.playBlockSlam(data.streak);
        if (towerSceneRef.current) {
          const heightIndex = Math.floor(data.height / 2) - 1;
          towerSceneRef.current.addBotBlock(data.playerId, heightIndex);
        }
        setCompetitors((prev) =>
          prev.map((c) =>
            c.id === data.playerId ? { ...c, height: data.height } : c
          )
        );
      }
    });

    const offEliminated = multiplayerClient.on('player_eliminated', (data) => {
      if (data.playerId !== multiplayerClient.playerId) {
        soundManager.playOofSound();
        if (towerSceneRef.current) {
          towerSceneRef.current.triggerPlayerEliminated(data.playerId);
        }
        setCompetitors((prev) =>
          prev.map((c) =>
            c.id === data.playerId ? { ...c, isAlive: false } : c
          )
        );
      } else {
        handleGameOver(false);
      }
    });

    const offTick = multiplayerClient.on('room_tick', (data) => {
      if (isMultiplayerActive) {
        setLavaHeight(data.lavaHeight);
        if (towerSceneRef.current) {
          towerSceneRef.current.setLavaHeight(data.lavaHeight);
        }
        if (data.players) {
          const others = data.players.filter(
            (p: { id: string }) => p.id !== multiplayerClient.playerId
          );
          setCompetitors(others);
        }
      }
    });

    const offGameOver = multiplayerClient.on('game_over', (data) => {
      const isMeWinner = data.winnerId === multiplayerClient.playerId;
      handleGameOver(isMeWinner);
    });

    const offChat = multiplayerClient.on('chat_message', (data) => {
      setMultiplayerChat((prev) => [...prev.slice(-10), data.message]);
    });

    return () => {
      offAscended();
      offEliminated();
      offTick();
      offGameOver();
      offChat();
    };
  }, [isMultiplayerActive]);

  // Update avatar customization in scene
  const handleUpdateAvatar = (newCust: AvatarCustomization) => {
    setAvatarCustomization(newCust);
    if (towerSceneRef.current) {
      towerSceneRef.current.updateAvatarCustomization(newCust);
    }
  };

  // Start Solo Game Handler
  const handleStartSoloGame = (mode: GameMode = 'race') => {
    setIsMultiplayerActive(false);
    setGameMode(mode);
    setGameState('playing');
    setIsVictory(false);
    setLastFeedback(null);
    setPlayerHeight(2);
    setLavaHeight(-2);
    setScore(0);
    setStreak(0);
    setQuestionIndex(0);

    const now = performance.now();
    setRunStartTime(now);
    setQuestionStartTime(now);

    // Initialize 4 AI Competitor Bots
    const hats: AvatarCustomization['hatType'][] = ['bacon', 'crown', 'valk', 'fedora'];
    const shirts = ['#0088cc', '#ff3366', '#ffaa00', '#9933cc'];
    const bots: CompetitorBot[] = BOT_NAMES.slice(0, 4).map((name, i) => ({
      id: `bot-${i}`,
      name,
      avatarColor: '#FFD900',
      shirtColor: shirts[i],
      hatType: hats[i],
      height: 2,
      speedMultiplier: 0.85 + Math.random() * 0.35,
      accuracy: 0.8 + Math.random() * 0.15,
      isAlive: true,
      lastAnswerTime: now
    }));
    setCompetitors(bots);

    // Reset Three.js Scene
    if (towerSceneRef.current) {
      towerSceneRef.current.isTitleScreen = false;
      towerSceneRef.current.resetScene();
      towerSceneRef.current.initCompetitors(bots);
    }

    resetPlayerStats(mode === 'race' ? 100 : 9999);
  };

  // Start Multiplayer Game Handler (triggered by MultiplayerLobby countdown)
  const handleStartMultiplayerGame = (roomState: RoomState) => {
    setIsMultiplayerLobbyOpen(false);
    setIsMultiplayerActive(true);
    setMultiplayerRoomState(roomState);
    setGameMode('race');
    setGameState('playing');
    setIsVictory(false);
    setLastFeedback(null);
    setPlayerHeight(2);
    setLavaHeight(roomState.lavaHeight);
    setScore(0);
    setStreak(0);
    setQuestionIndex(0);

    const now = performance.now();
    setRunStartTime(now);
    setQuestionStartTime(now);

    const otherPlayers = roomState.players.filter(
      (p) => p.id !== multiplayerClient.playerId
    );
    setCompetitors(otherPlayers);

    // Setup 3D Scene with real other players' towers
    if (towerSceneRef.current) {
      towerSceneRef.current.isTitleScreen = false;
      towerSceneRef.current.resetScene();
      towerSceneRef.current.initMultiplayerCompetitors(
        roomState.players,
        multiplayerClient.playerId
      );
    }

    resetPlayerStats(roomState.targetHeight || 100);
  };

  const resetPlayerStats = (targetHeight: number) => {
    setPlayerStats({
      height: 2,
      targetHeight,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      categoryStats: {
        'subject-verb': { correct: 0, total: 0 },
        'verb-tenses': { correct: 0, total: 0 },
        'homophones': { correct: 0, total: 0 },
        'pronouns': { correct: 0, total: 0 },
        'comparatives': { correct: 0, total: 0 },
        'plurals': { correct: 0, total: 0 },
        'prepositions': { correct: 0, total: 0 },
        'apostrophes': { correct: 0, total: 0 }
      }
    });
  };

  // Solo Simulation Loop (Only active when NOT in multiplayer)
  useEffect(() => {
    if (gameState !== 'playing' || isMultiplayerActive) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedRunSeconds = (now - runStartTime) / 1000;

      // Calculate lava rising
      const speed = calculateLavaSpeed(elapsedRunSeconds, playerHeight, gameMode);
      const dt = 0.1;
      const newLavaY = lavaHeight + speed * dt;
      setLavaHeight(newLavaY);

      if (towerSceneRef.current) {
        towerSceneRef.current.setLavaHeight(newLavaY);
      }

      // Check Loss
      if (checkLossCondition(playerHeight, newLavaY, gameMode)) {
        handleGameOver(false);
        return;
      }

      // Check Win
      if (checkWinCondition(playerHeight, playerStats.targetHeight, gameMode)) {
        handleGameOver(true);
        return;
      }

      // Simulate AI Bots
      setCompetitors((prevBots) => {
        return prevBots.map((bot) => {
          if (bot.isAlive === false) return bot;

          if (newLavaY >= bot.height) {
            const avatar = towerSceneRef.current?.competitorAvatars.get(bot.id);
            if (avatar) avatar.triggerFall();
            return { ...bot, isAlive: false };
          }

          const botSpeed = 1.0;
          const intervalBetweenAnswers = (4.8 / botSpeed) * 1000;
          if (Math.random() < 0.25) {
            let newHeight = bot.height + 2;
            if (towerSceneRef.current) {
              const heightIndex = Math.floor(newHeight / 2) - 1;
              towerSceneRef.current.addBotBlock(bot.id, heightIndex);
            }
            return {
              ...bot,
              height: newHeight
            };
          }
          return bot;
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, isMultiplayerActive, lavaHeight, playerHeight, runStartTime, gameMode, playerStats.targetHeight]);

  // Answer Submission Handler
  const handleSubmitAnswer = (rawAnswer: string) => {
    if (gameState !== 'playing') return;

    const now = performance.now();
    const answerTimeSeconds = (now - questionStartTime) / 1000;
    const isCorrect = checkAnswer(currentQuestion, rawAnswer);

    // If multiplayer, submit to authoritative server
    if (isMultiplayerActive) {
      multiplayerClient.submitAnswer(currentQuestion.id, rawAnswer, answerTimeSeconds);
    }

    // Update feedback toast
    setLastFeedback({
      isCorrect,
      explanation: currentQuestion.ruleExplanation,
      answer: currentQuestion.answer
    });

    // Update Stats
    const cat = currentQuestion.category;
    setPlayerStats((prev) => {
      const currentCat = prev.categoryStats[cat] || { correct: 0, total: 0 };
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalAnswers: prev.totalAnswers + 1,
        categoryStats: {
          ...prev.categoryStats,
          [cat]: {
            correct: currentCat.correct + (isCorrect ? 1 : 0),
            total: currentCat.total + 1
          }
        }
      };
    });

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      const points = calculateScore(100, newStreak, currentQuestion.difficulty, answerTimeSeconds);
      setScore((s) => s + points);

      const blocksGained = calculateBlockGain(newStreak, answerTimeSeconds);
      const newHeight = playerHeight + blocksGained;
      setPlayerHeight(newHeight);

      soundManager.playBlockSlam(newStreak);
      soundManager.playCorrectChime(newStreak);

      if (towerSceneRef.current) {
        const heightIndex = Math.floor(newHeight / 2) - 1;
        towerSceneRef.current.addPlayerBlock(heightIndex);
      }

      if (!isMultiplayerActive && checkWinCondition(newHeight, playerStats.targetHeight, gameMode)) {
        handleGameOver(true);
        return;
      }
    } else {
      setStreak(0);
      soundManager.playWrongBuzz();
    }

    // Advance to next question
    setQuestionIndex((prev) => (prev + 1) % questionList.length);
    setQuestionStartTime(performance.now());
  };

  // Game Over / Victory Trigger
  const handleGameOver = (victory: boolean) => {
    setGameState('gameover');
    setIsVictory(victory);
    const duration = Math.round((performance.now() - runStartTime) / 1000);
    setFinalTimeSeconds(duration);

    if (victory) {
      soundManager.playVictoryFanfare();
      if (towerSceneRef.current) {
        towerSceneRef.current.playerAvatar.triggerCheer();
      }
    } else {
      soundManager.playOofSound();
      if (towerSceneRef.current) {
        towerSceneRef.current.playerAvatar.triggerFall();
      }
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleReturnTitle = () => {
    if (isMultiplayerActive) {
      multiplayerClient.leaveRoom();
      setIsMultiplayerActive(false);
    }
    setGameState('title');
    if (towerSceneRef.current) {
      towerSceneRef.current.isTitleScreen = true;
      towerSceneRef.current.resetScene();
    }
  };

  const handleSendChat = (text: string) => {
    if (isMultiplayerActive) {
      multiplayerClient.sendChat(text);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Mount (Isolated from React DOM state) */}
      <div
        ref={canvasContainerRef}
        data-testid="threejs-canvas"
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
      />

      {/* Title Screen View */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartSoloGame}
          avatarCustomization={avatarCustomization}
          onUpdateAvatar={handleUpdateAvatar}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenStudyHub={() => setIsStudyHubOpen(true)}
          onOpenMultiplayer={() => setIsMultiplayerLobbyOpen(true)}
        />
      )}

      {/* Playing HUD */}
      {gameState === 'playing' && (
        <GameplayHUD
          currentQuestion={currentQuestion}
          onSubmitAnswer={handleSubmitAnswer}
          playerHeight={playerHeight}
          targetHeight={playerStats.targetHeight}
          lavaHeight={lavaHeight}
          score={score}
          streak={streak}
          competitors={competitors}
          gameMode={gameMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => setGameState('paused')}
          lastFeedback={lastFeedback}
          isMultiplayer={isMultiplayerActive}
          onSendChat={handleSendChat}
          recentChat={multiplayerChat}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={() => handleStartSoloGame(gameMode)}
          onOpenStudyHub={() => setIsStudyHubOpen(true)}
          onReturnTitle={handleReturnTitle}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Outcome Modals */}
      {gameState === 'gameover' && isVictory && (
        <VictoryModal
          stats={{ ...playerStats, height: playerHeight, score }}
          timeSeconds={finalTimeSeconds}
          onPlayAgain={() => (isMultiplayerActive ? setIsMultiplayerLobbyOpen(true) : handleStartSoloGame(gameMode))}
          onOpenStudyHub={() => setIsStudyHubOpen(true)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {gameState === 'gameover' && !isVictory && (
        <GameOverModal
          stats={{ ...playerStats, height: playerHeight, score }}
          lavaHeight={lavaHeight}
          onTryAgain={() => (isMultiplayerActive ? setIsMultiplayerLobbyOpen(true) : handleStartSoloGame(gameMode))}
          onOpenStudyHub={() => setIsStudyHubOpen(true)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* FYP Grammar Study Hub Modal */}
      {isStudyHubOpen && <StudyHubModal onClose={() => setIsStudyHubOpen(false)} />}

      {/* Real-Time Multiplayer Lobby Modal */}
      {isMultiplayerLobbyOpen && (
        <MultiplayerLobbyModal
          playerName={playerName}
          onUpdatePlayerName={setPlayerName}
          avatarCustomization={avatarCustomization}
          onStartMultiplayerGame={handleStartMultiplayerGame}
          onClose={() => setIsMultiplayerLobbyOpen(false)}
        />
      )}
    </main>
  );
}
