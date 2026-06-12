import Phaser from 'phaser';
import { firstMeetingDialogue } from '../content/prototypeDialogue';
import type { DialogueLine } from '../content/prototypeDialogue';
import { finishWithTransition } from '../game/progress';

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

type InteractionPoint = {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  lines: DialogueLine[];
  marker?: Phaser.GameObjects.Container;
  onActivate?: () => void;
  afterDialogue?: () => void;
};

const WORLD_WIDTH = 1672;
const WORLD_HEIGHT = 941;
const CHARACTER_SCALE = 0.105;

export class FirstMeetingScene extends Phaser.Scene {
  private cursors?: CursorKeys;
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private debugKey?: Phaser.Input.Keyboard.Key;
  private hero?: Phaser.Physics.Arcade.Sprite;
  private companion?: Phaser.Physics.Arcade.Sprite;
  private bus?: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  private blockers?: Phaser.Physics.Arcade.StaticGroup;
  private walkableZones: Phaser.Geom.Polygon[] = [];
  private interactionPoints: InteractionPoint[] = [];
  private nearbyInteraction?: InteractionPoint;
  private dialogueLines: DialogueLine[] = [];
  private dialogueIndex = 0;
  private dialogueOpen = false;
  private dialoguePanel?: Phaser.GameObjects.Container;
  private dialogueText?: Phaser.GameObjects.Text;
  private speakerText?: Phaser.GameObjects.Text;
  private dialogueHintText?: Phaser.GameObjects.Text;
  private interactionPrompt?: Phaser.GameObjects.Text;
  private objectiveText?: Phaser.GameObjects.Text;
  private locationText?: Phaser.GameObjects.Text;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private lastHeroPosition = new Phaser.Math.Vector2();
  private lastCompanionPosition = new Phaser.Math.Vector2();
  private dialogueCompleteCallback?: () => void;

  constructor() {
    super('FirstMeetingScene');
  }

  create(): void {
    this.add.image(0, 0, 'unil-sport-background').setOrigin(0).setDepth(0);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setRoundPixels(true);

    this.createNavigation();
    this.createVehicles();
    this.createCharacters();
    this.createInteractions();
    this.createHud();
    this.createInput();

    this.cameras.main.startFollow(this.hero!, true, 0.09, 0.09);
    this.cameras.main.fadeIn(350, 10, 18, 28);
    this.startDialogue(firstMeetingDialogue);
  }

  update(): void {
    if (!this.hero || !this.companion || !this.cursors) {
      return;
    }

    this.restoreToWalkableArea(this.hero, this.lastHeroPosition);
    this.restoreToWalkableArea(this.companion, this.lastCompanionPosition);

    if (this.dialogueOpen) {
      this.hero.setVelocity(0, 0);
      this.companion.setVelocity(0, 0);
    } else {
      this.updateHeroMovement();
      this.updateCompanionMovement();
    }

    this.hero.setDepth(1000 + this.hero.y);
    this.companion.setDepth(1000 + this.companion.y);
    this.updateNearbyInteraction();
  }

  private createCharacters(): void {
    this.hero = this.physics.add.sprite(735, 690, 'hero-front');
    this.configureCharacter(this.hero);

    this.companion = this.physics.add.sprite(690, 735, 'companion-front');
    this.configureCharacter(this.companion);

    this.lastHeroPosition.set(this.hero.x, this.hero.y);
    this.lastCompanionPosition.set(this.companion.x, this.companion.y);

    if (this.blockers) {
      this.physics.add.collider(this.hero, this.blockers);
      this.physics.add.collider(this.companion, this.blockers);
    }

    if (this.bus) {
      this.physics.add.collider(this.hero, this.bus);
      this.physics.add.collider(this.companion, this.bus);
    }
  }

