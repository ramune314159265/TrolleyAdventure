import { Graphics } from '../../../libraries/pixi.mjs'
import { easeOutQuint } from '../../../util/easing.js'
import { constants } from '../constants.js'
import { TrolleyIO } from '../index.js'

export class BlackFaceTransition {
	constructor(container) {
		this.container = container
	}
	start() {
		this.graphics = new Graphics()
		this.graphics.rect(0, 0, constants.viewWidth, constants.viewHeight)
		this.graphics.fill({
			color: '#000000'
		})
		this.graphics.alpha = 0
		this.container.addChild(this.graphics)
		const animationTick = 40
		return new Promise(resolve => {
			let tick = 0
			const handleTick = () => {
				if (animationTick < tick) {
					TrolleyIO.instance.app.ticker.remove(handleTick)
					resolve()
				}
				this.graphics.alpha = easeOutQuint(tick / animationTick)
				tick++
			}
			TrolleyIO.instance.app.ticker.add(handleTick)
		})
	}
	async end() {
		const animationTick = 40
		return new Promise(resolve => {
			let tick = 0
			const handleTick = () => {
				if (animationTick < tick) {
					TrolleyIO.instance.app.ticker.remove(handleTick)
					this.container.removeChild(this.graphics)
					resolve()
				}
				this.graphics.alpha = 1 - easeOutQuint(tick / animationTick)
				tick++
			}
			TrolleyIO.instance.app.ticker.add(handleTick)
		})
	}
}
