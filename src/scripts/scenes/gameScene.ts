import Phaser from 'phaser';
import { Lasers } from '../objects/Lasers';
import {
	createAlignedParallax,
	gameOver,
	flashRedWhenHurt,
} from '../utils/utils';
import { Laser } from '../objects/Laser';

//need to get rid of all of this and export into classes/functional components...?
export let wolfie: any;
let cursors: {
	left: any;
	right: any;
	up: any;
	space: any;
	down?: Phaser.Input.Keyboard.Key;
	shift?: Phaser.Input.Keyboard.Key;
};
let groundY: number;
let evilWalker: any;
let scoreText: Phaser.GameObjects.Text;
let energyBar: Phaser.GameObjects.Graphics;
let energyBarOverlay: Phaser.GameObjects.Image;
let wolfieIsHurt = false;
let wolfieEnergy: number;
let darkWalker: any;
let gate: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let floorSpikes:
	| Phaser.GameObjects.GameObject
	| Phaser.GameObjects.Group
	| Phaser.GameObjects.GameObject[]
	| Phaser.GameObjects.Group[];
let skySpikes:
	| Phaser.GameObjects.GameObject
	| Phaser.GameObjects.Group
	| Phaser.GameObjects.GameObject[]
	| Phaser.GameObjects.Group[];
let keyHasBeenCaptured = false;
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;
export let facingForward = true;

export const scale = Math.min(
	window.innerWidth / MAP_WIDTH,
	window.innerHeight / MAP_HEIGHT
);

const createBounceOnCollision = (character, adversary, thisObject) => {
	if (adversary === floorSpikes) {
		thisObject.tweens.add({
			targets: character,
			y: character.y - 100,
			ease: 'Power1',
			duration: 300,
			onComplete: function () {
				if (character === wolfie) {
					wolfieEnergy -= 20;
					wolfieIsHurt = true;
				}
			},
		});
	} else if (adversary === skySpikes) {
		thisObject.tweens.add({
			targets: character,
			y: character.y + 100,
			ease: 'Power1',
			duration: 400,
			onComplete: function () {
				if (character === wolfie) {
					wolfieEnergy -= 20;
					wolfieIsHurt = true;
				}
			},
		});
	} else {
		character.setVelocityY(-200);
		if (character.x > adversary.x) {
			thisObject.tweens.add({
				targets: character,
				x: character.x + 70,
				ease: 'Power1',
				duration: 500,
				onComplete: function () {
					if (character === wolfie) {
						wolfieEnergy -= 20;
						wolfieIsHurt = true;
					}
				},
			});
		}
		if (character.x < adversary.x) {
			thisObject.tweens.add({
				targets: character,
				x: character.x - 70,
				ease: 'Power1',
				duration: 500,
				onComplete: function () {
					if (character === wolfie && wolfieEnergy > 0) {
						wolfieEnergy -= 20;
						wolfieIsHurt = true;
					}
				},
			});
		}
	}
};

