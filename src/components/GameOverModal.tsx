import React from 'react';
import { PlayerStats, GrammarCategory } from '../types/game';
import { Flame, RotateCcw, Home, BookOpen, AlertTriangle } from 'lucide-react';
import { computeCategoryMastery } from '../game/rules';

interface GameOverModalProps {
  stats: PlayerStats;
  lavaHeight: number;
  onTryAgain: () => void;
  onOpenStudyHub: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  lavaHeight,
  onTryAgain,
  onOpenStudyHub,
  onReturnTitle
}) => {
  const accuracy = stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 0;

  const categoryMastery = computeCategoryMastery(stats.categoryStats);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="w-full max-w-lg bg-stone-900 border-2 border-red-600 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(255,50,0,0.5)] text-white relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-red-600 to-amber-600 rounded-2xl shadow-lg mb-3">
            <Flame className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-red-500 drop-shadow">
            SIZZLED BY THE LAVA!
          </h2>
          <p className="text-stone-300 text-sm mt-1">
            The rising boiling magma caught your tower at <span className="font-bold text-amber-400">{Math.round(stats.height)}m</span>!
          </p>
        </div>

        {/* Hero Stat Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400">Height Reached</div>
            <div className="text-xl font-black text-amber-400 tabular-nums mt-1">
              {Math.round(stats.height)}m
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400">Questions</div>
            <div className="text-xl font-black text-white tabular-nums mt-1">
              {stats.correctAnswers}/{stats.totalAnswers}
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-stone-400">Accuracy</div>
            <div className={`text-xl font-black tabular-nums mt-1 ${accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Academic Grammar Breakdown */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="text-xs font-black uppercase text-amber-300 mb-2.5 flex justify-between items-center">
            <span>Grammar Performance Breakdown</span>
            <span className="text-[10px] text-stone-400 font-normal">Review Your Weaknesses</span>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
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
            onClick={onTryAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm uppercase rounded-xl border border-yellow-300/40 transition shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>

          <button
            onClick={onOpenStudyHub}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-bold text-sm rounded-xl border border-indigo-400/30 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> Study Rules
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
