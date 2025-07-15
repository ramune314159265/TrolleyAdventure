import { Container } from 'pixi.js'
import { colors, constants } from '../constants'
import { HologramContainer } from './hologramContainer'
import { MainText } from './mainText'

export class QuestionFirstInfoComponent extends Container {
	constructor({ questionNo, level }) {
		super()
		this.questionNo = questionNo
		this.level = level
		this.init()
	}
	init() {
		this.innerContainer = new Container()
		const hologramWidth = 600
		const hologramHeight = 300
		this.hologram = new HologramContainer({
			maxWidth: hologramWidth,
			maxHeight: hologramHeight,
			innerContainer: this.innerContainer,
			color: colors.hologramMain
		})
		this.hologram.x = constants.viewWidth / 2
		this.hologram.y = constants.viewHeight / 2
		this.addChild(this.hologram)
		this.questionNoText = new MainText({
			content: `第${this.questionNo}問`,
			styleOverride: {
				fill: colors.hologramText,
				fontSize: 144,
			}
		})
		this.questionNoText.x = hologramWidth / 2
		this.questionNoText.y = 90
		this.innerContainer.addChild(this.questionNoText)
		this.levelText = new MainText({
			content: `Level ${this.level}`,
			styleOverride: {
				fill: colors.hologramText,
				fontSize: 80,
			}
		})
		this.levelText.x = hologramWidth / 2
		this.levelText.y = 210
		this.innerContainer.addChild(this.levelText)
	}
	async show() {
		await this.hologram.show()
	}
	async hide() {
		await this.hologram.hide()
	}
}
