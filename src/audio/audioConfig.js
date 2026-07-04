// Audio tuning lives here so volume changes never need gameplay edits.
// Keep individual VOLUME values between 0 and 1. MASTER_VOLUME controls the
// whole mix; raise it in small steps (for example 0.82 -> 0.88) to avoid clipping.
export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.82,
  GUN_VOLUME: 0.78,
  ZOMBIE_HIT_VOLUME: 0.5,
  ZOMBIE_DEATH_VOLUME: 0.62,
  PLAYER_DAMAGE_VOLUME: 0.72,
  RELOAD_CLICK_VOLUME: 0.28,
  JUMP_VOLUME: 0.2,
  AMBIENCE_VOLUME: 0.13,
  // Minimum gaps keep repeated effects punchy instead of becoming a wall of noise.
  MIN_GAP_MS: { gun: 75, zombieHit: 55, zombieDeath: 90, playerDamage: 250, reloadClick: 120, jump: 100 },
};
