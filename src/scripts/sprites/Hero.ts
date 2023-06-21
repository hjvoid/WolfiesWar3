import Phaser from 'phaser';

export default class Hero extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, textureAtlas) {
		super(scene, x, y, textureAtlas);
		scene.physics.world.enable(this);
		// this.body.world.setBounds(
		// 	worldBounds.x,
		// 	worldBounds.y,
		// 	worldBounds.width,
		// 	worldBounds.height
		// );
		// scene.add.existing(this, 0);
		scene.add.existing(this);

		scene.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'run',
				end: 10,
				zeroPad: 4,
			}),
			frameRate: 30,
			repeat: -1,
		});

		scene.anims.create({
			key: 'jump',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'jump',
				start: 0,
				end: 0,
				zeroPad: 4,
			}),
			frameRate: 1,
			repeat: -1,
		});
	}
}
