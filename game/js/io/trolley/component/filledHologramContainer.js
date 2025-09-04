import { GlowFilter } from 'pixi-filters'
import { Container, Graphics, Rectangle } from 'pixi.js'
import { TrolleyIO } from '..'
import { easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { constants } from '../constants'

export class FilledHologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		this.maxWidth = maxWidth
		this.maxHeight = maxHeight
		this.color = color
		this.containerWidth = Math.min(maxHeight * Math.sin(constants.uiRadian), maxWidth)
		this.innerContainer = innerContainer
		innerContainer.alpha = 0

		this.filterArea = new Rectangle(-50, -50, maxWidth + 50 * 2, maxHeight + 50 * 2)

		this.background = new Graphics()

		this.background.filters = [
			new GlowFilter({
				color,
				distance: 4,
				outerStrength: 8
			}),
		]
		this.background.filterArea = new Rectangle(-50, -50, maxWidth + 50 * 2, maxHeight + 50 * 2)
		this.addChild(this.background)
		this.addChild(innerContainer)

		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	async show() {
		animateSimple(rate => {
			this.containerWidth = Math.max(rate * this.maxWidth, this.maxHeight * Math.sin(constants.uiRadian))

			this.background.clear()
			this.background
				.moveTo(this.maxHeight * Math.sin(constants.uiRadian), 0)
				.lineTo(this.containerWidth, 0)
				.lineTo(this.containerWidth - this.maxHeight * Math.sin(constants.uiRadian), this.maxHeight)
				.lineTo(0, this.maxHeight)

			this.background.fill({
				color: this.color
			})
			this.pivot.x = this.containerWidth / 2
			this.pivot.y = this.maxHeight / 2
		}, { easing: easeOutQuint, duration: 750 })
		await wait(500)
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

			this.background.clear()
			this.background
				.moveTo(this.maxHeight * Math.sin(constants.uiRadian), 0)
				.lineTo(this.containerWidth, 0)
				.lineTo(this.containerWidth - this.maxHeight * Math.sin(constants.uiRadian), this.maxHeight)
				.lineTo(0, this.maxHeight)

			this.background.fill({
				color: this.color
			})
			this.pivot.x = this.containerWidth / 2
			this.pivot.y = this.maxHeight / 2
		}, { easing: easeOutQuint, duration: 750 })
	}
	destroy(options = { children: true }) {
		TrolleyIO.instance.app.ticker.remove(this.ticker)
		super.destroy(options)
	}
}
