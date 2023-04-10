import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
	constructor() {
		super({ key: 'GameOverScene' });
	}

	create() {
		// Add game over text, buttons, and other UI elements here
		const { width, height } = this.scale;
		console.log(width, height);
		this.add.text(width / 2, height / 2, 'GAME OVER', {
			fontFamily: 'Arial',
			fontSize: '32px',
			color: '#FFA500',
		});
	}
}
