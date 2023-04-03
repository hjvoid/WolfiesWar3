import Phaser from 'phaser';
import { Lasers } from './Lasers';

export let wolfie;
let cursors;
let ground;
let groundY;
let evilWalker;
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
			1: 'assets/backgroundLayers/hokusaiForest1.png',
			2: 'assets/backgroundLayers/hokusaiForest2.png',
			3: 'assets/backgroundLayers/hokusaiForest3.png',
			4: 'assets/backgroundLayers/hokusaiForest4.png',
			5: 'assets/backgroundLayers/hokusaiForest5.png',
			6: 'assets/backgroundLayers/hokusaiForest6.png',
			7: 'assets/backgroundLayers/hokusaiForest7.png',
			8: 'assets/backgroundLayers/hokusaiForest8.png',
			9: 'assets/backgroundLayers/hokusaiForest9.png',
			10: 'assets/backgroundLayers/hokusaiForest10Light.png',
			11: 'assets/backgroundLayers/hokusaiForest11.png',
		};
		for (const [key, value] of Object.entries(allBackgrounds)) {
			this.load.image(key, value);
		}

		// WOLFIE
		this.load.atlas(
			'wolfie',
			'assets/sprites/wolfieSpritesheet.png',
			'assets/sprites/wolfieSpritesheet.json'
		);

		// EVILWALKER
		this.load.atlas(
			'evilWalker',
			'assets/sprites/evilWalker.png',
			'assets/sprites/evilWalker.json'
		);
		//PROJECTILES
		this.load.atlas(
			'redPulse',
			'assets/sprites/projectiles/redPulse.png',
			'assets/sprites/projectiles/redPulse.json'
		);
		//PLATFORMS AND OBSTACLES
		this.load.image(
			'hokusaiAssetsSmall',
			'assets/obstacles/hokusaiAssetsSmallLightAndBright.png'
		);
		this.load.tilemapTiledJSON('tilemap', 'assets/obstacles/hokusai.json');
	}

	create() {
		// SCENE CONSTANTS
		const { width, height } = this.scale;
		this.physics.world.setBounds(
			0,
			0,
			this.scale.width * 3,
			this.scale.height
		);
		// BACKGROUND LAYERS
		createAlignedParallax(this, 1, '1', 0.3);
		createAlignedParallax(this, 1, '2', 0.4);
		createAlignedParallax(this, 1, '3', 0.5);
		createAlignedParallax(this, 1, '4', 0.6);
		createAlignedParallax(this, 1, '5', 0.7);
		createAlignedParallax(this, 1, '6', 0.7);
		createAlignedParallax(this, 1, '7', 0.7);
		createAlignedParallax(this, 1, '8', 0.7);
		createAlignedParallax(this, 1, '9', 0.9);
		createAlignedParallax(this, 1, '10', 0.9);
		createAlignedParallax(this, 1, '11', 1.2);

		// OBSTACLES AND BACKGROUND
		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage(
			'hokusaiAssetsSmall',
			'hokusaiAssetsSmall'
		);
		ground = map.createLayer('ground', tileset);
		ground.setCollisionByProperty({ collides: true });

		// WOLFIE
		wolfie = this.physics.add
			.sprite(130, 200, 'wolfie')
			.setScale(0.12, 0.12)
			.setBounce(0.3)
			.setCollideWorldBounds(true);
		wolfie.flipX = true;

		//EVILWALKER
		evilWalker = this.physics.add
			.sprite(130, 200, 'evilWalker')
			.setScale(0.12, 0.12)
			.setBounce(0.3)
			.setCollideWorldBounds(true);

		// WOLFIE ANIMS
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

		// EVILWALKER ANIMS
		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNames('evilWalker', {
				prefix: 'walk',
				end: 3,
				zeroPad: 4,
			}),
			frameRate: 9,
			repeat: -1,
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

		// PROJECTILES ANIMS
		const projectilesLaser = {
			key: 'redPulse',
			frames: this.anims.generateFrameNames('redPulse', {
				prefix: 'redPulse',
				end: 3,
				zeroPad: 4,
			}),
			repeat: -1,
		};
		this.anims.create(projectilesLaser);

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
		// EVILWALKER
		evilWalker.anims.play('walk', true).setVelocityX(50);
		// WOLFIE
		if (
			Math.round(Math.round(wolfie.y)) !== Math.round(groundY) &&
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
				this.lasers.fireLaser(wolfie.x - 10, wolfie.y);
				this.lasers.playAnimation('redPulse');
			}
		}
	}
}
