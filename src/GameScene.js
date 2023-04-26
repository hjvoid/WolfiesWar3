import Phaser from 'phaser';
import { Lasers } from './Lasers';

//need to get rid of all of this and export into classes/functional components...?
export let wolfie;
let cursors;
let groundY;
let evilWalker;
let scoreText;
let energyBar;
let energyBarOverlay;
let wolfieIsHurt = false;
let wolfieEnergy;
let darkWalker;
let gate;
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

const scale = Math.min(
	window.innerWidth / MAP_WIDTH,
	window.innerHeight / MAP_HEIGHT
);

// TODO
//Lasers currently only destroy the first instande of darkwalker
//Scaling does not work with the tilemap and associated layers
//The code also looks like crap and needs a clean up...:-()

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
			.setDisplaySize(scene.scale.width * 3, scene.scale.height)
			.setScrollFactor(scrollFactor);
		x += m.width;
	}
};

const gameOver = (scene, cam, time) => {
	cam.fadeOut(1000, 0, 0, 0);
	time.delayedCall(500, () => {
		scene.pause();
		scene.launch('game-over-scene');
	});
};

const flashRedWhenHurt = (character, scene) => {
	const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
	const endColor = Phaser.Display.Color.ValueToColor(0xff0000);
	scene.scene.tweens.addCounter({
		from: 0,
		to: 100,
		duration: 100,
		repeat: 2,
		yoyo: true,
		ease: Phaser.Math.Easing.Sine.InOut,
		onUpdate: (tween) => {
			const value = tween.getValue();
			const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
				startColor,
				endColor,
				100,
				value
			);
			const color = Phaser.Display.Color.GetColor(
				colorObject.r,
				colorObject.g,
				colorObject.b
			);
			character.setTint(color);
		},
	});
};

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game-scene' });
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
			'assets/sprites/wolfie4.png',
			'assets/sprites/wolfie4.json'
		);

		// EVILWALKER
		this.load.atlas(
			'evilWalker',
			'assets/sprites/evilWalker.png',
			'assets/sprites/evilWalker.json'
		);

		//hypnoNymph
		this.load.atlas(
			'hypnoNymph',
			'/assets/sprites/hypnoNymph.png',
			'/assets/sprites/hypnoNymph.json'
		);

		// DOG BISCUITS
		this.load.atlas(
			'dogBiscuit',
			'assets/tokens/cookie1.png',
			'assets/tokens/cookie1.json'
		);

		//PROJECTILES
		this.load.atlas(
			'redPulse',
			'assets/sprites/projectiles/redPulse.png',
			'assets/sprites/projectiles/redPulse.json'
		);

		//ENERGYBAR
		this.load.image(
			'energyBarOverlay',
			'assets/sprites/energyBarOverlay/energyBarOverlay1.png'
		);

		//PLATFORMS AND OBSTACLES
		this.load.image(
			'hokusaiAssetsSmall',
			'assets/obstacles/hokusaiAssetsSmallLightAndBright.png'
		);

		this.load.image('gate', 'assets/obstacles/level_gate1.png');
		this.load.tilemapTiledJSON('tilemap', 'assets/obstacles/hokusai.json');

		//HEART
		this.load.atlas(
			'heartPulse',
			'assets/tokens/heartPulse.png',
			'assets/tokens/heartPulse.json'
		);
	}

	create() {
		this.score = 0;
		wolfieEnergy = 200;

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
		createAlignedParallax(this, 1, '5', 0.9);
		createAlignedParallax(this, 1, '6', 0.7);
		createAlignedParallax(this, 1, '7', 0.7);
		createAlignedParallax(this, 1, '8', 0.7);
		createAlignedParallax(this, 1, '9', 0.9);
		createAlignedParallax(this, 1, '10', 0.9);
		createAlignedParallax(this, 1, '11', 1.2);

		// TILEMAP
		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage(
			'hokusaiAssetsSmall',
			'hokusaiAssetsSmall'
		);
		//LAYERS
		const ground = map.createLayer('ground', tileset);
		// Inhibits unecessary padding. See -> https://newdocs.phaser.io/docs/3.55.2/Phaser.Tilemaps.TilemapLayer#setCullPadding
		const cullPadding = 0.1; // Set the cull padding to 10% of the layer size
		ground.setCullPadding(ground.width * cullPadding);
		const obstacles = map.createLayer('obstacles', tileset);
		//SCALE LAYERS
		ground.setScale(scale);
		obstacles.setScale(scale);
		//set ground to stop gravity
		ground.setCollisionByProperty({ collides: true });

		//EVILWALKER
		evilWalker = this.physics.add
			.sprite(270 * scale, 150 * scale, 'evilWalker')
			.setScale(0.12 * scale, 0.12 * scale)
			//stops the jerky motion of the charater bobbing up and down within th box (see debug mode in main.js)
			.setOrigin(0.5 * scale, 0.5 * scale)
			.setCollideWorldBounds(true)
			.setImmovable(true);

		//END OF LEVEL GATE
		gate = this.physics.add
			.sprite((width * 3 - 70) * scale, 480 * scale, 'gate')
			.setScale(0.15 * scale, 0.15 * scale)
			.setCollideWorldBounds(true)
			.setImmovable(true);
		gate.body.allowGravity = false;

		// WOLFIE
		wolfie = this.physics.add
			.sprite(130 * scale, 200 * scale, 'wolfie')
			.setScale(0.23 * scale, 0.23 * scale)
			.setBounce(0.3)
			.setCollideWorldBounds(true);
		wolfie.flipX = true;

		// WOLFIE ANIMS
		this.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'move',
				end: 1,
				zeroPad: 4,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: 'jump',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'jump',
				start: 0,
				end: 0,
				zeroPad: 4,
			}),
			frameRate: 1,
			repeat: -1,
		});

		this.anims.create({
			key: 'hurt',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'hurt',
				start: 0,
				end: 1,
				zeroPad: 4,
			}),
			frameRate: 60,
			repeat: -1,
		});

		// EVILWALKER ANIMS
		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNames('evilWalker', {
				prefix: 'walk',
				end: 9,
				zeroPad: 4,
			}),
			frameRate: 9,
			repeat: -1,
		});

		//HYPNONYMPH
		this.anims.create({
			key: 'stationary',
			frames: this.anims.generateFrameNames('hypnoNymph', {
				prefix: 'stationary',
				end: 6,
				zeroPad: 4,
			}),
			frameRate: 7,
			repeat: -1,
		});

		// BISCUIT ANIMS
		this.anims.create({
			key: 'rotate',
			frames: this.anims.generateFrameNames('dogBiscuit', {
				prefix: 'rotate',
				end: 15,
				zeroPad: 4,
			}),
			frameRate: 15,
			repeat: -1,
		});

		// HEART ANIMS
		this.anims.create({
			key: 'heart',
			frames: this.anims.generateFrameNames('heartPulse', {
				prefix: 'pulsing',
				start: 0,
				end: 5,
				zeroPad: 4,
			}),
			frameRate: 7,
			repeat: -1,
		});

		// COLLIDERS
		// Wolfie and ground
		this.physics.add.collider(ground, wolfie, (ground) => {
			groundY = ground.y;
		});
		// Walker and ground
		this.physics.add.collider(ground, evilWalker, (ground) => {
			groundY = ground.y;
		});
		// Wolfie and Walker
		this.physics.add.collider(wolfie, evilWalker, () => {
			this.physics.world.separate(wolfie, evilWalker);
			wolfie.setVelocityY(-200);
			flashRedWhenHurt(wolfie, this.scene);
			if (wolfieEnergy > 0) {
				wolfieIsHurt = true;
			}
			if (wolfie.x > evilWalker.x) {
				this.tweens.add({
					targets: wolfie,
					x: wolfie.x + 50,
					ease: 'Power1',
					duration: 500,
					onComplete: function () {
						wolfieEnergy -= 20;
					},
				});
			}
			if (wolfie.x < evilWalker.x) {
				this.tweens.add({
					targets: wolfie,
					x: wolfie.x - 50,
					ease: 'Power1',
					duration: 500,
					onComplete: function () {
						wolfieEnergy -= 20;
					},
				});
			}
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

		// OBJECTS LAYER
		const objectsLayer = map.getObjectLayer('objects');
		objectsLayer.objects.forEach((layer) => {
			const { x = 0, y = 0, name, width = 0, height = 0 } = layer;
			switch (name) {
				case 'wolfieBiscuit': {
					let biscuit = this.physics.add.sprite(
						x * scale,
						y * scale,
						'dogBiscuit'
					);
					biscuit.setScale(0.18 * scale, 0.18 * scale);
					biscuit.body.setAllowGravity(false);
					biscuit.anims.play('rotate', true);
					this.physics.add.collider(wolfie, biscuit, () => {
						this.score += 5;
						biscuit.destroy();
					});
					break;
				}
				case 'heart': {
					let heart = this.physics.add.sprite(
						x * scale,
						y * scale,
						'heartPulse'
					);
					heart.setScale(0.12 * scale, 0.12 * scale);
					heart.body.setAllowGravity(false);
					heart.anims.play('heart', true);
					this.physics.add.collider(wolfie, heart, () => {
						wolfieEnergy = 200;
						wolfieIsHurt = true;
						heart.destroy();
					});
					break;
				}
				case 'darkWalker': {
					darkWalker = this.physics.add.sprite(
						x * scale,
						y * scale,
						'hypnoNymph'
					);
					darkWalker.setScale(0.1 * scale, 0.1 * scale);
					darkWalker.body.setAllowGravity(false).setImmovable(true);
					darkWalker.anims.play('stationary', true);
					this.physics.add.collider(wolfie, darkWalker, () => {
						flashRedWhenHurt(wolfie, this.scene);
						//TODO Add collider reaction here
						if (wolfieEnergy > 0) {
							wolfieEnergy -= 20;
							wolfieIsHurt = true;
						}
					});
					this.lasers.children.iterate((laser) => {
						this.physics.add.collider(laser, darkWalker, () => {
							darkWalker.destroy();
							laser.destroy();
						});
					});
					break;
				}
				case 'spikes': {
					const rect = this.add.rectangle(
						(x + width * 0.5) * scale,
						(y + height * 0.5) * scale,
						width,
						height
					);
					this.physics.add.existing(rect, true);
					this.physics.add.collider(wolfie, rect, () => {
						wolfie.setVelocityY(-200);
						flashRedWhenHurt(wolfie, this.scene);
						if (wolfieEnergy > 0) {
							wolfieEnergy -= 20;
							wolfieIsHurt = true;
						}
					});
					break;
				}
			}
		});

		// KEYBOARD CONTROLLER INITIALISE
		cursors = this.input.keyboard.createCursorKeys();

		// CAMERAS
		this.cameras.main
			.setBounds(0, 0, width * 3, height)
			.fadeIn(1000, 0, 0, 0);
		// SCORE
		scoreText = this.add.text(10, 10, 'Score: 0', {
			fontFamily: 'Arial',
			fontSize: '24',
			color: '#ffffff',
		});
		scoreText.setScale(1.8);

		//ENERGY BAR
		energyBar = this.add.graphics();
		energyBar.fillStyle(0xff00, 1);
		energyBar.fillRect(15, 50, wolfieEnergy, 20);

		energyBarOverlay = this.add
			.image(0, 25, 'energyBarOverlay')
			.setOrigin(0)
			.setDepth(1)
			.setScale(0.245, 0.34);
	}

	update() {
		const cam = this.cameras.main;
		const time = this.time;
		const speed = 3;
		const { width, height } = this.scale;
		scoreText.x = cam.scrollX + 10;

		if (wolfieEnergy <= 0 || wolfie.y + 29 > height) {
			wolfie.setImmovable(true);
			gameOver(this.scene, cam, time);
		}

		if (wolfie.x >= gate.x - 20 && wolfie.y >= gate.y + 20) {
			gameOver(this.scene, cam, time);
		}

		// Wolfie Health
		energyBar.x = cam.scrollX + 10;
		energyBarOverlay.x = cam.scrollX + 10;

		// CAMERA
		if (wolfie.x > width * 0.5) {
			cam.startFollow(wolfie);
		}

		// SCORE
		scoreText.setText('Score: ' + this.score);

		// EVILWALKER
		// Play walk animation if not already playing
		if (!evilWalker.anims.isPlaying) {
			evilWalker.anims.play('walk', true).setVelocityX(50);
		}
		if (
			evilWalker.anims.currentAnim.key === 'walk' &&
			evilWalker.x > 460 * scale
		) {
			evilWalker.anims.stop();
			evilWalker.flipX = true;
			evilWalker.anims.play('walk', true).setVelocityX(-50);
		} else if (
			evilWalker.anims.currentAnim.key === 'walk' &&
			evilWalker.x < 270 * scale &&
			evilWalker.flipX === true
		) {
			evilWalker.anims.stop();
			evilWalker.flipX = false;
			evilWalker.anims.play('walk', true).setVelocityX(50);
		}

		// WOLF CONTROLLERS
		if (cursors.left.isDown && !wolfieIsHurt) {
			facingForward = false;
			wolfie.flipX = false;
			wolfie.setVelocityX(-200);
			wolfie.anims.play('move', true);
			cam.scrollX -= speed;
		} else if (cursors.right.isDown && !wolfieIsHurt) {
			facingForward = true;
			wolfie.flipX = true;
			wolfie.setVelocityX(200);
			wolfie.anims.play('move', true);
		} else {
			wolfie.setVelocityX(0);
			wolfie.anims.play('move', false);
		}
		if (cursors.up.isDown && !wolfieIsHurt) {
			wolfie.anims.play('jump', true);
			if (Math.round(wolfie.y) === Math.round(groundY)) {
				wolfie.setVelocityY(-200 * scale);
			}
		}
		if (wolfieIsHurt) {
			energyBar.clear();
			wolfieEnergy > 175
				? energyBar.fillStyle(0xff00, 1)
				: wolfieEnergy > 75 && wolfieEnergy < 175
				? energyBar.fillStyle(0xffff00, 1)
				: energyBar.fillStyle(0xff0000, 1);
			energyBar.fillRect(15, 50, wolfieEnergy, 20);
			wolfieIsHurt = false;
		}
		// LASERS
		if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
			this.lasers.fireLaser((wolfie.x - 10) * scale, wolfie.y);
			this.lasers.playAnimation('redPulse');
		}
	}
}
