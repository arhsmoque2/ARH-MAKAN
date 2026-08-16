/**
 * ARH-MAKAN Web Audio Synthesized Chime Engine
 * Absorbed and upgraded from amogha-cafe/kitchen.
 * Generates zero-latency synthesized bells/pings without external audio files.
 */

class FnbAudioEngine {
  constructor() {
    this.ctx = null;
    this.isUnlocked = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isUnlocked = !!(this.ctx && this.ctx.state === 'running');
    return this.isUnlocked;
  }

  unlock() {
    const success = this.init();
    if (success) {
      this.playGentlePing();
    }
    return success;
  }

  /**
   * Dual-tone marimba chime for incoming orders
   */
  playNewOrderChime() {
    if (!this.init()) return;
    const now = this.ctx.currentTime;

    // First Tone (F5 - 698.46 Hz)
    this._playTone(698.46, now, 0.4, 'sine', 0.2);
    // Second Tone (A5 - 880.00 Hz)
    this._playTone(880.00, now + 0.12, 0.4, 'sine', 0.25);
    // Third Harmonizing Tone (C6 - 1046.50 Hz)
    this._playTone(1046.50, now + 0.24, 0.6, 'triangle', 0.3);
  }

  /**
   * Quick pleasant pop for item completion / bump
   */
  playBumpChime() {
    if (!this.init()) return;
    const now = this.ctx.currentTime;
    this._playTone(523.25, now, 0.15, 'sine', 0.15);
    this._playTone(783.99, now + 0.08, 0.2, 'sine', 0.2);
  }

  /**
   * Urgent pulse for overdue orders (>20m) or critical service calls
   */
  playUrgentAlert() {
    if (!this.init()) return;
    const now = this.ctx.currentTime;
    this._playTone(987.77, now, 0.18, 'sawtooth', 0.15);
    this._playTone(987.77, now + 0.22, 0.18, 'sawtooth', 0.15);
  }

  /**
   * Subtle soft ping for UI feedback
   */
  playGentlePing() {
    if (!this.init()) return;
    const now = this.ctx.currentTime;
    this._playTone(880, now, 0.15, 'sine', 0.1);
  }

  _playTone(freq, startTime, duration, type = 'sine', peakGain = 0.2) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope: Attack -> Decay -> Release
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio tone synthesis error:', e);
    }
  }
}

export const sound = new FnbAudioEngine();