export default class GameScene extends Phaser.Scene {
	score: number;
	lasers: Lasers;
	darkWalkers: Phaser.GameObjects.Group;
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
			'assets/sprites/wolfieExp.png',
			'assets/sprites/wolfieExp.json'
		);

		// EVILWALKER
		this.load.atlas(
			'evilWalker',
			'assets/sprites/evilWalker.png',
			'assets/sprites/evilWalker.json'
		);

		//HYPNONYMPH
		this.load.atlas(
			'hypnoNymph',
			'assets/sprites/hypnoNymph.png',
			'assets/sprites/hypnoNymph.json'
		);

		// DOG BISCUITS
		this.load.atlas(
			'dogBiscuit',
			'assets/tokens/cookie1.png',
			'assets/tokens/cookie1.json'
		);

		// LEVEL KEY
		this.load.image('levelKey', 'assets/tokens/cloudForestKey.png');

		//PROJECTILES
		this.load.atlas(
			'fireballYellow',
			'assets/sprites/projectiles/fireballs/fireballYellow.png',
			'assets/sprites/projectiles/fireballs/fireballYellow.json'
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

		//GATE
		this.load.image('gate', 'assets/obstacles/level_gate1.png');
		this.load.tilemapTiledJSON('tilemap', 'assets/obstacles/hokusai.json');

		//HEART
		this.load.atlas(
			'heartPulse',
			'assets/tokens/heartPulse.png',
			'assets/tokens/heartPulse.json'
		);

		//MOVING PLATFORM
		this.load.image('movingCloud', 'assets/obstacles/movingCloud.png');
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

		//scale the layers
		ground.setScale(scale);
		obstacles.setScale(scale);
		obstacles.setCullPadding(ground.width * cullPadding);
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
		const xPositionForGate = 70 * scale;
		gate = this.physics.add
			.sprite(width * 3 - xPositionForGate, 480 * scale, 'gate')
			.setScale(0.15 * scale, 0.15 * scale)
			.setCollideWorldBounds(true)
			.setImmovable(true);
		gate.body.allowGravity = false;

		// WOLFIE
		const wolfiesWorldBounds = new Phaser.Geom.Rectangle(
			0, // x
			0, // y
			width, // width
			height * scale - 50 // height - 50px (to allow the character to fall through)
		);
		wolfie = this.physics.add
			.sprite(130 * scale, 200 * scale, 'wolfie')
			.setScale(0.23 * scale, 0.23 * scale)
			.setBounce(0.3)
			.setCollideWorldBounds(true);
		wolfie.flipX = true;
		wolfie.body.world.setBounds(wolfiesWorldBounds);

		// WOLFIE ANIMS
		this.anims.create({
			key: 'move',
			frames: this.anims.generateFrameNames('wolfie', {
				prefix: 'run',
				end: 10,
				zeroPad: 4,
			}),
			frameRate: 30,
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

		//HYPNONYMPH ANIMS
		this.anims.create({
			key: 'stationary',
			frames: this.anims.generateFrameNames('hypnoNymph', {
				prefix: 'stationary',
				end: 6,
				zeroPad: 4,
			}),
			frameRate: 6,
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
		this.physics.add.collider(ground, wolfie, (groundLevel) => {
			groundY = (groundLevel as Phaser.Physics.Arcade.Sprite).y;
		});
		// Walker and ground
		this.physics.add.collider(ground, evilWalker);

		// Wolfie and Walker
		this.physics.add.collider(wolfie, evilWalker, () => {
			flashRedWhenHurt(wolfie, this.scene);
			if (wolfieEnergy > 0) {
				wolfieIsHurt = true;
			}
			createBounceOnCollision(wolfie, evilWalker, this);
		});

		//PROJECTILES
		this.lasers = new Lasers(this);
		this.physics.world.enable(this.lasers);
		this.lasers.children.iterate((laser) => {
			this.physics.world.enable(laser);
			if (laser.body instanceof Phaser.Physics.Arcade.Body) {
				laser.body.setAllowGravity(false);
			}
		});

		// PROJECTILES ANIMS
		const fireballFired = {
			key: 'fired',
			frames: this.anims.generateFrameNames('fireballYellow', {
				prefix: 'rotate',
				start: 0,
				end: 8,
				zeroPad: 4,
			}),
			frameRate: 16,
			repeat: -1,
		};
		const fireballImpact = {
			key: 'impact',
			frames: this.anims.generateFrameNames('fireballYellow', {
				prefix: 'impact',
				start: 0,
				end: 3,
				zeroPad: 4,
			}),
			frameRate: 16,
			repeat: 1,
			hideOnComplete: true,
		};

		this.anims.create(fireballFired);
		this.anims.create(fireballImpact);

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
				case 'levelKey': {
					let levelKey = this.physics.add.sprite(
						x * scale,
						y * scale,
						'levelKey'
					);
					levelKey.setScale(0.18 * scale, 0.18 * scale);
					levelKey.setRotation(-0.5);
					levelKey.body.setAllowGravity(false);
					this.tweens.add({
						targets: levelKey,
						rotation: Phaser.Math.DegToRad(10), // Final rotation angle
						duration: 1200, // Duration of each half of the tween in milliseconds
						ease: 'Elastic.In', // Easing function to control the tween
						yoyo: true, // Make the tween reverse back to its initial state
						repeat: -1, // Repeat the tween indefinitely
					});
					this.physics.add.collider(wolfie, levelKey, () => {
						keyHasBeenCaptured = true;
						levelKey.destroy();
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
					this.darkWalkers = this.add.group();
					darkWalker = this.physics.add.sprite(
						x * scale,
						y * scale,
						'hypnoNymph'
					);
					darkWalker.setScale(0.08 * scale, 0.08 * scale);
					darkWalker.body.setAllowGravity(false).setImmovable(true);
					darkWalker.anims.play('stationary', true);
					this.darkWalkers.add(darkWalker);

					this.physics.add.collider(wolfie, darkWalker, () => {
						flashRedWhenHurt(wolfie, this.scene);
						createBounceOnCollision(wolfie, darkWalker, this);
					});
					this.lasers.children.iterate((laser) => {
						this.physics.add.collider(
							laser,
							this.darkWalkers,
							(laser, darkWalker) => {
								const impactZoneX =
									darkWalker.body.x +
									darkWalker.body.halfWidth;
								const impactZoneY =
									darkWalker.body.y +
									darkWalker.body.halfHeight;
								darkWalker.destroy();
								laser.destroy();
								const expolosion = this.physics.add
									.sprite(
										impactZoneX,
										impactZoneY,
										'fireballYellow'
									)
									.setScale(0.2 * scale, 0.2 * scale);
								expolosion.body.setAllowGravity(false);
								expolosion.anims.play('impact');
							}
						);
					});
					break;
				}
				case 'spikes': {
					floorSpikes = this.add.rectangle(
						(x + width * 0.5) * scale,
						(y + height * 0.5) * scale,
						width,
						height
					);
					this.physics.add.existing(floorSpikes, true);
					this.physics.add.collider(wolfie, floorSpikes, () => {
						flashRedWhenHurt(wolfie, this.scene);
						createBounceOnCollision(wolfie, floorSpikes, this);
					});
					break;
				}
				case 'stalacSpikes': {
					skySpikes = this.add.rectangle(
						(x + width * 0.5) * scale,
						(y + height * 0.5) * scale,
						width,
						height
					);
					this.physics.add.existing(skySpikes, true);
					this.physics.add.collider(wolfie, skySpikes, () => {
						flashRedWhenHurt(wolfie, this.scene);
						createBounceOnCollision(wolfie, skySpikes, this);
					});
					break;
				}
			}
		});

		//MOVING PLATFORM
		const movingCloud = this.physics.add
			.sprite(width * 3 - 220 * scale, 100 * scale, 'movingCloud')
			.setScale(0.3 * scale, 0.3 * scale)
			.setImmovable(true)
			.setCollideWorldBounds(true);
		movingCloud.body.setAllowGravity(false);

		this.tweens.timeline({
			targets: movingCloud.body.velocity,
			loop: -1,
			tweens: [
				{ x: 70, y: 0, duration: 1000, ease: 'Stepped' },
				{ x: -70, y: 0, duration: 1000, ease: 'Stepped' },
			],
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
		if (wolfieEnergy <= 0 || wolfie.y + 29 * scale > height) {
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
			evilWalker.anims.play('walk', true).setVelocityX(50 * scale);
		}
		if (
			evilWalker.anims.currentAnim.key === 'walk' &&
			evilWalker.x > 460 * scale
		) {
			evilWalker.anims.stop();
			evilWalker.flipX = true;
			evilWalker.anims.play('walk', true).setVelocityX(-50 * scale);
		} else if (
			evilWalker.anims.currentAnim.key === 'walk' &&
			evilWalker.x < 270 * scale &&
			evilWalker.flipX === true
		) {
			evilWalker.anims.stop();
			evilWalker.flipX = false;
			evilWalker.anims.play('walk', true).setVelocityX(50 * scale);
		}

		// WOLF CONTROLLERS
		if (cursors.left.isDown && !wolfieIsHurt) {
			facingForward = false;
			wolfie.flipX = false;
			wolfie.setVelocityX(-200 * scale);
			wolfie.anims.play('move', true);
			cam.scrollX -= speed;
		} else if (cursors.right.isDown && !wolfieIsHurt) {
			facingForward = true;
			wolfie.flipX = true;
			wolfie.setVelocityX(200 * scale);
			wolfie.anims.play('move', true);
		} else {
			wolfie.setVelocityX(0);
			wolfie.anims.play('move', false);
		}
		if (cursors.up.isDown && !wolfieIsHurt) {
			wolfie.anims.play('jump', true);
			if (Math.round(wolfie.y) === Math.round(groundY)) {
				wolfie.setVelocityY(-160 * scale);
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
			this.lasers.fireLaser(wolfie.x - 10, wolfie.y);
			this.lasers.playAnimation('fired');
		}
	}
}
