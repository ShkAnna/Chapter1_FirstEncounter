import Phaser from 'phaser';
import type { StoryLine } from '../content/chapter';

export class DialogueOverlay {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly dialogueText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;
  private readonly portrait: Phaser.GameObjects.Image;
  private lines: StoryLine[] = [];
  private index = 0;
  private onComplete?: () => void;

  public isOpen = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;
    const frame = scene.add
      .image(width / 2, height - 96, 'dialogue-box')
      .setDisplaySize(width - 48, 176);
    const portraitFrame = scene.add
      .image(105, height - 102, 'portrait-frame')
      .setDisplaySize(132, 132);
    this.portrait = scene.add
      .image(105, height - 105, 'hero-portrait')
      .setDisplaySize(92, 118);
    this.speakerText = scene.add.text(174, height - 158, '', {
      color: '#f2c14e',
      fontSize: '18px',
      fontStyle: 'bold',
    });
    this.dialogueText = scene.add.text(174, height - 128, '', {
      color: '#f4efe7',
      fontSize: '17px',
      lineSpacing: 5,
      wordWrap: { width: width - 260 },
    });
    this.hintText = scene.add
      .text(width - 55, height - 37, 'Espace', {
        color: '#aeb7b9',
        fontSize: '13px',
      })
      .setOrigin(1, 0.5);

    this.container = scene.add
      .container(0, 0, [
        frame,
        portraitFrame,
        this.portrait,
        this.speakerText,
        this.dialogueText,
        this.hintText,
      ])
      .setScrollFactor(0)
      .setDepth(9000)
      .setVisible(false);

    scene.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isOpen) this.advance();
    });
  }

  public show(lines: StoryLine[], onComplete?: () => void): void {
    if (lines.length === 0) {
      onComplete?.();
      return;
    }
    this.lines = lines;
    this.index = 0;
    this.onComplete = onComplete;
    this.isOpen = true;
    this.container.setVisible(true);
    this.renderLine();
  }

  public close(): void {
    this.isOpen = false;
    this.container.setVisible(false);
    const callback = this.onComplete;
    this.onComplete = undefined;
    callback?.();
  }

  private advance(): void {
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.close();
      return;
    }
    this.renderLine();
  }

  private renderLine(): void {
    const line = this.lines[this.index];
    this.speakerText.setText(line.thought ? `${line.speaker} · pensée` : line.speaker);
    this.dialogueText.setText(line.text);
    this.hintText.setText(this.index === this.lines.length - 1 ? 'Espace · Fermer' : 'Espace');

    const portraitKey =
      line.portrait === 'companion'
        ? line.thought
          ? 'companion-portrait-blush'
          : 'companion-portrait'
        : line.portrait === 'npc'
          ? 'npc-01'
          : line.thought
            ? 'hero-portrait-thoughtful'
            : 'hero-portrait';

    this.portrait.setTexture(portraitKey);
    this.portrait.setVisible(line.speaker !== 'Narration');
  }
}
