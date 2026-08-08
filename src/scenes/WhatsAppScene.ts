import Phaser from 'phaser';
import { finishWithTransition } from '../game/progress';

type ChatItem =
  | { type: 'message'; from: 'alex' | 'anna'; text: string }
  | { type: 'attachment'; from: 'anna'; text: string; texture: string }
  | { type: 'title'; text: string };

const CHAT: ChatItem[] = [
  { type: 'message', from: 'anna', text: 'Bon bah maintenant mes discussions avec les amis ressemblent à ça 🤣' },
  { type: 'attachment', from: 'anna', text: 'Photos des pistolets', texture: 'pistol-photos' },
  { type: 'message', from: 'alex', text: 'ahahah excellent 😂' },
  {
    type: 'message',
    from: 'alex',
    text: "Le weekend du 7 juin il y a le Miam Festival. Ça t'intéresserait ?",
  },
  { type: 'message', from: 'anna', text: "Ouii, j'ai vu et j'aimerais beaucoup y aller 😃" },
  { type: 'message', from: 'anna', text: "J'étais en train de planifier dix mille choses en une journée 😂" },
  { type: 'attachment', from: 'anna', text: 'Deux idées de programme', texture: 'anna-program' },
  { type: 'message', from: 'alex', text: 'Je suis chaud pour tout en vrai 🤩' },
  { type: 'message', from: 'anna', text: 'Ooh oui, ça serait une journée parfaite 😍' },
  { type: 'message', from: 'alex', text: 'trop bien 😍 je me réjouis 🥂' },
  { type: 'title', text: 'Un jour et quelques discussions plus tard...' },
  { type: 'message', from: 'alex', text: 'je suis à PolyLAN' },
  {
    type: 'message',
    from: 'alex',
    text: "Si tu n'as rien à faire demain, viens me rendre visite à Beaulieu si tu veux 😛",
  },
  { type: 'message', from: 'anna', text: 'Oui avec plaisir 😊' },
];

export class WhatsAppScene extends Phaser.Scene {
  private index = 0;
  private history: ChatItem[] = [];
  private messageLayer?: Phaser.GameObjects.Container;

  constructor() {
    super('WhatsAppScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    this.add.rectangle(0, 0, width, height, 0x10151b).setOrigin(0);
    this.add.image(centerX, height / 2, 'phone-frame').setDisplaySize(360, 500);
    this.add.rectangle(centerX, 119, 310, 92, 0xe9e4dd, 0.96).setStrokeStyle(1, 0xc8c2ba);
    this.add
      .text(centerX, 80, 'WhatsApp · Quelques jours plus tard', {
        color: '#243039',
        fontSize: '13px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.createProfile(centerX - 90, 122, 'anna-whatsapp-avatar', 'Anna');
    this.createProfile(centerX + 90, 122, 'alex-whatsapp-avatar', 'Alex');
    this.add
      .text(centerX, height - 39, 'Espace · Message suivant', {
        color: '#687077',
        fontSize: '12px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.on('pointerdown', () => this.advance());
    this.advance();
  }

  private createProfile(x: number, y: number, texture: string, label: string): void {
    this.add.circle(x, y, 24, 0xffffff).setStrokeStyle(2, 0x49b6a9);
    const avatar = this.add.image(x, y, texture).setDisplaySize(42, 42);
    const maskShape = this.add.graphics().setVisible(false);
    maskShape.fillStyle(0xffffff).fillCircle(x, y, 21);
    avatar.setMask(maskShape.createGeometryMask());
    this.add
      .text(x + 33, y, label, {
        color: '#243039',
        fontSize: '13px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
  }

  private advance(): void {
    if (this.index >= CHAT.length) {
      finishWithTransition(
        this,
        'whatsapp_miam_invitation',
        ['miam_invitation', 'polylan_visit'],
        'Lendemain à PolyLAN · 31 mai',
      );
      return;
    }

    const item = CHAT[this.index];
    this.index += 1;
    if (item.type === 'title') {
      this.history = [item];
    } else {
      this.history.push(item);
      this.history = this.history.slice(-5);
    }
    this.renderMessages();
  }

  private renderMessages(): void {
    this.messageLayer?.destroy(true);
    const { width } = this.scale;
    const elements: Phaser.GameObjects.GameObject[] = [];
    const centerX = width / 2;
    const chatLeft = centerX - 151;
    const chatRight = centerX + 151;
    const chatTop = 173;
    let bottom = 474;

    for (const item of [...this.history].reverse()) {
      if (item.type === 'title') {
        const title = this.add
          .text(centerX, 295, item.text, {
            color: '#9b6a18',
            fontSize: '16px',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 270 },
          })
          .setOrigin(0.5);
        elements.push(title);
        continue;
      }

      const fromAlex = item.from === 'alex';
      const maxBubbleWidth = 228;
      const text = this.add.text(0, 0, item.text, {
          color: fromAlex ? '#eaffed' : '#243039',
          fontSize: '12px',
          lineSpacing: 2,
          wordWrap: { width: maxBubbleWidth - 24 },
        });

      const bubbleWidth = item.type === 'attachment'
        ? 220
        : Phaser.Math.Clamp(text.width + 24, 104, maxBubbleWidth);
      const bubbleHeight = item.type === 'attachment' ? 178 : text.height + 18;
      const top = bottom - bubbleHeight;
      if (top < chatTop) {
        text.destroy();
        continue;
      }

      const left = fromAlex ? chatRight - bubbleWidth : chatLeft;
      const bubble = this.add
        .rectangle(left, top, bubbleWidth, bubbleHeight, fromAlex ? 0x3f8057 : 0xf4efe7)
        .setOrigin(0)
        .setStrokeStyle(1, fromAlex ? 0x2f6542 : 0xd8d1c8);
      text.setPosition(left + 12, top + 9);
      elements.push(bubble, text);

      if (item.type === 'attachment') {
        const attachment = this.add
          .image(left + bubbleWidth / 2, top + 96, item.texture)
          .setDisplaySize(196, 147);
        elements.push(attachment);
      }

      bottom = top - 8;
    }

    this.messageLayer = this.add.container(0, 0, elements).setDepth(4000);
  }
}
