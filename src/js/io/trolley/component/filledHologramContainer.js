import { GlitchFilter, GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { TrolleyIO } from '..'
import { easeOutQuint } from '../../../util/easing'
import { constants } from '../constants'

export class FilledHologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		this.maxWidth = maxWidth
		this.containerWidth = Math.min(maxHeight * Math.sin(constants.uiRadian), maxWidth)
		this.innerContainer = innerContainer
		innerContainer.alpha = 0

		const glitch = new GlitchFilter({
			slices: 5,
			offset: 5,
			direction: 10,
			fillMode: 1,
		})
		this.filters = [
			glitch,
			new NoiseFilter({ noise: 0.5 }),
		]
		this.filterArea = new Rectangle(-50, -50, maxWidth + 50 * 2, maxHeight + 50 * 2)

		const background = new Graphics()

		background.filters = [
			new GlowFilter({
				color,
				distance: 4,
				outerStrength: 8
			}),
		]
		background.filterArea = new Rectangle(-50, -50, maxWidth + 50 * 2, maxHeight + 50 * 2)
		this.addChild(background)
		this.addChild(innerContainer)

		TrolleyIO.instance.app.ticker.add(() => {
			background.clear()
			background
				.moveTo(maxHeight * Math.sin(constants.uiRadian), 0)
				.lineTo(this.containerWidth, 0)
				.lineTo(this.containerWidth - maxHeight * Math.sin(constants.uiRadian), maxHeight)
				.lineTo(0, maxHeight)

			background.fill({
				color
			})
			this.pivot.x = this.containerWidth / 2
			this.pivot.y = maxHeight / 2

			if (Math.random() < 0.2) {
				glitch.refresh()
			}
		})
	}
	show() {
		return new Promise(resolve => {
			const animationTick = 40
			let tick = 0
			const handleTick = () => {
				if (0 <= tick && tick <= animationTick) {
					this.containerWidth = easeOutQuint(tick / animationTick) * this.maxWidth
				}
				if (30 <= tick && tick <= animationTick + 30) {
					this.innerContainer.alpha = easeOutQuint((tick - 30) / animationTick)
				}
				if (animationTick + 30 < tick) {
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
