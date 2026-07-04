import Phaser from 'phaser';
import { ENEMY_TYPES, GROUND_Y } from '../utils/constants.js';

export default class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'zombie-walker');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(7);
    this.body.setSize(44, 78).setOffset(14, 8);
  }

  spawn(type, x, difficulty = 1) {
    const config = ENEMY_TYPES[type];
    this.type = type;
    this.speed = config.speed * difficulty;
    this.health = config.health;
    this.maxHealth = config.health;
    this.scoreValue = config.score;
    this.enableBody(true, x, type === 'dropper' ? -30 : GROUND_Y, true, true);
    this.setTexture(config.texture).setScale(config.scale).setAlpha(1).clearTint();
    this.body.setAllowGravity(type === 'dropper');
    this.body.setSize(type === 'tank' ? 54 : 44, type === 'tank' ? 92 : 78);
  }

  chase(player) {
    if (!this.active) return;
    const direction = Math.sign(player.x - this.x) || 1;
    this.setVelocityX(direction * this.speed);
    this.setFlipX(direction < 0);
  }

  takeHit() {
    this.health -= 1;
    this.setTintFill(0xf4ffe6);
    this.scene.time.delayedCall(70, () => { if (this.active) this.clearTint(); });
    return this.health <= 0;
  }

  deactivate() { this.disableBody(true, true); }
}