  private configureCharacter(sprite: Phaser.Physics.Arcade.Sprite): void {
    sprite.setScale(CHARACTER_SCALE);
    sprite.setCollideWorldBounds(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(145, 76);
    body.setOffset(120, 416);
  }

  private createVehicles(): void {
    this.bus = this.physics.add.staticImage(665, 335, 'minibus-closed');
    this.bus.setScale(0.21);
    this.bus.setDepth(500);
    this.bus.refreshBody();
  }

  private createNavigation(): void {
    this.walkableZones = [
      this.polygon([
        325, 510, 585, 500, 705, 640, 655, 745, 470, 785, 260, 685,
      ]),
      this.polygon([500, 430, 610, 410, 805, 630, 735, 710, 565, 555]),
      this.polygon([365, 210, 930, 210, 945, 410, 430, 445]),
      this.polygon([555, 400, 930, 250, 1010, 300, 650, 510]),
      this.polygon([900, 275, 1320, 300, 1425, 390, 1280, 435, 950, 355]),
      this.polygon([745, 555, 850, 515, 865, 705, 785, 735]),
      this.createCirclePolygon(760, 750, 112),
      this.polygon([800, 730, 900, 745, 1050, 845, 990, 915, 850, 825]),
      this.polygon([145, 900, 230, 941, 1010, 875, 1325, 755, 1270, 690, 975, 815]),
      this.polygon([1270, 355, 1515, 410, 1390, 735, 1280, 770, 1335, 525]),
      this.polygon([1260, 700, 1395, 720, 1460, 815, 1390, 855, 1300, 790]),
    ];

    this.blockers = this.physics.add.staticGroup();
    this.addBlocker(0, 330, 425, 270);
    this.addBlocker(790, 340, 535, 285);
    this.addBlocker(1450, 375, 222, 566);

    this.debugGraphics = this.add.graphics().setDepth(3000).setVisible(false);
    this.debugGraphics.lineStyle(2, 0x49b6a9, 0.9);
    this.debugGraphics.fillStyle(0x49b6a9, 0.12);
    for (const zone of this.walkableZones) {
      this.debugGraphics.fillPoints(zone.points, true);
      this.debugGraphics.strokePoints(zone.points, true);
    }
  }

  private polygon(points: number[]): Phaser.Geom.Polygon {
    const polygonPoints: Phaser.Geom.Point[] = [];
    for (let index = 0; index < points.length; index += 2) {
      polygonPoints.push(new Phaser.Geom.Point(points[index], points[index + 1]));
    }
    return new Phaser.Geom.Polygon(polygonPoints);
  }

  private createCirclePolygon(
    centerX: number,
    centerY: number,
    radius: number,
  ): Phaser.Geom.Polygon {
    const points: Phaser.Geom.Point[] = [];
    for (let index = 0; index < 20; index += 1) {
      const angle = (Math.PI * 2 * index) / 20;
      points.push(
        new Phaser.Geom.Point(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius,
        ),
      );
    }
    return new Phaser.Geom.Polygon(points);
  }

  private addBlocker(x: number, y: number, width: number, height: number): void {
    const blocker = this.add.rectangle(x + width / 2, y + height / 2, width, height);
    blocker.setVisible(false);
    this.physics.add.existing(blocker, true);
    this.blockers?.add(blocker);
  }

  private createInteractions(): void {
    this.interactionPoints = [
      {
        id: 'group',
        x: 760,
        y: 750,
        radius: 82,
        label: 'le groupe du premier cours',
        lines: [
          {
            speaker: 'companion',
            text: "C'est ici que tout a vraiment commencé, au milieu de ce petit parc.",
          },
          {
            speaker: 'hero',
            text: 'Sept élèves, un premier trajet ensemble, et aucune idée de la suite.',
          },
        ],
      },
      {
        id: 'unil-building',
        x: 475,
        y: 625,
        radius: 74,
        label: 'le bâtiment UNIL Sport',
        lines: [
          {
            speaker: 'hero',
            text: "Le bâtiment d'UNIL Sport. Le groupe s'est retrouvé juste devant.",
          },
        ],
      },
      {
        id: 'football-field',
        x: 820,
        y: 590,
        radius: 78,
        label: 'le terrain de foot',
        lines: [
          {
            speaker: 'hero',
            text: 'Le terrain était déjà animé. Le campus semblait plein de vie.',
          },
        ],
      },
      {
        id: 'lake',
        x: 1245,
        y: 735,
        radius: 88,
        label: 'le bord du lac',
        lines: [
          {
            speaker: 'companion',
            text: 'Le lac, les montagnes et cette lumière de mai... difficile à oublier.',
          },
        ],
      },
      {
        id: 'bus',
        x: 665,
        y: 425,
        radius: 105,
        label: 'le petit bus blanc',
        lines: [
          {
            speaker: 'hero',
            text: 'Voilà notre bus. Vous pouvez vous installer, on y va !',
          },
          {
            speaker: 'companion',
            text: 'Le premier trajet du groupe pouvait commencer.',
          },
        ],
        onActivate: () => {
          this.bus?.setTexture('minibus-open');
          this.objectiveText?.setText('Souvenir débloqué : le petit bus blanc');
        },
        afterDialogue: () =>
          finishWithTransition(
            this,
            'first_meeting',
            ['unil_sport_group', 'white_vw_bus'],
            'En route vers le stand de Vernand',
          ),
      },
    ];

    for (const point of this.interactionPoints) {
      point.marker = this.createInteractionMarker(point.x, point.y);
    }
  }

  private createInteractionMarker(x: number, y: number): Phaser.GameObjects.Container {
    const glow = this.add.circle(0, 0, 16, 0xf2c14e, 0.16);
    const ring = this.add.circle(0, 0, 10, 0xf2c14e, 0.18).setStrokeStyle(2, 0xf8dc82, 0.9);
    const dot = this.add.circle(0, 0, 3, 0xfff3bf, 1);
    const marker = this.add.container(x, y, [glow, ring, dot]).setDepth(950);

    this.tweens.add({
      targets: marker,
      y: y - 5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    return marker;
  }

  private createHud(): void {
    const { width, height } = this.scale;

    this.locationText = this.add
      .text(24, 20, 'UNIL Sport · Lausanne', {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17, 17, 22, 0.76)',
        padding: { x: 12, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(5000);

    this.objectiveText = this.add
      .text(24, 66, 'Objectif : rejoindre le petit bus blanc', {
        color: '#f8dc82',
        fontSize: '15px',
        backgroundColor: 'rgba(17, 17, 22, 0.72)',
        padding: { x: 12, y: 7 },
      })
      .setScrollFactor(0)
      .setDepth(5000);

    this.interactionPrompt = this.add
      .text(width / 2, height - 28, '', {
        color: '#f4efe7',
        fontSize: '16px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17, 17, 22, 0.86)',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5100)
      .setVisible(false);

    const panelBackground = this.add.rectangle(
      width / 2,
      height - 72,
      width - 72,
      112,
      0x111116,
      0.92,
    );
    panelBackground.setStrokeStyle(1, 0xf2c14e, 0.48);

    this.speakerText = this.add.text(58, height - 116, '', {
      color: '#f2c14e',
      fontSize: '16px',
      fontStyle: 'bold',
    });
    this.dialogueText = this.add.text(58, height - 89, '', {
      color: '#f4efe7',
      fontSize: '18px',
      wordWrap: { width: width - 180 },
    });
    this.dialogueHintText = this.add
      .text(width - 56, height - 38, 'Espace', {
        color: '#aeb7b9',
        fontSize: '14px',
      })
      .setOrigin(1, 0.5);

    this.dialoguePanel = this.add
      .container(0, 0, [
        panelBackground,
        this.speakerText,
        this.dialogueText,
        this.dialogueHintText,
      ])
      .setScrollFactor(0)
      .setDepth(5200)
      .setVisible(false);
  }

  private createInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.interactionKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogueOpen) {
        this.advanceDialogue();
      }
    });

    this.interactionKey?.on('down', () => {
      if (!this.dialogueOpen && this.nearbyInteraction) {
        this.nearbyInteraction.onActivate?.();
        this.startDialogue(
          this.nearbyInteraction.lines,
          this.nearbyInteraction.afterDialogue,
        );
      }
    });

    this.debugKey?.on('down', () => {
      this.debugGraphics?.setVisible(!this.debugGraphics.visible);
    });
  }

  private updateHeroMovement(): void {
    if (!this.hero || !this.cursors) {
      return;
    }

    const velocity = new Phaser.Math.Vector2();
    if (this.cursors.left.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown) velocity.x += 1;
    if (this.cursors.up.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown) velocity.y += 1;

    velocity.normalize().scale(175);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.updateFacing(this.hero, velocity);
  }

  private updateCompanionMovement(): void {
    if (!this.hero || !this.companion) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.hero.x,
      this.hero.y,
      this.companion.x,
      this.companion.y,
    );

    if (distance > 68) {
      this.physics.moveToObject(this.companion, this.hero, 128);
    } else {
      this.companion.setVelocity(0, 0);
    }

    const body = this.companion.body as Phaser.Physics.Arcade.Body;
    this.updateFacing(this.companion, body.velocity);
  }

  private updateFacing(
    sprite: Phaser.Physics.Arcade.Sprite,
    velocity: Phaser.Math.Vector2,
  ): void {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      if (velocity.x < -8) {
        sprite.setTexture(sprite === this.hero ? 'hero-side' : 'companion-side');
        sprite.setFlipX(true);
      } else if (velocity.x > 8) {
        sprite.setTexture(sprite === this.hero ? 'hero-side' : 'companion-side');
        sprite.setFlipX(false);
      }
    } else if (velocity.y < -8) {
      sprite.setTexture(sprite === this.hero ? 'hero-back' : 'companion-back');
      sprite.setFlipX(false);
    } else if (velocity.y > 8) {
      sprite.setTexture(sprite === this.hero ? 'hero-front' : 'companion-front');
      sprite.setFlipX(false);
    }
  }

