import Phaser from 'phaser';
import { firstMeetingDialogue } from '../content/prototypeDialogue';
import type { DialogueLine } from '../content/prototypeDialogue';
import { finishWithTransition } from '../game/progress';

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

type MovementKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

type FacingDirection = 'front' | 'back' | 'left' | 'right';

type StudentPlacement = {
  texture: string;
  x: number;
  y: number;
  flipped?: boolean;
};

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
const HERO_MOVE_SPEED = 130;
const COMPANION_MOVE_SPEED = 130;
const COMPANION_FOLLOW_DISTANCE = 68;
const COMPANION_PATH_REFRESH_MS = 250;
const COMPANION_TRAIL_SPACING = 14;
const COMPANION_TRAIL_POINT_REACHED = 20;
const WALK_STEP_DURATION = 200;
const CHARACTER_FEET_OFFSET = 24;
const NAVIGATION_GRID_SIZE = 20;
const NAVIGATION_BLOCKER_MARGIN = 18;
const BUS_NAVIGATION_MARGIN = 15;
const WAYPOINT_REACHED_DISTANCE = 7;
const BUS_DOOR_APPROACH_X = 675;
const BUS_DOOR_APPROACH_Y = 410;
const BUS_DOOR_X = 675;
const BUS_DOOR_Y = 360;

export class FirstMeetingScene extends Phaser.Scene {
  private cursors?: CursorKeys;
  private wasdKeys?: MovementKeys;
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private debugKey?: Phaser.Input.Keyboard.Key;
  private hero?: Phaser.Physics.Arcade.Sprite;
  private companion?: Phaser.Physics.Arcade.Sprite;
  private students: Phaser.GameObjects.Image[] = [];
  private studentIdleTweens = new Map<
    Phaser.GameObjects.Image,
    Phaser.Tweens.Tween
  >();
  private studentBaseTextures = new Map<Phaser.GameObjects.Image, string>();
  private studentFacings = new Map<
    Phaser.GameObjects.Image,
    FacingDirection
  >();
  private walkingStudents = new Set<Phaser.GameObjects.Image>();
  private scriptedWalkingActors = new Set<Phaser.Physics.Arcade.Sprite>();
  private bus?: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  private blockers?: Phaser.Physics.Arcade.StaticGroup;
  private navigationBlockers: Phaser.Geom.Rectangle[] = [];
  private walkableZones: Phaser.Geom.Polygon[] = [];
  private navigationPath: Phaser.Math.Vector2[] = [];
  private companionNavigationPath: Phaser.Math.Vector2[] = [];
  private heroTrail: Phaser.Math.Vector2[] = [];
  private companionPathTarget = new Phaser.Math.Vector2();
  private nextCompanionPathRefresh = 0;
  private navigationTargetMarker?: Phaser.GameObjects.Arc;
  private interactionPoints: InteractionPoint[] = [];
  private nearbyInteraction?: InteractionPoint;
  private dialogueLines: DialogueLine[] = [];
  private dialogueIndex = 0;
  private dialogueOpen = false;
  private busSequenceActive = false;
  private busSequenceStarted = false;
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
  private heroFacing: FacingDirection = 'front';
  private companionFacing: FacingDirection = 'front';
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
    this.createStudents();
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

    if (this.dialogueOpen || this.busSequenceActive) {
      this.hero.setVelocity(0, 0);
      this.companion.setVelocity(0, 0);
    } else {
      this.updateHeroMovement();
      this.updateCompanionMovement();
    }

    this.updateCharacterAnimations();
    this.updateStudentAnimations();
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
    this.heroTrail = [
      new Phaser.Math.Vector2(
        this.hero.x,
        this.hero.y + CHARACTER_FEET_OFFSET,
      ),
    ];
    this.companionNavigationPath = [];
    this.companionPathTarget.set(0, 0);
    this.nextCompanionPathRefresh = 0;

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

