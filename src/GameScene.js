import Phaser from 'phaser';

let goober;
let cursors;
let ground;
let groundY;
let facingForward = true;
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

class Laser extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'unchargedLaser');
	}

	fire(x, y) {
		this.body.reset(x, y);
		this.setActive(true);
		this.setVisible(true);
		if (facingForward) {
			this.setVelocityX(300);
		} else {
			this.setVelocityX(-300);
			this.setFlipX(true);
		}
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (this.x >= goober.x + 800) {
			this.setActive(false);
			this.setVisible(false);
		}
	}
}

class Lasers extends Phaser.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);

		this.createMultiple({
			frameQuantity: 10,
			key: 'unchargedLaser',
			active: false,
			visible: false,
			classType: Laser,
		});
	}

	fireLaser(x, y) {
		let laser = this.getFirstDead(false);

		if (laser) {
			laser.fire(x, y);
		}
	}
}

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('game-scene');
	}
	preload() {
		// BACKGROUND IMAGES
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

		// SPRITES
		this.load.atlas(
			'goober',
			'/assets/sprites/Goober.png',
			'/assets/sprites/Goober.json'
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
		goober = this.physics.add
			.sprite(100, 200, 'goober')
			.setScale(2, 2)
			.setBounce(0.3);

		this.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('goober', {
				prefix: 'move',
				end: 7,
				zeroPad: 3,
			}),
			repeat: -1,
		});

		// COLLIDERS
		this.physics.add.collider(ground, goober, (ground) => {
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

		if (goober.x > width * 0.5) {
			cam.startFollow(goober);
		}

		if (cursors.left.isDown) {
			facingForward = false;
			goober.flipX = true;
			goober.setVelocityX(-200);
			goober.anims.play('move', true);
			cam.scrollX -= speed;
		} else if (cursors.right.isDown) {
			facingForward = true;
			goober.flipX = false;
			goober.setVelocityX(200);
			goober.anims.play('move', true);
		} else {
			goober.setVelocityX(0);
			goober.anims.play('move', false);
		}

		if (
			Phaser.Input.Keyboard.JustDown(cursors.up) &&
			goober.y === groundY
		) {
			goober.setVelocityY(-200);
			goober.anims.play('move', false);
		}

		if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
			this.lasers.fireLaser(goober.x, goober.y);
			this.lasers.playAnimation('waveform');
		}
	}
}
