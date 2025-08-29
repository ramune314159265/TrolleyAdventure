import { GlitchFilter, GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { TrolleyIO } from '..'
import { easeOutQuint } from '../../../util/easing'
import { animateSimple } from '../animation'
import { constants } from '../constants'

export class FilledHologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		this.maxWidth = maxWidth
		this.maxHeight = maxHeight
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

		this.ticker = () => {
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
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	async show() {
		await animateSimple(rate => {
			this.containerWidth = Math.max(rate * this.maxWidth, this.maxHeight * Math.sin(constants.uiRadian))
		}, { easing: easeOutQuint, duration: 750 })
		await animateSimple(rate => {
			this.innerContainer.alpha = rate
		}, { easing: easeOutQuint, duration: 500 })
	}
	async hide() {
		await animateSimple(rate => {
			this.innerContainer.alpha = 1 - rate
		}, { easing: easeOutQuint, duration: 250 })
		await animateSimple(rate => {
			this.containerWidth = Math.max((1 - rate) * this.maxWidth, this.maxHeight * Math.sin(constants.uiRadian))
		}, { easing: easeOutQuint, duration: 750 })
	}
	destroy(options = { children: true }) {
		TrolleyIO.instance.app.ticker.remove(this.ticker)
		super.destroy(options)
	}
}
