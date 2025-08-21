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

		this.hpBar = new Graphics()
		this.hpBar.filters = [
			new GlowFilter({
				color: colors.hologramMain,
				outerStrength: 2
			})
		]
		this.addChild(this.hpBar)
		this.hpText = new MainText({
			content: '- HP',
			styleOverride: {
				fontSize: 60,
				fill: colors.hologramText
			}
		})
		this.hpText.anchor.x = 0
		this.hpText.x = 30
		this.hpText.y = constants.viewHeight - 110
		this.addChild(this.hpText)

		this.filters = [new NoiseFilter({ noise: 0.5 })]
	}
	changeInfo({ questionNo, level, lives }) {
		this.questionInfoOverlayText.text = `QuestionNo.${questionNo} Lv.${level}`
		this.hpBar.clear()
		for (let i = 0; i < Math.min(lives, 20); i++) {
			this.hpBar
				.moveTo(20 + (130 + 15) * i, constants.viewHeight - 35)
				.lineTo(20 + (130 + 15) * i + 130, constants.viewHeight - 35)
				.lineTo(20 + (130 + 15) * i + 130 + 50 * Math.sin(constants.uiRadian), constants.viewHeight - 85)
				.lineTo(20 + (130 + 15) * i + 50 * Math.sin(constants.uiRadian), constants.viewHeight - 85)
				.lineTo(20 + (130 + 15) * i, constants.viewHeight - 35)
			this.hpBar.stroke({
				width: 5,
				color: colors.hologramMain,
			})
			this.hpBar.fill({ color: `${colors.hologramMain}10` })
		}
		this.hpBar
			.moveTo(20, constants.viewHeight - 20)
			.lineTo(20 + (130 + 15) * 3 - 15, constants.viewHeight - 20)
		this.hpBar.stroke({
			width: 8,
			color: colors.hologramMain
		})
		this.hpText.text = `${lives} HP`
	}
}
