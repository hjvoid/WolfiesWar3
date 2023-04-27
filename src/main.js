import Phaser from 'phaser';
import GameScene from './GameScene';
import GameOverScene from './GameOverScene';
import StartScreen from './StartScreen';

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	scale: {
		mode: Phaser.Scale.ScaleModes.NONE,
		width: window.innerWidth,
		height: window.innerWidth * 0.75,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: true,
			debugBodyColor: 0x00ff00, // set the debug color to green
		},
	},
	scene: [StartScreen, GameScene, GameOverScene],
};

export default new Phaser.Game(config);
