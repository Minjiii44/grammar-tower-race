import React, { useState, useEffect, useRef } from 'react';
import { GrammarQuestion, CompetitorBot, GameMode } from '../types/game';
import { Flame, Pause, Volume2, VolumeX, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export interface HUDCompetitor {
  id: string;
  name: string;
  height: number;
  isAlive?: boolean;
}

interface GameplayHUDProps {
  currentQuestion: GrammarQuestion;
  onSubmitAnswer: (answer: string) => void;
  playerHeight: number;
  targetHeight: number;
  lavaHeight: number;
  score: number;
  streak: number;
  competitors: HUDCompetitor[];
  gameMode: GameMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  lastFeedback: { isCorrect: boolean; explanation: string; answer: string } | null;
  isMultiplayer?: boolean;
  onSendChat?: (text: string) => void;
  recentChat?: { id?: string; sender: string; text: string }[];
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  currentQuestion,
  onSubmitAnswer,
  playerHeight,
  targetHeight,
  lavaHeight,
  score,
  streak,
  competitors,
  gameMode,
  isMuted,
  onToggleMute,
  onPause,
  lastFeedback,
  isMultiplayer = false,
  onSendChat,
  recentChat = []
}) => {
  const [typedInput, setTypedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input bar on question change
  useEffect(() => {
    setTypedInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  // Keep focus on input unless user interacts with other keys
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPause();
      } else if (e.key.toLowerCase() === 'm' && document.activeElement !== inputRef.current) {
        onToggleMute();
      } else if (['1', '2', '3', '4'].includes(e.key) && currentQuestion.options && !typedInput) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[idx]) {
          e.preventDefault();
          onSubmitAnswer(currentQuestion.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [currentQuestion, onSubmitAnswer, onPause, onToggleMute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onSubmitAnswer(typedInput);
    setTypedInput('');
  };

  // Distance from lava to player's feet
  const lavaDistance = Math.max(0, playerHeight - lavaHeight);
  const isLavaCritical = lavaDistance < 4;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none z-10">
      {/* Top Perimeter Status Cluster */}
      <div className="flex justify-between items-start w-full">
        {/* Height & Score Cluster */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="bg-black/75 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">TOWER HEIGHT</div>
              <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                <span>{Math.round(playerHeight)}m</span>
                {gameMode === 'race' && <span className="text-xs text-stone-400">/ {targetHeight}m</span>}
              </div>
            </div>

            <div className="h-8 w-px bg-white/20" />

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">SCORE</div>
              <div className="text-xl font-black text-amber-400 tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>

            {streak >= 2 && (
              <>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 px-2 py-1 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-black text-amber-300 tabular-nums">{streak}x STREAK</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lava Proximity Danger Meter (Top Center) */}
        {gameMode !== 'study' && (
          <div className="flex flex-col items-center pointer-events-auto">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-lg ${
                isLavaCritical
                  ? 'bg-red-600/90 border-yellow-300 text-white animate-bounce'
                  : lavaDistance < 8
                  ? 'bg-amber-600/80 border-amber-400/50 text-white'
                  : 'bg-black/70 border-white/10 text-stone-300'
              }`}
            >
              <Flame className={`w-4 h-4 ${isLavaCritical ? 'text-yellow-300' : 'text-red-400'}`} />
              <span className="tabular-nums">LAVA: {lavaDistance.toFixed(1)}m BELOW</span>
            </div>
          </div>
        )}

        {/* Utilities & Mini Leaderboard */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-2 bg-black/70 hover:bg-black/90 text-white border border-white/20 rounded-lg transition cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onPause}
              className="p-2 bg-black/70 hover:bg-black/90 text-white border border-white/20 rounded-lg transition cursor-pointer"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Mini Competitor Tracker */}
          {competitors.length > 0 && (
            <div className="bg-black/80 border border-white/15 rounded-xl p-2.5 text-xs w-44 shadow-lg hidden sm:block">
              <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1 border-b border-white/10 pb-0.5 flex justify-between items-center">
                <span>{isMultiplayer ? 'LIVE MULTIPLAYER' : 'RACE STANDINGS'}</span>
                {isMultiplayer && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                <div className="flex justify-between items-center text-amber-300 font-bold">
                  <span className="truncate">YOU</span>
                  <span className="tabular-nums">{Math.round(playerHeight)}m</span>
                </div>
                {competitors.map((comp) => (
                  <div key={comp.id} className="flex justify-between items-center text-stone-300 text-[11px]">
                    <span className={`truncate max-w-[95px] ${comp.isAlive === false ? 'line-through text-red-400' : ''}`}>
                      {comp.name}
                    </span>
                    <span className="tabular-nums font-mono">
                      {comp.isAlive === false ? (
                        <span className="text-[9px] text-red-400 font-bold">OOF!</span>
                      ) : (
                        `${Math.round(comp.height)}m`
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Reactions for Multiplayer */}
              {isMultiplayer && onSendChat && (
                <div className="mt-2 pt-1.5 border-t border-white/10 flex gap-1">
                  {['GG!', 'LAVA!', 'OOF!', 'NICE!'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onSendChat(q)}
                      className="flex-1 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px] font-bold text-stone-300 hover:text-white transition cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Live Chat Ticker (Multiplayer) */}
          {isMultiplayer && recentChat && recentChat.length > 0 && (
            <div className="flex flex-col gap-1 w-44">
              {recentChat.slice(-2).map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="bg-black/75 border border-cyan-500/40 px-2 py-1 rounded-lg text-[10px] text-cyan-200 animate-fade-in shadow truncate"
                >
                  <span className="font-bold text-amber-300">{c.sender}: </span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Educational Feedback Pill (center-top) */}
      {lastFeedback && (
        <div className="mx-auto pointer-events-auto max-w-lg mb-2 animate-fade-in">
          <div
            className={`flex items-start gap-2.5 px-4 py-2.5 rounded-xl border text-xs shadow-xl ${
              lastFeedback.isCorrect
                ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-100'
                : 'bg-red-950/90 border-red-500/60 text-red-100'
            }`}
          >
            {lastFeedback.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>{lastFeedback.isCorrect ? 'CORRECT! +BLOCKS STACKED' : 'INCORRECT!'}</span>
                {!lastFeedback.isCorrect && (
                  <span className="bg-red-600/40 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
                    Answer: {lastFeedback.answer}
                  </span>
                )}
              </div>
              <p className="mt-0.5 opacity-90 leading-relaxed font-sans">{lastFeedback.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom Typing & Question Console */}
      <div className="mx-auto w-full max-w-2xl pointer-events-auto">
        <div className="bg-black/85 border-2 border-amber-500/50 rounded-2xl p-4 md:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-none">
          {/* Question Header & Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-md text-[11px] font-black text-amber-300 tracking-wider uppercase">
              {currentQuestion.categoryLabel}
            </span>
            <span className="text-[11px] font-medium text-stone-400 italic">
              Hint: {currentQuestion.hint}
            </span>
          </div>

          {/* Question Prompt Sentence */}
          <div className="text-base md:text-lg font-bold text-white mb-3 text-center leading-snug">
            {currentQuestion.prompt}
          </div>

          {/* Quick Choice Buttons if Options Available */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSubmitAnswer(option)}
                  className="flex items-center justify-between px-3 py-2 bg-stone-900/90 hover:bg-amber-600/80 border border-white/20 hover:border-yellow-300 rounded-xl text-white font-bold text-sm transition shadow cursor-pointer active:scale-95"
                >
                  <span className="truncate">{option}</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                    [{idx + 1}]
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Speed Typing Input Bar */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Type your answer here and press Enter..."
              className="flex-1 px-4 py-2.5 bg-black/80 border border-stone-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 rounded-xl text-white font-semibold text-base placeholder-stone-500 outline-none transition"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black uppercase text-sm rounded-xl border border-yellow-300/40 shadow-lg transition active:scale-95 cursor-pointer shrink-0"
            >
              STACK! ↵
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
