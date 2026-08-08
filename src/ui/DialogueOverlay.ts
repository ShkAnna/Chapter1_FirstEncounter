import Phaser from 'phaser';
import type { StoryLine } from '../content/chapter';

const PANEL_WIDTH_RATIO = 0.9;
const PANEL_HEIGHT = 160;
const PANEL_BOTTOM_MARGIN = 8;
const PANEL_ART_SCALE = 0.65;
const PANEL_LEFT_SLICE = 340;
const PANEL_RIGHT_SLICE = 60;
const PANEL_TOP_SLICE = 80;
const PANEL_BOTTOM_SLICE = 44;
const PANEL_TEXT_LEFT = 130;
const PANEL_TEXT_RIGHT = 40;
const PORTRAIT_FRAME_SCALE = 0.255;

export class DialogueOverlay {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly frame: Phaser.GameObjects.NineSlice;
  private readonly portraitFrame: Phaser.GameObjects.Image;
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
    const panelWidth = width * PANEL_WIDTH_RATIO;
    const panelHeight = PANEL_HEIGHT;
    const panelLeft = (width - panelWidth) / 2;
    const panelTop = height - panelHeight - PANEL_BOTTOM_MARGIN;
    const portraitCenterX = panelLeft + 65;

    this.frame = scene.add
      .nineslice(
        width / 2,
        panelTop + panelHeight / 2,
        'dialogue-box',
        undefined,
        panelWidth / PANEL_ART_SCALE,
        panelHeight / PANEL_ART_SCALE,
        PANEL_LEFT_SLICE,
        PANEL_RIGHT_SLICE,
        PANEL_TOP_SLICE,
        PANEL_BOTTOM_SLICE,
      )
      .setScale(PANEL_ART_SCALE);
    this.portraitFrame = scene.add
      .image(portraitCenterX, panelTop + panelHeight / 2 + 4, 'portrait-frame')
      .setScale(PORTRAIT_FRAME_SCALE);
    this.portrait = scene.add
      .image(
        portraitCenterX,
        panelTop + panelHeight - 27,
        'hero-portrait',
        'dialogue-portrait',
      )
      .setOrigin(0.5, 1);
    this.speakerText = scene.add
      .text(panelLeft + 198 * PANEL_ART_SCALE, panelTop + 34 * PANEL_ART_SCALE, '', {
        color: '#f2c14e',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.dialogueText = scene.add.text(panelLeft + PANEL_TEXT_LEFT, panelTop + 68, '', {
      color: '#f4efe7',
      fontSize: '16px',
      lineSpacing: 3,
      wordWrap: { width: panelWidth - PANEL_TEXT_LEFT - PANEL_TEXT_RIGHT },
    });
    this.hintText = scene.add
      .text(panelLeft + panelWidth - 32, panelTop + panelHeight - 17, 'Espace', {
        color: '#aeb7b9',
        fontSize: '11px',
      })
      .setOrigin(1, 0.5);

    this.container = scene.add
      .container(0, 0, [
        this.frame,
        this.portrait,
        this.portraitFrame,
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
    const { width, height } = this.scene.scale;
    const isNarration = line.speaker === 'Narration';

    this.speakerText.setText(line.thought ? `${line.speaker} · pensée` : line.speaker);
    this.hintText.setText(this.index === this.lines.length - 1 ? 'Espace · Fermer' : 'Espace');

    const panelWidth = width * PANEL_WIDTH_RATIO;
    const panelHeight = PANEL_HEIGHT;
    const panelLeft = (width - panelWidth) / 2;
    const panelTop = height - panelHeight - PANEL_BOTTOM_MARGIN;
    const panelBottom = panelTop + panelHeight;
    const panelCenterY = panelTop + panelHeight / 2;
    const textLeftInset = isNarration ? 36 : PANEL_TEXT_LEFT;
    const textRightInset = PANEL_TEXT_RIGHT;
    const finalTextWidth = panelWidth - textLeftInset - textRightInset;
    this.dialogueText.setWordWrapWidth(finalTextWidth).setText(line.text);

    this.frame
      .setPosition(width / 2, panelCenterY)
      .setSize(panelWidth / PANEL_ART_SCALE, panelHeight / PANEL_ART_SCALE)
      .setScale(PANEL_ART_SCALE);

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

    this.speakerText.setPosition(
      panelLeft + 198 * PANEL_ART_SCALE,
      panelTop + 34 * PANEL_ART_SCALE,
    );

    this.portrait.setTexture(portraitKey, 'dialogue-portrait');
    const portraitScale = Math.min(
      75 / this.portrait.frame.realWidth,
      94 / this.portrait.frame.realHeight,
    );
    const portraitCenterX = panelLeft + 65;
    this.portrait
      .setScale(portraitScale)
      .setPosition(portraitCenterX, panelTop + panelHeight - 27);
    this.portraitFrame
      .setScale(PORTRAIT_FRAME_SCALE)
      .setPosition(portraitCenterX, panelCenterY + 4);
    this.portrait.setVisible(!isNarration);
    this.portraitFrame.setVisible(!isNarration);
    this.dialogueText
      .setPosition(panelLeft + textLeftInset, panelCenterY - this.dialogueText.height / 2)
      .setWordWrapWidth(finalTextWidth);
    this.hintText.setPosition(panelLeft + panelWidth - 32, panelBottom - 17);
  }
}
