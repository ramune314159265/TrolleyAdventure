import { GlitchFilter, GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { easeOutQuint } from '../../../util/easing'
import { TrolleyIO } from '../index'

export class HologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		this.innerContainer = innerContainer
		this.maxWidth = maxWidth
		this.maxHeight = maxHeight
		this.containerWidth = 20

		this.alpha = 0
		innerContainer.alpha = 0

		const lineGap = 25
		const lineDistance = 20

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
		TrolleyIO.instance.app.ticker.add(() => {
			lineOffset += 0.2
			if (lineDistance < lineOffset) {
				lineOffset = 0
			}
			grid.clear()
			for (let i = 0; i < maxHeight; i += lineDistance) {
				grid.moveTo(lineGap, Math.min(i + lineOffset, maxHeight)).lineTo(this.containerWidth - lineGap, Math.min(i + lineOffset, maxHeight))
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
			flame.roundRect(0, 0, this.containerWidth, maxHeight, 24)
			flame.stroke({
				width: 2,
				color: `${color}bb`
			})
			flame.fill({
				color: `${color}10`
			})
			flame.moveTo(-lineDistance, -5).lineTo(-lineDistance, maxHeight + 5)
			flame.moveTo(this.containerWidth + lineDistance, -5).lineTo(this.containerWidth + lineDistance, maxHeight + 5)
			flame.stroke({
				width: 1,
				color: color
			})
			this.pivot.x = this.containerWidth / 2
			this.pivot.y = maxHeight / 2
		})

		this.filters = [
			glitch,
			new NoiseFilter({ noise: 0.4 }),
		]
		this.filterArea = new Rectangle(-lineDistance - 10, -lineDistance - 10, maxWidth + lineDistance * 2 + 50, maxHeight + 5 + 50)
		this.addChild(innerContainer)
	}
	show() {
		return new Promise(resolve => {
			const animationTick = 40
			let tick = 0
			const handleTick = () => {
				if (0 <= tick && tick <= animationTick) {
					this.containerWidth = easeOutQuint(tick / animationTick) * this.maxWidth
					this.alpha = easeOutQuint(tick / animationTick)
				}
				if (25 <= tick && tick < 30) {
					this.innerContainer.alpha = 0.3
				}
				if (30 <= tick && tick < 50) {
					this.innerContainer.alpha = 0
				}
				if (50 <= tick && tick <= 50 + animationTick) {
					this.innerContainer.alpha = easeOutQuint((tick - 50) / animationTick)
				}
				if (50 + animationTick < tick) {
					TrolleyIO.instance.app.ticker.remove(handleTick)
					resolve()
				}
				tick++
			}
			TrolleyIO.instance.app.ticker.add(handleTick)
		})
	}
	hide() {
		return new Promise(resolve => {
			const animationTick = 40
			let tick = 0
			const handleTick = () => {
				if (0 <= tick && tick <= animationTick) {
					this.innerContainer.alpha = 1 - easeOutQuint(tick / animationTick)
				}
				if (animationTick <= tick && tick <= animationTick + animationTick) {
					this.containerWidth = (1 - easeOutQuint((tick - animationTick) / animationTick)) * this.maxWidth
					this.alpha = (1 - easeOutQuint((tick - animationTick) / animationTick))
				}
				if (animationTick + animationTick < tick) {
					TrolleyIO.instance.app.ticker.remove(handleTick)
					resolve()
				}
				tick++
			}
			TrolleyIO.instance.app.ticker.add(handleTick)
		})
	}
}
