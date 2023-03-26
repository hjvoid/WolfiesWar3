import Phaser from 'phaser';

let platforms;
let goober;
let cursors;
let ground;
let groundY;

/**
 * @param {Phaser.Scene} scene
 * @param {number} count
 * @param {string} texture
 * @param {number} scrollFactor
 */

const createAlignedParallax = (scene, count, texture, scrollFactor) => {
	let x = 0;
	for (let i = 0; i < count; ++i) {
		const m = scene.add
			.image(x, scene.scale.height, texture)
			.setOrigin(0, 1)
			.setScrollFactor(scrollFactor);
		x += m.width;
	}
};

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('game-scene');
	}
	preload() {
		this.load.image(
			'grass_ground',
			'/assets/backgroundLayers/Layer_0001_8.png'
		);
		this.load.image(
			'tree_tops',
			'/assets/backgroundLayers/Layer_0002_7.png'
		);
		this.load.image(
			'secondary_tree_bottoms',
			'/assets/backgroundLayers/Layer_0005_5.png'
		);
		this.load.image(
			'tree_bottoms',
			'/assets/backgroundLayers/Layer_0003_6.png'
		);
		this.load.image(
			'primary_shrubery',
			'/assets/backgroundLayers/Layer_0006_4.png'
		);
		this.load.image(
			'secondary_lights',
			'/assets/backgroundLayers/Layer_0007_Lights.png'
		);
		this.load.image(
			'background_shrubbery',
			'/assets/backgroundLayers/Layer_0009_2.png'
		);
		this.load.image(
			'background_shrubbery_shadow',
			'/assets/backgroundLayers/Layer_0008_3.png'
		);
		this.load.image(
			'lights_forefront',
			'/assets/backgroundLayers/Layer_0004_Lights.png'
		);
		this.load.image(
			'shadow_ground',
			'/assets/backgroundLayers/Layer_0000_9.png'
		);
		this.load.image('platform', '/assets/backgroundLayers/platform.png');

		this.load.atlas(
			'goober',
			'/assets/sprites/Goober.png',
			'/assets/sprites/Goober.json'
		);

		this.load.image(
			'mossyObstacles',
			'/assets/obstacles/mossyPlatformsSmall.png'
		);
		this.load.tilemapTiledJSON('tilemap', '/assets/obstacles/game.json');
	}

	create() {
		const { width, height } = this.scale;

		createAlignedParallax(this, 3, 'background_shrubbery_shadow', 0.3);
		createAlignedParallax(this, 3, 'background_shrubbery', 0.4);
		createAlignedParallax(this, 3, 'secondary_lights', 0.5);
		createAlignedParallax(this, 3, 'primary_shrubery', 0.6);
		createAlignedParallax(this, 3, 'secondary_tree_bottoms', 0.7);
		createAlignedParallax(this, 3, 'tree_tops', 0.9);
		createAlignedParallax(this, 3, 'tree_bottoms', 0.9);
		createAlignedParallax(this, 3, 'lights_forefront', 0.9);
		createAlignedParallax(this, 3, 'grass_ground', 0.9);

		platforms = this.physics.add.staticGroup();
		platforms.create(200, 570, 'platform').setImmovable(true);

		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage(
			'mossyPlatformsSmall',
			'mossyObstacles'
		);
		ground = map.createLayer('ground', tileset);
		ground.setCollisionByProperty({ collides: true });
		console.log(ground);
		goober = this.physics.add
			.sprite(100, 200, 'goober')
			.setScale(2, 2)
			.setBounce(0.3);

		this.physics.add.collider(ground, goober, (ground) => {
			groundY = ground.y;
		});

		createAlignedParallax(this, 3, 'shadow_ground', 0.9);

		this.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('goober', {
				prefix: 'move',
				end: 7,
				zeroPad: 3,
			}),
			repeat: -1,
		});

		cursors = this.input.keyboard.createCursorKeys();

		this.cameras.main.setBounds(0, 0, width * 3, height);
	}

	update() {
		const cam = this.cameras.main;
		const speed = 3;
		const { width } = this.scale;

		if (cursors.left.isDown) {
			goober.flipX = true;
			goober.setVelocityX(-200);
			goober.anims.play('move', true);
			cam.scrollX -= speed;
		} else if (cursors.right.isDown) {
			goober.flipX = false;
			goober.setVelocityX(200);
			goober.anims.play('move', true);
			if (goober.x > width * 0.5) {
				cam.scrollX += speed;
			}
		} else {
			goober.setVelocityX(0);
			goober.anims.play('move', false);
		}

		if (cursors.up.isDown && goober.y === groundY) {
			goober.setVelocityY(-200);
			goober.anims.play('move', false);
		}
	}
}
