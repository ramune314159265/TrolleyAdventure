import { GlowFilter } from 'pixi-filters'
import { Container, Graphics } from 'pixi.js'
import { TrolleyIO } from '..'
import { wait } from '../../../util/wait'
import { colors, constants } from '../constants'
import { MainText } from './mainText'

export class IncorrectMark extends Container {
	static width = 100
	static size = 700
	constructor() {
		super()
		this.mark = new Graphics()
		this.mark.visible = false
		this.mark.filters = [
			new GlowFilter({
				color: colors.red.main,
				outerStrength: 2
			})
		]
		this.mark.x = constants.viewWidth / 2
		this.mark.y = constants.viewHeight / 2
		this.mark
			.rotateTransform(Math.PI / 4)
			.moveTo(-IncorrectMark.size / 2, IncorrectMark.width / 2)
			.lineTo(-IncorrectMark.width / 2, IncorrectMark.width / 2)
			.lineTo(-IncorrectMark.width / 2, IncorrectMark.size / 2)
			.lineTo(IncorrectMark.width / 2, IncorrectMark.size / 2)
			.lineTo(IncorrectMark.width / 2, IncorrectMark.width / 2)
			.lineTo(IncorrectMark.size / 2, IncorrectMark.width / 2)
			.lineTo(IncorrectMark.size / 2, -IncorrectMark.width / 2)
			.lineTo(IncorrectMark.width / 2, -IncorrectMark.width / 2)
			.lineTo(IncorrectMark.width / 2, -IncorrectMark.size / 2)
			.lineTo(-IncorrectMark.width / 2, -IncorrectMark.size / 2)
			.lineTo(-IncorrectMark.width / 2, -IncorrectMark.width / 2)
			.lineTo(-IncorrectMark.size / 2, -IncorrectMark.width / 2)
			.lineTo(-IncorrectMark.size / 2, IncorrectMark.width / 2)
			.fill({
				color: colors.red.translucent
			})
			.stroke({
				width: 6,
				color: colors.red.main
			})
		this.addChild(this.mark)
		this.correctText = new MainText({
			content: '不正解...',
			styleOverride: {
				fill: '#ffa9a3',
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
		this.mark.visible = true

		for (let i = 0; i < 9; i++) {
			this.alpha = (i % 2) === 0 ? 1 : 0
			await wait(75)
		}
		TrolleyIO.instance.seManager.play('incorrect')
		this.alpha = 1
		this.correctText.visible = true
	}
	async hide() {
		for (let i = 0; i < 9; i++) {
			this.alpha = (i % 2) === 0 ? 0 : 0.75
			await wait(50)
		}
		this.alpha = 0
	}
}
