import { GlitchFilter, GlowFilter } from '../../../libraries/pixi-filters.mjs'
import { Container, Graphics, NoiseFilter } from '../../../libraries/pixi.mjs'
import { easeOutQuint } from '../../../util/easing.js'
import { TrolleyIO } from '../index.js'

export const hologramContainer = () => {
	const container = new Container()

	const maxWidth = 400
	const maxHeight = 300
	const lineGap = 25
	const lineDistance = 20
	const animationTick = 40
	const color = '#00ffcc'

	const grid = new Graphics()
	container.addChild(grid)
	const flame = new Graphics()
	container.addChild(flame)

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

		lineOffset += 0.2
		if (lineDistance < lineOffset) {
			lineOffset = 0
		}
		grid.clear()
		for (let i = 0; i <= maxHeight; i += lineDistance) {
			grid.moveTo(lineGap, i + lineOffset).lineTo(width - lineGap, i + lineOffset)
		}
		grid.stroke({
			width: 3,
			color: color
		})
		if (Math.random() < 0.2) {
			glitch.refresh()
		}

		grid.alpha = 0.4
		grid.filters = [new GlowFilter({
			color,
			outerStrength: 3
		})]
		flame.clear()
		flame.filters = [new GlowFilter({
			color: `${color}50`,
			outerStrength: 4
		})]
		flame.roundRect(0, 0, width, maxHeight, 24)
		flame.stroke({
			width: 2,
			color: `${color}bb`
		})
		flame.fill({
			color: `${color}10`
		})
		container.pivot.x = width / 2
		container.pivot.y = maxHeight / 2
	})

	container.filters = [
		glitch,
		new NoiseFilter({ noise: 0.4 }),
	]
	return container
}
