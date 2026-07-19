class SoundEffects {
  private ctx: AudioContext | null = null;
  /** Master volume 0–1; base gain is intentionally higher so 100% is actually loud */
  public volume = 0.8;
  private baseGain = 2.4;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Google Pixel-style dual chime for push notifications (like "Popcorn")
   * Refined to be extremely soft, warm, and quiet.
   * Volume is automatically boosted if the browser window/tab is backgrounded.
   */
  playPixelPush() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const isBackground = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const volumeBoost = isBackground ? 0.55 : 0.32;
      const effectiveVolume = volumeBoost * this.volume * this.baseGain;

      // Note 1 (G5, soft chime)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now); // G5
      gain1.gain.setValueAtTime(0.0, now);
      gain1.gain.linearRampToValueAtTime(effectiveVolume, now + 0.008); // 8ms soft attack
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2 (C6, perfect fourth chime, gentle and pleasant)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.05); // C6
      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.setValueAtTime(0.0, now + 0.05);
      gain2.gain.linearRampToValueAtTime(effectiveVolume, now + 0.058); // 8ms soft attack
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn('[Sound] Failed to play push sound:', e);
    }
  }

  /**
   * Soft UI pop/swoosh for sent messages (quieter and rounded)
   */
  playSent() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.08); // gentler sweep
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume * this.baseGain, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('[Sound] Failed to play sent sound:', e);
    }
  }

  /**
   * Subtle bubble pop for received messages in the currently active chat
   */
  playReceivedSoft() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06); // gentler fall
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume * this.baseGain, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('[Sound] Failed to play received sound:', e);
    }
  }

  /** Soft glass tap — third theme for mixer */
  playGlassTap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const v = 0.18 * this.volume * this.baseGain;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(v, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn('[Sound] glass tap failed', e);
    }
  }

  playTheme(theme: 'pixel' | 'bubble' | 'glass' | 'silent') {
    if (theme === 'silent') return;
    if (theme === 'pixel') this.playPixelPush();
    else if (theme === 'bubble') this.playReceivedSoft();
    else this.playGlassTap();
  }
}

export const soundEffects = new SoundEffects();
