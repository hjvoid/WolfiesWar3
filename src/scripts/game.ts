import 'phaser';
import startScreen from './scenes/startScreenScene';
import gameScene from './scenes/gameScene';
import gameOverScene from './scenes/gameOverScene';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scale: {
		mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
		width: window.innerWidth,
		height: window.innerWidth * 0.75,
	},
	scene: [startScreen, gameScene, gameOverScene],
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 300 },
		},
	},
};

window.addEventListener('load', () => {
	const game = new Phaser.Game(config);
});
