import { GlitchFilter, GlowFilter, GrayscaleFilter, HslAdjustmentFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { TrolleyIO } from '../index'

export class HologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()
		this.innerContainer = innerContainer
		this.maxWidth = maxWidth
		this.maxHeight = maxHeight
		this.containerWidth = 30
		this.isActive = true

		this.alpha = 0
		innerContainer.alpha = 0

		const lineGap = 35
		const lineDistance = 30

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
		this.ticker = () => {
			lineOffset += 0.2
			if (lineDistance < lineOffset) {
				lineOffset = 0
			}
			grid.clear()
			for (let i = 0; i < maxHeight; i += lineDistance) {
				grid.moveTo(lineGap, Math.min(i + lineOffset, maxHeight)).lineTo(this.containerWidth - lineGap, Math.min(i + lineOffset, maxHeight))
			}
			grid.stroke({
				width: 4,
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
				width: 3,
				color: `${color}bb`
			})
			flame.fill({
				color: `${color}10`
			})
			flame.moveTo(-lineDistance, -5).lineTo(-lineDistance, maxHeight + 5)
			flame.moveTo(this.containerWidth + lineDistance, -5).lineTo(this.containerWidth + lineDistance, maxHeight + 5)
			flame.stroke({
				width: 2,
				color: color
			})
			this.pivot.x = this.containerWidth / 2
			this.pivot.y = maxHeight / 2
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)

		this.filters = [
			glitch,
			new NoiseFilter({ noise: 0.5 }),
		]
		this.filterArea = new Rectangle(-lineDistance - 10, -lineDistance - 10, maxWidth + lineDistance * 2 + 50, maxHeight + 5 + 50)
		this.addChild(innerContainer)
	}
	async show() {
		animateSimple(rate => {
			this.containerWidth = rate * this.maxWidth
			this.alpha = rate
		}, { easing: easeOutQuint, duration: 750 })
		await wait(500)
		this.innerContainer.alpha = 0.3
		await wait(100)
		this.innerContainer.alpha = 0
		await wait(200)
		await animateSimple(rate => {
			this.innerContainer.alpha = rate
		}, { easing: easeOutQuint, duration: 750 })
	}
	async hide() {
		await animateSimple(rate => {
			this.innerContainer.alpha = 1 - rate
		}, { easing: easeOutQuint, duration: 250 })
		await animateSimple(rate => {
			this.containerWidth = (1 - rate) * this.maxWidth
			this.alpha = 1 - rate
		}, { easing: easeOutQuint, duration: 750 })
	}
	activate() {
		if (this.isActive) {
			return
		}
		const filters = [...this.filters]
		filters.pop()
		filters.pop()
		this.filters = filters
		this.isActive = true
	}
	deactivate() {
		if (!this.isActive) {
			return
		}
		const filters = [...this.filters]
		filters.push(new GrayscaleFilter())
		const hslFilter = new HslAdjustmentFilter()
		hslFilter.lightness = -0.4
		filters.push(hslFilter)
		this.filters = filters
		this.isActive = false
	}
	destroy(options = { children: true }) {
		TrolleyIO.instance.app.ticker.remove(this.ticker)
		super.destroy(options)
	}
}
