import Phaser from 'phaser';
import type { StoryLine } from '../content/chapter';
import { finishWithTransition } from '../game/progress';
import { DialogueOverlay } from '../ui/DialogueOverlay';
import { HighResolutionScene } from './HighResolutionScene';

type MovementKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

type FacingDirection = 'front' | 'back' | 'left' | 'right';

type Follower = {
  sprite: Phaser.Physics.Arcade.Sprite;
  texturePrefix: string;
  facing: FacingDirection;
  spacing: number;
  path: Phaser.Math.Vector2[];
  pathTarget: Phaser.Math.Vector2;
  nextPathRefresh: number;
  active: boolean;
};

type InteractionPoint = {
  id: 'case' | 'restaurant' | 'entrance';
  x: number;
  y: number;
  radius: number;
  label: string;
  marker: Phaser.GameObjects.Container;
  requiresCase?: boolean;
};

const WORLD_WIDTH = 1672;
const WORLD_HEIGHT = 941;
const VIEWPORT_WIDTH = 960;
const VIEWPORT_HEIGHT = 540;
const BACKGROUND_FIT_SCALE = Math.min(
  VIEWPORT_WIDTH / WORLD_WIDTH,
  VIEWPORT_HEIGHT / WORLD_HEIGHT,
);
const WORLD_OBJECT_SCALE = 1 / BACKGROUND_FIT_SCALE;
const CHARACTER_SCALE = WORLD_OBJECT_SCALE;
const CHARACTER_FEET_OFFSET = 29 * WORLD_OBJECT_SCALE;
const CHARACTER_BODY_WIDTH = 17;
const CHARACTER_BODY_HEIGHT = 9;
const CHARACTER_BODY_OFFSET_X = 14;
const CHARACTER_BODY_OFFSET_Y = 50;
const HERO_MOVE_SPEED = 126 * WORLD_OBJECT_SCALE;
const FOLLOWER_MOVE_SPEED = 120 * WORLD_OBJECT_SCALE;
const WALK_STEP_DURATION = 210;
const NAVIGATION_GRID_SIZE = 20;
const NAVIGATION_BLOCKER_MARGIN = 17;
const WAYPOINT_REACHED_DISTANCE = 7 * WORLD_OBJECT_SCALE;
const FOLLOWER_PATH_REFRESH_MS = 280;
const HERO_TRAIL_SPACING = 12 * WORLD_OBJECT_SCALE;
const BUS_X = 525;
const BUS_Y = 624;
const BUS_SCALE = 0.2 * WORLD_OBJECT_SCALE;
const BUS_DOOR_X = 545;
const BUS_DOOR_Y = 624;
const BUS_EXIT_FEET_X = 685;
const BUS_EXIT_FEET_Y = 674;
const CASE_REST_X = 620;
const CASE_REST_Y = 560;
const ENTRANCE_X = 1135;
const ENTRANCE_Y = 525;
const DOOR_X = 1145;
const DOOR_Y = 490;

