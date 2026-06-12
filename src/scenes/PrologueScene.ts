import Phaser from 'phaser';
import { finishWithTransition } from '../game/progress';
import { DialogueOverlay } from '../ui/DialogueOverlay';

export class PrologueScene extends Phaser.Scene {
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
    this.add.image(0, 0, 'anna-room').setOrigin(0);
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
    this.add.image(0, 0, 'alex-room').setOrigin(0);
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
    const { width, height } = this.scale;
    const panel = this.add.image(width / 2, height / 2, 'received-email').setDisplaySize(680, 500);
    const title = this.add
      .text(width / 2 - 270, 68, "Demande d'autorisation de participation", {
        color: '#132231',
        fontSize: '18px',
        fontStyle: 'bold',
      });
    const body = this.add.text(
      width / 2 - 270,
      112,
      "Bonjour M. C.,\n\nJe suis Anna S., assistante scientifique à l'EPFL.\nSuite à ma nationalité ukrainienne, j'aimerais demander une autorisation officielle pour participer au module de tir au pistolet.\n\nJe vous remercie d'avance pour votre réponse.\n\nCordialement,\nAnna S.",
      {
        color: '#1d2933',
        fontSize: '15px',
        lineSpacing: 5,
        wordWrap: { width: 540 },
      },
    );
    const button = this.createButton(width / 2, 445, 'Répondre', () => this.showComposeEmail());
    this.actionLayer = this.add.container(0, 0, [panel, title, body, ...button]).setDepth(7000);
  }

  private showComposeEmail(): void {
    this.clearActionLayer();
    const { width, height } = this.scale;
    const panel = this.add.image(width / 2, height / 2, 'compose-email').setDisplaySize(760, 470);
    const title = this.add.text(width / 2 - 310, 75, 'Réponse à Anna S.', {
      color: '#132231',
      fontSize: '18px',
      fontStyle: 'bold',
    });
    const instruction = this.add
      .text(width / 2, 160, 'Choisir la réponse', {
        color: '#243746',
        fontSize: '18px',
      })
      .setOrigin(0.5);
    const accept = this.createButton(width / 2, 235, 'Accepter la participation', () =>
      this.acceptParticipation(),
    );
    const refuse = this.createButton(
      width / 2,
      310,
      this.refused ? 'Refus impossible' : 'Refuser la participation',
      () => this.refuseParticipation(),
      this.refused,
    );
    this.actionLayer = this.add
      .container(0, 0, [panel, title, instruction, ...accept, ...refuse])
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
    const { width, height } = this.scale;
    const panel = this.add.image(width / 2, height / 2, 'compose-email').setDisplaySize(760, 470);
    const response = this.add.text(
      width / 2 - 300,
      105,
      "Bonjour Anna,\n\nJe peux vous confirmer qu'il n'y a pas de restrictions particulières pour les ressortissants ukrainiens dans la législation suisse sur les armes. Vous pouvez donc venir au cours sans procédure additionnelle.\n\nAvec mes meilleures salutations,\n\nAlexandre C.",
      {
        color: '#1d2933',
        fontSize: '16px',
        lineSpacing: 6,
        wordWrap: { width: 600 },
      },
    );
    const send = this.createButton(width / 2, 445, 'Envoyer', () => this.sendReply());
    this.actionLayer = this.add.container(0, 0, [panel, response, ...send]).setDepth(7000);
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
    const button = this.createButton(this.scale.width / 2, this.scale.height / 2, label, callback);
    this.actionLayer = this.add.container(0, 0, button).setDepth(6500);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    callback: () => void,
    disabled = false,
  ): Phaser.GameObjects.GameObject[] {
    const background = this.add
      .rectangle(x, y, 330, 52, disabled ? 0x4b5056 : 0x315f65, disabled ? 0.7 : 0.95)
      .setStrokeStyle(2, disabled ? 0x777777 : 0xf2c14e)
      .setInteractive({ useHandCursor: !disabled });
    const text = this.add
      .text(x, y, label, {
        color: disabled ? '#aaaaaa' : '#f4efe7',
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    if (!disabled) background.on('pointerdown', callback);
    return [background, text];
  }

  private clearActionLayer(): void {
    this.actionLayer?.destroy(true);
    this.actionLayer = undefined;
  }
}
