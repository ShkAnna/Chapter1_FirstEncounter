import Phaser from 'phaser';
import { COLORS } from '../content/game';
import { firstMeetingDialogue } from '../content/prototypeDialogue';
import type { DialogueLine } from '../content/prototypeDialogue';

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export class FirstMeetingScene extends Phaser.Scene {
  private cursors?: CursorKeys;
  private hero?: Phaser.Physics.Arcade.Sprite;
  private companion?: Phaser.Physics.Arcade.Sprite;
  private dialogueIndex = 0;
  private dialogueText?: Phaser.GameObjects.Text;
  private speakerText?: Phaser.GameObjects.Text;
  private hintText?: Phaser.GameObjects.Text;

  constructor() {
    super('FirstMeetingScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.createPlaceholderTextures();
    this.add.rectangle(0, 0, width, height, 0x243033).setOrigin(0);
    this.createRoom(width, height);

    this.hero = this.physics.add.sprite(width * 0.48, height * 0.52, 'hero-placeholder');
    this.hero.setCollideWorldBounds(true);

    this.companion = this.physics.add.sprite(width * 0.58, height * 0.56, 'companion-placeholder');
    this.companion.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.createDialogueBox(width, height);
    this.showDialogue(firstMeetingDialogue[this.dialogueIndex]);

    this.input.keyboard?.on('keydown-SPACE', () => this.advanceDialogue());
  }

  update(): void {
    if (!this.hero || !this.companion || !this.cursors) {
      return;
    }

    const speed = 170;
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown) velocity.x += 1;
    if (this.cursors.up.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown) velocity.y += 1;

    velocity.normalize().scale(speed);
    this.hero.setVelocity(velocity.x, velocity.y);

    const distance = Phaser.Math.Distance.Between(
      this.hero.x,
      this.hero.y,
      this.companion.x,
      this.companion.y,
    );

    if (distance > 72) {
      this.physics.moveToObject(this.companion, this.hero, 115);
    } else {
      this.companion.setVelocity(0, 0);
    }
  }

  private createRoom(width: number, height: number): void {
    this.add.rectangle(width * 0.5, height * 0.5, 760, 380, 0x31464a);
    this.add.rectangle(width * 0.5, height * 0.32, 620, 54, 0x3f585e);
    this.add.rectangle(width * 0.28, height * 0.56, 96, 72, COLORS.gold, 0.68);
    this.add.rectangle(width * 0.73, height * 0.52, 112, 64, COLORS.teal, 0.72);
    this.add.circle(width * 0.5, height * 0.46, 22, COLORS.blush, 0.9);
  }

  private createDialogueBox(width: number, height: number): void {
    this.add.rectangle(width * 0.5, height - 72, width - 80, 104, 0x111116, 0.88);
    this.speakerText = this.add.text(72, height - 112, '', {
      color: '#f2c14e',
      fontSize: '16px',
      fontStyle: 'bold',
    });
    this.dialogueText = this.add.text(72, height - 86, '', {
      color: '#f4efe7',
      fontSize: '18px',
      wordWrap: { width: width - 144 },
    });
    this.hintText = this.add
      .text(width - 72, height - 42, 'Espace', {
        color: '#aeb7b9',
        fontSize: '14px',
      })
      .setOrigin(1, 0.5);
  }

  private showDialogue(line: DialogueLine): void {
    this.speakerText?.setText(line.speaker === 'hero' ? 'Lui' : 'Moi');
    this.dialogueText?.setText(line.text);
    this.hintText?.setVisible(true);
  }

  private advanceDialogue(): void {
    this.dialogueIndex += 1;

    if (this.dialogueIndex >= firstMeetingDialogue.length) {
      this.speakerText?.setText('Souvenir');
      this.dialogueText?.setText('Un detail important sera place ici quand la timeline sera completee.');
      this.hintText?.setVisible(false);
      return;
    }

    this.showDialogue(firstMeetingDialogue[this.dialogueIndex]);
  }

  private createPlaceholderTextures(): void {
    this.createCharacterTexture('hero-placeholder', COLORS.violet, COLORS.paper);
    this.createCharacterTexture('companion-placeholder', COLORS.blush, COLORS.paper);
  }

  private createCharacterTexture(key: string, bodyColor: number, faceColor: number): void {
    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(bodyColor);
    graphics.fillRoundedRect(10, 18, 28, 30, 8);
    graphics.fillStyle(faceColor);
    graphics.fillCircle(24, 14, 12);
    graphics.generateTexture(key, 48, 52);
    graphics.destroy();
  }
}
