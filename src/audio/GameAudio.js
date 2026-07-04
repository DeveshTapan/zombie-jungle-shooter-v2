import { AUDIO_CONFIG } from './audioConfig.js';

// Small, dependency-free Web Audio synthesizer used by the game scene.
export default class GameAudio {
  constructor(scene) {
    this.context = scene.sound.context;
    this.lastPlayed = new Map();
    this.ambienceNodes = [];
    this.isMuted = false;
    if (!this.context) return;

    this.masterGain = this.context.createGain();
    this.limiter = this.context.createDynamicsCompressor();
    this.masterGain.gain.value = AUDIO_CONFIG.MASTER_VOLUME;
    this.limiter.threshold.value = -7;
    this.limiter.knee.value = 10;
    this.limiter.ratio.value = 8;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.16;
    this.masterGain.connect(this.limiter).connect(this.context.destination);
  }

  async unlock() {
    if (!this.context) return false;
    if (this.context.state === 'suspended') {
      try { await this.context.resume(); } catch { return false; }
    }
    return this.context.state === 'running';
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.context || !this.masterGain) return;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(muted ? 0 : AUDIO_CONFIG.MASTER_VOLUME, now, 0.015);
  }

  canPlay(name) {
    if (!this.context || !this.masterGain || this.isMuted || this.context.state !== 'running') return false;
    const now = performance.now();
    const gap = AUDIO_CONFIG.MIN_GAP_MS[name] ?? 0;
    if (now - (this.lastPlayed.get(name) ?? -Infinity) < gap) return false;
    this.lastPlayed.set(name, now);
    return true;
  }

  makeVoice(volume, duration) {
    const now = this.context.currentTime;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(Math.max(0.0001, volume), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(this.masterGain);
    return { gain, now };
  }

  oscillator(type, startFrequency, endFrequency, volume, duration, delay = 0) {
    const { gain, now } = this.makeVoice(volume, duration + delay);
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now + delay);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + delay + duration);
    oscillator.connect(gain);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + duration);
  }

  noise(volume, duration, filterType, frequency) {
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const { gain, now } = this.makeVoice(volume, duration);
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    source.connect(filter).connect(gain);
    source.start(now);
  }

  playGunSound() {
    if (!this.canPlay('gun')) return;
    const volume = AUDIO_CONFIG.GUN_VOLUME;
    this.noise(volume * 0.78, 0.075, 'highpass', 850);
    this.oscillator('square', 190, 72, volume * 0.48, 0.09);
    this.oscillator('triangle', 95, 48, volume * 0.38, 0.13, 0.012);
  }

  playZombieHitSound() {
    if (!this.canPlay('zombieHit')) return;
    const volume = AUDIO_CONFIG.ZOMBIE_HIT_VOLUME;
    this.noise(volume * 0.6, 0.07, 'lowpass', 1100);
    this.oscillator('triangle', 135, 72, volume * 0.55, 0.1);
  }

  playZombieDeathSound() {
    if (!this.canPlay('zombieDeath')) return;
    const volume = AUDIO_CONFIG.ZOMBIE_DEATH_VOLUME;
    this.noise(volume * 0.4, 0.2, 'lowpass', 720);
    this.oscillator('sawtooth', 118, 38, volume * 0.55, 0.28);
    this.oscillator('triangle', 72, 28, volume * 0.45, 0.34, 0.025);
  }

  playPlayerDamageSound() {
    if (!this.canPlay('playerDamage')) return;
    const volume = AUDIO_CONFIG.PLAYER_DAMAGE_VOLUME;
    this.noise(volume * 0.38, 0.15, 'bandpass', 520);
    this.oscillator('sawtooth', 230, 58, volume * 0.5, 0.3);
    this.oscillator('square', 92, 46, volume * 0.32, 0.36, 0.025);
  }

  playReloadClickSound() {
    if (!this.canPlay('reloadClick')) return;
    const volume = AUDIO_CONFIG.RELOAD_CLICK_VOLUME;
    this.noise(volume * 0.7, 0.018, 'highpass', 2600);
    this.oscillator('square', 1250, 780, volume * 0.45, 0.025);
  }

  playJumpSound() {
    if (!this.canPlay('jump')) return;
    this.oscillator('sine', 185, 260, AUDIO_CONFIG.JUMP_VOLUME, 0.065);
  }

  async startAmbienceLoop() {
    if (this.ambienceNodes.length || !(await this.unlock()) || this.isMuted) return;
    const now = this.context.currentTime;
    const seconds = 5;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * seconds, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    let brownNoise = 0;
    for (let i = 0; i < data.length; i += 1) {
      brownNoise = (brownNoise + (Math.random() * 0.16 - 0.08)) * 0.985;
      data[i] = brownNoise;
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'bandpass';
    filter.frequency.value = 430;
    filter.Q.value = 0.55;
    gain.gain.value = AUDIO_CONFIG.AMBIENCE_VOLUME;
    source.connect(filter).connect(gain).connect(this.masterGain);
    source.start(now);

    // A quiet, slowly pulsing high tone suggests distant night insects.
    const insect = this.context.createOscillator();
    const insectGain = this.context.createGain();
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    insect.type = 'sine';
    insect.frequency.value = 2450;
    insectGain.gain.value = AUDIO_CONFIG.AMBIENCE_VOLUME * 0.06;
    lfo.frequency.value = 0.23;
    lfoGain.gain.value = AUDIO_CONFIG.AMBIENCE_VOLUME * 0.045;
    lfo.connect(lfoGain).connect(insectGain.gain);
    insect.connect(insectGain).connect(this.masterGain);
    insect.start(now);
    lfo.start(now);
    this.ambienceNodes = [source, insect, lfo, gain, insectGain, filter, lfoGain];
  }

  stopAmbienceLoop() {
    this.ambienceNodes.forEach((node) => {
      try { node.stop?.(); } catch { /* Node may already be stopped. */ }
      try { node.disconnect(); } catch { /* Disconnection is best-effort. */ }
    });
    this.ambienceNodes = [];
  }

  destroy() {
    this.stopAmbienceLoop();
    this.masterGain?.disconnect();
    this.limiter?.disconnect();
  }
}
