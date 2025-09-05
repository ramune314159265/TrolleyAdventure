import { Container, Graphics } from 'pixi.js'
import { easeOutQuint } from '../../../util/easing'
import { animateSimple } from '../animation'
import { colors, constants } from '../constants'

export class CorrectMark extends Container {
	static offsetRadian = -Math.PI / 2
	static circleWidth = 30
	static radius = 250
	constructor() {
		super()
		this.mark = new Graphics()

		this.addChild(this.mark)
	}
	async show() {
		await animateSimple(rate => {
			this.mark
				.clear()
				.beginPath()
				.arc(
					constants.viewWidth / 2, constants.viewHeight / 2, CorrectMark.radius + CorrectMark.circleWidth / 2,
					CorrectMark.offsetRadian, CorrectMark.offsetRadian + Math.PI * 2 * rate,
				)
				.arc(
					constants.viewWidth / 2, constants.viewHeight / 2, CorrectMark.radius - CorrectMark.circleWidth / 2,
					CorrectMark.offsetRadian + Math.PI * 2 * rate, CorrectMark.offsetRadian, true
				)
				.closePath()
				.stroke({
					width: 4,
					color: colors.hologramMain
				})
				.fill({

				})
		}, { easing: easeOutQuint, duration: 2000 })
	}
}
