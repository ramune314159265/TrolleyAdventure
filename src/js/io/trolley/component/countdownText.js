import { TrolleyIO } from '..'
import { MainText } from './mainText'

export class CountdownText extends MainText {
	constructor({ styleOverride, additionalScale }) {
		super({ styleOverride })
		this.additionalScale = additionalScale
		this.visible = false
		this.ticker = () => { }
		this.onEnded = () => { }
	}
	start({ periodMs }) {
		const endsMs = performance.now() + periodMs
		this.visible = true
		this.ticker = () => {
			const remain = endsMs - performance.now()
			if (remain < 0) {
				this.visible = false
				this.onEnded()
				TrolleyIO.instance.app.ticker.remove(this.ticker)
				return
			}
			const second = Math.ceil(remain / 1000)
			const remainder = remain / 1000 - Math.floor(remain / 1000)
			this.text = second
			this.scale.set(1 + this.additionalScale * remainder)
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	abort() {
		this.visible = false
		TrolleyIO.instance.app.ticker.remove(this.ticker)
	}
}
