import Phaser from 'phaser';
import { BULLET_LIFESPAN, BULLET_SPEED } from '../utils/constants.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tracer');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);
    this.body.setAllowGravity(false);
    this.lifespan = 0;
  }

  fire({ x, y, dx, dy }) {
    this.enableBody(true, x, y, true, true);
    this.lifespan = BULLET_LIFESPAN;
    this.setRotation(Math.atan2(dy, dx));
    this.setVelocity(dx * BULLET_SPEED, dy * BULLET_SPEED);
  }

  update(_time, delta) {
    if (!this.active) return;
    this.lifespan -= delta;
    if (this.lifespan <= 0) this.deactivate();
  }

  deactivate() { this.disableBody(true, true); }
}
