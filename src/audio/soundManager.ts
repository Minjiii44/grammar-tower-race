/**
 * Procedural Web Audio Sound Synthesizer
 * Zero external audio files or dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lavaOsc: OscillatorNode | null = null;
  private lavaGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.lavaGain) {
      this.lavaGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Heavy block slam sound when a tower block drops into place under the avatar.
   */
  public playBlockSlam(streak: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch rises slightly with streak
    const baseFreq = 120 + Math.min(streak * 12, 100);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);

    // High clack transient for the stud snap
    const clack = this.ctx.createOscillator();
    const clackGain = this.ctx.createGain();
    clack.type = 'square';
    clack.frequency.setValueAtTime(800 + Math.min(streak * 40, 400), t);
    clack.frequency.exponentialRampToValueAtTime(150, t + 0.05);

    clackGain.gain.setValueAtTime(0.15, t);
    clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    clack.connect(clackGain);
    clackGain.connect(this.ctx.destination);

    clack.start(t);
    clack.stop(t + 0.07);
  }

  /**
   * Upbeat chime for correct answers, scaling up with streak.
   */
  public playCorrectChime(streak: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Major triad arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const baseNote = notes[Math.min(streak, notes.length - 1)];

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(baseNote, t);
    osc1.frequency.exponentialRampToValueAtTime(baseNote * 1.5, t + 0.25);

    osc2.frequency.setValueAtTime(baseNote * 1.25, t);
    osc2.frequency.exponentialRampToValueAtTime(baseNote * 2, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.38);
    osc2.stop(t + 0.38);
  }

  /**
   * Wrong answer buzz.
   */
  public playWrongBuzz() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * The iconic Roblox-style "OOF" sound synthesized purely through Web Audio!
   * Pitch down formant with quick decay.
   */
  public playOofSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Classic "OOF": drops from ~340Hz down to ~160Hz
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Springy jump sound.
   */
  public playJumpBoing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Updates ambient boiling lava rumble based on proximity to player's feet (0 to 1).
   */
  public updateLavaRumble(proximity: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (!this.lavaOsc) {
      this.lavaOsc = this.ctx.createOscillator();
      this.lavaGain = this.ctx.createGain();
      this.lavaOsc.type = 'sine';
      this.lavaOsc.frequency.setValueAtTime(55, t);

      this.lavaGain.gain.setValueAtTime(0, t);
      this.lavaOsc.connect(this.lavaGain);
      this.lavaGain.connect(this.ctx.destination);
      this.lavaOsc.start();
    }

    if (this.lavaGain && this.lavaOsc) {
      // Clamped proximity 0 (far) to 1 (touching)
      const clamped = Math.max(0, Math.min(proximity, 1));
      const targetGain = clamped > 0.1 ? (clamped * 0.15) : 0;
      this.lavaGain.gain.linearRampToValueAtTime(targetGain, t + 0.1);
      this.lavaOsc.frequency.linearRampToValueAtTime(50 + clamped * 35, t + 0.1);
    }
  }

  /**
   * Victory fanfare arpeggio!
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, time: 0, dur: 0.12 },
      { f: 659.25, time: 0.12, dur: 0.12 },
      { f: 783.99, time: 0.24, dur: 0.12 },
      { f: 1046.5, time: 0.36, dur: 0.4 }
    ];

    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.time);

      gain.gain.setValueAtTime(0.3, t + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur + 0.02);
    });
  }

  public dispose() {
    if (this.lavaOsc) {
      try {
        this.lavaOsc.stop();
        this.lavaOsc.disconnect();
      } catch {
        // ignore
      }
      this.lavaOsc = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const soundManager = new SoundManager();
