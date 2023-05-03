import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-over-scene' });
	}

	preload() {
		this.load.image(
			'startScreen2',
			'assets/splashScreens/kaleidoscope2.png'
		);
	}

	create() {
		// Add game over text, buttons, and other UI elements here
		const { width, height } = this.scale;

		this.cameras.main.fadeIn(1400, 0, 0, 0);
		// Add the splash background image
		const bg = this.add.image(0, 0, 'startScreen2');
		bg.setOrigin(0, 0).setDisplaySize(width, height);

		this.add
			.text(width * 0.5, height * 0.3, 'GAME OVER', {
				fontFamily: 'Arial',
				fontSize: '64px',
				color: '#ffffff',
			})
			.setOrigin(0.5);
		this.cameras.main.setBackgroundColor('#000000');
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
