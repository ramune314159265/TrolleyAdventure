import { Graphics } from 'pixi.js'
import { easeOutQuint } from '../../../util/easing'
import { animateSimple } from '../animation'
import { constants } from '../constants'

export class BlackFaceTransition {
	constructor(container) {
		this.container = container
	}
	async start() {
		this.graphics = new Graphics()
		this.graphics.rect(0, 0, constants.viewWidth, constants.viewHeight)
		this.graphics.fill({
			color: '#000000'
		})
		this.graphics.alpha = 0
		this.container.addChild(this.graphics)
		await animateSimple(rate => {
			this.graphics.alpha = rate
		}, { easing: easeOutQuint, duration: 1000 })
	}
	async end() {
		await animateSimple(rate => {
			this.graphics.alpha = 1 - rate
		}, { easing: easeOutQuint, duration: 1000 })
	}
}
