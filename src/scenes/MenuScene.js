import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants.js';

const centerText = (scene, x, y, text, style) => scene.add.text(x, y, text, style).setOrigin(0.5);

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'jungle-arena').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x02090c, 0.56);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 560, 620, 0x061416, 0.92)
      .setStrokeStyle(2, 0xbfffd7, 0.23);
    this.add.rectangle(GAME_WIDTH / 2 - 278, GAME_HEIGHT / 2, 5, 620, 0xd4ff54, 1);

    centerText(this, GAME_WIDTH / 2, 82, 'THE OUTBREAK REACHED BASE CAMP', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#d4ff54', letterSpacing: 3,
    });
    centerText(this, GAME_WIDTH / 2, 190, 'ZOMBIE', {
      fontFamily: 'Impact, Arial Black', fontSize: '104px', color: '#f4f7e8', stroke: '#061416', strokeThickness: 8,
    });
    centerText(this, GAME_WIDTH / 2, 275, 'JUNGLE', {
      fontFamily: 'Impact, Arial Black', fontSize: '104px', color: '#07191b',
      stroke: '#d4ff54', strokeThickness: 3,
    });
    centerText(this, GAME_WIDTH / 2, 342,
      'Run the jungle trail, clear the infected, and survive\nas long as your three lives can carry you.', {
        fontFamily: 'Segoe UI, Arial', fontSize: '18px', color: '#c4d3ce', align: 'center', lineSpacing: 7,
      });

    const controls = [
      ['A  D', 'MOVE'], ['W', 'JUMP'], ['E', 'AIM UP'], ['SPACE', 'FIRE'],
    ];
    controls.forEach(([key, label], index) => {
      const x = 428 + index * 142;
      this.add.rectangle(x, 433, 124, 66, 0x000000, 0.28).setStrokeStyle(1, 0xffffff, 0.12);
      centerText(this, x, 421, key, { fontFamily: 'Arial Black', fontSize: '15px', color: '#ffffff' });
      centerText(this, x, 449, label, { fontFamily: 'Arial Black', fontSize: '10px', color: '#9eb8ad' });
    });

    this.createButton(GAME_WIDTH / 2, 525, 'START MISSION', () => this.scene.start('GameScene'));
    const best = Number(localStorage.getItem('zjs-v2-best') || 0);
    centerText(this, GAME_WIDTH / 2, 587, `BEST SCORE  ${String(best).padStart(5, '0')}`, {
      fontFamily: 'Arial Black', fontSize: '13px', color: '#9eb8ad', letterSpacing: 2,
    });
    centerText(this, GAME_WIDTH / 2, 676, 'P  PAUSE     •     M  MUTE     •     MOBILE  ON-SCREEN CONTROLS', {
      fontFamily: 'Arial Black', fontSize: '11px', color: '#78968c', letterSpacing: 1,
    });
  }

  createButton(x, y, label, callback) {
    const button = this.add.image(x, y, 'acid-button').setInteractive({ useHandCursor: true });
    const text = centerText(this, x, y, label, {
      fontFamily: 'Impact, Arial Black', fontSize: '24px', color: '#0c1809', letterSpacing: 3,
    });
    button.on('pointerover', () => button.setTint(0xeeff9a));
    button.on('pointerout', () => button.clearTint());
    button.on('pointerdown', () => { button.setScale(0.97); text.setScale(0.97); });
    button.on('pointerup', callback);
  }
}
