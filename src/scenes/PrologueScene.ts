import Phaser from 'phaser';
import { finishWithTransition } from '../game/progress';
import { DialogueOverlay } from '../ui/DialogueOverlay';
import { HighResolutionScene } from './HighResolutionScene';

export class PrologueScene extends HighResolutionScene {
  private dialogue?: DialogueOverlay;
  private actionLayer?: Phaser.GameObjects.Container;
  private refused = false;

  constructor() {
    super('PrologueScene');
  }

  create(): void {
    this.showAnnaRoom();
  }

  private showAnnaRoom(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    this.add.image(0, 0, 'anna-room').setOrigin(0).setDisplaySize(width, height);
    this.add
      .image(322, 316, 'companion-seated-computer')
      .setScale(0.22)
      .setDepth(1000);
    this.add
      .text(24, 20, "Chambre d'Anna · Avant la rencontre", {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.75)',
        padding: { x: 12, y: 8 },
      })
      .setDepth(6000);
    this.dialogue = new DialogueOverlay(this);
    this.dialogue.show(
      [
        {
          speaker: 'Anna',
          portrait: 'companion',
          text: "Je veux tester un nouveau sport. Équitation, parachutisme, pilates...",
        },
        { speaker: 'Anna', portrait: 'companion', text: 'Tir ? Sérieusement ? Avec de vraies armes ?' },
        {
          speaker: 'Anna',
          portrait: 'companion',
          text: "Wow, ça a l'air trop cool ! Let's go, on fait ça.",
        },
      ],
      () => {
        this.showCenteredAction("S'inscrire au module de tir", () => {
          this.dialogue?.show(
            [
              { speaker: 'Narration', text: 'Anna remplit le formulaire et envoie sa demande à Alexandre C.' },
              {
                speaker: 'Anna',
                portrait: 'companion',
                text: "C'est tout bon. J'espère que je serai autorisée, j'ai trop hâte de tester !",
              },
            ],
            () => this.showAlexRoom(),
          );
        });
      },
    );
  }

  private showAlexRoom(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    this.add.image(0, 0, 'alex-room').setOrigin(0).setDisplaySize(width, height);
    this.add
      .image(650, 300, 'hero-seated-computer')
      .setScale(0.2)
      .setDepth(1000);
    this.add
      .text(24, 20, "Chambre d'Alex · Le même soir", {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.75)',
        padding: { x: 12, y: 8 },
      })
      .setDepth(6000);
    this.dialogue = new DialogueOverlay(this);
    this.dialogue.show(
      [
        {
          speaker: 'Alex',
          portrait: 'hero',
          text: 'Il y a beaucoup de mails pour le nouveau semestre. Je vais y répondre.',
        },
      ],
      () => this.showReceivedEmail(),
    );
  }

  private showReceivedEmail(): void {
    this.clearActionLayer();
    const shell = this.createMailShell('Boîte de réception');
    const subject = this.add.text(
      shell.mainLeft,
      shell.panelTop + 103,
      "Demande d'autorisation de participation",
      {
        color: '#172033',
        fontFamily: 'Arial, sans-serif',
        fontSize: '21px',
        fontStyle: 'bold',
      },
    );
    const avatar = this.add
      .circle(shell.mainLeft + 22, shell.panelTop + 157, 22, 0x5b78a7)
      .setStrokeStyle(2, 0xffffff);
    const avatarText = this.add
      .text(shell.mainLeft + 22, shell.panelTop + 157, 'AS', {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const sender = this.add.text(shell.mainLeft + 56, shell.panelTop + 139, 'Anna S.', {
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    });
    const senderAddress = this.add.text(
      shell.mainLeft + 56,
      shell.panelTop + 161,
      'À : Alexandre C.',
      {
        color: '#687386',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
      },
    );
    const date = this.add
      .text(shell.mainRight, shell.panelTop + 142, 'Aujourd’hui · 20:47', {
        color: '#687386',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
      })
      .setOrigin(1, 0);
    const divider = this.add
      .rectangle(shell.mainLeft, shell.panelTop + 194, shell.mainWidth, 1, 0xdce2ea)
      .setOrigin(0);
    const body = this.add.text(
      shell.mainLeft,
      shell.panelTop + 215,
      "Bonjour M. C.,\n\nJe suis Anna S., assistante scientifique à l'EPFL.\nSuite à ma nationalité ukrainienne, j'aimerais demander une autorisation officielle pour participer au module de tir au pistolet.\n\nJe vous remercie d'avance pour votre réponse.\n\nCordialement,\nAnna S.",
      {
        color: '#283346',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineSpacing: 4,
        wordWrap: { width: shell.mainWidth - 8 },
      },
    );
    const reply = this.createMailButton(
      shell.mainLeft + 61,
      shell.panelTop + 69,
      122,
      '↩  Répondre',
      () => this.showComposeEmail(),
      true,
    );

    this.actionLayer = this.add
      .container(0, 0, [
        ...shell.elements,
        subject,
        avatar,
        avatarText,
        sender,
        senderAddress,
        date,
        divider,
        body,
        ...reply,
      ])
      .setDepth(7000);
  }

  private showComposeEmail(): void {
    this.clearActionLayer();
    const shell = this.createMailShell('Brouillons');
    const heading = this.add.text(shell.mainLeft, shell.panelTop + 61, 'Nouvelle réponse', {
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    });
    const recipientLabel = this.add.text(shell.mainLeft, shell.panelTop + 111, 'À', {
      color: '#687386',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const recipient = this.add.text(shell.mainLeft + 72, shell.panelTop + 108, 'Anna S.', {
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    });
    const recipientLine = this.add
      .rectangle(shell.mainLeft, shell.panelTop + 137, shell.mainWidth, 1, 0xdce2ea)
      .setOrigin(0);
    const subjectLabel = this.add.text(shell.mainLeft, shell.panelTop + 151, 'Objet', {
      color: '#687386',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const subject = this.add.text(
      shell.mainLeft + 72,
      shell.panelTop + 148,
      "RE: Demande d'autorisation de participation",
      {
        color: '#172033',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      },
    );
    const subjectLine = this.add
      .rectangle(shell.mainLeft, shell.panelTop + 178, shell.mainWidth, 1, 0xdce2ea)
      .setOrigin(0);
    const instruction = this.add.text(
      shell.mainLeft,
      shell.panelTop + 211,
      'Choisir la réponse à envoyer',
      {
        color: '#172033',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
      },
    );
    const explanation = this.add.text(
      shell.mainLeft,
      shell.panelTop + 241,
      "La législation suisse n'impose aucune restriction particulière dans ce cas.",
      {
        color: '#687386',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        wordWrap: { width: shell.mainWidth },
      },
    );
    const accept = this.createMailButton(
      shell.mainLeft + 145,
      shell.panelTop + 305,
      270,
      'Accepter la participation',
      () => this.acceptParticipation(),
      true,
    );
    const refuse = this.createMailButton(
      shell.mainLeft + 145,
      shell.panelTop + 365,
      270,
      this.refused ? 'Refus impossible' : 'Refuser la participation',
      () => this.refuseParticipation(),
      false,
      this.refused,
    );
    this.actionLayer = this.add
      .container(0, 0, [
        ...shell.elements,
        heading,
        recipientLabel,
        recipient,
        recipientLine,
        subjectLabel,
        subject,
        subjectLine,
        instruction,
        explanation,
        ...accept,
        ...refuse,
      ])
      .setDepth(7000);
  }

  private refuseParticipation(): void {
    if (this.refused) return;
    this.refused = true;
    this.clearActionLayer();
    this.dialogue?.show(
      [
        {
          speaker: 'Alex',
          portrait: 'hero',
          text: "Les Ukrainiens n'ont aucune restriction de participation. Je n'ai aucune raison de refuser.",
        },
      ],
      () => this.showComposeEmail(),
    );
  }

  private acceptParticipation(): void {
    this.clearActionLayer();
    const shell = this.createMailShell('Brouillons');
    const heading = this.add.text(shell.mainLeft, shell.panelTop + 61, 'Réponse à Anna S.', {
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    });
    const recipientLabel = this.add.text(shell.mainLeft, shell.panelTop + 111, 'À', {
      color: '#687386',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const recipient = this.add.text(shell.mainLeft + 72, shell.panelTop + 108, 'Anna S.', {
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    });
    const recipientLine = this.add
      .rectangle(shell.mainLeft, shell.panelTop + 137, shell.mainWidth, 1, 0xdce2ea)
      .setOrigin(0);
    const subjectLabel = this.add.text(shell.mainLeft, shell.panelTop + 151, 'Objet', {
      color: '#687386',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const subject = this.add.text(
      shell.mainLeft + 72,
      shell.panelTop + 148,
      "RE: Demande d'autorisation de participation",
      {
        color: '#172033',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      },
    );
    const subjectLine = this.add
      .rectangle(shell.mainLeft, shell.panelTop + 178, shell.mainWidth, 1, 0xdce2ea)
      .setOrigin(0);
    const response = this.add.text(
      shell.mainLeft,
      shell.panelTop + 201,
      "Bonjour Anna,\n\nJe peux vous confirmer qu'il n'y a pas de restrictions particulières pour les ressortissants ukrainiens dans la législation suisse sur les armes. Vous pouvez donc venir au cours sans procédure additionnelle.\n\nAvec mes meilleures salutations,\n\nAlexandre C.",
      {
        color: '#283346',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineSpacing: 4,
        wordWrap: { width: shell.mainWidth },
      },
    );
    const send = this.createMailButton(
      shell.mainLeft + 57,
      shell.panelTop + 456,
      114,
      'Envoyer',
      () => this.sendReply(),
      true,
    );
    this.actionLayer = this.add
      .container(0, 0, [
        ...shell.elements,
        heading,
        recipientLabel,
        recipient,
        recipientLine,
        subjectLabel,
        subject,
        subjectLine,
        response,
        ...send,
      ])
      .setDepth(7000);
  }

  private sendReply(): void {
    this.clearActionLayer();
    this.dialogue?.show(
      [
        { speaker: 'Alex', portrait: 'hero', text: "Trop bien, c'est fait !" },
        { speaker: 'Alex', portrait: 'hero', text: 'Maintenant, je peux me reposer et jouer un peu.' },
      ],
      () =>
        finishWithTransition(
          this,
          'prologue',
          ['unil_sport_registration', 'alex_authorization_reply'],
          'Le jour de la première rencontre',
        ),
    );
  }

  private showCenteredAction(label: string, callback: () => void): void {
    this.clearActionLayer();
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const panelWidth = 540;
    const panelHeight = 220;
    const panelLeft = centerX - panelWidth / 2;
    const panelTop = centerY - panelHeight / 2;

    const dimmer = this.add
      .rectangle(0, 0, width, height, 0x111722, 0.28)
      .setOrigin(0)
      .setInteractive();

    const windowGraphics = this.add.graphics();
    windowGraphics.fillStyle(0x0b1020, 0.28);
    windowGraphics.fillRoundedRect(panelLeft + 8, panelTop + 10, panelWidth, panelHeight, 16);
    windowGraphics.fillStyle(0xf5f5f7, 1);
    windowGraphics.fillRoundedRect(panelLeft, panelTop, panelWidth, panelHeight, 16);
    windowGraphics.fillStyle(0xe6e7eb, 1);
    windowGraphics.fillRoundedRect(panelLeft, panelTop, panelWidth, 46, 16);
    windowGraphics.fillRect(panelLeft, panelTop + 24, panelWidth, 22);
    windowGraphics.lineStyle(1, 0xc8c9ce, 1);
    windowGraphics.lineBetween(panelLeft, panelTop + 46, panelLeft + panelWidth, panelTop + 46);

    const trafficLights = [
      { x: panelLeft + 22, color: 0xff5f57 },
      { x: panelLeft + 44, color: 0xfebc2e },
      { x: panelLeft + 66, color: 0x28c840 },
    ];
    for (const light of trafficLights) {
      windowGraphics.fillStyle(light.color, 1);
      windowGraphics.fillCircle(light.x, panelTop + 23, 7);
    }

    windowGraphics.fillStyle(0x3478f6, 1);
    windowGraphics.fillCircle(panelLeft + 67, panelTop + 104, 27);
    windowGraphics.lineStyle(4, 0xffffff, 1);
    windowGraphics.beginPath();
    windowGraphics.moveTo(panelLeft + 54, panelTop + 104);
    windowGraphics.lineTo(panelLeft + 64, panelTop + 114);
    windowGraphics.lineTo(panelLeft + 82, panelTop + 94);
    windowGraphics.strokePath();

    const title = this.add
      .text(centerX, panelTop + 23, 'UNIL Sport', {
        color: '#34343a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const heading = this.add.text(panelLeft + 112, panelTop + 77, 'Module de tir au pistolet', {
      color: '#1d1d1f',
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    });
    const description = this.add.text(
      panelLeft + 112,
      panelTop + 107,
      "Envoyer la demande d'inscription pour ce semestre ?",
      {
        color: '#5d5d63',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      },
    );

    const buttonWidth = 292;
    const buttonHeight = 44;
    const buttonX = centerX;
    const buttonY = panelTop + 174;
    const buttonGraphics = this.add.graphics();
    const drawButton = (color: number): void => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(color, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10,
      );
    };
    drawButton(0x3478f6);

    const buttonText = this.add
      .text(buttonX, buttonY, label, {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const buttonZone = this.add
      .zone(buttonX, buttonY, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true });

    let activated = false;
    buttonZone.on('pointerover', () => drawButton(0x2868d7));
    buttonZone.on('pointerout', () => drawButton(0x3478f6));
    buttonZone.on('pointerdown', () => {
      if (activated) return;
      activated = true;
      this.clearActionLayer();
      callback();
    });

    this.actionLayer = this.add
      .container(0, 0, [
        dimmer,
        windowGraphics,
        title,
        heading,
        description,
        buttonGraphics,
        buttonText,
        buttonZone,
      ])
      .setDepth(6500);
  }

  private createMailShell(activeFolder: string): {
    elements: Phaser.GameObjects.GameObject[];
    panelTop: number;
    mainLeft: number;
    mainRight: number;
    mainWidth: number;
  } {
    const { width, height } = this.scale;
    const panelLeft = 50;
    const panelTop = 20;
    const panelWidth = width - panelLeft * 2;
    const panelHeight = height - panelTop * 2;
    const sidebarWidth = 170;
    const mainLeft = panelLeft + sidebarWidth + 20;
    const mainRight = panelLeft + panelWidth - 20;
    const mainWidth = mainRight - mainLeft;
    const elements: Phaser.GameObjects.GameObject[] = [];

    const dimmer = this.add.rectangle(0, 0, width, height, 0x07111f, 0.42).setOrigin(0);
    const windowGraphics = this.add.graphics();
    windowGraphics.fillStyle(0x050b14, 0.35);
    windowGraphics.fillRoundedRect(
      panelLeft + 8,
      panelTop + 9,
      panelWidth,
      panelHeight,
      12,
    );
    windowGraphics.fillStyle(0xf8fafc, 1);
    windowGraphics.fillRoundedRect(panelLeft, panelTop, panelWidth, panelHeight, 12);
    windowGraphics.fillStyle(0x173a63, 1);
    windowGraphics.fillRoundedRect(panelLeft, panelTop, panelWidth, 42, 12);
    windowGraphics.fillRect(panelLeft, panelTop + 22, panelWidth, 20);
    windowGraphics.fillStyle(0xeef3f8, 1);
    windowGraphics.fillRect(panelLeft, panelTop + 42, sidebarWidth, panelHeight - 42);
    windowGraphics.fillStyle(0xffffff, 1);
    windowGraphics.fillRect(
      panelLeft + sidebarWidth,
      panelTop + 42,
      panelWidth - sidebarWidth,
      panelHeight - 42,
    );
    windowGraphics.fillStyle(0xf7f9fc, 1);
    windowGraphics.fillRect(
      panelLeft + sidebarWidth,
      panelTop + 42,
      panelWidth - sidebarWidth,
      54,
    );
    windowGraphics.lineStyle(1, 0xd7dee8, 1);
    windowGraphics.lineBetween(
      panelLeft + sidebarWidth,
      panelTop + 96,
      panelLeft + panelWidth,
      panelTop + 96,
    );
    windowGraphics.lineBetween(
      panelLeft + sidebarWidth,
      panelTop + 42,
      panelLeft + sidebarWidth,
      panelTop + panelHeight,
    );

    const appTitle = this.add
      .text(panelLeft + 18, panelTop + 21, '✉  Courrier', {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    const windowControls = this.add
      .text(panelLeft + panelWidth - 18, panelTop + 21, '—    □    ×', {
        color: '#e8f0fb',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      })
      .setOrigin(1, 0.5);
    const account = this.add.text(panelLeft + 18, panelTop + 63, 'Alexandre C.', {
      color: '#24354a',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    });
    const accountAddress = this.add.text(panelLeft + 18, panelTop + 84, 'alexandre@unil.ch', {
      color: '#718096',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
    });
    const foldersTitle = this.add.text(panelLeft + 18, panelTop + 121, 'DOSSIERS', {
      color: '#7b8798',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
    });

    elements.push(
      dimmer,
      windowGraphics,
      appTitle,
      windowControls,
      account,
      accountAddress,
      foldersTitle,
    );

    const folders = [
      { label: 'Boîte de réception', icon: '▣' },
      { label: 'Brouillons', icon: '▤' },
      { label: 'Messages envoyés', icon: '➤' },
      { label: 'Corbeille', icon: '×' },
    ];
    folders.forEach((folder, index) => {
      const y = panelTop + 157 + index * 42;
      if (folder.label === activeFolder) {
        const active = this.add
          .rectangle(panelLeft + 8, y - 8, sidebarWidth - 16, 34, 0xd9e8fa)
          .setOrigin(0);
        elements.push(active);
      }
      const icon = this.add.text(panelLeft + 20, y, folder.icon, {
        color: folder.label === activeFolder ? '#165a9e' : '#66758a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      });
      const label = this.add.text(panelLeft + 48, y, folder.label, {
        color: folder.label === activeFolder ? '#174f83' : '#405066',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: folder.label === activeFolder ? 'bold' : 'normal',
      });
      elements.push(icon, label);
    });

    return { elements, panelTop, mainLeft, mainRight, mainWidth };
  }

  private createMailButton(
    x: number,
    y: number,
    width: number,
    label: string,
    callback: () => void,
    primary = false,
    disabled = false,
  ): Phaser.GameObjects.GameObject[] {
    const height = 38;
    const background = this.add.graphics();
    const drawButton = (hovered = false): void => {
      const fill = disabled
        ? 0xe5e9ef
        : primary
          ? hovered
            ? 0x0e4f91
            : 0x1769aa
          : hovered
            ? 0xe6edf6
            : 0xf8fafc;
      const stroke = disabled ? 0xcbd2dc : primary ? 0x0e5798 : 0xaab6c5;
      background.clear();
      background.fillStyle(fill, 1);
      background.fillRoundedRect(x - width / 2, y - height / 2, width, height, 6);
      background.lineStyle(1, stroke, 1);
      background.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 6);
    };
    drawButton();
    const text = this.add
      .text(x, y, label, {
        color: disabled ? '#8a94a3' : primary ? '#ffffff' : '#26364a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const hitTarget = this.add.rectangle(x, y, width, height, 0xffffff, 0.001);
    if (!disabled) {
      let activated = false;
      hitTarget.setInteractive({ useHandCursor: true });
      hitTarget.on('pointerover', () => drawButton(true));
      hitTarget.on('pointerout', () => drawButton(false));
      hitTarget.on('pointerup', () => {
        if (activated) return;
        activated = true;
        callback();
      });
    }
    return [background, text, hitTarget];
  }

  private clearActionLayer(): void {
    this.actionLayer?.destroy(true);
    this.actionLayer = undefined;
  }
}
