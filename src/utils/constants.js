// Central gameplay values make the survival curve easy to tune.
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GROUND_Y = 625;
export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_SPEED = 570;
export const PLAYER_LIVES = 3;
export const PLAYER_INVULNERABLE_MS = 1200;
export const BULLET_SPEED = 850;
export const BULLET_LIFESPAN = 1300;
export const FIRE_RATE = 145;
export const MAX_BULLETS = 60;
export const MAX_ZOMBIES = 40;

export const ENEMY_TYPES = {
  walker: { texture: 'zombie-walker', speed: 78, health: 1, score: 100, scale: 1 },
  runner: { texture: 'zombie-runner', speed: 145, health: 1, score: 160, scale: 0.88 },
  dropper: { texture: 'zombie-dropper', speed: 105, health: 2, score: 240, scale: 0.92 },
  tank: { texture: 'zombie-tank', speed: 56, health: 6, score: 700, scale: 1.35 },
};
