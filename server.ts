import http from 'node:http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRAMMAR_QUESTIONS } from './src/data/grammarQuestions.ts';
import { checkAnswer, calculateScore, calculateBlockGain, calculateLavaSpeed } from './src/game/rules.ts';
import { MultiplayerPlayer, RoomState, RoomStatus, ChatMessage } from './src/types/multiplayer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientSession {
  ws: WebSocket;
  playerId: string;
  name: string;
  roomId: string | null;
}

interface GameRoom {
  id: string;
  status: RoomStatus;
  countdown: number;
  lavaHeight: number;
  targetHeight: number;
  winnerId: string | null;
  clients: Map<string, ClientSession>;
  players: Map<string, MultiplayerPlayer>;
  questions: typeof GRAMMAR_QUESTIONS;
  tickInterval?: NodeJS.Timeout;
  countdownTimer?: NodeJS.Timeout;
  startTime: number;
}

const rooms = new Map<string, GameRoom>();
const clientSessions = new Map<WebSocket, ClientSession>();

function getPublicRoomsList(): { id: string; playerCount: number; status: RoomStatus }[] {
  const list: { id: string; playerCount: number; status: RoomStatus }[] = [];
  rooms.forEach((room) => {
    list.push({
      id: room.id,
      playerCount: room.players.size,
      status: room.status
    });
  });
  return list;
}

function broadcastToRoom(room: GameRoom, message: object) {
  const data = JSON.stringify(message);
  room.clients.forEach((session) => {
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(data);
    }
  });
}

function serializeRoomState(room: GameRoom): RoomState {
  return {
    roomId: room.id,
    status: room.status,
    countdown: room.countdown,
    lavaHeight: room.lavaHeight,
    targetHeight: room.targetHeight,
    players: Array.from(room.players.values()),
    winnerId: room.winnerId
  };
}

function startRoomCountdown(room: GameRoom) {
  if (room.status !== 'lobby') return;
  room.status = 'countdown';
  room.countdown = 3;

  broadcastToRoom(room, {
    type: 'countdown_tick',
    countdown: room.countdown
  });

  room.countdownTimer = setInterval(() => {
    room.countdown -= 1;
    if (room.countdown <= 0) {
      if (room.countdownTimer) clearInterval(room.countdownTimer);
      startRoomRace(room);
    } else {
      broadcastToRoom(room, {
        type: 'countdown_tick',
        countdown: room.countdown
      });
    }
  }, 1000);
}

function startRoomRace(room: GameRoom) {
  room.status = 'racing';
  room.lavaHeight = -2;
  room.startTime = Date.now();
  room.winnerId = null;

  // Reset player heights
  room.players.forEach((p) => {
    p.height = 2;
    p.score = 0;
    p.streak = 0;
    p.isAlive = true;
  });

  // Shuffle questions for this match
  room.questions = [...GRAMMAR_QUESTIONS].sort(() => Math.random() - 0.5);

  broadcastToRoom(room, {
    type: 'game_started',
    state: serializeRoomState(room),
    questions: room.questions
  });

  // Start 100ms authoritative tick loop for lava & win/loss checks
  if (room.tickInterval) clearInterval(room.tickInterval);
  room.tickInterval = setInterval(() => {
    if (room.status !== 'racing') return;

    const elapsed = (Date.now() - room.startTime) / 1000;
    // Highest player height
    let maxHeight = 2;
    let aliveCount = 0;
    room.players.forEach((p) => {
      if (p.height > maxHeight) maxHeight = p.height;
      if (p.isAlive) aliveCount++;
    });

    const lavaSpeed = calculateLavaSpeed(elapsed, maxHeight, 'race');
    room.lavaHeight += lavaSpeed * 0.1;

    // Check player eliminations against lava
    room.players.forEach((p) => {
      if (p.isAlive && room.lavaHeight >= p.height) {
        p.isAlive = false;
        broadcastToRoom(room, {
          type: 'player_eliminated',
          playerId: p.id,
          height: p.height
        });
      }
    });

    // Check win condition: player reached 100m
    let winner: MultiplayerPlayer | null = null;
    room.players.forEach((p) => {
      if (p.height >= room.targetHeight && !winner) {
        winner = p;
      }
    });

    // Or if all players died to lava, highest player wins
    if (!winner && aliveCount === 0 && room.players.size > 0) {
      let topPlayer: MultiplayerPlayer | null = null;
      room.players.forEach((p) => {
        if (!topPlayer || p.height > topPlayer.height) {
          topPlayer = p;
        }
      });
      winner = topPlayer;
    }

    if (winner) {
      room.status = 'finished';
      room.winnerId = (winner as MultiplayerPlayer).id;
      if (room.tickInterval) clearInterval(room.tickInterval);

      const leaderboard = Array.from(room.players.values()).sort(
        (a, b) => b.height - a.height || b.score - a.score
      );

      broadcastToRoom(room, {
        type: 'game_over',
        winnerId: room.winnerId,
        leaderboard,
        state: serializeRoomState(room)
      });
      return;
    }

    // Broadcast periodic state sync
    broadcastToRoom(room, {
      type: 'room_tick',
      lavaHeight: room.lavaHeight,
      players: Array.from(room.players.values())
    });
  }, 100);
}

