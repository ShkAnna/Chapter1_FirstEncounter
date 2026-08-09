import Phaser from 'phaser';

const TEXT_RESOLUTION = Math.min(Math.max(window.devicePixelRatio, 2), 3);

export abstract class HighResolutionScene extends Phaser.Scene {
  private highResolutionTextEnabled = false;

  protected constructor(key: string) {
    super(key);
  }

  init(): void {
    if (this.highResolutionTextEnabled) return;
    this.highResolutionTextEnabled = true;

    this.events.on(
      Phaser.Scenes.Events.ADDED_TO_SCENE,
      (gameObject: Phaser.GameObjects.GameObject) => {
        if (gameObject instanceof Phaser.GameObjects.Text) {
          gameObject.setResolution(TEXT_RESOLUTION);
        }
      },
    );
  }
}
