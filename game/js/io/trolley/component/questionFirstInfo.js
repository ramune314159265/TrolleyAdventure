import { GlowFilter } from 'pixi-filters'
import { Container, Sprite } from 'pixi.js'
import { TrolleyIO } from '..'
import { wait } from '../../../util/wait'
import { colors } from '../constants'
import { MainText } from './mainText'

export class QuestionFirstInfoComponent extends Container {
	constructor() {
		super()
		this.init()
	}
	init() {
	}
	setInfo({ accuracy, level }) {
		this.removeChildren()
		const colorSet = (() => {
			switch (true) {
				case 0.8 < accuracy:
					return 'primary'
				case 0.5 < accuracy && accuracy <= 0.8:
					return 'yellow'
				case accuracy <= 0.5:
					return 'red'
				default:
					return 'primary'
			}
		})()

		this.warningMark = Sprite.from('warning')
		this.warningMark.tint = colors[colorSet].main
		this.warningMark.width = 600
		this.warningMark.height = 600
		this.warningMark.anchor.set(0.5)
		this.warningMark.y = 350
		this.warningMark.filters = [
			new GlowFilter({
				color: colors[colorSet].main,
				distance: 12
			})
		]
		this.addChild(this.warningMark)
		this.text = new MainText({
			content: [
				`LEVEL ${level}`,
				`ACCURACY ${Number.isFinite(accuracy) ? Math.round(accuracy * 100) : '?'} %`
			].join('\n'),
			styleOverride: {
				fill: colors[colorSet].text,
				fontSize: 72,
				align: 'center',
				letterSpacing: 16,
				lineHeight: 72
			}
		})
		this.text.anchor.y = 0
		this.text.y = 650
		this.addChild(this.text)
	}
	async show() {
		this.visible = true
		for (let i = 0; i < 7; i++) {
			this.alpha = (i % 2) === 0 ? 0.8 : 0
			await wait(75)
		}
		await wait(1000)
	}
	async hide() {
		TrolleyIO.instance.seManager.play('noise')
		for (let i = 0; i < 9; i++) {
			this.alpha = (i % 2) === 0 ? 0 : 0.8
			await wait(50)
		}
		this.visible = false
	}
}
