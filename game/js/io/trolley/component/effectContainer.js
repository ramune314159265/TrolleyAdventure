import { GlitchFilter } from 'pixi-filters'
import { Container, NoiseFilter } from 'pixi.js'
import { TrolleyIO } from '..'

export class EffectContainer extends Container {
	constructor() {
		super()
		const glitch = new GlitchFilter({
			slices: 6,
			offset: 4,
			direction: 20,
			fillMode: 1,
		})
		this.filters = [
			glitch,
			new NoiseFilter({ noise: 0.5 })
		]
		this.ticker = () => {
			if (Math.random() < 0.15) {
				glitch.refresh()
			}
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	destroy(options = { children: true }) {
		TrolleyIO.instance.app.ticker.remove(this.ticker)
		super.destroy(options)
	}
}
