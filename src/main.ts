import Phaser from 'phaser';
import './styles.css';
import { BootScene } from './scenes/BootScene';
import { FirstMeetingScene } from './scenes/FirstMeetingScene';
import { TitleScene } from './scenes/TitleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 960,
  height: 540,
  backgroundColor: '#1b1a20',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, FirstMeetingScene],
};

new Phaser.Game(config);
