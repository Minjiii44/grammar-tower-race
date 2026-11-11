import React from 'react';
import { Play, RotateCcw, Home, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenStudyHub: () => void;
  onReturnTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenStudyHub,
  onReturnTitle,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-sm bg-stone-900 border-2 border-white/20 rounded-3xl p-6 text-white text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl font-black uppercase tracking-wider text-amber-400 mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-stone-400 mb-6">
          The lava has temporarily paused rising.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-sm uppercase rounded-xl border border-yellow-300/40 transition shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> Resume (Esc)
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase rounded-xl border border-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Restart Climb
          </button>

          <button
            onClick={onOpenStudyHub}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 font-bold text-xs uppercase rounded-xl border border-indigo-500/30 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> Grammar Study Hub
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-black/60 hover:bg-black/80 text-stone-300 font-semibold text-xs rounded-xl border border-white/10 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Sound: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent hover:bg-white/5 text-stone-400 hover:text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer mt-2"
          >
            <Home className="w-4 h-4" /> Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