  private createStudents(): void {
    const placements: StudentPlacement[] = [
      { texture: 'npc-01', x: 660, y: 700 },
      { texture: 'npc-02', x: 725, y: 635, flipped: true },
      { texture: 'npc-03', x: 810, y: 640 },
      { texture: 'npc-04', x: 875, y: 710, flipped: true },
      { texture: 'npc-06', x: 815, y: 780 },
      { texture: 'npc-08', x: 745, y: 800, flipped: true },
    ];

    this.students = placements.map((placement, index) => {
      const student = this.add
        .image(placement.x, placement.y, placement.texture)
        .setScale(CHARACTER_SCALE)
        .setFlipX(placement.flipped ?? false)
        .setDepth(1000 + placement.y);

      const idleTween = this.tweens.add({
        targets: student,
        scaleX: CHARACTER_SCALE * 0.997,
        scaleY: CHARACTER_SCALE * 1.009,
        duration: 1150 + index * 90,
        delay: index * 120,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      this.studentIdleTweens.set(student, idleTween);
      this.studentBaseTextures.set(student, placement.texture);
      this.studentFacings.set(student, 'front');

      return student;
    });
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

    this.navigationTargetMarker = this.add
      .circle(0, 0, 11, 0x4ea4ef, 0.16)
      .setStrokeStyle(2, 0x9fd1ff, 0.95)
      .setDepth(2900)
      .setVisible(false);
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
    this.navigationBlockers.push(new Phaser.Geom.Rectangle(x, y, width, height));
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
            text: 'Voilà notre bus.',
          },
        ],
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
    this.wasdKeys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MovementKeys | undefined;
    this.interactionKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogueOpen) {
        this.advanceDialogue();
      }
    });

    this.interactionKey?.on('down', () => {
      if (!this.dialogueOpen && !this.busSequenceActive && this.nearbyInteraction) {
        if (this.nearbyInteraction.id === 'bus') {
          void this.startBusSequence();
          return;
        }

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

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (
        pointer.button !== 0 ||
        this.dialogueOpen ||
        this.busSequenceActive ||
        !this.hero
      ) {
        return;
      }

      const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if (!this.isNavigationWalkable(target.x, target.y)) {
        return;
      }

      const start = new Phaser.Math.Vector2(
        this.hero.x,
        this.hero.y + CHARACTER_FEET_OFFSET,
      );
      const path = this.findNavigationPath(start, target);
      if (path.length === 0) {
        return;
      }
      this.navigationPath = path;

      const finalWaypoint = this.navigationPath.at(-1)!;
      this.navigationTargetMarker
        ?.setPosition(finalWaypoint.x, finalWaypoint.y)
        .setVisible(true);
    });
  }

  private updateHeroMovement(): void {
    if (!this.hero || !this.cursors) {
      return;
    }

    const velocity = new Phaser.Math.Vector2();
    if (this.cursors.left.isDown || this.wasdKeys?.left.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown || this.wasdKeys?.right.isDown) velocity.x += 1;
    if (this.cursors.up.isDown || this.wasdKeys?.up.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown || this.wasdKeys?.down.isDown) velocity.y += 1;

    if (velocity.lengthSq() === 0) {
      this.updatePointAndClickMovement();
      return;
    }

    this.clearNavigationPath();
    velocity.normalize().scale(HERO_MOVE_SPEED);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.updateFacing(this.hero, velocity);
  }

  private updatePointAndClickMovement(): void {
    if (!this.hero || this.navigationPath.length === 0) {
      this.hero?.setVelocity(0, 0);
      return;
    }

    const waypoint = this.navigationPath[0];
    const targetPosition = new Phaser.Math.Vector2(
      waypoint.x,
      waypoint.y - CHARACTER_FEET_OFFSET,
    );
    const distance = Phaser.Math.Distance.Between(
      this.hero.x,
      this.hero.y,
      targetPosition.x,
      targetPosition.y,
    );

    if (distance <= WAYPOINT_REACHED_DISTANCE) {
      this.hero.setPosition(targetPosition.x, targetPosition.y);
      this.navigationPath.shift();
      if (this.navigationPath.length === 0) {
        this.hero.setVelocity(0, 0);
        this.navigationTargetMarker?.setVisible(false);
      }
      return;
    }

    const velocity = targetPosition
      .clone()
      .subtract(new Phaser.Math.Vector2(this.hero.x, this.hero.y))
      .normalize()
      .scale(HERO_MOVE_SPEED);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.updateFacing(this.hero, velocity);
  }

  private clearNavigationPath(): void {
    this.navigationPath = [];
    this.navigationTargetMarker?.setVisible(false);
  }

  private findNavigationPath(
    start: Phaser.Math.Vector2,
    target: Phaser.Math.Vector2,
  ): Phaser.Math.Vector2[] {
    if (this.isSegmentNavigable(start, target)) {
      return [target];
    }

    const columns = Math.ceil(WORLD_WIDTH / NAVIGATION_GRID_SIZE);
    const rows = Math.ceil(WORLD_HEIGHT / NAVIGATION_GRID_SIZE);
    const nodeCount = columns * rows;
    const nodeState = new Int8Array(nodeCount);

    const nodePoint = (index: number): Phaser.Math.Vector2 => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      return new Phaser.Math.Vector2(
        Math.min(
          column * NAVIGATION_GRID_SIZE + NAVIGATION_GRID_SIZE / 2,
          WORLD_WIDTH - 1,
        ),
        Math.min(
          row * NAVIGATION_GRID_SIZE + NAVIGATION_GRID_SIZE / 2,
          WORLD_HEIGHT - 1,
        ),
      );
    };

    const isNodeWalkable = (index: number): boolean => {
      if (nodeState[index] !== 0) return nodeState[index] === 1;
      const point = nodePoint(index);
      const walkable = this.isNavigationWalkable(point.x, point.y);
      nodeState[index] = walkable ? 1 : -1;
      return walkable;
    };

    const closestNode = (point: Phaser.Math.Vector2): number => {
      let closest = -1;
      let closestDistanceSq = Number.POSITIVE_INFINITY;
      for (let index = 0; index < nodeCount; index += 1) {
        if (!isNodeWalkable(index)) continue;
        const candidate = nodePoint(index);
        if (!this.isSegmentNavigable(point, candidate)) continue;
        const distanceSq = Phaser.Math.Distance.Squared(
          point.x,
          point.y,
          candidate.x,
          candidate.y,
        );
        if (distanceSq < closestDistanceSq) {
          closest = index;
          closestDistanceSq = distanceSq;
        }
      }
      return closest;
    };

    const startNode = closestNode(start);
    const targetNode = closestNode(target);
    if (startNode < 0 || targetNode < 0) return [];

    const gScore = new Float64Array(nodeCount);
    gScore.fill(Number.POSITIVE_INFINITY);
    const fScore = new Float64Array(nodeCount);
    fScore.fill(Number.POSITIVE_INFINITY);
    const cameFrom = new Int32Array(nodeCount);
    cameFrom.fill(-1);
    const openState = new Uint8Array(nodeCount);
    const closedState = new Uint8Array(nodeCount);
    const openNodes = [startNode];
    const heuristic = (index: number): number => nodePoint(index).distance(target);

    gScore[startNode] = 0;
    fScore[startNode] = heuristic(startNode) / NAVIGATION_GRID_SIZE;
    openState[startNode] = 1;
    let reachedTarget = false;
    let bestNode = startNode;
    let bestDistance = heuristic(startNode);
    const neighbors = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    while (openNodes.length > 0) {
      let bestOpenIndex = 0;
      for (let index = 1; index < openNodes.length; index += 1) {
        if (fScore[openNodes[index]] < fScore[openNodes[bestOpenIndex]]) {
          bestOpenIndex = index;
        }
      }

      const current = openNodes.splice(bestOpenIndex, 1)[0];
      openState[current] = 0;
      if (closedState[current]) continue;
      closedState[current] = 1;

      const distanceToTarget = heuristic(current);
      if (distanceToTarget < bestDistance) {
        bestDistance = distanceToTarget;
        bestNode = current;
      }
      if (current === targetNode) {
        reachedTarget = true;
        bestNode = current;
        break;
      }

      const currentColumn = current % columns;
      const currentRow = Math.floor(current / columns);
      for (const [columnOffset, rowOffset] of neighbors) {
        const nextColumn = currentColumn + columnOffset;
        const nextRow = currentRow + rowOffset;
        if (
          nextColumn < 0 ||
          nextColumn >= columns ||
          nextRow < 0 ||
          nextRow >= rows
        ) {
          continue;
        }

        const next = nextRow * columns + nextColumn;
        if (closedState[next] || !isNodeWalkable(next)) continue;
        if (columnOffset !== 0 && rowOffset !== 0) {
          const horizontal = currentRow * columns + nextColumn;
          const vertical = nextRow * columns + currentColumn;
          if (!isNodeWalkable(horizontal) || !isNodeWalkable(vertical)) continue;
        }

        const movementCost =
          columnOffset !== 0 && rowOffset !== 0 ? Math.SQRT2 : 1;
        const tentativeScore = gScore[current] + movementCost;
        if (tentativeScore >= gScore[next]) continue;

        cameFrom[next] = current;
        gScore[next] = tentativeScore;
        fScore[next] = tentativeScore + heuristic(next) / NAVIGATION_GRID_SIZE;
        if (!openState[next]) {
          openState[next] = 1;
          openNodes.push(next);
        }
      }
    }

    if (!reachedTarget) return [];

    const gridPath: Phaser.Math.Vector2[] = [];
    let current = bestNode;
    while (current >= 0) {
      gridPath.unshift(nodePoint(current));
      if (current === startNode) break;
      current = cameFrom[current];
    }
    if (current !== startNode) return [];

    const rawPath = [start, ...gridPath];
    if (reachedTarget && this.isSegmentNavigable(gridPath.at(-1)!, target)) {
      rawPath.push(target);
    }
    return this.smoothNavigationPath(rawPath).slice(1);
  }

  private smoothNavigationPath(points: Phaser.Math.Vector2[]): Phaser.Math.Vector2[] {
    if (points.length <= 2) return points;

    const smoothed = [points[0]];
    let anchor = 0;
    while (anchor < points.length - 1) {
      let next = points.length - 1;
      while (next > anchor + 1 && !this.isSegmentNavigable(points[anchor], points[next])) {
        next -= 1;
      }
      smoothed.push(points[next]);
      anchor = next;
    }
    return smoothed;
  }

  private isSegmentNavigable(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
  ): boolean {
    const distance = start.distance(end);
    const steps = Math.max(1, Math.ceil(distance / (NAVIGATION_GRID_SIZE / 3)));
    for (let step = 0; step <= steps; step += 1) {
      const x = Phaser.Math.Linear(start.x, end.x, step / steps);
      const y = Phaser.Math.Linear(start.y, end.y, step / steps);
      if (!this.isNavigationWalkable(x, y)) return false;
    }
    return true;
  }

  private isNavigationWalkable(x: number, y: number): boolean {
    if (!this.isWalkable(x, y)) return false;
    if (
      this.navigationBlockers.some(
        (blocker) =>
          x >= blocker.left - NAVIGATION_BLOCKER_MARGIN &&
          x <= blocker.right + NAVIGATION_BLOCKER_MARGIN &&
          y >= blocker.top - NAVIGATION_BLOCKER_MARGIN &&
          y <= blocker.bottom + NAVIGATION_BLOCKER_MARGIN,
      )
    ) {
      return false;
    }

    if (this.bus) {
      const bounds = this.bus.getBounds();
      if (
        x >= bounds.left - BUS_NAVIGATION_MARGIN &&
        x <= bounds.right + BUS_NAVIGATION_MARGIN &&
        y >= bounds.top - BUS_NAVIGATION_MARGIN &&
        y <= bounds.bottom + BUS_NAVIGATION_MARGIN
      ) {
        return false;
      }
    }
    return true;
  }

  private updateCompanionMovement(): void {
    if (!this.hero || !this.companion) {
      return;
    }

    const companionFeet = new Phaser.Math.Vector2(
      this.companion.x,
      this.companion.y + CHARACTER_FEET_OFFSET,
    );
    const heroFeet = new Phaser.Math.Vector2(
      this.hero.x,
      this.hero.y + CHARACTER_FEET_OFFSET,
    );
    this.recordHeroTrail(heroFeet);

    if (
      companionFeet.distance(heroFeet) <= COMPANION_FOLLOW_DISTANCE &&
      this.isSegmentNavigable(companionFeet, heroFeet)
    ) {
      this.heroTrail = [heroFeet.clone()];
      this.companionNavigationPath = [];
      this.companion.setVelocity(0, 0);
      return;
    }

    while (
      this.heroTrail.length > 1 &&
      companionFeet.distance(this.heroTrail[0]) <=
        COMPANION_TRAIL_POINT_REACHED
    ) {
      this.heroTrail.shift();
    }

    const trailTarget = this.heroTrail[0] ?? heroFeet;
    const targetMoved =
      this.companionPathTarget.distance(trailTarget) >
      WAYPOINT_REACHED_DISTANCE;

    if (this.time.now >= this.nextCompanionPathRefresh || targetMoved) {
      this.companionNavigationPath = this.findNavigationPath(
        companionFeet,
        trailTarget,
      );
      this.companionPathTarget.copy(trailTarget);
      this.nextCompanionPathRefresh = this.time.now + COMPANION_PATH_REFRESH_MS;
    }

    while (
      this.companionNavigationPath.length > 0 &&
      companionFeet.distance(this.companionNavigationPath[0]) <=
        WAYPOINT_REACHED_DISTANCE
    ) {
      this.companionNavigationPath.shift();
    }

    const waypoint = this.companionNavigationPath[0];
    if (!waypoint) {
      this.companion.setVelocity(0, 0);
      return;
    }

    this.physics.moveTo(
      this.companion,
      waypoint.x,
      waypoint.y - CHARACTER_FEET_OFFSET,
      COMPANION_MOVE_SPEED,
    );
    const body = this.companion.body as Phaser.Physics.Arcade.Body;
    this.updateFacing(this.companion, body.velocity);
  }

  private recordHeroTrail(heroFeet: Phaser.Math.Vector2): void {
    if (!this.isNavigationWalkable(heroFeet.x, heroFeet.y)) {
      return;
    }

    const lastPoint = this.heroTrail.at(-1);
    if (!lastPoint || lastPoint.distance(heroFeet) >= COMPANION_TRAIL_SPACING) {
      this.heroTrail.push(heroFeet.clone());
    }
  }

  private async startBusSequence(): Promise<void> {
    if (
      this.busSequenceStarted ||
      !this.hero ||
      !this.companion ||
      !this.bus
    ) {
      return;
    }

    this.busSequenceStarted = true;
    this.busSequenceActive = true;
    this.clearNavigationPath();
    this.nearbyInteraction = undefined;
    this.interactionPrompt?.setVisible(false);
    this.objectiveText?.setText('Le groupe rejoint le petit bus blanc...');
    for (const point of this.interactionPoints) {
      point.marker?.setVisible(false);
    }

    const studentGatheringPoints = [
      new Phaser.Math.Vector2(585, 445),
      new Phaser.Math.Vector2(610, 462),
      new Phaser.Math.Vector2(635, 475),
      new Phaser.Math.Vector2(660, 482),
      new Phaser.Math.Vector2(690, 480),
      new Phaser.Math.Vector2(718, 462),
    ];

    await Promise.all([
      ...this.students.map((student, index) =>
        this.moveActorTo(student, studentGatheringPoints[index], 112),
      ),
      this.moveActorTo(
        this.companion,
        new Phaser.Math.Vector2(742, 442),
        COMPANION_MOVE_SPEED,
      ),
      this.moveActorTo(
        this.hero,
        new Phaser.Math.Vector2(645, 420),
        HERO_MOVE_SPEED,
      ),
    ]);

    this.objectiveText?.setText('Tout le groupe est prêt près du bus');
    this.startDialogue(
      [{ speaker: 'hero', text: 'Voilà notre bus.' }],
      () => void this.openBusAndInviteGroup(),
    );
  }

  private async openBusAndInviteGroup(): Promise<void> {
    if (!this.bus) {
      return;
    }

    this.objectiveText?.setText('Alex déverrouille le petit bus blanc...');
    await this.transitionBusTexture('minibus-open', 560);
    this.startDialogue(
      [
        {
          speaker: 'hero',
          text: 'Vous pouvez vous installer. On y va !',
        },
      ],
      () => void this.boardGroupAndDepart(),
    );
  }

  private async boardGroupAndDepart(): Promise<void> {
    if (!this.hero || !this.companion || !this.bus) {
      return;
    }

    const busBody = this.bus.body as Phaser.Physics.Arcade.StaticBody;
    busBody.enable = false;
    this.objectiveText?.setText('Le groupe monte dans le bus...');

    const boardingOrder: Array<
      Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite
    > = [...this.students, this.companion, this.hero];

    for (let index = 0; index < boardingOrder.length; index += 1) {
      this.objectiveText?.setText(
        `Embarquement dans le bus : ${index + 1}/${boardingOrder.length}`,
      );
      await this.boardActor(boardingOrder[index]);
      await this.waitFor(130);
    }

    await this.transitionBusTexture('minibus-closed', 480);
    this.objectiveText?.setText('Tout le monde est installé. Départ !');
    await this.waitFor(450);
    await this.departBus();
  }

  private async boardActor(
    actor: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite,
  ): Promise<void> {
    await this.moveActorTo(
      actor,
      new Phaser.Math.Vector2(BUS_DOOR_APPROACH_X, BUS_DOOR_APPROACH_Y),
      105,
    );

    this.tweens.killTweensOf(actor);
    const boardingDirection = new Phaser.Math.Vector2(
      BUS_DOOR_X - actor.x,
      BUS_DOOR_Y - actor.y,
    );
    this.startScriptedWalk(actor, boardingDirection);
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: actor,
        x: BUS_DOOR_X,
        y: BUS_DOOR_Y,
        alpha: 0,
        duration: 420,
        ease: 'Sine.in',
        onUpdate: () => actor.setDepth(1600 + actor.y),
        onComplete: () => {
          this.stopScriptedWalk(actor, false);
          actor.setVisible(false);
          resolve();
        },
      });
    });
  }

  private async departBus(): Promise<void> {
    if (!this.bus) {
      return;
    }

    this.cameras.main.stopFollow();
    this.cameras.main.startFollow(this.bus, true, 0.08, 0.08);
    this.bus.setDepth(2600);

    await Promise.all([
      this.transitionBusTexture('minibus-rear', 320),
      this.tweenBusTo(665, 270, 0.19, 850, 'Sine.inOut'),
    ]);
    await this.tweenBusTo(650, 215, 0.175, 750, 'Linear');
    await Promise.all([
      this.transitionBusTexture('minibus-rear-left', 320),
      this.tweenBusTo(585, 160, 0.15, 1050, 'Sine.inOut'),
    ]);
    await this.tweenBusTo(505, 115, 0.125, 1100, 'Sine.in');
    this.cameras.main.fadeOut(650, 6, 10, 18);
    await this.waitFor(650);

    finishWithTransition(
      this,
      'first_meeting',
      ['unil_sport_group', 'white_vw_bus'],
      'En route vers le stand de Vernand',
    );
  }

  private moveActorTo(
    actor: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite,
    targetFeet: Phaser.Math.Vector2,
    speed: number,
  ): Promise<void> {
    const startFeet = new Phaser.Math.Vector2(
      actor.x,
      actor.y + CHARACTER_FEET_OFFSET,
    );
    const path = this.findNavigationPath(startFeet, targetFeet);
    return this.moveActorAlongPath(
      actor,
      path.length > 0 ? path : [targetFeet],
      speed,
    );
  }

  private moveActorAlongPath(
    actor: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite,
    path: Phaser.Math.Vector2[],
    speed: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      let waypointIndex = 0;

      const moveNext = (): void => {
        const waypoint = path[waypointIndex];
        if (!waypoint) {
          this.stopScriptedWalk(actor);
          resolve();
          return;
        }

        const targetX = waypoint.x;
        const targetY = waypoint.y - CHARACTER_FEET_OFFSET;
        const direction = new Phaser.Math.Vector2(
          targetX - actor.x,
          targetY - actor.y,
        );
        const distance = direction.length();
        this.startScriptedWalk(actor, direction);

        this.tweens.add({
          targets: actor,
          x: targetX,
          y: targetY,
          duration: Math.max(80, (distance / speed) * 1000),
          ease: 'Linear',
          onUpdate: () => actor.setDepth(1000 + actor.y),
          onComplete: () => {
            waypointIndex += 1;
            moveNext();
          },
        });
      };

      moveNext();
    });
  }

  private startScriptedWalk(
    actor: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite,
    direction: Phaser.Math.Vector2,
  ): void {
    if (actor === this.hero || actor === this.companion) {
      const sprite = actor as Phaser.Physics.Arcade.Sprite;
      this.scriptedWalkingActors.add(sprite);
      this.updateFacing(sprite, direction);
      return;
    }

    const student = actor as Phaser.GameObjects.Image;
    this.studentFacings.set(student, this.facingFromDirection(direction));
    this.walkingStudents.add(student);
    this.studentIdleTweens.get(student)?.pause();
    student.setScale(CHARACTER_SCALE).setAngle(0);
    this.updateStudentTexture(student);
  }

  private stopScriptedWalk(
    actor: Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite,
    resumeIdle = true,
  ): void {
    if (actor === this.hero || actor === this.companion) {
      this.scriptedWalkingActors.delete(actor as Phaser.Physics.Arcade.Sprite);
      return;
    }

    const student = actor as Phaser.GameObjects.Image;
    this.walkingStudents.delete(student);
    student.setAngle(0).setScale(CHARACTER_SCALE);
    this.updateStudentTexture(student, false);
    if (resumeIdle) {
      this.studentIdleTweens.get(student)?.restart();
    }
  }

  private updateStudentAnimations(): void {
    for (const student of this.walkingStudents) {
      this.updateStudentTexture(student);
    }
  }

  private updateStudentTexture(
    student: Phaser.GameObjects.Image,
    walking = true,
  ): void {
    const baseTexture = this.studentBaseTextures.get(student);
    const facing = this.studentFacings.get(student) ?? 'front';
    if (!baseTexture) {
      return;
    }

    const studentIndex = Math.max(0, this.students.indexOf(student));
    const useWalkingPose =
      walking &&
      Math.floor((this.time.now + studentIndex * 65) / WALK_STEP_DURATION) % 2 === 0;
    let texture = baseTexture;

    if (facing === 'back') {
      texture = `${baseTexture}-${useWalkingPose ? 'walk-back' : 'idle-back'}`;
    } else if (facing === 'left' || facing === 'right') {
      texture = `${baseTexture}-${useWalkingPose ? 'walk-right' : 'idle-right'}`;
    } else if (useWalkingPose) {
      texture = `${baseTexture}-walk-front`;
    }

    if (student.texture.key !== texture) {
      student.setTexture(texture);
    }
    student.setFlipX(facing === 'left');
  }

  private facingFromDirection(direction: Phaser.Math.Vector2): FacingDirection {
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      return direction.x < 0 ? 'left' : 'right';
    }
    return direction.y < 0 ? 'back' : 'front';
  }

  private tweenBusTo(
    x: number,
    y: number,
    scale: number,
    duration: number,
    ease: string,
  ): Promise<void> {
    if (!this.bus) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.bus,
        x,
        y,
        scaleX: scale,
        scaleY: scale,
        duration,
        ease,
        onComplete: () => resolve(),
      });
    });
  }

  private transitionBusTexture(texture: string, duration: number): Promise<void> {
    if (!this.bus || this.bus.texture.key === texture) {
      return Promise.resolve();
    }

    const bus = this.bus;
    const overlay = this.add
      .image(bus.x, bus.y, texture)
      .setOrigin(bus.originX, bus.originY)
      .setScale(bus.scaleX, bus.scaleY)
      .setFlipX(bus.flipX)
      .setFlipY(bus.flipY)
      .setRotation(bus.rotation)
      .setDepth(bus.depth + 1)
      .setAlpha(0);

    return new Promise((resolve) => {
      this.tweens.add({
        targets: overlay,
        alpha: 1,
        duration,
        ease: 'Sine.inOut',
        onUpdate: () => {
          overlay
            .setPosition(bus.x, bus.y)
            .setScale(bus.scaleX, bus.scaleY)
            .setRotation(bus.rotation)
            .setDepth(bus.depth + 1);
        },
        onComplete: () => {
          bus.setTexture(texture);
          overlay.destroy();
          resolve();
        },
      });
    });
  }

  private waitFor(duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(duration, () => resolve());
    });
  }

  private updateFacing(
    sprite: Phaser.Physics.Arcade.Sprite,
    velocity: Phaser.Math.Vector2,
  ): void {
    let facing: FacingDirection | undefined;

    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      if (velocity.x < -8) {
        facing = 'left';
      } else if (velocity.x > 8) {
        facing = 'right';
      }
    } else if (velocity.y < -8) {
      facing = 'back';
    } else if (velocity.y > 8) {
      facing = 'front';
    }

    if (!facing) {
      return;
    }

    if (sprite === this.hero) {
      this.heroFacing = facing;
    } else {
      this.companionFacing = facing;
    }
  }

  private updateCharacterAnimations(): void {
    if (!this.hero || !this.companion) {
      return;
    }

    this.updateCharacterAnimation(
      this.hero,
      'hero',
      this.heroFacing,
      0,
    );
    this.updateCharacterAnimation(
      this.companion,
      'companion',
      this.companionFacing,
      85,
    );
  }

  private updateCharacterAnimation(
    sprite: Phaser.Physics.Arcade.Sprite,
    character: 'hero' | 'companion',
    facing: FacingDirection,
    phaseOffset: number,
  ): void {
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const moving =
      this.scriptedWalkingActors.has(sprite) ||
      body.deltaAbsX() + body.deltaAbsY() > 0.05;
    const elapsed = this.time.now + phaseOffset;
    const idleTexture =
      facing === 'front'
        ? `${character}-front`
        : facing === 'back'
          ? `${character}-back`
          : `${character}-side`;

    if (!moving) {
      const breath = Math.sin(elapsed / 620);
      if (sprite.texture.key !== idleTexture) {
        sprite.setTexture(idleTexture);
      }
      sprite.setFlipX(facing === 'left');
      sprite.setAngle(0);
      sprite.setScale(
        CHARACTER_SCALE * (1 - breath * 0.0035),
        CHARACTER_SCALE * (1 + breath * 0.009),
      );
      return;
    }

    const step = Math.floor(elapsed / WALK_STEP_DURATION);
    const useWalkingPose = step % 2 === 0;
    const walkTexture = `${character}-walk-${facing}`;
    const texture = useWalkingPose ? walkTexture : idleTexture;
    const stridePhase = (elapsed / (WALK_STEP_DURATION * 2)) * Math.PI * 2;
    const stride = Math.sin(stridePhase);
    const lift = Math.abs(stride);
    const breath = Math.sin(elapsed / 430);

    if (sprite.texture.key !== texture) {
      sprite.setTexture(texture);
    }

    if (facing === 'left' || facing === 'right') {
      sprite.setFlipX(!useWalkingPose && facing === 'left');
    } else {
      sprite.setFlipX(Math.floor(step / 2) % 2 === 1);
    }

    sprite.setAngle(stride * (facing === 'left' || facing === 'right' ? 0.45 : 0.7));
    sprite.setScale(
      CHARACTER_SCALE * (1 - lift * 0.004),
      CHARACTER_SCALE * (1 + lift * 0.012 + breath * 0.003),
    );
  }

  private restoreToWalkableArea(
    sprite: Phaser.Physics.Arcade.Sprite,
    lastValidPosition: Phaser.Math.Vector2,
  ): void {
    const feetX = sprite.x;
    const feetY = sprite.y + CHARACTER_FEET_OFFSET;

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

    if (this.busSequenceActive) {
      this.nearbyInteraction = undefined;
      this.interactionPrompt?.setVisible(false);
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
    this.clearNavigationPath();
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
