import Phaser from 'phaser';
import { startStoryScene } from '../game/progress';
import type { StorySceneId } from '../game/progress';

type TransitionData = {
  nextScene: StorySceneId | null;
  memories: string[];
  transitionText: string;
};

export class TransitionScene extends Phaser.Scene {
  private nextScene: StorySceneId | null = null;

  constructor() {
    super('TransitionScene');
  }

  create(data: TransitionData): void {
    this.nextScene = data.nextScene;
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x090b12).setOrigin(0);
    this.add.image(width / 2, height / 2 - 20, 'transition-plaque').setDisplaySize(760, 310);
    this.add
      .text(width / 2, height / 2 - 72, data.transitionText, {
        color: '#f4efe7',
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        align: 'center',
        wordWrap: { width: 620 },
      })
      .setOrigin(0.5);

    if (data.memories.length > 0) {
      this.add
        .text(width / 2, height / 2 + 18, `${data.memories.length} souvenir(s) débloqué(s)`, {
          color: '#f2c14e',
          fontSize: '16px',
        })
        .setOrigin(0.5);
    }

    this.add
      .text(width / 2, height / 2 + 135, 'Espace · Continuer', {
        color: '#aeb7b9',
        fontSize: '15px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keyup-SPACE', () => this.continueStory());
    this.input.once('pointerdown', () => this.continueStory());
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private continueStory(): void {
    if (this.nextScene) {
      startStoryScene(this, this.nextScene);
    } else {
      this.scene.start('TitleScene');
    }
  }
}
