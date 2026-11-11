import { AvatarCustomization } from '../three/RobloxAvatar';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: AvatarCustomization;
  height: number;
  score: number;
  streak: number;
  isAlive: boolean;
  isHost: boolean;
  ready: boolean;
}

export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished';

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  countdown: number;
  lavaHeight: number;
  targetHeight: number;
  players: MultiplayerPlayer[];
  winnerId: string | null;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: number;
}
