import Phaser from 'phaser';
import { completeScene, resetSave } from '../game/progress';
import { DialogueOverlay } from '../ui/DialogueOverlay';
import { HighResolutionScene } from './HighResolutionScene';

export class FinaleScene extends HighResolutionScene {
  private hero?: Phaser.GameObjects.Image;
  private companion?: Phaser.GameObjects.Image;
  private train?: Phaser.GameObjects.Image;
  private dialogue?: DialogueOverlay;

  constructor() {
    super('FinaleScene');
  }

  create(): void {
    this.add.image(0, 0, 'lausanne-station').setOrigin(0);
    this.cameras.main.setBounds(0, 0, 1672, 941).setScroll(340, 180).setRoundPixels(true);
    this.train = this.add.image(1110, 250, 'train-open').setScale(0.36).setDepth(300);
    this.hero = this.add.image(790, 535, 'hero-front').setScale(0.105).setDepth(1500);
    this.companion = this.add
      .image(850, 535, 'companion-front')
      .setScale(0.105)
      .setDepth(1500);

    for (let index = 0; index < 4; index += 1) {
      this.add
        .image(360 + index * 250, 500, `npc-${String(index + 1).padStart(2, '0')}`)
        .setScale(0.075)
        .setAlpha(0.65)
        .setDepth(1200);
    }

    this.add
      .text(24, 20, 'Gare de Lausanne · 1er juin', {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.78)',
        padding: { x: 12, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(8000);

    this.dialogue = new DialogueOverlay(this);
    this.dialogue.show(
      [
        { speaker: 'Alex', portrait: 'hero', text: 'Merci beaucoup encore une fois.' },
        { speaker: 'Alex', portrait: 'hero', text: 'Passe une belle nuit et fais de beaux rêves.' },
        { speaker: 'Anna', portrait: 'companion', text: 'Merci énormément à toi aussi.' },
        {
          speaker: 'Anna',
          portrait: 'companion',
          text: 'Repose-toi bien et fais de beaux rêves toi aussi.',
        },
        { speaker: 'Narration', text: 'Ils restent silencieux, se regardent, puis se rapprochent.' },
      ],
      () => this.playKissSequence(),
    );
  }

  private playKissSequence(): void {
    if (!this.hero || !this.companion) return;
    this.tweens.add({ targets: this.hero, x: 812, duration: 700, ease: 'Sine.inOut' });
    this.tweens.add({
      targets: this.companion,
      x: 828,
      duration: 700,
      ease: 'Sine.inOut',
      onComplete: () => {
        const hearts = this.add.image(820, 430, 'hearts').setScale(0.18).setDepth(3000);
        this.tweens.add({
          targets: hearts,
          y: 390,
          alpha: 0,
          duration: 1700,
          repeat: 1,
          onComplete: () => this.playDeparture(),
        });
      },
    });
  }

  private playDeparture(): void {
    if (!this.companion || !this.hero || !this.train) return;
    this.companion.setVisible(false);
    this.train.setTexture('train-closed');
    this.tweens.add({ targets: this.train, x: 1900, duration: 2300, ease: 'Sine.in' });
    this.tweens.add({
      targets: this.hero,
      x: 300,
      duration: 2100,
      ease: 'Sine.in',
      onComplete: () => {
        this.hero?.setVisible(false);
        this.showFinalMessage();
      },
    });
  }

  private showFinalMessage(): void {
    completeScene('lausanne_station_first_kiss', ['first_kiss', 'final_anniversary_message']);
    const { width, height } = this.scale;
    this.add
      .rectangle(0, 0, width, height, 0x080b13, 0.94)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(9000);
    this.add
      .text(
        width / 2,
        48,
        "Alex et Anna sont bien rentrés chez eux après cette incroyable journée, celle qui a ouvert un nouveau chapitre dans leur vie.\n\nPlus tard, ils vivront beaucoup de voyages et d'aventures ensemble, remplis de joie, de tendresse et d'amour infini.\n\nLe 1er juin 2026, ils fêtent leur première année ensemble, et ce jeu raconte le début de leur histoire.\n\nJe t'aime, mon cœur. Chaque jour avec toi est incroyable et inoubliable.\nMerci d'être dans ma vie.\nJe t'aime énormément, à l'infini.\n\nAnna",
        {
          color: '#f4efe7',
          fontFamily: 'Georgia, serif',
          fontSize: '20px',
          lineSpacing: 7,
          align: 'center',
          wordWrap: { width: 780 },
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(9100);
    const button = this.add
      .rectangle(width / 2, height - 48, 300, 48, 0x315f65, 0.95)
      .setStrokeStyle(2, 0xf2c14e)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(9200);
    this.add
      .text(width / 2, height - 48, 'Continuer : Chapitre 2', {
        color: '#f4efe7',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9300);
    button.on('pointerdown', () => this.showChapterTwoMessage());
  }

  private showChapterTwoMessage(): void {
    const { width, height } = this.scale;
    this.children.removeAll(true);
    this.cameras.main.setScroll(0, 0).setBounds(0, 0, width, height);
    this.add.rectangle(0, 0, width, height, 0x090b12).setOrigin(0);
    this.add
      .text(width / 2, height / 2, 'Chapitre 2 est en train de se charger.\nAttendez un peu... ❤️', {
        color: '#f4efe7',
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        align: 'center',
      })
      .setOrigin(0.5);
    this.time.delayedCall(3500, () => {
      resetSave();
      this.scene.start('TitleScene');
    });
  }
}
