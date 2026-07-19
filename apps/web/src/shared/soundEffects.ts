export type SoundPackId = 'pixel' | 'bubble' | 'glass' | 'silent';

/**
 * Tolk audio engine — WebAudio synths (no external samples).
 * Separate gains for notifications vs send so mixer can split them.
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  /** Master 0–1; baseGain pushed high so 100% is actually loud */
  public volume = 0.85;
  public notifVolume = 1;
  public sendVolume = 1;
  private baseGain = 4.2;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  private gain(kind: 'notif' | 'send', mult = 1) {
    const k = kind === 'notif' ? this.notifVolume : this.sendVolume;
    return Math.max(0.0001, this.volume * k * this.baseGain * mult);
  }

  /** Notification pack — dual chime */
  playPixelPush() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const isBackground =
        typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const v = this.gain('notif', isBackground ? 0.55 : 0.38);

      const note = (freq: number, t0: number, dur: number) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(v, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(g);
        g.connect(this.ctx!.destination);
        osc.start(t0);
        osc.stop(t0 + dur);
      };
      note(784, now, 0.16);
      note(1046.5, now + 0.055, 0.22);
    } catch (e) {
      console.warn('[Sound] push failed', e);
    }
  }

  /** Send — short ink tick (Tolk) */
  playSent(pack: SoundPackId = 'pixel') {
    if (pack === 'silent') return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const v = this.gain('send', pack === 'glass' ? 0.22 : pack === 'bubble' ? 0.18 : 0.2);

      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = pack === 'glass' ? 'triangle' : 'sine';
      if (pack === 'bubble') {
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.07);
      } else if (pack === 'glass') {
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
      } else {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
      }
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(v, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('[Sound] sent failed', e);
    }
  }

  playReceivedSoft() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const v = this.gain('notif', 0.16);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(v, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('[Sound] received failed', e);
    }
  }

  playGlassTap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const v = this.gain('notif', 0.28);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(v, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn('[Sound] glass failed', e);
    }
  }

  playTheme(theme: SoundPackId) {
    if (theme === 'silent') return;
    if (theme === 'pixel') this.playPixelPush();
    else if (theme === 'bubble') this.playReceivedSoft();
    else this.playGlassTap();
  }

  /** Preview send sound for a pack */
  previewSend(pack: SoundPackId) {
    this.playSent(pack);
  }
}

export const soundEffects = new SoundEffects();

/** Map chat wallpaper theme → default sound pack */
export const THEME_SOUND_PACK: Record<string, SoundPackId> = {
  ink_void: 'pixel',
  paper_dust: 'glass',
  mint_wave: 'bubble',
  night: 'pixel',
  coffee: 'glass',
  party: 'bubble',
  words_tolk: 'pixel',
  travel: 'bubble',
};
