import React, { useEffect } from 'react';
import { GameMode } from '../types/game';
import { AvatarCustomization } from '../three/RobloxAvatar';
import { Flame, Trophy, BookOpen, Volume2, VolumeX, Users } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  avatarCustomization: AvatarCustomization;
  onUpdateAvatar: (customization: AvatarCustomization) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStudyHub: () => void;
  onOpenMultiplayer: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  avatarCustomization,
  onUpdateAvatar,
  isMuted,
  onToggleMute,
  onOpenStudyHub,
  onOpenMultiplayer
}) => {
  const [selectedMode, setSelectedMode] = React.useState<GameMode>('race');

  // Start on Enter or Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame(selectedMode);
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, selectedMode, onToggleMute]);

  const hatOptions: { id: AvatarCustomization['hatType']; label: string }[] = [
    { id: 'noob', label: 'Classic Noob Cap' },
    { id: 'bacon', label: 'Bacon Hair' },
    { id: 'crown', label: 'Golden Crown' },
    { id: 'valk', label: 'Valkyrie Helm' },
    { id: 'fedora', label: 'Pro Fedora' }
  ];

  const shirtColors = [
    { name: 'Blue', color: '#0055BF' },
    { name: 'Red', color: '#D92525' },
    { name: 'Emerald', color: '#1B8A44' },
    { name: 'Purple', color: '#6B21A8' },
    { name: 'Dark', color: '#1E1E24' }
  ];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none p-6 md:p-10 select-none">
      {/* Top Bar Utilities */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Online Multiplayer Lobby Quick Button */}
          <button
            onClick={onOpenMultiplayer}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-300/40 px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition shadow-[0_4px_12px_rgba(0,180,255,0.35)] cursor-pointer"
          >
            <Users className="w-4 h-4 text-cyan-200" />
            <span>PLAY MULTIPLAYER (ONLINE)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStudyHub}
            className="flex items-center gap-1.5 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-lg cursor-pointer"
            title="Grammar Rules & Study Hub"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Grammar Study Hub</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 rounded-lg transition cursor-pointer"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Center Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto pointer-events-auto max-w-2xl mx-auto">
        {/* Bespoke SVG Title Lockup */}
        <div className="w-full max-w-lg mb-2 drop-shadow-[0_8px_16px_rgba(255,68,0,0.5)]">
          <svg viewBox="0 0 540 120" className="w-full h-auto">
            <defs>
              <linearGradient id="lavaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="45%" stopColor="#FF7700" />
                <stop offset="90%" stopColor="#D91E00" />
              </linearGradient>
              <linearGradient id="studGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0077FF" />
              </linearGradient>
            </defs>
            {/* Stud blocks emblem header */}
            <rect x="170" y="4" width="200" height="20" rx="4" fill="url(#studGrad)" stroke="#003388" strokeWidth="2" />
            <circle cx="210" cy="4" r="5" fill="#00E5FF" />
            <circle cx="270" cy="4" r="5" fill="#00E5FF" />
            <circle cx="330" cy="4" r="5" fill="#00E5FF" />
            <text x="270" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" letterSpacing="3">ROBLOX STYLE</text>

            {/* Main Title Lettering */}
            <text
              x="270"
              y="68"
              textAnchor="middle"
              fill="url(#lavaGrad)"
              stroke="#2B0500"
              strokeWidth="5"
              strokeLinejoin="miter"
              paintOrder="stroke fill"
              fontSize="48"
              fontWeight="900"
              letterSpacing="2"
              fontFamily="Impact, sans-serif"
            >
              GRAMMAR TOWER
            </text>
            <text
              x="270"
              y="104"
              textAnchor="middle"
              fill="#FFFFFF"
              stroke="#D91E00"
              strokeWidth="4"
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize="24"
              fontWeight="900"
              letterSpacing="6"
              fontFamily="Impact, sans-serif"
            >
              RISING LAVA RACE
            </text>
          </svg>
        </div>

        <p className="text-stone-300 text-sm md:text-base font-medium max-w-lg mb-5 drop-shadow">
          Correct grammatical errors & fill blanks to stack tower blocks before the boiling molten lava catches you!
        </p>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-4">
          <button
            onClick={() => setSelectedMode('race')}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedMode === 'race'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 border-yellow-300 text-white ring-2 ring-yellow-400/50 shadow-lg'
                : 'bg-black/60 hover:bg-black/80 border-white/10 text-stone-300'
            }`}
          >
            <Flame className="w-5 h-5 text-yellow-300 shrink-0" />
            <div>
              <div className="font-black text-sm uppercase">100m Lava Race</div>
              <div className="text-xs text-white/80">Race 4 AI bots to summit!</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('endless')}
            className={`flex items-center gap-2 p-3 rounded-xl border text-left transition cursor-pointer ${
              selectedMode === 'endless'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 border-pink-300 text-white ring-2 ring-pink-400/50 shadow-lg'
                : 'bg-black/60 hover:bg-black/80 border-white/10 text-stone-300'
            }`}
          >
            <Trophy className="w-5 h-5 text-pink-300 shrink-0" />
            <div>
              <div className="font-black text-sm uppercase">Endless Climb</div>
              <div className="text-xs text-white/80">Survive accelerating lava!</div>
            </div>
          </button>
        </div>

        {/* Action Buttons: Solo Start + Multiplayer Button */}
        <div className="flex flex-col gap-2.5 w-full max-w-md">
          <button
            data-start="true"
            onClick={() => onStartGame(selectedMode)}
            className="w-full py-3.5 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xl uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(255,100,0,0.5)] border-2 border-yellow-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            START SOLO CLIMB (ENTER)
          </button>

          <button
            onClick={onOpenMultiplayer}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-black text-base uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgba(0,150,255,0.4)] border border-cyan-300/50 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5 text-cyan-200" />
            <span>RACE OTHER PLAYERS (MULTIPLAYER)</span>
          </button>
        </div>

        {/* Avatar Customization Drawer */}
        <div className="mt-5 p-3 bg-black/65 border border-white/10 rounded-xl w-full max-w-md">
          <div className="text-xs font-bold uppercase text-stone-400 mb-2 flex justify-between">
            <span>Avatar Customizer</span>
            <span className="text-amber-400">Roblox Outfit</span>
          </div>

          <div className="flex gap-2 justify-center mb-2">
            {shirtColors.map((s) => (
              <button
                key={s.name}
                onClick={() => onUpdateAvatar({ ...avatarCustomization, torsoColor: s.color })}
                style={{ backgroundColor: s.color }}
                className={`w-7 h-7 rounded-lg border-2 transition cursor-pointer ${
                  avatarCustomization.torsoColor === s.color ? 'border-yellow-400 scale-110 shadow' : 'border-white/20'
                }`}
                title={`${s.name} Shirt`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {hatOptions.map((h) => (
              <button
                key={h.id}
                onClick={() => onUpdateAvatar({ ...avatarCustomization, hatType: h.id })}
                className={`px-2 py-1 text-xs font-bold rounded border transition cursor-pointer ${
                  avatarCustomization.hatType === h.id
                    ? 'bg-amber-500 text-black border-yellow-300'
                    : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flat Control Hints */}
      <div className="text-center pointer-events-auto">
        <p className="text-xs font-semibold tracking-wider text-stone-400">
          Type Answer + Enter · 1/2/3/4 Quick Tap · Esc Pause · M Mute
        </p>
      </div>
    </div>
  );
};
