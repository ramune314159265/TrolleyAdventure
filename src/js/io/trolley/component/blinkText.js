import { TrolleyIO } from '../index.js'
import { mainText } from './mainText.js'

export const blinkText = ({ content, styleOverride }) => {
	const object = mainText({ content, styleOverride })
	const animationStart = performance.now()
	const topTextTicker = () => {
		object.alpha = Math.abs(Math.sin((performance.now() - animationStart) / 1000))
	}
	TrolleyIO.instance.app.ticker.add(topTextTicker)
	return object
}
