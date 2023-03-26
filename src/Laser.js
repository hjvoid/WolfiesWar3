import Phaser from 'phaser';
import { facingForward, goober } from './GameScene';

export class Laser extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'unchargedLaser');
	}

	fire(x, y) {
		this.body.reset(x, y);
		this.setActive(true);
		this.setVisible(true);
		if (facingForward) {
			this.setVelocityX(300);
		} else {
			this.setVelocityX(-300);
			this.setFlipX(true);
		}
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (this.x >= goober.x + 800) {
			this.setActive(false);
			this.setVisible(false);
		}
	}
}
