import Phaser from 'phaser';
import GameScene from './GameScene';

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
		},
	},
	scene: [GameScene],
};

export default new Phaser.Game(config);
