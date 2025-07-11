import { Sprite } from 'pixi.js'

export class FitSprite extends Sprite {
	constructor({ texture, width, height }) {
		super(texture)
		this.anchor.x = 0.5
		this.anchor.y = 0.5

		console.log(this.width)
		const scaleX = width / this.width
		const scaleY = height / this.height
		const scale = Math.min(scaleX, scaleY)

		this.scale.set(scale)
	}
}
