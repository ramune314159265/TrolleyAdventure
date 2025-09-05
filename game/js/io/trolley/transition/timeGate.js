import { Graphics } from 'pixi.js'
import { easeInQuart, easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { constants } from '../constants'

export class TimeGateTransition {
	constructor(container) {
		this.container = container
	}
	async start() {
		this.graphics = new Graphics()
		this.graphics.rect(0, 0, constants.viewWidth, constants.viewHeight)
		this.graphics.fill({
			color: '#ffffff'
		})
		this.graphics.alpha = 0
		this.container.addChild(this.graphics)
		await animateSimple(rate => {
			this.graphics.alpha = rate
		}, { easing: easeInQuart, duration: 1000 })
		await wait(2000)
	}
	async end() {
		await animateSimple(rate => {
			this.graphics.alpha = 1 - rate
		}, { easing: easeOutQuint, duration: 1000 })
		await wait(500)
	}
}
