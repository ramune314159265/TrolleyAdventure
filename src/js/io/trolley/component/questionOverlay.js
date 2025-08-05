import { GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter, Rectangle } from 'pixi.js'
import { colors, constants } from '../constants'
import { MainText } from './mainText'

export class QuestionOverlay extends Container {
	constructor() {
		super()
		const height = 100
		const infoWidth = 600
		const questionInfoOverlay = new Graphics()
		questionInfoOverlay
			.moveTo(0, height)
			.lineTo(infoWidth - height * Math.sin(constants.uiRadian), height)
			.lineTo(infoWidth, 0)
		questionInfoOverlay.stroke({
			width: 3,
			color: colors.hologramMain
		})
		questionInfoOverlay.filters = [
			new GlowFilter({
				color: colors.hologramMain,
				outerStrength: 4
			})
		]
		questionInfoOverlay.filterArea = new Rectangle(0, 0, infoWidth + 20, height + 20)
		questionInfoOverlay
			.moveTo(0, height)
			.lineTo(infoWidth - height * Math.sin(constants.uiRadian), height)
			.lineTo(infoWidth, 0)
			.lineTo(0, 0)
		questionInfoOverlay.fill({
			color: `${colors.hologramMain}10`
		})
		this.addChild(questionInfoOverlay)

		this.questionInfoOverlayText = new MainText({
			content: '',
			styleOverride: {
				fontSize: 80,
				fill: colors.hologramText
			}
		})
		this.questionInfoOverlayText.anchor.x = 0
		this.questionInfoOverlayText.x = 24
		this.questionInfoOverlayText.y = height / 2
		this.addChild(this.questionInfoOverlayText)

		this.filters = [new NoiseFilter({ noise: 0.5 })]
	}
	changeInfo({ questionNo, level }) {
		this.questionInfoOverlayText.text = `QuestionNo.${questionNo} Lv.${level}`
	}
}
