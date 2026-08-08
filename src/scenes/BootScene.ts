import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    const images: Array<[string, string]> = [
      ['title-background', 'assets/game/ui/title/title-background.png'],
      ['anna-room', 'assets/game/environments/prologue/anna-room.png'],
      ['alex-room', 'assets/game/environments/prologue/alex-room-v5.png'],
      ['unil-sport-background', 'assets/game/environments/unil/unil-sport-v12.png'],
      ['vernand-exterior', 'assets/game/environments/vernand/exterior.png'],
      ['vernand-briefing', 'assets/game/environments/vernand/briefing-room.png'],
      ['vernand-range', 'assets/game/environments/vernand/range-25m-v7.png'],
      ['polylan-hall', 'assets/game/environments/polylan/hall-v2.png'],
      ['chauderon', 'assets/game/environments/night-finale/chauderon-v4.png'],
      ['lausanne-station', 'assets/game/environments/night-finale/lausanne-station.png'],
      ['dialogue-box', 'assets/game/ui/dialogue/dialogue-box.png'],
      ['portrait-frame', 'assets/game/ui/dialogue/portrait-frame.png'],
      ['transition-plaque', 'assets/game/ui/memories/transition-plaque.png'],
      ['received-email', 'assets/game/ui/email/received-email.png'],
      ['compose-email', 'assets/game/ui/email/compose-email.png'],
      ['phone-frame', 'assets/game/ui/phone/phone-frame.png'],
      ['alex-whatsapp-avatar', 'assets/characters/hero/avatar-whatsapp.png'],
      ['anna-whatsapp-avatar', 'assets/characters/companion/avatar-whatsapp.png'],
      ['pistol-photos', 'assets/objects/pistol-photos-placeholder.png'],
      ['anna-program', 'assets/story/anna-program-ideas-placeholder.png'],
      ['minibus-closed', 'assets/game/objects/vehicles/minibus-closed.png'],
      ['minibus-open', 'assets/game/objects/vehicles/minibus-open.png'],
      ['city-bus', 'assets/game/objects/vehicles/city-bus.png'],
      ['train-open', 'assets/game/objects/vehicles/train-open.png'],
      ['train-closed', 'assets/game/objects/vehicles/train-closed.png'],
      ['case-closed', 'assets/game/objects/shooting/case-closed.png'],
      ['phone-low-battery', 'assets/game/objects/world/phone-low-battery.png'],
      ['hearts', 'assets/game/objects/world/hearts.png'],
    ];

    for (const [key, path] of images) this.load.image(key, path);

    this.load.image('hero-front', 'assets/game/characters/hero/idle-front.png');
    this.load.image('hero-back', 'assets/game/characters/hero/idle-back.png');
    this.load.image(
      'hero-seated-computer',
      'assets/game/characters/hero/seated-computer.png',
    );
    this.load.image('hero-side', 'assets/game/characters/hero/idle-right.png');
    this.load.image('hero-three-quarter', 'assets/game/characters/hero/idle-left.png');
    this.load.image('hero-portrait', 'assets/game/characters/hero/portrait-neutral.png');
    this.load.image(
      'hero-portrait-thoughtful',
      'assets/game/characters/hero/portrait-thoughtful.png',
    );
    this.load.image('hero-shooting', 'assets/game/characters/hero/shooting-instructor.png');
    this.load.image('hero-polylan', 'assets/game/characters/hero/polylan-front.png');
    this.load.image('hero-polylan-back', 'assets/game/characters/hero/polylan-back.png');

    this.load.image('companion-front', 'assets/game/characters/companion/idle-front.png');
    this.load.image('companion-back', 'assets/game/characters/companion/idle-back.png');
    this.load.image(
      'companion-seated-computer',
      'assets/game/characters/companion/seated-computer.png',
    );
    this.load.image('companion-side', 'assets/game/characters/companion/idle-right.png');
    this.load.image('companion-three-quarter', 'assets/game/characters/companion/idle-left.png');
    this.load.image(
      'companion-portrait',
      'assets/game/characters/companion/portrait-neutral.png',
    );
    this.load.image(
      'companion-portrait-blush',
      'assets/game/characters/companion/portrait-blush.png',
    );
    this.load.image(
      'companion-shooting-idle',
      'assets/game/characters/companion/shooting-idle.png',
    );
    this.load.image(
      'companion-shooting-pose',
      'assets/game/characters/companion/shooting-pose.png',
    );
    this.load.image('companion-polylan', 'assets/game/characters/companion/polylan-front.png');
    this.load.image(
      'companion-polylan-back',
      'assets/game/characters/companion/polylan-back.png',
    );

    for (let index = 1; index <= 8; index += 1) {
      const suffix = String(index).padStart(2, '0');
      this.load.image(`npc-${suffix}`, `assets/game/characters/npcs/npc-${suffix}.png`);
    }
  }

  create(): void {
    const portraitFrames: Array<[string, number, number, number, number]> = [
      ['hero-portrait', 51, 59, 333, 410],
      ['hero-portrait-thoughtful', 0, 65, 336, 404],
      ['companion-portrait', 67, 13, 317, 396],
      ['companion-portrait-blush', 29, 17, 355, 392],
      ['npc-01', 144, 36, 163, 444],
    ];

    for (const [textureKey, x, y, width, height] of portraitFrames) {
      this.textures.get(textureKey).add('dialogue-portrait', 0, x, y, width, height);
    }

    this.scene.start('TitleScene');
  }
}
