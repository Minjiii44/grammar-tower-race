import { RoomState, MultiplayerPlayer, ChatMessage } from '../types/multiplayer';
import { GrammarQuestion } from '../types/game';
import { AvatarCustomization } from '../three/RobloxAvatar';

type EventCallback<T = any> = (data: T) => void;

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  public playerId: string = '';
  public currentRoomState: RoomState | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isIntentionalClose: boolean = false;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }

      this.isIntentionalClose = false;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'room_joined') {
              this.playerId = data.yourId;
              this.currentRoomState = data.state;
            } else if (data.type === 'room_sync' || data.type === 'game_started' || data.type === 'game_over') {
              if (data.state) this.currentRoomState = data.state;
            }
            this.emit(data.type, data);
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        this.ws.onclose = () => {
          this.emit('disconnected', {});
          if (!this.isIntentionalClose) {
            // attempt reconnect after 2 seconds
            setTimeout(() => {
              if (!this.isIntentionalClose) {
                this.connect().catch(() => {});
              }
            }, 2000);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('WebSocket connection error:', err);
          reject(err);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  public joinRoom(roomId: string, playerName: string, avatar: AvatarCustomization) {
    this.send({
      type: 'join_room',
      roomId,
      playerName,
      avatar
    });
  }

  public toggleReady() {
    this.send({ type: 'toggle_ready' });
  }

  public startGame() {
    this.send({ type: 'start_game' });
  }

  public submitAnswer(questionId: string, answer: string, timeTaken: number) {
    this.send({
      type: 'submit_answer',
      questionId,
      answer,
      timeTaken
    });
  }

  public sendChat(text: string) {
    this.send({
      type: 'send_chat',
      text
    });
  }

  public leaveRoom() {
    this.send({ type: 'leave_room' });
    this.currentRoomState = null;
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
  }
}

export const multiplayerClient = new MultiplayerClient();
