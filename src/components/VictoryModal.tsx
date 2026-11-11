import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats, GrammarCategory } from '../types/game';
import { Trophy, Clock, CheckCircle2, RotateCcw, Home, BookOpen, Star } from 'lucide-react';
import { computeCategoryMastery } from '../game/rules';

interface VictoryModalProps {
  stats: PlayerStats;
  timeSeconds: number;
  onPlayAgain: () => void;
  onOpenStudyHub: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  timeSeconds,
  onPlayAgain,
  onOpenStudyHub,
  onReturnTitle
}) => {
  useEffect(() => {
    // Launch festive confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const accuracy = stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 100;

  const categoryMastery = computeCategoryMastery(stats.categoryStats);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg bg-stone-900 border-2 border-yellow-400 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(255,200,0,0.4)] text-white relative">
        {/* Header Ribbon */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-lg mb-3">
            <Trophy className="w-10 h-10 text-stone-950" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-yellow-400 drop-shadow">
            TOWER ZENITH CONQUERED!
          </h2>
          <p className="text-stone-300 text-sm mt-1">
            You scaled the full 100m Grammar Tower and escaped the boiling magma!
          </p>
        </div>

        {/* Hero Stat Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Time
            </div>
            <div className="text-xl font-black text-white tabular-nums mt-1">
              {formatTime(timeSeconds)}
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Accuracy
            </div>
            <div className="text-xl font-black text-emerald-400 tabular-nums mt-1">
              {accuracy}%
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400 flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-400" /> Score
            </div>
            <div className="text-xl font-black text-amber-400 tabular-nums mt-1">
              {stats.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Academic FYP Grammar Mastery Breakdown */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="text-xs font-black uppercase text-amber-300 mb-2.5 flex justify-between items-center">
            <span>Grammar Category Mastery</span>
            <span className="text-[10px] text-stone-400 font-normal">FYP Evaluation</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {(Object.entries(categoryMastery) as [GrammarCategory, number][]).map(([cat, pct]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="capitalize text-stone-300 truncate max-w-[180px]">
                  {cat.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono font-bold tabular-nums text-white">
                    {pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-sm uppercase rounded-xl border border-yellow-300 transition shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>

          <button
            onClick={onOpenStudyHub}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold text-sm rounded-xl border border-indigo-400/30 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> Study Hub
          </button>

          <button
            onClick={onReturnTitle}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm rounded-xl border border-white/10 transition cursor-pointer"
          >
            <Home className="w-4 h-4" /> Menu
          </button>
        </div>
      </div>
    </div>
  );
};