  private restoreToWalkableArea(
    sprite: Phaser.Physics.Arcade.Sprite,
    lastValidPosition: Phaser.Math.Vector2,
  ): void {
    const feetX = sprite.x;
    const feetY = sprite.y + 24;

    if (!this.isWalkable(feetX, feetY)) {
      sprite.setPosition(lastValidPosition.x, lastValidPosition.y);
      sprite.setVelocity(0, 0);
      return;
    }

    lastValidPosition.set(sprite.x, sprite.y);
  }

  private isWalkable(x: number, y: number): boolean {
    return this.walkableZones.some((zone) => Phaser.Geom.Polygon.Contains(zone, x, y));
  }

  private updateNearbyInteraction(): void {
    if (!this.hero) {
      return;
    }

    let closest: InteractionPoint | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const point of this.interactionPoints) {
      const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, point.x, point.y);
      const isNearby = distance <= point.radius;
      point.marker?.setAlpha(isNearby ? 1 : 0.55);
      if (isNearby && distance < closestDistance) {
        closest = point;
        closestDistance = distance;
      }
    }

    this.nearbyInteraction = closest;
    this.interactionPrompt
      ?.setText(closest ? `E · Examiner ${closest.label}` : '')
      .setVisible(Boolean(closest) && !this.dialogueOpen);
  }

  private startDialogue(lines: DialogueLine[], onComplete?: () => void): void {
    this.dialogueLines = lines;
    this.dialogueIndex = 0;
    this.dialogueCompleteCallback = onComplete;
    this.dialogueOpen = true;
    this.dialoguePanel?.setVisible(true);
    this.interactionPrompt?.setVisible(false);
    this.showDialogueLine();
  }

  private showDialogueLine(): void {
    const line = this.dialogueLines[this.dialogueIndex];
    if (!line) {
      return;
    }

    this.speakerText?.setText(line.speaker === 'hero' ? 'Alex' : 'Anna');
    this.dialogueText?.setText(line.text);
    this.dialogueHintText?.setText(
      this.dialogueIndex === this.dialogueLines.length - 1 ? 'Espace · Fermer' : 'Espace',
    );
  }

  private advanceDialogue(): void {
    this.dialogueIndex += 1;
    if (this.dialogueIndex >= this.dialogueLines.length) {
      this.dialogueOpen = false;
      this.dialoguePanel?.setVisible(false);
      const callback = this.dialogueCompleteCallback;
      this.dialogueCompleteCallback = undefined;
      callback?.();
      return;
    }

    this.showDialogueLine();
  }
}
