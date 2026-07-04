import Phaser from 'phaser';
import './style.css';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { GAME_HEIGHT, GAME_WIDTH } from './utils/constants.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#07191b',
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1180 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 3 },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

// Phaser owns the canvas and starts BootScene automatically.
new Phaser.Game(config);
