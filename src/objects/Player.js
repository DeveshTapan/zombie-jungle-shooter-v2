import Phaser from 'phaser';
import { GROUND_Y, PLAYER_JUMP_SPEED, PLAYER_SPEED } from '../utils/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x) {
    super(scene, x, GROUND_Y, 'survivor');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8).setCollideWorldBounds(true);
    this.body.setSize(40, 82).setOffset(18, 8);
    this.body.setMaxVelocity(PLAYER_SPEED, 720);
    this.facing = 1;
    this.aimingUp = false;
  }

  move(axis) {
    this.setVelocityX(axis * PLAYER_SPEED);
    if (axis !== 0) {
      this.facing = Math.sign(axis);
      this.setFlipX(this.facing < 0);
    }
  }

  jump() {
    if (this.body.blocked.down || this.body.touching.down) {
      this.setVelocityY(-PLAYER_JUMP_SPEED);
      return true;
    }
    return false;
  }

  setAim(up) {
    this.aimingUp = up;
    this.setTexture(up ? 'survivor-aim' : 'survivor');
  }

  getMuzzle() {
    if (this.aimingUp) return { x: this.x + this.facing * 9, y: this.y - 92, dx: 0, dy: -1 };
    return { x: this.x + this.facing * 52, y: this.y - 55, dx: this.facing, dy: 0 };
  }
}
