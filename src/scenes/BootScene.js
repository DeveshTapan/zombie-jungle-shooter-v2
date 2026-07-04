import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('jungle-arena', `${import.meta.env.BASE_URL}assets/images/jungle-last-stand.png`);
  }

  create() {
    this.createSurvivor(false);
    this.createSurvivor(true);
    this.createZombie('zombie-walker', 0x607d55, 70, 88);
    this.createZombie('zombie-runner', 0x8a9d55, 64, 82);
    this.createZombie('zombie-dropper', 0x55766d, 68, 86);
    this.createZombie('zombie-tank', 0x425b42, 84, 108);
    this.createSmallTextures();
    this.scene.start('MenuScene');
  }

  createSurvivor(aimingUp) {
    const g = this.make.graphics({ add: false });
    // Boots and legs.
    g.lineStyle(12, 0x121a1b).lineBetween(31, 68, 27, 92).lineBetween(47, 68, 51, 92);
    g.lineStyle(7, 0x42565a).lineBetween(31, 69, 27, 88).lineBetween(47, 69, 51, 88);
    // Tactical body and glowing stripe.
    g.fillStyle(0x17272a).fillRoundedRect(18, 32, 43, 42, 8);
    g.fillStyle(0x2c6870).fillRect(22, 38, 35, 11);
    g.fillStyle(0xd4ff54).fillRect(22, 50, 5, 18);
    g.fillStyle(0x344b4f).fillRect(18, 61, 43, 9);
    // Head, hair, and visor.
    g.fillStyle(0xc99670).fillCircle(39, 22, 14);
    g.fillStyle(0x172427).fillEllipse(37, 16, 30, 17);
    g.fillStyle(0x72e5ef).fillRect(41, 19, 14, 5);
    // Arms and rifle.
    if (aimingUp) {
      g.lineStyle(7, 0xc99670).lineBetween(42, 45, 47, 19);
      g.fillStyle(0x26383c).fillRoundedRect(38, 0, 18, 52, 4);
      g.fillStyle(0x89a0a3).fillRect(45, 0, 4, 28);
      g.fillStyle(0xd4ff54).fillRect(40, 10, 2, 14);
    } else {
      g.lineStyle(7, 0xc99670).lineBetween(42, 46, 64, 48);
      g.fillStyle(0x26383c).fillRoundedRect(38, 38, 45, 18, 4);
      g.fillStyle(0x0c1416).fillRect(72, 43, 21, 7);
      g.fillStyle(0x89a0a3).fillRect(82, 45, 14, 3);
      g.fillStyle(0xd4ff54).fillRect(48, 40, 17, 2);
    }
    g.generateTexture(aimingUp ? 'survivor-aim' : 'survivor', 100, 96);
    g.destroy();
  }

  createZombie(key, color, width, height) {
    const g = this.make.graphics({ add: false });
    const center = width / 2;
    g.lineStyle(width > 75 ? 16 : 11, 0x17231e)
      .lineBetween(center - 12, height - 38, center - 16, height)
      .lineBetween(center + 12, height - 38, center + 16, height);
    g.fillStyle(color).fillRoundedRect(10, 25, width - 20, height - 48, width > 75 ? 14 : 8);
    g.fillStyle(0x263c31).fillRect(10, height - 42, width - 20, 12);
    g.fillStyle(color).fillCircle(center, 21, width > 75 ? 20 : 16);
    g.fillStyle(0xcfff55).fillCircle(center + 7, 19, width > 75 ? 4 : 3);
    g.fillStyle(0x172018).fillRect(center + 3, 29, 15, 4);
    g.lineStyle(width > 75 ? 15 : 9, color)
      .lineBetween(14, 39, 1, 62)
      .lineBetween(width - 14, 39, width - 1, 58);
    if (width > 75) {
      g.fillStyle(0x52684e).fillCircle(12, 35, 14).fillCircle(width - 12, 35, 14);
      g.lineStyle(4, 0x85966f).lineBetween(22, 32, width - 18, 72);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }

  createSmallTextures() {
    const tracer = this.make.graphics({ add: false });
    tracer.fillStyle(0xfff3a4).fillRoundedRect(0, 0, 28, 5, 2);
    tracer.generateTexture('tracer', 28, 5).destroy();

    const particle = this.make.graphics({ add: false });
    particle.fillStyle(0xd4ff54).fillCircle(4, 4, 4);
    particle.generateTexture('particle', 8, 8).destroy();

    const hazard = this.make.graphics({ add: false });
    hazard.fillStyle(0x39251c).fillRoundedRect(3, 30, 92, 30, 10);
    hazard.lineStyle(4, 0x9b653c);
    for (let x = 12; x < 88; x += 18) hazard.lineBetween(x, 32, x - 5, 57);
    hazard.fillStyle(0xb98651).fillEllipse(88, 45, 14, 24);
    hazard.generateTexture('log-hazard', 100, 64).destroy();

    const flame = this.make.graphics({ add: false });
    flame.fillStyle(0xff5a35).fillTriangle(8, 48, 28, 2, 42, 48);
    flame.fillStyle(0xffc34a).fillTriangle(18, 48, 30, 17, 36, 48);
    flame.generateTexture('fire-hazard', 52, 52).destroy();

    const button = this.make.graphics({ add: false });
    button.fillStyle(0xc7f33f).fillRoundedRect(0, 0, 300, 62, 5);
    button.generateTexture('acid-button', 300, 62).destroy();
  }
}
