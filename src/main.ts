import Phaser from 'phaser';
import './styles.css';
import { BootScene } from './scenes/BootScene';
import { ChapterScene } from './scenes/ChapterScene';
import { FinaleScene } from './scenes/FinaleScene';
import { FirstMeetingScene } from './scenes/FirstMeetingScene';
import { PrologueScene } from './scenes/PrologueScene';
import { TitleScene } from './scenes/TitleScene';
import { TransitionScene } from './scenes/TransitionScene';
import { VernandArrivalScene } from './scenes/VernandArrivalScene';
import { WhatsAppScene } from './scenes/WhatsAppScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 960,
  height: 540,
  backgroundColor: '#1b1a20',
  antialias: true,
  antialiasGL: true,
  pixelArt: false,
  roundPixels: false,
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
  scene: [
    BootScene,
    TitleScene,
    PrologueScene,
    FirstMeetingScene,
    VernandArrivalScene,
    ChapterScene,
    WhatsAppScene,
    FinaleScene,
    TransitionScene,
  ],
};

new Phaser.Game(config);
