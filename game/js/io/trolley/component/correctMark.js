import { GlowFilter } from 'pixi-filters'
import { Container, Graphics } from 'pixi.js'
import { TrolleyIO } from '..'
import { easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { colors, constants } from '../constants'
import { MainText } from './mainText'

export class CorrectMark extends Container {
	static offsetRadian = -Math.PI / 2
	static circleWidth = 100
	static radius = 300
	constructor() {
		super()
		this.mark = new Graphics()
		this.mark.filters = [
			new GlowFilter({
				color: colors.primary.main,
				outerStrength: 2
			})
		]
		this.addChild(this.mark)
		this.correctText = new MainText({
			content: '正解！',
			styleOverride: {
				fill: colors.primary.text,
				fontSize: 160,
				letterSpacing: 16
			}
		})
		this.correctText.x = constants.viewWidth / 2
		this.correctText.y = constants.viewHeight / 2
		this.correctText.visible = false
		this.addChild(this.correctText)
	}
	async show() {
		TrolleyIO.instance.seManager.play('is_correct')
		this.correctText.visible = false
		animateSimple(rate => {
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
				.fill({
					color: colors.primary.translucent
				})
				.stroke({
					width: 6,
					color: colors.primary.main
				})
		}, { easing: easeOutQuint, duration: 1500 })

		for (let i = 0; i < 9; i++) {
			this.alpha = (i % 2) === 0 ? 0.75 : 0
			await wait(75)
		}
		TrolleyIO.instance.seManager.play('correct')
		this.alpha = 1
		this.correctText.visible = true
		await wait(750)
	}
	async hide() {
		for (let i = 0; i < 9; i++) {
			this.alpha = (i % 2) === 0 ? 0 : 0.75
			await wait(50)
		}
		this.alpha = 0
	}
}
