import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-over-scene' });
	}

	create() {
		// Add game over text, buttons, and other UI elements here
		const { width, height } = this.scale;
		this.add
			.text(width * 0.5, height * 0.3, 'GAME OVER', {
				fontFamily: 'Arial',
				fontSize: '32px',
				color: '#FFA500',
			})
			.setOrigin(0.5);

		const button = this.add
			.rectangle(width * 0.5, height * 0.55, 150, 75, 0xffffff)
			.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.scene.stop();
				this.scene.start('game-scene');
			});

		this.add
			.text(button.x, button.y, 'Play Again', {
				color: '#000000',
			})
			.setOrigin(0.5);
	}
}
