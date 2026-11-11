import React, { useState, useEffect } from 'react';
import { multiplayerClient } from '../utils/multiplayerClient';
import { RoomState, MultiplayerPlayer } from '../types/multiplayer';
import { AvatarCustomization } from '../three/RobloxAvatar';
import { Users, Play, Check, X, ShieldAlert, Sparkles, Copy, LogOut } from 'lucide-react';

interface MultiplayerLobbyModalProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  avatarCustomization: AvatarCustomization;
  onStartMultiplayerGame: (roomState: RoomState) => void;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  playerName,
  onUpdatePlayerName,
  avatarCustomization,
  onStartMultiplayerGame,
  onClose
}) => {
  const [roomIdInput, setRoomIdInput] = useState('ARENA-1');
  const [inRoom, setInRoom] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    multiplayerClient.connect().catch((err) => {
      console.warn('Could not connect to multiplayer server:', err);
    });

    const offJoined = multiplayerClient.on('room_joined', (data) => {
      setInRoom(true);
      setMyPlayerId(data.yourId);
      setRoomState(data.state);
    });

    const offTick = multiplayerClient.on('countdown_tick', (data) => {
      setCountdown(data.countdown);
    });

    const offStarted = multiplayerClient.on('game_started', (data) => {
      onStartMultiplayerGame(data.state);
    });

    const offPlayerJoined = multiplayerClient.on('player_joined', (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        const exists = prev.players.some((p) => p.id === data.player.id);
        if (exists) return prev;
        return { ...prev, players: [...prev.players, data.player] };
      });
    });

    const offPlayerLeft = multiplayerClient.on('player_left', (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p) => p.id !== data.playerId)
        };
      });
    });

    const offPlayerUpdated = multiplayerClient.on('player_updated', (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) => (p.id === data.player.id ? data.player : p))
        };
      });
    });

    const offSync = multiplayerClient.on('room_sync', (data) => {
      if (data.state) setRoomState(data.state);
    });

    return () => {
      offJoined();
      offTick();
      offStarted();
      offPlayerJoined();
      offPlayerLeft();
      offPlayerUpdated();
      offSync();
    };
  }, [onStartMultiplayerGame]);

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomIdInput.trim()) return;
    multiplayerClient.joinRoom(roomIdInput.trim(), playerName.trim() || 'Player', avatarCustomization);
  };

  const handleToggleReady = () => {
    multiplayerClient.toggleReady();
  };

  const handleStartHost = () => {
    multiplayerClient.startGame();
  };

  const handleLeave = () => {
    multiplayerClient.leaveRoom();
    setInRoom(false);
    setRoomState(null);
  };

  const handleCopyCode = () => {
    if (roomState) {
      navigator.clipboard?.writeText(roomState.roomId).catch(() => {});
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const me = roomState?.players.find((p) => p.id === myPlayerId);
  const isHost = me?.isHost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="w-full max-w-xl bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(255,100,0,0.4)] text-white relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-amber-400">
                MULTIPLAYER LAVA RACE
              </h2>
              <p className="text-xs text-stone-400">
                {inRoom ? `Room: ${roomState?.roomId}` : 'Race live with players on adjacent towers'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (inRoom) handleLeave();
              onClose();
            }}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown Overlay if active */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 z-20 bg-black/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-2">
              RACE COMMENCING IN
            </div>
            <div className="text-7xl font-black text-amber-400 animate-ping">
              {countdown}
            </div>
            <div className="text-xs text-stone-400 mt-4">
              Ascend to 100m before the lava catches you!
            </div>
          </div>
        )}

        {/* STEP 1: Join / Create Room Screen */}
        {!inRoom ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Your Roblox Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => onUpdatePlayerName(e.target.value)}
                maxLength={20}
                placeholder="Enter player username"
                className="w-full px-4 py-2.5 bg-black/60 border border-stone-700 focus:border-amber-400 rounded-xl text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Room Code / Match ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  placeholder="ARENA-1 or custom code"
                  className="flex-1 px-4 py-2.5 bg-black/60 border border-stone-700 focus:border-amber-400 rounded-xl text-white font-mono font-bold uppercase tracking-wider outline-none"
                />
                <button
                  type="button"
                  onClick={() => setRoomIdInput('ROOM-' + Math.floor(1000 + Math.random() * 9000))}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl text-xs text-stone-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> How Live Multiplayer Works:
              </div>
              <p>• Connect with friends or public racers in real time via WebSockets.</p>
              <p>• Everyone gets their own adjacent 3D tower in the volcanic caldera.</p>
              <p>• Synchronized lava rises authoritative from the server; first to 100m wins!</p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-base uppercase rounded-xl border border-yellow-300 transition shadow-lg cursor-pointer"
            >
              JOIN MULTIPLAYER ROOM ↵
            </button>
          </form>
        ) : (
          /* STEP 2: In-Room Lobby View */
          <div className="space-y-4">
            {/* Room Info Bar */}
            <div className="flex items-center justify-between p-3 bg-black/50 border border-white/10 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase">ROOM CODE</span>
                <div className="text-lg font-black font-mono text-amber-400 tracking-wider">
                  {roomState?.roomId}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg border border-white/10 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleLeave}
                  className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg border border-red-500/30 transition cursor-pointer"
                  title="Leave Room"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Connected Racers List */}
            <div>
              <div className="text-xs font-bold uppercase text-stone-400 mb-2 flex justify-between">
                <span>RACING ROSTER ({roomState?.players.length || 0}/6)</span>
                <span className="text-amber-400">100m Summit Race</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {roomState?.players.map((p) => {
                  const isCurrent = p.id === myPlayerId;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm transition ${
                        isCurrent
                          ? 'bg-amber-950/40 border-amber-500/50 text-white'
                          : 'bg-black/40 border-white/10 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: p.avatar.torsoColor }}
                        />
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">
                              YOU
                            </span>
                          )}
                          {p.isHost && (
                            <span className="text-[10px] bg-indigo-500/80 text-white px-1.5 py-0.2 rounded font-bold">
                              HOST
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.ready ? (
                          <span className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                            <Check className="w-3.5 h-3.5" /> READY
                          </span>
                        ) : (
                          <span className="text-xs text-stone-500 font-semibold">NOT READY</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions: Ready & Start */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleToggleReady}
                className={`flex-1 py-3 px-4 font-black text-sm uppercase rounded-xl border transition shadow cursor-pointer ${
                  me?.ready
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-stone-800 hover:bg-stone-700 text-white border-white/20'
                }`}
              >
                {me?.ready ? '✓ YOU ARE READY' : 'CLICK TO READY UP'}
              </button>

              {isHost && (
                <button
                  onClick={handleStartHost}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-sm uppercase rounded-xl border border-yellow-300 transition shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" /> START RACE NOW
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
