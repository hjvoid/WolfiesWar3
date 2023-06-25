import Phaser from 'phaser';
import { facingForward, hero, scale, MAP_HEIGHT } from '../scenes/gameScene';

export class Laser extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'unchargedLaser');
	}

	fire(x, y) {
		this.body.reset(x, y);
		this.setGravityY(0);
		this.setActive(true);
		this.setVisible(true);
		this.setScale(0.2 * scale);
		if (facingForward) {
			this.setVelocityX(300);
		} else {
			this.setVelocityX(-300);
			this.setFlipX(true);
		}
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (
			this.x >= hero.x + 800 * scale ||
			this.x < 0 ||
			this.x < hero.x - 400 * scale
		) {
			this.setActive(false);
			this.setVisible(false);
		}
		if (this.y > MAP_HEIGHT * scale) {
			this.destroy();
		}
	}
}
