import Phaser from 'phaser';
import { Laser } from './Laser';

export class Lasers extends Phaser.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);

		this.createMultiple({
			frameQuantity: 10,
			key: 'unchargedLaser',
			active: false,
			visible: false,
			classType: Laser,
		});
	}

	fireLaser(x, y) {
		let laser = this.getFirstDead(false);

		if (laser) {
			laser.fire(x, y);
		}
	}
}