export class VernandArrivalScene extends HighResolutionScene {
  private hero?: Phaser.Physics.Arcade.Sprite;
  private companion?: Phaser.Physics.Arcade.Sprite;
  private followers: Follower[] = [];
  private students: Phaser.Physics.Arcade.Sprite[] = [];
  private bus?: Phaser.GameObjects.Image;
  private toolCase?: Phaser.GameObjects.Image;
  private dialogue?: DialogueOverlay;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: MovementKeys;
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private debugKey?: Phaser.Input.Keyboard.Key;
  private objectiveText?: Phaser.GameObjects.Text;
  private interactionPrompt?: Phaser.GameObjects.Text;
  private navigationTargetMarker?: Phaser.GameObjects.Arc;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private blockers?: Phaser.Physics.Arcade.StaticGroup;
  private walkableZones: Phaser.Geom.Polygon[] = [];
  private navigationBlockers: Phaser.Geom.Rectangle[] = [];
  private navigationBlockerPolygons: Phaser.Geom.Polygon[] = [];
  private navigationPath: Phaser.Math.Vector2[] = [];
  private interactions: InteractionPoint[] = [];
  private nearbyInteraction?: InteractionPoint;
  private heroFacing: FacingDirection = 'front';
  private lastHeroPosition = new Phaser.Math.Vector2();
  private heroTrail: Phaser.Math.Vector2[] = [];
  private controlsEnabled = false;
  private scriptedActors = new Set<Phaser.Physics.Arcade.Sprite>();
  private caseCollected = false;
  private caseFollowOffset = new Phaser.Math.Vector2(
    -24 * WORLD_OBJECT_SCALE,
    20 * WORLD_OBJECT_SCALE,
  );
  private entranceSequenceActive = false;
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super('VernandArrivalScene');
  }

  create(): void {
    this.add.image(0, 0, 'vernand-exterior').setOrigin(0).setDepth(0);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main
      .setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .setZoom(BACKGROUND_FIT_SCALE)
      .setRoundPixels(true);

    this.createNavigation();
    this.createBusAndCase();
    this.createCharacters();
    this.createInteractions();
    this.createCentralTreeOverlay();
    const worldObjects = [...this.children.list];
    this.createHud();
    this.createInput();
    this.createUiCamera(worldObjects);

    this.cameras.main.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.cameras.main.fadeIn(350, 8, 12, 18);
    this.uiCamera?.fadeIn(350, 8, 12, 18);
    void this.playArrivalSequence();
  }

  update(): void {
    if (!this.hero || !this.dialogue) return;

    if (this.controlsEnabled && !this.scriptedActors.has(this.hero)) {
      this.restoreToWalkableArea(this.hero, this.lastHeroPosition);
    }

    if (!this.controlsEnabled || this.dialogue.isOpen || this.entranceSequenceActive) {
      this.hero.setVelocity(0, 0);
      this.stopFollowers();
    } else {
      this.updateHeroMovement();
      this.updateFollowers();
    }

    this.updateCharacterAnimations();
    this.updateToolCase();
    this.hero.setDepth(1100 + this.hero.y);
    for (const follower of this.followers) {
      follower.sprite.setDepth(1100 + follower.sprite.y);
    }
    this.updateNearbyInteraction();
  }

  private createNavigation(): void {
    this.walkableZones = [
      this.polygon([
        0, 390, 210, 405, 405, 360, 730, 270, 845, 315, 790, 420,
        920, 500, 1460, 690, 1390, 941, 0, 941,
      ]),
      this.polygon([780, 405, 940, 405, 1265, 445, 1290, 535, 945, 575, 805, 515]),
      this.polygon([105, 305, 610, 245, 740, 280, 405, 395, 145, 445]),
    ];

    this.blockers = this.physics.add.staticGroup();
    this.addBlocker(0, 655, 165, 230);
    this.addBlocker(195, 695, 250, 246);
    this.addBlocker(1300, 565, 372, 376);
    this.addBlocker(0, 0, 780, 285);
    this.addBlocker(790, 0, 882, 405);
    this.navigationBlockerPolygons.push(
      this.polygon([
        545, 554,
        580, 580,
        592, 650,
        570, 685,
        470, 699,
        416, 665,
        423, 635,
        454, 596,
      ]),
    );

    this.debugGraphics = this.add.graphics().setDepth(5000).setVisible(false);
    this.debugGraphics.fillStyle(0x49b6a9, 0.13).lineStyle(2, 0x49b6a9, 0.92);
    for (const zone of this.walkableZones) {
      this.debugGraphics.fillPoints(zone.points, true);
      this.debugGraphics.strokePoints(zone.points, true);
    }
    this.debugGraphics.fillStyle(0xf2c14e, 0.12).lineStyle(2, 0xf2c14e, 0.9);
    for (const blocker of this.navigationBlockers) {
      this.debugGraphics.fillRect(blocker.x, blocker.y, blocker.width, blocker.height);
      this.debugGraphics.strokeRect(blocker.x, blocker.y, blocker.width, blocker.height);
    }
    for (const blocker of this.navigationBlockerPolygons) {
      this.debugGraphics.fillPoints(blocker.points, true);
      this.debugGraphics.strokePoints(blocker.points, true);
    }

    this.navigationTargetMarker = this.add
      .circle(0, 0, 11, 0x4ea4ef, 0.16)
      .setStrokeStyle(2, 0x9fd1ff, 0.95)
      .setScale(WORLD_OBJECT_SCALE)
      .setDepth(4900)
      .setVisible(false);
  }

  private createBusAndCase(): void {
    this.bus = this.add
      .image(1080, BUS_Y, 'minibus-closed')
      .setScale(BUS_SCALE)
      .setDepth(900);
    this.toolCase = this.add
      .image(CASE_REST_X, CASE_REST_Y, 'case-closed')
      .setScale(0.1 * WORLD_OBJECT_SCALE)
      .setDepth(1000 + CASE_REST_Y)
      .setVisible(false);
  }

  private createCentralTreeOverlay(): void {
    this.add
      .image(785, 613, 'vernand-central-tree-overlay')
      .setScale(0.36)
      .setDepth(2800);
  }

  private createCharacters(): void {
    this.hero = this.physics.add.sprite(BUS_DOOR_X, BUS_DOOR_Y, 'unil-hero-front');
    this.configureCharacter(this.hero).setVisible(false);

    this.companion = this.physics.add.sprite(
      BUS_DOOR_X,
      BUS_DOOR_Y,
      'unil-companion-front',
    );
    this.configureCharacter(this.companion).setVisible(false);

    const studentSuffixes = ['01', '02', '03', '04', '06', '08'];
    this.students = studentSuffixes.map((suffix) => {
      const student = this.physics.add.sprite(
        BUS_DOOR_X,
        BUS_DOOR_Y,
        `unil-npc-${suffix}`,
      );
      this.configureCharacter(student).setVisible(false);
      return student;
    });

    this.followers = [
      this.createFollower(this.companion, 'unil-companion', 62, false),
      ...this.students.map((student, index) =>
        this.createFollower(
          student,
          `unil-npc-${studentSuffixes[index]}`,
          90 + index * 22,
          false,
        ),
      ),
    ];

    if (this.blockers) {
      this.physics.add.collider(this.hero, this.blockers);
      for (const follower of this.followers) {
        this.physics.add.collider(follower.sprite, this.blockers);
      }
    }
  }

  private configureCharacter(
    sprite: Phaser.Physics.Arcade.Sprite,
  ): Phaser.Physics.Arcade.Sprite {
    sprite.setScale(CHARACTER_SCALE).setCollideWorldBounds(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(CHARACTER_BODY_WIDTH, CHARACTER_BODY_HEIGHT);
    body.setOffset(CHARACTER_BODY_OFFSET_X, CHARACTER_BODY_OFFSET_Y);
    return sprite;
  }

  private createFollower(
    sprite: Phaser.Physics.Arcade.Sprite,
    texturePrefix: string,
    spacing: number,
    active: boolean,
  ): Follower {
    return {
      sprite,
      texturePrefix,
      facing: 'front',
      spacing: spacing * WORLD_OBJECT_SCALE,
      path: [],
      pathTarget: new Phaser.Math.Vector2(),
      nextPathRefresh: 0,
      active,
    };
  }

  private createInteractions(): void {
    this.interactions = [
      this.createInteraction('case', CASE_REST_X, CASE_REST_Y, 78, 'la caisse noire'),
      this.createInteraction('restaurant', 360, 405, 92, 'le restaurant'),
      this.createInteraction(
        'entrance',
        ENTRANCE_X,
        ENTRANCE_Y,
        92,
        "l'entrée du stand",
        true,
      ),
    ];
  }

  private createInteraction(
    id: InteractionPoint['id'],
    x: number,
    y: number,
    radius: number,
    label: string,
    requiresCase = false,
  ): InteractionPoint {
    const glow = this.add.circle(0, 0, 16, 0xf2c14e, 0.15);
    const ring = this.add
      .circle(0, 0, 10, 0xf2c14e, 0.2)
      .setStrokeStyle(2, 0xffe59b, 0.9);
    const dot = this.add.circle(0, 0, 3, 0xfff5cc);
    const marker = this.add.container(x, y, [glow, ring, dot]).setDepth(4700);
    marker.setScale(WORLD_OBJECT_SCALE);
    this.tweens.add({
      targets: marker,
      y: y - 5 * WORLD_OBJECT_SCALE,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.inOut',
    });
    return {
      id,
      x,
      y,
      radius: radius * WORLD_OBJECT_SCALE,
      label,
      marker,
      requiresCase,
    };
  }

  private createHud(): void {
    const { width, height } = this.scale;
    this.add
      .text(24, 20, 'Stand de Vernand · Parking', {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.76)',
        padding: { x: 12, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(8000);
    this.objectiveText = this.add
      .text(24, 66, 'Objectif : attendre la descente du groupe', {
        color: '#f8dc82',
        fontSize: '15px',
        backgroundColor: 'rgba(17,17,22,0.72)',
        padding: { x: 12, y: 7 },
      })
      .setScrollFactor(0)
      .setDepth(8000);
    this.interactionPrompt = this.add
      .text(width / 2, height - 28, '', {
        color: '#f4efe7',
        fontSize: '16px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.86)',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(8100)
      .setVisible(false);
    this.dialogue = new DialogueOverlay(this);
  }

  private createUiCamera(worldObjects: Phaser.GameObjects.GameObject[]): void {
    const { width, height } = this.scale;
    const worldObjectSet = new Set(worldObjects);
    const uiObjects = this.children.list.filter((object) => !worldObjectSet.has(object));

    this.uiCamera = this.cameras
      .add(0, 0, width, height)
      .setName('vernand-ui')
      .setRoundPixels(true);
    this.uiCamera.ignore(worldObjects);
    this.cameras.main.ignore(uiObjects);
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

    this.interactionKey?.on('down', () => {
      if (this.controlsEnabled && !this.dialogue?.isOpen && this.nearbyInteraction) {
        this.activateInteraction(this.nearbyInteraction);
      }
    });
    this.debugKey?.on('down', () => {
      this.debugGraphics?.setVisible(!this.debugGraphics.visible);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (
        pointer.button !== 0 ||
        !this.controlsEnabled ||
        this.dialogue?.isOpen ||
        this.entranceSequenceActive ||
        !this.hero
      ) {
        return;
      }

      const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if (!this.isNavigationWalkable(target.x, target.y)) return;
      const start = this.characterFeet(this.hero);
      const path = this.findNavigationPath(start, target);
      if (path.length === 0) return;
      this.navigationPath = path;
      const finalWaypoint = path.at(-1)!;
      this.navigationTargetMarker
        ?.setPosition(finalWaypoint.x, finalWaypoint.y)
        .setVisible(true);
    });
  }

  private async playArrivalSequence(): Promise<void> {
    if (!this.bus || !this.hero || !this.companion || !this.toolCase || !this.dialogue) {
      return;
    }

    this.objectiveText?.setText('Le petit bus blanc arrive au stand...');
    await this.tweenPromise({
      targets: this.bus,
      x: BUS_X,
      duration: 1900,
      ease: 'Sine.out',
    });
    await this.transitionBusTexture('minibus-open', 420);
    this.objectiveText?.setText('Les élèves descendent du bus...');

    const exitOrder = [
      this.students[0],
      this.students[1],
      this.companion,
      this.students[2],
      this.students[3],
      this.students[4],
      this.students[5],
      this.hero,
    ];
    const gatheringPoints = [
      new Phaser.Math.Vector2(650, 440),
      new Phaser.Math.Vector2(610, 445),
      new Phaser.Math.Vector2(570, 450),
      new Phaser.Math.Vector2(530, 455),
      new Phaser.Math.Vector2(650, 490),
      new Phaser.Math.Vector2(610, 495),
      new Phaser.Math.Vector2(570, 500),
      new Phaser.Math.Vector2(610, 585),
    ];
    let markLastStudentArrived: () => void = () => undefined;
    const lastStudentArrived = new Promise<void>((resolve) => {
      markLastStudentArrived = resolve;
    });

    await Promise.all(
      exitOrder.map(async (actor, index) => {
        if (actor === this.hero) {
          await lastStudentArrived;
          await this.waitFor(480);
        } else {
          await this.waitFor(index * 360);
        }
        actor.setPosition(BUS_DOOR_X, BUS_DOOR_Y).setAlpha(0).setVisible(true);
        await this.tweenPromise({ targets: actor, alpha: 1, duration: 120 });
        await this.moveActorAlongPath(
          actor,
          [new Phaser.Math.Vector2(BUS_EXIT_FEET_X, BUS_EXIT_FEET_Y)],
          145 * WORLD_OBJECT_SCALE,
        );
        await this.moveActorAlongPath(
          actor,
          [gatheringPoints[index]],
          145 * WORLD_OBJECT_SCALE,
        );
        this.setActorFacing(
          actor,
          new Phaser.Math.Vector2(BUS_X - actor.x, BUS_Y - actor.y),
        );
        if (actor === this.students.at(-1)) markLastStudentArrived();
      }),
    );

    this.toolCase.setVisible(true);
    await this.transitionBusTexture('minibus-closed', 380);
    this.lastHeroPosition.set(this.hero.x, this.hero.y);
    this.heroTrail = [this.characterFeet(this.hero)];
    this.cameras.main.startFollow(this.hero, true, 0.09, 0.09);

    this.dialogue.show(
      [
        {
          speaker: 'Narration',
          text: 'Après le trajet, le groupe arrive au stand de Vernand.',
        },
      ],
      () => {
        this.controlsEnabled = true;
        this.objectiveText?.setText('Objectif : prendre la caisse noire');
      },
    );
  }

  private updateHeroMovement(): void {
    if (!this.hero || !this.cursors) return;
    const velocity = new Phaser.Math.Vector2();
    if (this.cursors.left.isDown || this.wasdKeys?.left.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown || this.wasdKeys?.right.isDown) velocity.x += 1;
    if (this.cursors.up.isDown || this.wasdKeys?.up.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown || this.wasdKeys?.down.isDown) velocity.y += 1;

    if (velocity.lengthSq() === 0) {
      this.updatePointAndClickMovement();
      this.recordHeroTrail();
      return;
    }

    this.clearNavigationPath();
    velocity.normalize().scale(HERO_MOVE_SPEED);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.heroFacing = this.facingFromDirection(velocity, this.heroFacing);
    this.recordHeroTrail();
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
    const offset = targetPosition.clone().subtract(new Phaser.Math.Vector2(this.hero.x, this.hero.y));
    if (offset.length() <= WAYPOINT_REACHED_DISTANCE) {
      this.hero.setPosition(targetPosition.x, targetPosition.y);
      this.navigationPath.shift();
      if (this.navigationPath.length === 0) {
        this.hero.setVelocity(0, 0);
        this.navigationTargetMarker?.setVisible(false);
      }
      return;
    }

    const velocity = offset.normalize().scale(HERO_MOVE_SPEED);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.heroFacing = this.facingFromDirection(velocity, this.heroFacing);
  }

  private updateFollowers(): void {
    if (!this.hero) return;
    const heroFeet = this.characterFeet(this.hero);

    for (let index = 0; index < this.followers.length; index += 1) {
      const follower = this.followers[index];
      if (!follower.active || !follower.sprite.visible) {
        follower.sprite.setVelocity(0, 0);
        continue;
      }

      const followerFeet = this.characterFeet(follower.sprite);
      const trailOffset = Math.max(1, Math.round(follower.spacing / HERO_TRAIL_SPACING));
      const trailIndex = Math.max(0, this.heroTrail.length - 1 - trailOffset);
      const trailTarget = this.heroTrail[trailIndex] ?? heroFeet;
      const closeEnough = followerFeet.distance(heroFeet) <= follower.spacing;

      if (closeEnough && this.isSegmentNavigable(followerFeet, heroFeet)) {
        follower.path = [];
        follower.sprite.setVelocity(0, 0);
        continue;
      }

      if (
        this.time.now >= follower.nextPathRefresh ||
        follower.pathTarget.distance(trailTarget) > WAYPOINT_REACHED_DISTANCE
      ) {
        follower.path = this.findNavigationPath(followerFeet, trailTarget);
        follower.pathTarget.copy(trailTarget);
        follower.nextPathRefresh =
          this.time.now + FOLLOWER_PATH_REFRESH_MS + index * 18;
      }

      while (
        follower.path.length > 0 &&
        followerFeet.distance(follower.path[0]) <= WAYPOINT_REACHED_DISTANCE
      ) {
        follower.path.shift();
      }

      const waypoint = follower.path[0];
      if (!waypoint) {
        follower.sprite.setVelocity(0, 0);
        continue;
      }

      this.physics.moveTo(
        follower.sprite,
        waypoint.x,
        waypoint.y - CHARACTER_FEET_OFFSET,
        FOLLOWER_MOVE_SPEED,
      );
      const body = follower.sprite.body as Phaser.Physics.Arcade.Body;
      follower.facing = this.facingFromDirection(body.velocity, follower.facing);
    }
  }

  private stopFollowers(): void {
    for (const follower of this.followers) follower.sprite.setVelocity(0, 0);
  }

  private recordHeroTrail(): void {
    if (!this.hero) return;
    const feet = this.characterFeet(this.hero);
    if (!this.isNavigationWalkable(feet.x, feet.y)) return;
    const lastPoint = this.heroTrail.at(-1);
    if (!lastPoint || lastPoint.distance(feet) >= HERO_TRAIL_SPACING) {
      this.heroTrail.push(feet);
      if (this.heroTrail.length > 180) this.heroTrail.shift();
    }
  }

  private updateCharacterAnimations(): void {
    if (!this.hero) return;
    this.updateCharacterAnimation(this.hero, 'unil-hero', this.heroFacing, 0);
    for (let index = 0; index < this.followers.length; index += 1) {
      const follower = this.followers[index];
      this.updateCharacterAnimation(
        follower.sprite,
        follower.texturePrefix,
        follower.facing,
        65 + index * 43,
      );
    }
  }

  private updateCharacterAnimation(
    sprite: Phaser.Physics.Arcade.Sprite,
    texturePrefix: string,
    facing: FacingDirection,
    phaseOffset: number,
  ): void {
    if (!sprite.visible) return;
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const moving =
      this.scriptedActors.has(sprite) || body.deltaAbsX() + body.deltaAbsY() > 0.05;
    const elapsed = this.time.now + phaseOffset;
    const npcTexture = texturePrefix.startsWith('unil-npc-');
    const idleTexture = npcTexture
      ? facing === 'front'
        ? texturePrefix
        : facing === 'back'
          ? `${texturePrefix}-idle-back`
          : `${texturePrefix}-idle-right`
      : facing === 'front'
        ? `${texturePrefix}-front`
        : facing === 'back'
          ? `${texturePrefix}-back`
          : `${texturePrefix}-side`;

    if (!moving) {
      const breath = Math.sin(elapsed / 620);
      if (this.textures.exists(idleTexture) && sprite.texture.key !== idleTexture) {
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
    const walkFacing = facing === 'left' ? 'right' : facing;
    const walkTexture = `${texturePrefix}-walk-${walkFacing}`;
    const texture = step % 2 === 0 && this.textures.exists(walkTexture) ? walkTexture : idleTexture;
    const stride = Math.sin((elapsed / (WALK_STEP_DURATION * 2)) * Math.PI * 2);
    const lift = Math.abs(stride);
    if (this.textures.exists(texture) && sprite.texture.key !== texture) {
      sprite.setTexture(texture);
    }
    if (facing === 'left' || facing === 'right') {
      sprite.setFlipX(facing === 'left');
    } else {
      sprite.setFlipX(false);
    }
    sprite.setAngle(stride * (facing === 'left' || facing === 'right' ? 0.45 : 0.7));
    sprite.setScale(
      CHARACTER_SCALE * (1 - lift * 0.004),
      CHARACTER_SCALE * (1 + lift * 0.012),
    );
  }

  private activateInteraction(interaction: InteractionPoint): void {
    this.clearNavigationPath();
    if (interaction.id === 'case') {
      this.collectToolCase(interaction);
      return;
    }
    if (interaction.id === 'restaurant') {
      this.dialogue?.show([
        {
          speaker: 'Narration',
          text: 'Quelques visiteurs discutent tranquillement sur la terrasse du restaurant.',
        },
      ]);
      return;
    }
    if (interaction.id === 'entrance' && this.caseCollected) {
      this.dialogue?.show(
        [
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: 'Tout le monde est prêt ? On passe aux règles de sécurité.',
          },
        ],
        () => void this.enterStand(),
      );
    }
  }

  private collectToolCase(interaction: InteractionPoint): void {
    if (this.caseCollected) return;
    this.caseCollected = true;
    interaction.marker.setVisible(false);
    for (const follower of this.followers) follower.active = true;
    this.objectiveText?.setText("Objectif : guider le groupe jusqu'à l'entrée du stand");
    this.dialogue?.show([
      {
        speaker: 'Alex',
        portrait: 'hero',
        text: "Je prends la caisse avec le matériel avant d'entrer.",
      },
      {
        speaker: 'Alex',
        portrait: 'hero',
        text: 'Maintenant, on va rentrer au stand. Mettez vos pamirs et on peut y aller.',
      },
    ]);
  }

  private async enterStand(): Promise<void> {
    if (!this.hero || this.entranceSequenceActive) return;
    this.entranceSequenceActive = true;
    this.controlsEnabled = false;
    this.nearbyInteraction = undefined;
    this.interactionPrompt?.setVisible(false);
    this.navigationTargetMarker?.setVisible(false);
    for (const interaction of this.interactions) interaction.marker.setVisible(false);
    this.objectiveText?.setText("Le groupe entre dans le stand...");

    const queuePoints = [
      new Phaser.Math.Vector2(1095, 540),
      new Phaser.Math.Vector2(1055, 560),
      new Phaser.Math.Vector2(1015, 580),
      new Phaser.Math.Vector2(975, 600),
      new Phaser.Math.Vector2(935, 620),
      new Phaser.Math.Vector2(895, 640),
      new Phaser.Math.Vector2(855, 660),
      new Phaser.Math.Vector2(815, 680),
    ];
    const group = [this.hero, ...this.followers.map((follower) => follower.sprite)];
    await Promise.all(
      group.map((actor, index) =>
        this.moveActorTo(actor, queuePoints[index], 118),
      ),
    );

    let enteredCount = 0;
    await Promise.all(
      group.map(async (actor, index) => {
        await this.waitFor(index * 360);
        const pathToDoor = [
          ...queuePoints.slice(0, index).reverse(),
          new Phaser.Math.Vector2(DOOR_X, DOOR_Y),
        ];
        await this.moveActorAlongPath(actor, pathToDoor, 112 * WORLD_OBJECT_SCALE);
        const fadeTargets = index === 0 && this.toolCase
          ? [actor, this.toolCase]
          : actor;
        await this.tweenPromise({
          targets: fadeTargets,
          alpha: 0,
          duration: 260,
          ease: 'Sine.in',
        });
        actor.setVisible(false);
        if (index === 0) this.toolCase?.setVisible(false);
        enteredCount += 1;
        this.objectiveText?.setText(`Entrée dans le stand : ${enteredCount}/${group.length}`);
      }),
    );

    this.toolCase?.setVisible(false);
    await this.waitFor(250);
    this.cameras.main.fadeOut(650, 6, 10, 18);
    this.uiCamera?.fadeOut(650, 6, 10, 18);
    await this.waitFor(650);
    finishWithTransition(
      this,
      'arrival_vernand',
      ['vernand_arrival', 'black_tool_case'],
      "À l'intérieur du stand...",
    );
  }

  private updateToolCase(): void {
    if (!this.toolCase || !this.hero || !this.caseCollected) return;
    const moving = (this.hero.body as Phaser.Physics.Arcade.Body).speed > 2;
    const targetX = this.hero.x + this.caseFollowOffset.x;
    const targetY = this.hero.y + this.caseFollowOffset.y;
    this.toolCase.x = Phaser.Math.Linear(this.toolCase.x, targetX, 0.14);
    this.toolCase.y = Phaser.Math.Linear(this.toolCase.y, targetY, 0.14);
    this.toolCase.setDepth(1080 + this.toolCase.y);
    this.toolCase.setAngle(moving ? Math.sin(this.time.now / 115) * 1.2 : 0);
  }

  private updateNearbyInteraction(): void {
    if (!this.hero || !this.dialogue || !this.controlsEnabled || this.entranceSequenceActive) {
      this.interactionPrompt?.setVisible(false);
      return;
    }

    let closest: InteractionPoint | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const interaction of this.interactions) {
      const completedCase = interaction.id === 'case' && this.caseCollected;
      const available = !completedCase && (!interaction.requiresCase || this.caseCollected);
      const distance = Phaser.Math.Distance.Between(
        this.hero.x,
        this.hero.y,
        interaction.x,
        interaction.y,
      );
      interaction.marker.setAlpha(available ? (distance <= interaction.radius ? 1 : 0.5) : 0.18);
      if (available && distance <= interaction.radius && distance < closestDistance) {
        closest = interaction;
        closestDistance = distance;
      }
    }
    this.nearbyInteraction = closest;
    const prompt = closest
      ? closest.id === 'entrance'
        ? 'E · Entrer dans le stand'
        : `E · Examiner ${closest.label}`
      : '';
    this.interactionPrompt
      ?.setText(prompt)
      .setVisible(Boolean(closest) && !this.dialogue.isOpen);
  }

  private moveActorTo(
    actor: Phaser.Physics.Arcade.Sprite,
    targetFeet: Phaser.Math.Vector2,
    speed: number,
  ): Promise<void> {
    const startFeet = this.characterFeet(actor);
    const path = this.findNavigationPath(startFeet, targetFeet);
    return this.moveActorAlongPath(
      actor,
      path.length > 0 ? path : [targetFeet],
      speed * WORLD_OBJECT_SCALE,
    );
  }

  private moveActorAlongPath(
    actor: Phaser.Physics.Arcade.Sprite,
    path: Phaser.Math.Vector2[],
    speed: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      let waypointIndex = 0;
      const moveNext = (): void => {
        const waypoint = path[waypointIndex];
        if (!waypoint) {
          this.scriptedActors.delete(actor);
          resolve();
          return;
        }
        const targetX = waypoint.x;
        const targetY = waypoint.y - CHARACTER_FEET_OFFSET;
        const direction = new Phaser.Math.Vector2(targetX - actor.x, targetY - actor.y);
        const distance = direction.length();
        this.scriptedActors.add(actor);
        this.setActorFacing(actor, direction);
        this.tweens.add({
          targets: actor,
          x: targetX,
          y: targetY,
          duration: Math.max(80, (distance / speed) * 1000),
          ease: 'Linear',
          onUpdate: () => actor.setDepth(1100 + actor.y),
          onComplete: () => {
            waypointIndex += 1;
            moveNext();
          },
        });
      };
      moveNext();
    });
  }

  private setActorFacing(
    actor: Phaser.Physics.Arcade.Sprite,
    direction: Phaser.Math.Vector2,
  ): void {
    if (actor === this.hero) {
      this.heroFacing = this.facingFromDirection(direction, this.heroFacing);
      return;
    }
    const follower = this.followers.find((entry) => entry.sprite === actor);
    if (follower) follower.facing = this.facingFromDirection(direction, follower.facing);
  }

  private transitionBusTexture(texture: string, duration: number): Promise<void> {
    if (!this.bus) return Promise.resolve();
    const bus = this.bus;
    const overlay = this.add
      .image(bus.x, bus.y, texture)
      .setScale(bus.scaleX, bus.scaleY)
      .setDepth(bus.depth + 1)
      .setAlpha(0);
    this.uiCamera?.ignore(overlay);
    return new Promise((resolve) => {
      this.tweens.add({
        targets: overlay,
        alpha: 1,
        duration,
        ease: 'Sine.inOut',
        onComplete: () => {
          bus.setTexture(texture);
          overlay.destroy();
          resolve();
        },
      });
    });
  }

  private findNavigationPath(
    start: Phaser.Math.Vector2,
    target: Phaser.Math.Vector2,
  ): Phaser.Math.Vector2[] {
    if (this.isSegmentNavigable(start, target)) return [target];

    const columns = Math.ceil(WORLD_WIDTH / NAVIGATION_GRID_SIZE);
    const rows = Math.ceil(WORLD_HEIGHT / NAVIGATION_GRID_SIZE);
    const nodeCount = columns * rows;
    const state = new Int8Array(nodeCount);
    const nodePoint = (index: number): Phaser.Math.Vector2 => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      return new Phaser.Math.Vector2(
        Math.min(column * NAVIGATION_GRID_SIZE + NAVIGATION_GRID_SIZE / 2, WORLD_WIDTH - 1),
        Math.min(row * NAVIGATION_GRID_SIZE + NAVIGATION_GRID_SIZE / 2, WORLD_HEIGHT - 1),
      );
    };
    const isNodeWalkable = (index: number): boolean => {
      if (state[index] !== 0) return state[index] === 1;
      const point = nodePoint(index);
      const walkable = this.isNavigationWalkable(point.x, point.y);
      state[index] = walkable ? 1 : -1;
      return walkable;
    };
    const closestNode = (point: Phaser.Math.Vector2): number => {
      let closest = -1;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < nodeCount; index += 1) {
        if (!isNodeWalkable(index)) continue;
        const candidate = nodePoint(index);
        if (!this.isSegmentNavigable(point, candidate)) continue;
        const distance = candidate.distanceSq(point);
        if (distance < closestDistance) {
          closest = index;
          closestDistance = distance;
        }
      }
      return closest;
    };

    const startNode = closestNode(start);
    const targetNode = closestNode(target);
    if (startNode < 0 || targetNode < 0) return [];
    const gScore = new Float64Array(nodeCount);
    const fScore = new Float64Array(nodeCount);
    gScore.fill(Number.POSITIVE_INFINITY);
    fScore.fill(Number.POSITIVE_INFINITY);
    const cameFrom = new Int32Array(nodeCount);
    cameFrom.fill(-1);
    const openNodes = [startNode];
    const openState = new Uint8Array(nodeCount);
    const closedState = new Uint8Array(nodeCount);
    const heuristic = (index: number): number => nodePoint(index).distance(target);
    gScore[startNode] = 0;
    fScore[startNode] = heuristic(startNode) / NAVIGATION_GRID_SIZE;
    openState[startNode] = 1;
    const neighbors = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
    ];
    let reached = false;

    while (openNodes.length > 0) {
      let bestOpen = 0;
      for (let index = 1; index < openNodes.length; index += 1) {
        if (fScore[openNodes[index]] < fScore[openNodes[bestOpen]]) bestOpen = index;
      }
      const current = openNodes.splice(bestOpen, 1)[0];
      openState[current] = 0;
      if (closedState[current]) continue;
      closedState[current] = 1;
      if (current === targetNode) {
        reached = true;
        break;
      }
      const currentColumn = current % columns;
      const currentRow = Math.floor(current / columns);
      for (const [columnOffset, rowOffset] of neighbors) {
        const nextColumn = currentColumn + columnOffset;
        const nextRow = currentRow + rowOffset;
        if (nextColumn < 0 || nextColumn >= columns || nextRow < 0 || nextRow >= rows) continue;
        const next = nextRow * columns + nextColumn;
        if (closedState[next] || !isNodeWalkable(next)) continue;
        if (columnOffset !== 0 && rowOffset !== 0) {
          const horizontal = currentRow * columns + nextColumn;
          const vertical = nextRow * columns + currentColumn;
          if (!isNodeWalkable(horizontal) || !isNodeWalkable(vertical)) continue;
        }
        const tentative = gScore[current] + (columnOffset !== 0 && rowOffset !== 0 ? Math.SQRT2 : 1);
        if (tentative >= gScore[next]) continue;
        cameFrom[next] = current;
        gScore[next] = tentative;
        fScore[next] = tentative + heuristic(next) / NAVIGATION_GRID_SIZE;
        if (!openState[next]) {
          openState[next] = 1;
          openNodes.push(next);
        }
      }
    }
    if (!reached) return [];

    const gridPath: Phaser.Math.Vector2[] = [];
    let current = targetNode;
    while (current >= 0) {
      gridPath.unshift(nodePoint(current));
      if (current === startNode) break;
      current = cameFrom[current];
    }
    if (current !== startNode) return [];
    const rawPath = [start, ...gridPath];
    if (this.isSegmentNavigable(gridPath.at(-1)!, target)) rawPath.push(target);
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

  private isSegmentNavigable(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2): boolean {
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
    if (!this.walkableZones.some((zone) => Phaser.Geom.Polygon.Contains(zone, x, y))) {
      return false;
    }
    return !this.navigationBlockers.some(
      (blocker) =>
        x >= blocker.left - NAVIGATION_BLOCKER_MARGIN &&
        x <= blocker.right + NAVIGATION_BLOCKER_MARGIN &&
        y >= blocker.top - NAVIGATION_BLOCKER_MARGIN &&
        y <= blocker.bottom + NAVIGATION_BLOCKER_MARGIN,
    ) && !this.navigationBlockerPolygons.some((blocker) =>
      Phaser.Geom.Polygon.Contains(blocker, x, y),
    );
  }

  private restoreToWalkableArea(
    sprite: Phaser.Physics.Arcade.Sprite,
    lastValidPosition: Phaser.Math.Vector2,
  ): void {
    const feet = this.characterFeet(sprite);
    if (!this.isNavigationWalkable(feet.x, feet.y)) {
      sprite.setPosition(lastValidPosition.x, lastValidPosition.y).setVelocity(0, 0);
      return;
    }
    lastValidPosition.set(sprite.x, sprite.y);
  }

  private addBlocker(x: number, y: number, width: number, height: number): void {
    const rectangle = new Phaser.Geom.Rectangle(x, y, width, height);
    this.navigationBlockers.push(rectangle);
    const blocker = this.add.rectangle(x + width / 2, y + height / 2, width, height);
    blocker.setVisible(false);
    this.physics.add.existing(blocker, true);
    this.blockers?.add(blocker);
  }

  private polygon(points: number[]): Phaser.Geom.Polygon {
    const polygonPoints: Phaser.Geom.Point[] = [];
    for (let index = 0; index < points.length; index += 2) {
      polygonPoints.push(new Phaser.Geom.Point(points[index], points[index + 1]));
    }
    return new Phaser.Geom.Polygon(polygonPoints);
  }

  private characterFeet(sprite: Phaser.Physics.Arcade.Sprite): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(sprite.x, sprite.y + CHARACTER_FEET_OFFSET);
  }

  private facingFromDirection(
    direction: Phaser.Math.Vector2,
    fallback: FacingDirection,
  ): FacingDirection {
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      if (direction.x < -8) return 'left';
      if (direction.x > 8) return 'right';
    } else {
      if (direction.y < -8) return 'back';
      if (direction.y > 8) return 'front';
    }
    return fallback;
  }

  private clearNavigationPath(): void {
    this.navigationPath = [];
    this.navigationTargetMarker?.setVisible(false);
  }

  private tweenPromise(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ ...config, onComplete: () => resolve() });
    });
  }

  private waitFor(duration: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(duration, () => resolve()));
  }
}
