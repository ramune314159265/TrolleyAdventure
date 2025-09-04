import { GlowFilter } from 'pixi-filters'
import { Container, NoiseFilter, Sprite } from 'pixi.js'
import { wait } from '../../../util/wait'
import { MainText } from './mainText'

export class QuestionFirstInfoComponent extends Container {
	constructor() {
		super()
		this.init()
	}
	init() {
		this.warningMark = Sprite.from('warning')
		this.warningMark.width = 600
		this.warningMark.height = 600
		this.warningMark.anchor.set(0.5)
		this.warningMark.y = 350
		this.warningMark.filters = [
			new GlowFilter({
				color: '#d16668',
				distance: 12
			})
		]
		this.addChild(this.warningMark)
		this.text = new MainText({
			content: '',
			styleOverride: {
				fill: '#d16668',
				fontSize: 72,
				align: 'center',
				letterSpacing: 16,
				lineHeight: 72
			}
		})
		this.text.anchor.y = 0
		this.text.y = 650
		this.addChild(this.text)
		this.filters = [
			new NoiseFilter({ noise: 0.3 })
		]
	}
	setInfo({ questionNo, level }) {
		this.text.text = [
			`LEVEL ${level}`
		].join('\n')
	}
	async show() {
		this.visible = true
		for (let i = 0; i < 5; i++) {
			this.alpha = (i % 2) === 0 ? 0.8 : 0
			await wait(100)
		}
		await wait(1000)
	}
	async hide() {
		this.visible = false
	}
}
