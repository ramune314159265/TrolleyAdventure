import { GlitchFilter, GlowFilter } from '../../../libraries/pixi-filters.mjs'
import { Container, Graphics, NoiseFilter, Rectangle } from '../../../libraries/pixi.mjs'
import { easeOutQuint } from '../../../util/easing.js'
import { TrolleyIO } from '../index.js'

export class HologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		innerContainer.alpha = 0

		const lineGap = 25
		const lineDistance = 20
		const animationTick = 40

		const grid = new Graphics()
		this.addChild(grid)
		const flame = new Graphics()
		this.addChild(flame)

		const glitch = new GlitchFilter({
			slices: 5,
			offset: 5,
			direction: 10,
			fillMode: 1,
		})
		let lineOffset = 0
		let width = 20
		let tick = 0
		TrolleyIO.instance.app.ticker.add(() => {
			tick++
			if (0 <= tick && tick <= animationTick) {
				width = easeOutQuint(tick / animationTick) * maxWidth
			}
			if (25 <= tick && tick < 30) {
				innerContainer.alpha = 0.3
			}
			if (30 <= tick && tick < 50) {
				innerContainer.alpha = 0
			}
			if (50 <= tick && tick <= 50 + animationTick) {
				innerContainer.alpha = easeOutQuint((tick - 50) / animationTick)
			}

			lineOffset += 0.2
			if (lineDistance < lineOffset) {
				lineOffset = 0
			}
			grid.clear()
			for (let i = 0; i < maxHeight; i += lineDistance) {
				grid.moveTo(lineGap, Math.min(i + lineOffset, maxHeight)).lineTo(width - lineGap, Math.min(i + lineOffset, maxHeight))
			}
			grid.stroke({
				width: 3,
				color
			})
			if (Math.random() < 0.2) {
				glitch.refresh()
			}

			grid.alpha = 0.4
			grid.filters = [new GlowFilter({
				color,
				outerStrength: 4
			})]
			flame.clear()
			flame.filters = [new GlowFilter({
				color: `${color}50`,
				outerStrength: 6
			})]
			flame.roundRect(0, 0, width, maxHeight, 24)
			flame.stroke({
				width: 2,
				color: `${color}bb`
			})
			flame.fill({
				color: `${color}10`
			})
			flame.moveTo(-lineDistance, -5).lineTo(-lineDistance, maxHeight + 5)
			flame.moveTo(width + lineDistance, -5).lineTo(width + lineDistance, maxHeight + 5)
			flame.stroke({
				width: 1,
				color: color
			})
			this.pivot.x = width / 2
			this.pivot.y = maxHeight / 2
		})

		this.filters = [
			glitch,
			new NoiseFilter({ noise: 0.4 }),
		]
		this.filterArea = new Rectangle(-lineDistance - 10, -lineDistance - 10, maxWidth + lineDistance * 2 + 50, maxHeight + 5 + 50)
		this.addChild(innerContainer)
	}
}
