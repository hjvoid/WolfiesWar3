import Phaser from 'phaser';
import { Lasers } from './Lasers';
import GameOverScene from './GameOver';

export let wolfie;
let cursors;
let ground;
let groundY;
let evilWalker;
let scoreText;
let energyBar;
let wolfieIsHurt = false;
let points = 0;
let wolfieEnergy = 200;
let gate;
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

const gameOver = (scene) => {
	scene.pause();
	scene.launch('GameOverScene');
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
		super('game-scene');
	}
	preload() {
		// BACKGROUND IMAGES
		const allBackgrounds = {
			1: '/assets/backgroundLayers/hokusaiForest1.png',
			2: '/assets/backgroundLayers/hokusaiForest2.png',
			3: '/assets/backgroundLayers/hokusaiForest3.png',
			4: '/assets/backgroundLayers/hokusaiForest4.png',
			5: '/assets/backgroundLayers/hokusaiForest5.png',
			6: '/assets/backgroundLayers/hokusaiForest6.png',
			7: '/assets/backgroundLayers/hokusaiForest7.png',
			8: '/assets/backgroundLayers/hokusaiForest8.png',
			9: '/assets/backgroundLayers/hokusaiForest9.png',
			10: '/assets/backgroundLayers/hokusaiForest10Light.png',
			11: '/assets/backgroundLayers/hokusaiForest11.png',
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
			'/assets/sprites/evilWalker.png',
			'/assets/sprites/evilWalker.json'
		);

		// DOG BISCUITS
		this.load.atlas(
			'dogBiscuit',
			'assets/tokens/silverDog.png',
			'assets/tokens/silverDog.json'
		);

		//PROJECTILES
		this.load.atlas(
			'redPulse',
			'/assets/sprites/projectiles/redPulse.png',
			'/assets/sprites/projectiles/redPulse.json'
		);
		//PLATFORMS AND OBSTACLES
		this.load.image(
			'hokusaiAssetsSmall',
			'/assets/obstacles/hokusaiAssetsSmallLightAndBright.png'
		);
		this.load.image('gate', '/assets/obstacles/level_gate1.png');
		this.load.tilemapTiledJSON('tilemap', '/assets/obstacles/hokusai.json');
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
		this.scene.add('GameOverScene', GameOverScene);

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

		// OBSTACLES AND BACKGROUND
		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage(
			'hokusaiAssetsSmall',
			'hokusaiAssetsSmall'
		);

		ground = map.createLayer('ground', tileset);
		ground.setCollisionByProperty({ collides: true });
		map.createLayer('obstacles', tileset);

		//EVILWALKER
		evilWalker = this.physics.add
			.sprite(270, 150, 'evilWalker')
			.setScale(0.12, 0.12)
			.setBounce(0.9)
			.setCollideWorldBounds(true)
			.setImmovable(true);

		//END OF LEVEL GATE
		gate = this.physics.add
			.sprite(width * 3 - 70, 480, 'gate')
			.setScale(0.15, 0.15)
			.setCollideWorldBounds(true)
			.setImmovable(true);
		gate.body.allowGravity = false;

		// WOLFIE
		wolfie = this.physics.add
			.sprite(130, 200, 'wolfie')
			.setScale(0.23, 0.23)
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

		// BISCUIT ANIMS
		this.anims.create({
			key: 'rotate',
			frames: this.anims.generateFrameNames('dogBiscuit', {
				prefix: 'rotate',
				end: 10,
				zeroPad: 4,
			}),
			frameRate: 10,
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
		var projectilesLaser = {
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
					let biscuit = this.physics.add.sprite(x, y, 'dogBiscuit');
					biscuit.setScale(0.2, 0.2);
					biscuit.body.setAllowGravity(false);
					biscuit.anims.play('rotate', true);
					this.physics.add.collider(wolfie, biscuit, () => {
						// biscuit.anims.stop('rotate', true);
						points += 5;
						biscuit.destroy();
					});
					break;
				}
				case 'spikes': {
					const rect = this.add.rectangle(
						x + width * 0.5,
						y + height * 0.5,
						width,
						height
					);
					// add the rectangle to the Arcade physics system
					this.physics.add.existing(rect, true);
					this.physics.add.collider(wolfie, rect, () => {
						wolfie.setVelocityY(-200);
						flashRedWhenHurt(wolfie, this.scene);
						if (wolfieEnergy > 0) {
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
		this.cameras.main.setBounds(0, 0, width * 3, height);
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
		energyBar.fillRect(5, 50, wolfieEnergy, 20);
	}

	update() {
		const cam = this.cameras.main;
		const speed = 3;
		const { width, height } = this.scale;
		scoreText.x = cam.scrollX + 10;

		if (wolfieEnergy <= 0 || wolfie.y + 29 > height) {
			gameOver(this.scene);
		}

		if (wolfie.x >= gate.x - 20 && wolfie.y >= gate.y + 20) {
			gameOver(this.scene);
		}

		// Wolfie Health
		energyBar.x = cam.scrollX + 10;

		// CAMERA
		if (wolfie.x > width * 0.5) {
			cam.startFollow(wolfie);
		}

		// SCORE
		scoreText.setText('Score: ' + points);

		// EVILWALKER
		// Play walk animation if not already playing
		if (!evilWalker.anims.isPlaying) {
			evilWalker.anims.play('walk', true).setVelocityX(50);
		}
		if (evilWalker.anims.currentAnim.key === 'walk' && evilWalker.x > 460) {
			evilWalker.anims.stop();
			evilWalker.flipX = true;
			evilWalker.anims.play('walk', true).setVelocityX(-50);
		} else if (
			evilWalker.anims.currentAnim.key === 'walk' &&
			evilWalker.x < 270 &&
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
				wolfie.setVelocityY(-200);
			}
		}
		if (wolfieIsHurt) {
			energyBar.clear();
			energyBar.fillStyle(0xff0000, 1);
			energyBar.fillRect(5, 50, wolfieEnergy, 20);
			wolfieIsHurt = false;
		}
		// LASERS
		if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
			this.lasers.fireLaser(wolfie.x - 10, wolfie.y);
			this.lasers.playAnimation('redPulse');
		}
	}
}
