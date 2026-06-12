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
    this.add.rectangle(0, 0, width, height, 0x10151b).setOrigin(0);
    this.add.image(width / 2, height / 2, 'phone-frame').setDisplaySize(410, 520);
    this.add
      .text(width / 2, 36, 'Quelques jours plus tard · WhatsApp', {
        color: '#f4efe7',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add.image(width / 2 - 155, 95, 'anna-whatsapp-avatar').setDisplaySize(48, 48);
    this.add.image(width / 2 + 155, 95, 'alex-whatsapp-avatar').setDisplaySize(48, 48);
    this.add
      .text(width / 2, height - 22, 'Espace · Message suivant', {
        color: '#aeb7b9',
        fontSize: '14px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.on('pointerdown', () => this.advance());
    this.advance();
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
    let y = 130;

    for (const item of this.history) {
      if (item.type === 'title') {
        const title = this.add
          .text(width / 2, 270, item.text, {
            color: '#f2c14e',
            fontSize: '19px',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 330 },
          })
          .setOrigin(0.5);
        elements.push(title);
        continue;
      }

      const fromAlex = item.from === 'alex';
      const x = width / 2 + (fromAlex ? 55 : -55);
      const bubbleWidth = 250;
      const text = this.add
        .text(x, y, item.text, {
          color: fromAlex ? '#eaffed' : '#243039',
          fontSize: '13px',
          lineSpacing: 3,
          wordWrap: { width: bubbleWidth - 26 },
          backgroundColor: fromAlex ? '#3f8057' : '#f4efe7',
          padding: { x: 12, y: 9 },
        })
        .setOrigin(fromAlex ? 1 : 0, 0);
      elements.push(text);

      if (item.type === 'attachment') {
        const attachment = this.add
          .image(fromAlex ? x - 125 : x + 125, y + 42, item.texture)
          .setDisplaySize(120, 70);
        elements.push(attachment);
        y += 88;
      } else {
        y += Math.max(55, text.height + 10);
      }
    }

    this.messageLayer = this.add.container(0, 0, elements).setDepth(4000);
  }
}
