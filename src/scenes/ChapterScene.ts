import Phaser from 'phaser';
import { CHAPTER_SCENES } from '../content/chapter';
import type { ChapterSceneConfig, ChapterStage, StageInteraction } from '../content/chapter';
import { finishWithTransition } from '../game/progress';
import type { StorySceneId } from '../game/progress';
import { DialogueOverlay } from '../ui/DialogueOverlay';
import { HighResolutionScene } from './HighResolutionScene';

type ChapterSceneData = {
  sceneId: StorySceneId;
  stageIndex?: number;
  completedIds?: string[];
};

type RuntimeInteraction = StageInteraction & {
  marker: Phaser.GameObjects.Container;
};

const WORLD_WIDTH = 1672;
const WORLD_HEIGHT = 941;
const CHARACTER_SCALE = 0.105;

export class ChapterScene extends HighResolutionScene {
  private config?: ChapterSceneConfig;
  private stage?: ChapterStage;
  private stageIndex = 0;
  private completedIds = new Set<string>();
  private hero?: Phaser.Physics.Arcade.Sprite;
  private companion?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private dialogue?: DialogueOverlay;
  private prompt?: Phaser.GameObjects.Text;
  private objective?: Phaser.GameObjects.Text;
  private nearby?: RuntimeInteraction;
  private interactions: RuntimeInteraction[] = [];
  private objects = new Map<string, Phaser.GameObjects.Image>();
  private blockers?: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('ChapterScene');
  }

  create(data: ChapterSceneData): void {
    this.config = CHAPTER_SCENES[data.sceneId];
    if (!this.config) {
      this.scene.start('TitleScene');
      return;
    }
    this.stageIndex = data.stageIndex ?? 0;
    this.completedIds = new Set(data.completedIds ?? []);
    this.stage = this.config.stages[this.stageIndex];

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT).setRoundPixels(true);
    this.add.image(0, 0, this.stage.background).setOrigin(0);

    this.createBlockers();
    this.createObjects();
    this.createCharacters();
    this.createNpcs();
    this.createInteractions();
    this.createHud();
    this.createInput();

    this.cameras.main.startFollow(this.hero!, true, 0.09, 0.09);
    this.cameras.main.fadeIn(300, 8, 12, 18);
    this.dialogue?.show(this.stage.opening);
  }

  update(): void {
    if (!this.hero || !this.stage || !this.cursors || !this.dialogue) return;

    if (this.dialogue.isOpen) {
      this.hero.setVelocity(0, 0);
      this.companion?.setVelocity(0, 0);
    } else {
      this.updateHero();
      this.updateCompanion();
    }

    this.clampToWalkArea(this.hero);
    if (this.companion) this.clampToWalkArea(this.companion);
    this.hero.setDepth(1000 + this.hero.y);
    this.companion?.setDepth(1000 + this.companion.y);
    this.updateNearbyInteraction();
  }

  private createBlockers(): void {
    this.blockers = this.physics.add.staticGroup();
    for (const blocker of this.stage?.blockers ?? []) {
      const rectangle = this.add
        .rectangle(
          blocker.x + blocker.width / 2,
          blocker.y + blocker.height / 2,
          blocker.width,
          blocker.height,
        )
        .setVisible(false);
      this.physics.add.existing(rectangle, true);
      this.blockers.add(rectangle);
    }
  }

  private createObjects(): void {
    for (const object of this.stage?.objects ?? []) {
      const image = this.add
        .image(object.x, object.y, object.texture)
        .setScale(object.scale)
        .setDepth(object.depth ?? 700 + object.y);
      this.objects.set(object.key, image);
    }
  }

  private createCharacters(): void {
    if (!this.stage) return;
    this.hero = this.physics.add.sprite(
      this.stage.playerStart.x,
      this.stage.playerStart.y,
      this.stage.playerTexture ?? 'hero-front',
    );
    this.configureCharacter(this.hero);

    if (this.stage.companionStart) {
      this.companion = this.physics.add.sprite(
        this.stage.companionStart.x,
        this.stage.companionStart.y,
        this.stage.companionTexture ?? 'companion-front',
      );
      this.configureCharacter(this.companion);
    }

    if (this.blockers) {
      this.physics.add.collider(this.hero, this.blockers);
      if (this.companion) this.physics.add.collider(this.companion, this.blockers);
    }
  }

  private configureCharacter(sprite: Phaser.Physics.Arcade.Sprite): void {
    sprite.setScale(CHARACTER_SCALE).setCollideWorldBounds(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(145, 76);
    body.setOffset(120, 416);
  }

  private createNpcs(): void {
    if (!this.stage) return;
    const count = this.stage.npcCount ?? 0;
    const area = this.stage.walkArea;
    for (let index = 0; index < count; index += 1) {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = area.x + area.width * (0.2 + column * 0.19);
      const y = area.y + area.height * (0.38 + row * 0.25);
      this.add
        .image(x, y, `npc-${String((index % 8) + 1).padStart(2, '0')}`)
        .setScale(0.09)
        .setDepth(800 + y)
        .setAlpha(0.92);
    }
  }

  private createInteractions(): void {
    for (const interaction of this.stage?.interactions ?? []) {
      const marker = this.createMarker(interaction.x, interaction.y);
      this.interactions.push({ ...interaction, radius: interaction.radius ?? 90, marker });
    }
  }

  private createMarker(x: number, y: number): Phaser.GameObjects.Container {
    const glow = this.add.circle(0, 0, 16, 0xf2c14e, 0.15);
    const ring = this.add.circle(0, 0, 10, 0xf2c14e, 0.2).setStrokeStyle(2, 0xffe59b, 0.9);
    const dot = this.add.circle(0, 0, 3, 0xfff5cc);
    const marker = this.add.container(x, y, [glow, ring, dot]).setDepth(2800);
    this.tweens.add({
      targets: marker,
      y: y - 5,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.inOut',
    });
    return marker;
  }

  private createHud(): void {
    if (!this.stage || !this.config) return;
    const { width, height } = this.scale;
    this.add
      .text(22, 18, this.stage.location, {
        color: '#f4efe7',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.78)',
        padding: { x: 12, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(8000);
    this.objective = this.add
      .text(22, 64, `Objectif : ${this.stage.objective}`, {
        color: '#f8dc82',
        fontSize: '15px',
        backgroundColor: 'rgba(17,17,22,0.74)',
        padding: { x: 12, y: 7 },
      })
      .setScrollFactor(0)
      .setDepth(8000);
    this.prompt = this.add
      .text(width / 2, height - 26, '', {
        color: '#f4efe7',
        fontSize: '16px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(17,17,22,0.88)',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(8200)
      .setVisible(false);
    this.dialogue = new DialogueOverlay(this);
  }

  private createInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.interactionKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactionKey?.on('down', () => {
      if (!this.dialogue?.isOpen && this.nearby) this.activate(this.nearby);
    });
  }

  private updateHero(): void {
    if (!this.hero || !this.cursors) return;
    const velocity = new Phaser.Math.Vector2();
    if (this.cursors.left.isDown) velocity.x -= 1;
    if (this.cursors.right.isDown) velocity.x += 1;
    if (this.cursors.up.isDown) velocity.y -= 1;
    if (this.cursors.down.isDown) velocity.y += 1;
    velocity.normalize().scale(175);
    this.hero.setVelocity(velocity.x, velocity.y);
    this.updateFacing(this.hero, velocity, 'hero');
  }

  private updateCompanion(): void {
    if (!this.hero || !this.companion) return;
    const distance = Phaser.Math.Distance.Between(
      this.hero.x,
      this.hero.y,
      this.companion.x,
      this.companion.y,
    );
    if (distance > 72) this.physics.moveToObject(this.companion, this.hero, 128);
    else this.companion.setVelocity(0, 0);
    const body = this.companion.body as Phaser.Physics.Arcade.Body;
    this.updateFacing(this.companion, body.velocity, 'companion');
  }

  private updateFacing(
    sprite: Phaser.Physics.Arcade.Sprite,
    velocity: Phaser.Math.Vector2,
    kind: 'hero' | 'companion',
  ): void {
    const polylan = this.config?.id === 'polylan_lan_date';
    if (polylan) {
      if (velocity.y < -8) sprite.setTexture(`${kind}-polylan-back`);
      else if (velocity.lengthSq() > 64) sprite.setTexture(`${kind}-polylan`);
      return;
    }
    const shooting =
      this.config?.id === 'second_shooting_lesson' ||
      this.config?.id === 'vernand_safety_and_first_shots';
    if (shooting) return;

    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      if (Math.abs(velocity.x) > 8) {
        sprite.setTexture(`${kind}-side`).setFlipX(velocity.x < 0);
      }
    } else if (velocity.y < -8) {
      sprite.setTexture(`${kind}-back`).setFlipX(false);
    } else if (velocity.y > 8) {
      sprite.setTexture(`${kind}-front`).setFlipX(false);
    }
  }

  private clampToWalkArea(sprite: Phaser.Physics.Arcade.Sprite): void {
    if (!this.stage) return;
    const area = this.stage.walkArea;
    sprite.x = Phaser.Math.Clamp(sprite.x, area.x, area.x + area.width);
    sprite.y = Phaser.Math.Clamp(sprite.y, area.y, area.y + area.height);
  }

  private updateNearbyInteraction(): void {
    if (!this.hero || !this.dialogue) return;
    let nearest: RuntimeInteraction | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const interaction of this.interactions) {
      const available = (interaction.requires ?? []).every((id) => this.completedIds.has(id));
      const distance = Phaser.Math.Distance.Between(
        this.hero.x,
        this.hero.y,
        interaction.x,
        interaction.y,
      );
      interaction.marker.setAlpha(available ? (distance <= interaction.radius! ? 1 : 0.5) : 0.18);
      if (available && distance <= interaction.radius! && distance < nearestDistance) {
        nearest = interaction;
        nearestDistance = distance;
      }
    }

    this.nearby = nearest;
    this.prompt
      ?.setText(nearest ? `E · Examiner ${nearest.label}` : '')
      .setVisible(Boolean(nearest) && !this.dialogue.isOpen);
  }

  private activate(interaction: RuntimeInteraction): void {
    this.completedIds.add(interaction.id);
    if (interaction.activateObject) {
      this.objects.get(interaction.activateObject.key)?.setTexture(interaction.activateObject.texture);
    }
    if (this.config?.id === 'chaudron_missed_bus' && interaction.id === 'hug') {
      const bus = this.objects.get('city-bus');
      if (bus) {
        this.tweens.add({ targets: bus, x: 260, duration: 2200, ease: 'Sine.inOut' });
      }
    }

    this.dialogue?.show(interaction.lines, () => {
      if (interaction.stageAdvance && this.config) {
        this.scene.restart({
          sceneId: this.config.id,
          stageIndex: this.stageIndex + 1,
          completedIds: [],
        });
        return;
      }
      if (interaction.completes && this.config) {
        finishWithTransition(
          this,
          this.config.id,
          this.config.memories,
          this.config.transitionText,
        );
      }
    });
  }
}
