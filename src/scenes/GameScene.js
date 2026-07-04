import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Zombie from '../objects/Zombie.js';
import Bullet from '../objects/Bullet.js';
import {
  ENEMY_TYPES, FIRE_RATE, GAME_HEIGHT, GAME_WIDTH, GROUND_Y,
  MAX_BULLETS, MAX_ZOMBIES, PLAYER_INVULNERABLE_MS, PLAYER_LIVES,
} from '../utils/constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'jungle-arena')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x021012, 0.16).setDepth(1);
    this.createAtmosphere();

    this.ground = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 20, GAME_WIDTH, 40, 0x15231b, 0).setDepth(2);
    this.physics.add.existing(this.ground, true);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.score = 0;
    this.kills = 0;
    this.shots = 0;
    this.hits = 0;
    this.combo = 1;
    this.comboClock = 0;
    this.lives = PLAYER_LIVES;
    this.elapsed = 0;
    this.spawnClock = 0.5;
    this.hazardClock = 4;
    this.nextShotTime = 0;
    this.invulnerableUntil = 0;
    this.isPaused = false;
    this.gameIsOver = false;
    this.isMuted = false;
    this.touchInput = { left: false, right: false, jump: false, aim: false, fire: false };

    this.player = new Player(this, GAME_WIDTH / 2);
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: MAX_BULLETS, runChildUpdate: true });
    this.zombies = this.physics.add.group({ classType: Zombie, maxSize: MAX_ZOMBIES });
    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.zombies, this.ground);
    this.physics.add.overlap(this.bullets, this.zombies, this.handleBulletHit, undefined, this);
    this.physics.add.overlap(this.player, this.zombies, this.hurtPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.hurtPlayer, undefined, this);

    this.createKeyboardControls();
    this.createHud();
    this.createTouchControls();
    this.spawnZombie('walker');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanUp, this);
  }

  createAtmosphere() {
    this.fog = this.add.ellipse(-180, 520, 620, 86, 0xa8dec7, 0.045).setDepth(3);
    this.tweens.add({ targets: this.fog, x: GAME_WIDTH + 180, duration: 17000, repeat: -1 });
    for (let i = 0; i < 12; i += 1) {
      const firefly = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(140, 570),
        Phaser.Math.Between(1, 3), 0xc6ff88, Phaser.Math.FloatBetween(0.12, 0.3),
      ).setDepth(4);
      this.tweens.add({
        targets: firefly, y: firefly.y - Phaser.Math.Between(20, 55), alpha: 0.04,
        duration: Phaser.Math.Between(1400, 2800), yoyo: true, repeat: -1,
      });
    }
  }

  createKeyboardControls() {
    this.keys = this.input.keyboard.addKeys({
      left: 'A', right: 'D', jump: 'W', jumpAlt: 'K', aim: 'E', fire: 'SPACE', fireAlt: 'J',
      pause: 'P', mute: 'M', cursorLeft: 'LEFT', cursorRight: 'RIGHT', cursorJump: 'UP', cursorAim: 'DOWN',
    });
    this.input.on('pointerup', this.releaseTouchInputs, this);
  }

  createHud() {
    const labelStyle = { fontFamily: 'Arial Black', fontSize: '10px', color: '#9eb8ad', letterSpacing: 2 };
    const valueStyle = { fontFamily: 'Impact, Arial Black', fontSize: '27px', color: '#ffffff', letterSpacing: 2 };

    this.add.text(24, 20, 'ZOMBIE JUNGLE', { ...labelStyle, color: '#d4ff54', letterSpacing: 4 }).setDepth(30);
    this.add.text(24, 36, 'LAST STAND', { fontFamily: 'Impact', fontSize: '31px', color: '#ffffff', letterSpacing: 2 }).setDepth(30);

    this.addHudStat(700, 'TIME', 'timeText', labelStyle, valueStyle);
    this.addHudStat(810, 'SCORE', 'scoreText', labelStyle, valueStyle);
    this.addHudStat(930, 'COMBO', 'comboText', labelStyle, { ...valueStyle, color: '#d4ff54' });
    this.livesText = this.add.text(1050, 30, '♥ ♥ ♥', {
      fontFamily: 'Arial', fontSize: '30px', color: '#ff5b62', stroke: '#30080c', strokeThickness: 4,
    }).setDepth(30);

    this.pauseButton = this.createIconButton(1174, 42, 'Ⅱ', () => this.togglePause());
    this.muteButton = this.createIconButton(1224, 42, '♪', () => this.toggleMute());
    this.updateHud();
  }

  addHudStat(x, label, property, labelStyle, valueStyle) {
    this.add.rectangle(x, 42, 98, 57, 0x06191c, 0.84).setStrokeStyle(1, 0xdfffe7, 0.14).setDepth(29);
    this.add.text(x, 25, label, labelStyle).setOrigin(0.5).setDepth(30);
    this[property] = this.add.text(x, 48, '0', valueStyle).setOrigin(0.5).setDepth(30);
  }

  createIconButton(x, y, label, callback) {
    const button = this.add.rectangle(x, y, 40, 40, 0x06191c, 0.9)
      .setStrokeStyle(1, 0xffffff, 0.2).setDepth(30).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5).setDepth(31);
    button.on('pointerup', callback);
    return button;
  }

  createTouchControls() {
    const showTouch = this.sys.game.device.input.touch || window.innerWidth < 900;
    if (!showTouch) return;
    const make = (x, y, radius, label, action, color = 0x06191c) => {
      const button = this.add.circle(x, y, radius, color, 0.78).setStrokeStyle(2, 0xdfffdc, 0.3)
        .setDepth(40).setScrollFactor(0).setInteractive();
      this.add.text(x, y, label, { fontFamily: 'Arial Black', fontSize: label.length > 1 ? '14px' : '25px', color: '#ffffff' })
        .setOrigin(0.5).setDepth(41);
      button.on('pointerdown', () => { this.touchInput[action] = true; button.setScale(0.93); });
      button.on('pointerup', () => { this.touchInput[action] = false; button.setScale(1); });
      button.on('pointerout', () => { this.touchInput[action] = false; button.setScale(1); });
    };
    make(72, 646, 34, '◀', 'left');
    make(150, 646, 34, '▶', 'right');
    make(228, 646, 34, '↑', 'jump');
    make(1110, 646, 37, 'AIM', 'aim');
    make(1210, 630, 50, 'FIRE', 'fire', 0xb6202d);
  }

  update(_time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) this.togglePause();
    if (Phaser.Input.Keyboard.JustDown(this.keys.mute)) this.toggleMute();
    if (this.isPaused || this.gameIsOver) return;

    const dt = delta / 1000;
    this.elapsed += dt;
    this.spawnClock -= dt;
    this.hazardClock -= dt;
    this.comboClock -= dt;
    if (this.comboClock <= 0 && this.combo !== 1) this.combo = 1;

    const left = this.keys.left.isDown || this.keys.cursorLeft.isDown || this.touchInput.left;
    const right = this.keys.right.isDown || this.keys.cursorRight.isDown || this.touchInput.right;
    this.player.move(Number(right) - Number(left));

    const aiming = this.keys.aim.isDown || this.keys.cursorAim.isDown || this.touchInput.aim;
    this.player.setAim(aiming);
    if (Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt)
      || Phaser.Input.Keyboard.JustDown(this.keys.cursorJump) || this.touchInput.jump) {
      if (this.player.jump()) this.playTone(210, 0.05, 0.025);
      this.touchInput.jump = false;
    }

    if (this.keys.fire.isDown || this.keys.fireAlt.isDown || this.touchInput.fire) this.tryShoot();
    this.zombies.getChildren().forEach((zombie) => zombie.chase(this.player));
    this.hazards.getChildren().forEach((hazard) => {
      if (!hazard.active) return;
      hazard.setVelocityX(-(150 + this.elapsed * 1.3));
      if (hazard.x < -100) hazard.destroy();
    });

    if (this.spawnClock <= 0) {
      this.spawnZombie(this.chooseEnemyType());
      this.spawnClock = Math.max(0.42, 1.25 - this.elapsed * 0.007);
    }
    if (this.hazardClock <= 0) {
      this.spawnHazard();
      this.hazardClock = Phaser.Math.FloatBetween(5, 8);
    }
    this.updateHud();
  }

  chooseEnemyType() {
    const roll = Math.random();
    if (this.elapsed > 34 && roll < 0.08) return 'tank';
    if (this.elapsed > 18 && roll < 0.24) return 'dropper';
    if (this.elapsed > 8 && roll < 0.48) return 'runner';
    return 'walker';
  }

  spawnZombie(type) {
    const zombie = this.zombies.get();
    if (!zombie) return;
    const fromLeft = type !== 'dropper' && Math.random() < 0.34;
    const x = type === 'dropper' ? Phaser.Math.Between(250, GAME_WIDTH - 180) : (fromLeft ? -70 : GAME_WIDTH + 70);
    zombie.spawn(type, x, Math.min(1.75, 1 + this.elapsed / 125));
  }

  spawnHazard() {
    const isFire = Math.random() < 0.38;
    const hazard = this.hazards.create(GAME_WIDTH + 100, GROUND_Y, isFire ? 'fire-hazard' : 'log-hazard')
      .setOrigin(0.5, 1).setDepth(6);
    hazard.body.setAllowGravity(false);
    hazard.body.setSize(isFire ? 38 : 82, isFire ? 42 : 36);
  }

  tryShoot() {
    if (this.time.now < this.nextShotTime) return;
    const bullet = this.bullets.get();
    if (!bullet) return;
    const muzzle = this.player.getMuzzle();
    bullet.fire(muzzle);
    this.nextShotTime = this.time.now + FIRE_RATE;
    this.shots += 1;
    this.cameras.main.shake(35, 0.0013);
    const flash = this.add.circle(muzzle.x, muzzle.y, 12, 0xffe786, 0.95).setDepth(10);
    this.tweens.add({ targets: flash, alpha: 0, scale: 2.4, duration: 70, onComplete: () => flash.destroy() });
    this.playTone(145, 0.035, 0.04, 'square');
  }

  handleBulletHit(bullet, zombie) {
    if (!bullet.active || !zombie.active) return;
    bullet.deactivate();
    this.hits += 1;
    if (!zombie.takeHit()) {
      this.playTone(85, 0.045, 0.025);
      return;
    }

    const reward = zombie.scoreValue * this.combo;
    this.score += reward;
    this.kills += 1;
    this.combo = Math.min(8, this.combo + 1);
    this.comboClock = 2.8;
    this.createKillEffect(zombie.x, zombie.y - 48, `+${reward}`);
    zombie.deactivate();
    this.playTone(62, 0.09, 0.045, 'sawtooth');
  }

  createKillEffect(x, y, label) {
    const text = this.add.text(x, y, label, {
      fontFamily: 'Impact', fontSize: '25px', color: '#d4ff54', stroke: '#061416', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: text, y: y - 55, alpha: 0, duration: 700, onComplete: () => text.destroy() });
    for (let i = 0; i < 7; i += 1) {
      const mote = this.add.image(x, y, 'particle').setTint(i % 2 ? 0xd4ff54 : 0xffb547).setDepth(18);
      this.tweens.add({
        targets: mote, x: x + Phaser.Math.Between(-65, 65), y: y + Phaser.Math.Between(-70, 28),
        alpha: 0, scale: 0.2, duration: Phaser.Math.Between(300, 650), onComplete: () => mote.destroy(),
      });
    }
  }

  hurtPlayer(_player, threat) {
    if (this.time.now < this.invulnerableUntil || this.gameIsOver) return;
    this.invulnerableUntil = this.time.now + PLAYER_INVULNERABLE_MS;
    this.lives -= 1;
    this.combo = 1;
    this.comboClock = 0;
    this.cameras.main.flash(180, 190, 20, 30);
    this.cameras.main.shake(260, 0.015);
    this.player.setTint(0xff5b62).setVelocityY(-260);
    const direction = Math.sign(this.player.x - threat.x) || 1;
    this.player.setVelocityX(direction * 360);
    this.tweens.add({
      targets: this.player, alpha: 0.25, duration: 95, yoyo: true, repeat: 5,
      onComplete: () => { if (this.player.active) this.player.setAlpha(1).clearTint(); },
    });
    this.playTone(48, 0.18, 0.07, 'sawtooth');
    this.updateHud();
    if (this.lives <= 0) this.endGame();
  }

  updateHud() {
    this.timeText.setText(this.formatTime(this.elapsed));
    this.scoreText.setText(String(this.score).padStart(5, '0'));
    this.comboText.setText(`×${this.combo}`);
    this.livesText.setText(Array.from({ length: PLAYER_LIVES }, (_, i) => i < this.lives ? '♥' : '♡').join(' '));
  }

  togglePause(force) {
    if (this.gameIsOver) return;
    this.isPaused = typeof force === 'boolean' ? force : !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(60);
      const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x02090c, 0.72);
      const panel = this.add.rectangle(0, 0, 430, 260, 0x061416, 0.96).setStrokeStyle(2, 0xd4ff54, 0.55);
      const title = this.add.text(0, -62, 'PAUSED', { fontFamily: 'Impact', fontSize: '68px', color: '#f4f7e8' }).setOrigin(0.5);
      const hint = this.add.text(0, 20, 'PRESS P OR TAP RESUME', { fontFamily: 'Arial Black', fontSize: '13px', color: '#9eb8ad' }).setOrigin(0.5);
      const resume = this.add.rectangle(0, 78, 280, 54, 0xd4ff54).setInteractive({ useHandCursor: true });
      const resumeText = this.add.text(0, 78, 'RESUME', { fontFamily: 'Impact', fontSize: '23px', color: '#0c1809' }).setOrigin(0.5);
      resume.on('pointerup', () => this.togglePause(false));
      this.pauseOverlay.add([shade, panel, title, hint, resume, resumeText]);
    } else {
      this.physics.resume();
      this.pauseOverlay?.destroy(true);
      this.pauseOverlay = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.sound.mute = this.isMuted;
    this.muteButton.setStrokeStyle(2, this.isMuted ? 0xff5353 : 0xffffff, 0.65);
  }

  playTone(frequency, duration, volume, type = 'sine') {
    if (this.isMuted || !this.sound.context) return;
    const context = this.sound.context;
    if (context.state === 'suspended') context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  endGame() {
    this.gameIsOver = true;
    this.physics.pause();
    this.time.delayedCall(650, () => this.scene.start('GameOverScene', {
      score: this.score, kills: this.kills, shots: this.shots, hits: this.hits, elapsed: this.elapsed,
    }));
  }

  formatTime(seconds) {
    const whole = Math.floor(seconds);
    return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
  }

  releaseTouchInputs() {
    this.touchInput.left = false;
    this.touchInput.right = false;
    this.touchInput.jump = false;
    this.touchInput.aim = false;
    this.touchInput.fire = false;
  }

  cleanUp() {
    this.input.off('pointerup', this.releaseTouchInputs, this);
  }
}
