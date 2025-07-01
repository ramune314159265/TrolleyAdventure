import { GlitchFilter } from '../../../libraries/pixi-filters.mjs'
import { TrolleyIO } from '../index.js'
import { mainText } from './mainText.js'

export const glitchText = ({ content, styleOverride }) => {
	const object = mainText({ content, styleOverride })
	const glitch = new GlitchFilter({
		slices: 5,
		offset: 5,
		direction: 10,
		fillMode: 1,
	})
	object.filters = [glitch]
	TrolleyIO.instance.app.ticker.add(() => {
		if (0.1 < Math.random()) return
		glitch.refresh()
	})
	return object
}
