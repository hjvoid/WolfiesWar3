import Phaser from 'phaser';

export default class StartScreen extends Phaser.Scene {
	constructor() {
		super({ key: 'start-screen' });
	}

	preload() {
		this.load.image(
			'startScreen1',
			'assets/splashScreens/kaleidoscope1.png'
		);
	}

	create() {
		const { width, height } = this.game.config;
		this.cameras.main.fadeIn(1000, 0, 0, 0);
		// Add the splash background image
		const bg = this.add.image(0, 0, 'startScreen1');
		bg.setOrigin(0, 0).setDisplaySize(width, height);

		// Add the "Wolfie's War" text
		const text = this.add.text(
			this.cameras.main.centerX,
			this.cameras.main.centerY - 50,
			"Wolfie's War",
			{
				fontFamily: 'Arial',
				fontSize: '64px',
				color: '#ffffff',
			}
		);
		text.setOrigin(0.5, 0.5);

		// Add the start button
		const button = this.add.text(
			this.cameras.main.centerX,
			this.cameras.main.centerY + 50,
			'Start Game',
			{
				fontFamily: 'Arial',
				fontSize: '32px',
				color: '#ffffff',
			}
		);
		button.setOrigin(0.5, 0.5);
		button.setInteractive({ useHandCursor: true });
		button.on('pointerdown', () => {
			this.cameras.main.fadeOut(1000, 0, 0, 0);
			this.time.delayedCall(1000, () => {
				this.scene.start('game-scene');
			});
		});
	}
}
