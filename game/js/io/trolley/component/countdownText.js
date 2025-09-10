import { TrolleyIO } from '..'
import { MainText } from './mainText'

export class CountdownText extends MainText {
	constructor({ styleOverride, additionalScale }) {
		super({ styleOverride })
		this.additionalScale = additionalScale
		this.visible = false
		this.ticker = () => { }
	}
	start({ periodMs }) {
		const endsMs = performance.now() + periodMs
		this.lastCount = Infinity
		this.onCountChange = () => { }
		this.visible = true
		this.ticker = () => {
			const remain = endsMs - performance.now()
			if (remain < 0) {
				this.abort()
				return
			}
			const second = Math.ceil(remain / 1000)
			const remainder = remain / 1000 - Math.floor(remain / 1000)
			this.text = second
			this.scale.set(1 + this.additionalScale * remainder)
			if (second < this.lastCount) {
				this.lastCount = second
				this.onCountChange()
			}
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	abort() {
		this.visible = false
		TrolleyIO.instance.app.ticker?.remove?.(this.ticker)
	}
}