function removeClientFromRoom(session: ClientSession) {
  if (!session.roomId) return;
  const room = rooms.get(session.roomId);
  if (!room) return;

  room.clients.delete(session.playerId);
  room.players.delete(session.playerId);

  broadcastToRoom(room, {
    type: 'player_left',
    playerId: session.playerId
  });

  if (room.clients.size === 0) {
    if (room.tickInterval) clearInterval(room.tickInterval);
    if (room.countdownTimer) clearInterval(room.countdownTimer);
    rooms.delete(room.id);
  } else {
    // Reassign host if host left
    const remainingPlayers = Array.from(room.players.values());
    if (remainingPlayers.length > 0 && !remainingPlayers.some((p) => p.isHost)) {
      remainingPlayers[0].isHost = true;
      broadcastToRoom(room, {
        type: 'room_sync',
        state: serializeRoomState(room)
      });
    }
  }
  session.roomId = null;
}

wss.on('connection', (ws: WebSocket) => {
  const session: ClientSession = {
    ws,
    playerId: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: 'Player',
    roomId: null
  };
  clientSessions.set(ws, session);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'get_rooms') {
        ws.send(JSON.stringify({ type: 'rooms_list', rooms: getPublicRoomsList() }));
        return;
      }

      if (msg.type === 'join_room') {
        const roomId = (msg.roomId || 'ARENA-1').trim().toUpperCase();
        session.name = (msg.playerName || 'Player').trim();

        // Leave existing room if any
        if (session.roomId) {
          removeClientFromRoom(session);
        }

        let room = rooms.get(roomId);
        const isNewRoom = !room;
        if (!room) {
          room = {
            id: roomId,
            status: 'lobby',
            countdown: 3,
            lavaHeight: -2,
            targetHeight: 100,
            winnerId: null,
            clients: new Map(),
            players: new Map(),
            questions: [...GRAMMAR_QUESTIONS],
            startTime: Date.now()
          };
          rooms.set(roomId, room);
        }

        session.roomId = roomId;
        room.clients.set(session.playerId, session);

        const newPlayer: MultiplayerPlayer = {
          id: session.playerId,
          name: session.name,
          avatar: msg.avatar || {
            skinColor: '#FFD900',
            torsoColor: '#0055BF',
            legsColor: '#267326',
            hatType: 'noob'
          },
          height: 2,
          score: 0,
          streak: 0,
          isAlive: true,
          isHost: isNewRoom || room.players.size === 0,
          ready: false
        };

        room.players.set(session.playerId, newPlayer);

        // Send full state to newly joined client
        ws.send(
          JSON.stringify({
            type: 'room_joined',
            yourId: session.playerId,
            state: serializeRoomState(room),
            questions: room.questions
          })
        );

        // Broadcast player joined to room
        broadcastToRoom(room, {
          type: 'player_joined',
          player: newPlayer
        });
        return;
      }

      if (msg.type === 'toggle_ready') {
        if (!session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room || room.status !== 'lobby') return;
        const player = room.players.get(session.playerId);
        if (!player) return;

        player.ready = !player.ready;
        broadcastToRoom(room, {
          type: 'player_updated',
          player
        });

        // If all players are ready, auto-countdown!
        const allReady = Array.from(room.players.values()).every((p) => p.ready);
        if (allReady && room.players.size >= 1) {
          startRoomCountdown(room);
        }
        return;
      }

      if (msg.type === 'start_game') {
        if (!session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room) return;
        const player = room.players.get(session.playerId);
        if (player && player.isHost && room.status === 'lobby') {
          startRoomCountdown(room);
        }
        return;
      }

      if (msg.type === 'submit_answer') {
        if (!session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room || room.status !== 'racing') return;
        const player = room.players.get(session.playerId);
        if (!player || !player.isAlive) return;

        const question = GRAMMAR_QUESTIONS.find((q) => q.id === msg.questionId);
        if (!question) return;

        const isCorrect = checkAnswer(question, msg.answer);
        if (isCorrect) {
          player.streak += 1;
          const points = calculateScore(100, player.streak, question.difficulty, msg.timeTaken || 3.0);
          player.score += points;

          const blocksGained = calculateBlockGain(player.streak, msg.timeTaken || 3.0);
          player.height += blocksGained;

          broadcastToRoom(room, {
            type: 'player_ascended',
            playerId: player.id,
            height: player.height,
            blocksGained,
            score: player.score,
            streak: player.streak
          });

          // Check if player reached 100m target height!
          if (player.height >= room.targetHeight) {
            room.status = 'finished';
            room.winnerId = player.id;
            if (room.tickInterval) clearInterval(room.tickInterval);

            const leaderboard = Array.from(room.players.values()).sort(
              (a, b) => b.height - a.height || b.score - a.score
            );

            broadcastToRoom(room, {
              type: 'game_over',
              winnerId: player.id,
              leaderboard,
              state: serializeRoomState(room)
            });
          }
        } else {
          player.streak = 0;
          broadcastToRoom(room, {
            type: 'player_wrong',
            playerId: player.id
          });
        }
        return;
      }

      if (msg.type === 'send_chat') {
        if (!session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room) return;
        const chatMsg: ChatMessage = {
          id: 'chat_' + Math.random().toString(36).substring(2, 9),
          sender: session.name,
          text: String(msg.text || '').substring(0, 100),
          time: Date.now()
        };
        broadcastToRoom(room, {
          type: 'chat_message',
          message: chatMsg
        });
        return;
      }

      if (msg.type === 'leave_room') {
        removeClientFromRoom(session);
        return;
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    const s = clientSessions.get(ws);
    if (s) {
      removeClientFromRoom(s);
      clientSessions.delete(ws);
    }
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Grammar Tower Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
