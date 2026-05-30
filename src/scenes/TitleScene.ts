import Phaser from 'phaser';
import { COLORS, GAME_TITLE } from '../content/game';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLORS.ink).setOrigin(0);
    this.add.circle(width * 0.5, height * 0.42, 92, COLORS.blush, 0.28);
    this.add.circle(width * 0.42, height * 0.38, 56, COLORS.teal, 0.28);
    this.add.circle(width * 0.58, height * 0.38, 56, COLORS.gold, 0.25);

    this.add
      .text(width * 0.5, height * 0.27, GAME_TITLE, {
        color: '#f4efe7',
        fontFamily: 'Georgia, serif',
        fontSize: '44px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height * 0.47, 'Appuie sur Espace pour commencer', {
        color: '#f4efe7',
        fontSize: '18px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('FirstMeetingScene');
    });

    this.input.once('pointerdown', () => {
      this.scene.start('FirstMeetingScene');
    });
  }
}
