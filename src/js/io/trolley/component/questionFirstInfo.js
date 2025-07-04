import { Container } from '../../../libraries/pixi.mjs'
import { colors, constants } from '../constants.js'
import { HologramContainer } from './hologramContainer.js'
import { MainText } from './mainText.js'

export class QuestionFirstInfoComponent extends Container {
	constructor({ questionNo, level }) {
		super()
		this.questionNo = questionNo
		this.level = level
		this.init()
	}
	init() {
		this.innerContainer = new Container()
		const hologramWidth = 400
		const hologramHeight = 175
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
				fontSize: 96,
			}
		})
		this.questionNoText.x = hologramWidth / 2
		this.questionNoText.y = 60
		this.innerContainer.addChild(this.questionNoText)
		this.levelText = new MainText({
			content: `Level ${this.level}`,
			styleOverride: {
				fill: colors.hologramText,
				fontSize: 52,
			}
		})
		this.levelText.x = hologramWidth / 2
		this.levelText.y = 140
		this.innerContainer.addChild(this.levelText)
	}
	show() {
		this.hologram.show()
	}
	hide() {
		this.hologram.hide()
	}
}
