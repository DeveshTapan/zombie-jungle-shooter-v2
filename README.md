# Zombie Jungle: Last Stand V2

A fresh Phaser 3 and Vite reimplementation of the original side-scrolling survival game. It preserves the original gameplay style and visual direction while using new modular code and an original generated jungle background.

## Install and run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

Production check:

```bash
npm run build
npm run preview
```

## Controls

- **A / D** or **Left / Right**: move
- **W**, **K**, or **Up**: jump
- **E** or **Down**: aim upward
- **Space** or **J**: fire
- **P**: pause or resume
- **M**: mute or unmute
- Mobile: on-screen movement, jump, aim, and fire controls

## Gameplay

Survive an increasingly dangerous moonlit jungle trail. Walkers, runners, droppers, and heavy infected approach from both sides. Kill enemies to build a score combo, jump over moving logs and fire traps, and protect three lives for as long as possible. The mission report records score, eliminations, accuracy, survival time, and the persistent best score.

## Folder structure

```text
public/assets/images/             Original jungle background
src/main.js                      Phaser and responsive scale configuration
src/style.css                    Full-page responsive shell
src/scenes/BootScene.js          Asset loading and generated game textures
src/scenes/MenuScene.js          Mission briefing and controls
src/scenes/GameScene.js          Survival loop, HUD, input, scoring, and effects
src/scenes/GameOverScene.js      Mission report and replay flow
src/objects/Player.js            Running, jumping, facing, and rifle aim
src/objects/Zombie.js            Infected variants and pursuit behavior
src/objects/Bullet.js            Pooled tracer projectiles
src/utils/constants.js           Shared balance and enemy configuration
```

## Future improvements

- Frame-by-frame character animation and sprite sheets
- More hazards, infected variants, bosses, and weapon upgrades
- Layered adaptive music and a larger procedural sound library
- Additional environmental parallax and weather effects
- Online leaderboards and unlockable challenge modes
