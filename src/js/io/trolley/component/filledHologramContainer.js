import { GlitchFilter, GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { TrolleyIO } from '..'
import { constants } from '../constants'

export class FilledHologramContainer extends Container {
	constructor({ maxWidth, maxHeight, color, innerContainer }) {
		super()

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
		background
			.moveTo(maxHeight * Math.sin(constants.uiRadian), 0)
			.lineTo(maxWidth, 0)
			.lineTo(maxWidth - maxHeight * Math.sin(constants.uiRadian), maxHeight)
			.lineTo(0, maxHeight)

		background.fill({
			color
		})
		background.filters = [
			new GlowFilter({
				color: `${color}`,
				distance: 4,
				outerStrength: 8
			}),
		]
		background.filterArea = new Rectangle(-50, -50, maxWidth + 50 * 2, maxHeight + 50 * 2)
		this.pivot.x = maxWidth / 2
		this.pivot.y = maxHeight / 2
		this.addChild(background)
		this.addChild(innerContainer)

		TrolleyIO.instance.app.ticker.add(() => {
			if (Math.random() < 0.2) {
				glitch.refresh()
			}
		})
	}
}
