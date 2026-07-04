import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.report = { score: 0, kills: 0, shots: 0, hits: 0, elapsed: 0, ...data };
  }

  create() {
    const { score, kills, shots, hits, elapsed } = this.report;
    const best = Math.max(score, Number(localStorage.getItem('zjs-v2-best') || 0));
    localStorage.setItem('zjs-v2-best', String(best));
    const accuracy = shots ? Math.round((hits / shots) * 100) : 0;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'jungle-arena').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x02090c, 0.72);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 540, 500, 0x061416, 0.94)
      .setStrokeStyle(2, 0xbfffd7, 0.23);
    this.add.rectangle(GAME_WIDTH / 2 - 268, GAME_HEIGHT / 2, 5, 500, 0xd4ff54);

    this.add.text(GAME_WIDTH / 2, 160, 'MISSION REPORT', {
      fontFamily: 'Arial Black', fontSize: '14px', color: '#d4ff54', letterSpacing: 3,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 230, 'CLEARING LOST', {
      fontFamily: 'Impact, Arial Black', fontSize: '72px', color: '#f4f7e8',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 290, `You held the trail for ${this.formatTime(elapsed)}.`, {
      fontFamily: 'Segoe UI, Arial', fontSize: '18px', color: '#c4d3ce',
    }).setOrigin(0.5);

    const stats = [['SCORE', score], ['ELIMINATIONS', kills], ['ACCURACY', `${accuracy}%`]];
    stats.forEach(([label, value], index) => {
      const x = 475 + index * 165;
      this.add.rectangle(x, 370, 145, 82, 0x000000, 0.3).setStrokeStyle(1, 0xffffff, 0.1);
      this.add.text(x, 348, label, { fontFamily: 'Arial Black', fontSize: '10px', color: '#9eb8ad' }).setOrigin(0.5);
      this.add.text(x, 381, String(value), { fontFamily: 'Impact', fontSize: '29px', color: '#d4ff54' }).setOrigin(0.5);
    });

    const button = this.add.image(GAME_WIDTH / 2, 480, 'acid-button').setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 480, 'PLAY AGAIN', {
      fontFamily: 'Impact', fontSize: '24px', color: '#0c1809', letterSpacing: 3,
    }).setOrigin(0.5);
    button.on('pointerup', () => this.scene.start('GameScene'));
    this.add.text(GAME_WIDTH / 2, 545, `BEST SCORE  ${String(best).padStart(5, '0')}`, {
      fontFamily: 'Arial Black', fontSize: '12px', color: '#9eb8ad', letterSpacing: 2,
    }).setOrigin(0.5);
  }

  formatTime(seconds) {
    const whole = Math.floor(seconds);
    return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
  }
}
