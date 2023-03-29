import Phaser from 'phaser';
import { Lasers } from './Lasers';

export let wolfie;
let cursors;
let ground;
let groundY;
export let facingForward = true;
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
		// BACKGROUND IMAGES
		const allBackgrounds = {
			grass_ground: '/assets/backgroundLayers/Layer_0001_8.png',
			tree_tops: '/assets/backgroundLayers/Layer_0002_7.png',
			secondary_tree_bottoms: '/assets/backgroundLayers/Layer_0005_5.png',
			tree_bottoms: '/assets/backgroundLayers/Layer_0003_6.png',
			primary_shrubery: '/assets/backgroundLayers/Layer_0006_4.png',
			secondary_lights: '/assets/backgroundLayers/Layer_0007_Lights.png',
			background_shrubbery: '/assets/backgroundLayers/Layer_0009_2.png',
			background_shrubbery_shadow:
				'/assets/backgroundLayers/Layer_0008_3.png',
			lights_forefront: '/assets/backgroundLayers/Layer_0004_Lights.png',
			shadow_ground: '/assets/backgroundLayers/Layer_0000_9.png',
		};
		for (const [key, value] of Object.entries(allBackgrounds)) {
			this.load.image(key, value);
		}

		// SPRITES
		this.load.atlas(
			'wolfie',
			'/assets/sprites/wolfieSpritesheet.png',
			'/assets/sprites/wolfieSpritesheet.json'
		);
		//PROJECTILES
		this.load.atlas(
			'unchargedLaser',
			'/assets/sprites/projectiles/unchargedLaser.png',
			'/assets/sprites/projectiles/unchargedLaser.json'
		);
		//PLATFORMS AND OBSTACLES
		this.load.image(
			'mossyObstacles',
			'/assets/obstacles/mossyPlatformsSmall.png'
		);
		this.load.tilemapTiledJSON('tilemap', '/assets/obstacles/game.json');
	}

	create() {
		// SCENE CONSTANTS
		const { width, height } = this.scale;

		// BACKGROUND LAYERS
		createAlignedParallax(this, 3, 'background_shrubbery_shadow', 0.3);
		createAlignedParallax(this, 3, 'background_shrubbery', 0.4);
		createAlignedParallax(this, 3, 'secondary_lights', 0.5);
		createAlignedParallax(this, 3, 'primary_shrubery', 0.6);
		createAlignedParallax(this, 3, 'secondary_tree_bottoms', 0.7);
		createAlignedParallax(this, 3, 'tree_tops', 0.9);
		createAlignedParallax(this, 3, 'tree_bottoms', 0.9);
		createAlignedParallax(this, 3, 'lights_forefront', 0.9);
		createAlignedParallax(this, 3, 'grass_ground', 0.9);
		createAlignedParallax(this, 3, 'shadow_ground', 0.9);

		// OBSTACLES AND BACKGROUND
		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage(
			'mossyPlatformsSmall',
			'mossyObstacles'
		);
		ground = map.createLayer('ground', tileset);
		ground.setCollisionByProperty({ collides: true });

		// SPRITES
		wolfie = this.physics.add
			.sprite(100, 200, 'wolfie')
			.setScale(0.12, 0.12)
			.setBounce(0.3);
		wolfie.flipX = true;

		this.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'move',
				end: 3,
				zeroPad: 4,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: 'jump',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'jump',
				end: 3,
				zeroPad: 4,
			}),
			frameRate: 10,
			repeat: 0,
		});

		// COLLIDERS
		this.physics.add.collider(ground, wolfie, (ground) => {
			groundY = ground.y;
		});
		//PROJECTILES
		this.lasers = new Lasers(this);
		this.physics.world.enable(this.lasers);
		this.lasers.children.iterate((laser) => {
			this.physics.world.enable(laser);
			laser.body.setAllowGravity(false);
		});

		// create a new animation
		var config = {
			key: 'waveform',
			frames: this.anims.generateFrameNames('unchargedLaser', {
				prefix: 'waveform',
				end: 3,
				zeroPad: 3,
			}),
			repeat: -1,
		};

		// add the animation to the animation manager
		this.anims.create(config);

		// KEYBOARD CONTROLLER INITIALISE
		cursors = this.input.keyboard.createCursorKeys();

		// CAMERAS
		this.cameras.main.setBounds(0, 0, width * 3, height);
	}

	update() {
		const cam = this.cameras.main;
		const speed = 3;
		const { width } = this.scale;
		// CAMERA
		if (wolfie.x > width * 0.5) {
			cam.startFollow(wolfie);
		}
		// WOLFIE
		if (
			Math.round(wolfie.y) !== Math.round(groundY) &&
			!cursors.left.isDown &&
			!cursors.right.isDown
		) {
			wolfie.anims.play('move', false);
			wolfie.anims.play('jump', true);
		} else {
			if (cursors.left.isDown) {
				facingForward = false;
				wolfie.flipX = false;
				wolfie.setVelocityX(-200);
				wolfie.anims.play('move', true);
				cam.scrollX -= speed;
			} else if (cursors.right.isDown) {
				facingForward = true;
				wolfie.flipX = true;
				wolfie.setVelocityX(200);
				wolfie.anims.play('move', true);
			} else {
				wolfie.setVelocityX(0);
				wolfie.anims.play('move', false);
			}
			if (
				Phaser.Input.Keyboard.JustDown(cursors.up) &&
				wolfie.y === groundY
			) {
				wolfie.setVelocityY(-200);
			}
			// LASERS
			if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
				this.lasers.fireLaser(wolfie.x, wolfie.y);
				this.lasers.playAnimation('waveform');
			}
		}
	}
}
