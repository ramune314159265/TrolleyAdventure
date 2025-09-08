import { TrolleyIO } from '../index'
import { MainText } from './mainText'

export class BlinkText extends MainText {
	constructor({ content, styleOverride }) {
		super({ content, styleOverride })
		const animationStart = performance.now()
		this.ticker = () => {
			this.alpha = Math.abs(Math.sin((performance.now() - animationStart) / 1000))
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	destroy(options = { children: true }) {
		TrolleyIO.instance.app.ticker?.remove?.(this.ticker)
		super.destroy(options)
	}
}
