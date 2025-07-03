import { GlitchFilter } from '../../../libraries/pixi-filters.mjs'
import { TrolleyIO } from '../index.js'
import { MainText } from './mainText.js'

export class GlitchText extends MainText {
	constructor({ content, styleOverride }) {
		super({ content, styleOverride })
		const glitch = new GlitchFilter({
			slices: 5,
			offset: 5,
			direction: 10,
			fillMode: 1,
		})
		this.filters = [glitch]
		TrolleyIO.instance.app.ticker.add(() => {
			if (0.1 < Math.random()) return
			glitch.refresh()
		})
	}
}
