import Phaser from 'phaser';
/**
 * @param {Phaser.Scene} scene
 * @param {number} count
 * @param {string} texture
 * @param {number} scrollFactor
 */
export const createAlignedParallax = (scene, count, texture, scrollFactor) => {
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

export const gameOver = (scene, cam, time) => {
	cam.fadeOut(1000, 0, 0, 0);
	time.delayedCall(500, () => {
		scene.pause();
		scene.launch('game-over-scene');
	});
};

export const flashRedWhenHurt = (character, scene) => {
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