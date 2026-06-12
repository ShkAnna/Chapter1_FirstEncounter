import Phaser from 'phaser';
import { GAME_TITLE } from '../content/game';
import {
  loadSave,
  resetSave,
  startStoryScene,
  STORY_SCENES,
  type StorySceneId,
} from '../game/progress';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const save = loadSave();
    const previewScene = new URLSearchParams(window.location.search).get('scene');

    if (import.meta.env.DEV && STORY_SCENES.includes(previewScene as StorySceneId)) {
      startStoryScene(this, previewScene as StorySceneId);
      return;
    }

    this.add.image(0, 0, 'title-background').setOrigin(0).setDisplaySize(width, height);
    this.add.rectangle(0, 0, width, height, 0x0a0d15, 0.56).setOrigin(0);

    this.add
      .text(width * 0.5, height * 0.24, GAME_TITLE, {
        color: '#f4efe7',
        fontFamily: 'Georgia, serif',
        fontSize: '44px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width * 0.5,
        height * 0.47,
        save.currentScene === 'prologue'
          ? 'Espace · Commencer le chapitre'
          : `Espace · Continuer (${save.completedScenes.length}/10 scènes)`,
        {
          color: '#f4efe7',
          fontSize: '18px',
          backgroundColor: 'rgba(17,17,22,0.76)',
          padding: { x: 16, y: 10 },
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height * 0.58, 'N · Recommencer depuis le prologue', {
        color: '#c6c9cf',
        fontSize: '14px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keyup-SPACE', () => {
      startStoryScene(this, save.currentScene);
    });

    this.input.keyboard?.once('keyup-N', () => {
      resetSave();
      startStoryScene(this, 'prologue');
    });

    this.input.once('pointerdown', () => {
      startStoryScene(this, save.currentScene);
    });
  }
}
