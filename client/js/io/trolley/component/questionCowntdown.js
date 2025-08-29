import { GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter } from 'pixi.js'
import { TrolleyIO } from '..'
import { easeOutQuint } from '../../../util/easing'
import { animateSimple } from '../animation'
import { colors, constants } from '../constants'
import { CountdownText } from './countdownText'

export class QuestionCountdown extends Container {
	static gaugeHeight = 15
	static textWrapperHeight = 175
	static textStart = 5000
	static animationDuration = 1000
	constructor() {
		super()
		this.isTextShowed = false
		this.onEnded = () => { }
		this.underGauge = new Graphics()
		this.underGauge.y = constants.viewHeight - QuestionCountdown.gaugeHeight
		this.underGauge.filters = [
			new NoiseFilter({ noise: 0.5 }),
			new GlowFilter({
				color: colors.hologramMain,
				outerStrength: 2
			})
		]
		this.addChild(this.underGauge)
		this.countdownContainer = new Container()
		this.countdownContainer.x = constants.viewWidth / 2
		this.countdownContainer.y = constants.viewHeight
		this.addChild(this.countdownContainer)
		this.countdownWrapper = new Graphics()
		this.countdownWrapper
			.moveTo(-100, -QuestionCountdown.textWrapperHeight / 2)
			.lineTo(100, -QuestionCountdown.textWrapperHeight / 2)
			.lineTo(100 + QuestionCountdown.textWrapperHeight * Math.sin(constants.uiRadian), QuestionCountdown.textWrapperHeight / 2)
			.lineTo(-100 - QuestionCountdown.textWrapperHeight * Math.sin(constants.uiRadian), QuestionCountdown.textWrapperHeight / 2)
			.lineTo(-100, -QuestionCountdown.textWrapperHeight / 2)
		this.countdownWrapper.fill({ color: `${colors.hologramMain}10` })
		this.countdownWrapper.stroke({
			color: colors.hologramMain,
			width: 4
		})
		this.countdownWrapper.filters = [
			new GlowFilter({
				color: colors.hologramMain,
				outerStrength: 4
			})
		]
		this.countdownContainer.addChild(this.countdownWrapper)
		this.countdownText = new CountdownText({
			styleOverride: {
				fontSize: 172,
				fill: colors.hologramText
			},
			additionalScale: 0.4
		})
		this.countdownContainer.addChild(this.countdownText)
		this.countdownContainer.filters = [
			new NoiseFilter({ noise: 0.5 })
		]
		this.visible = false
	}
	start({ periodMs, showCountdown }) {
		this.visible = true
		this.countdownContainer.y = constants.viewHeight + QuestionCountdown.textWrapperHeight / 2
		const startMs = performance.now()
		const endsMs = performance.now() + periodMs
		this.ticker = () => {
			this.underGauge.clear()
			this.underGauge
				.moveTo(constants.viewWidth * (1 - ((endsMs - performance.now()) / (endsMs - startMs))), 0)
				.lineTo(constants.viewWidth, 0)
				.lineTo(constants.viewWidth, QuestionCountdown.gaugeHeight)
				.lineTo(constants.viewWidth * (1 - ((endsMs - performance.now()) / (endsMs - startMs))), QuestionCountdown.gaugeHeight)
			this.underGauge.fill({ color: colors.hologramMain })
			const remain = endsMs - performance.now()
			if (remain <= QuestionCountdown.textStart + QuestionCountdown.animationDuration && showCountdown) {
				this.showText()
			}
			if (remain < 0) {
				this.abort()
				this.onEnded()
				return
			}
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
	abort() {
		this.visible = false
		this.hideText()
		TrolleyIO.instance.app.ticker.remove(this.ticker)
	}
	async showText() {
		if (this.isTextShowed) {
			return
		}
		this.isTextShowed = true
		await animateSimple(rate => {
			this.countdownContainer.y = constants.viewHeight + QuestionCountdown.textWrapperHeight / 2 - QuestionCountdown.textWrapperHeight * rate
		}, { easing: easeOutQuint, duration: QuestionCountdown.animationDuration })
		this.countdownText.start({ periodMs: QuestionCountdown.textStart })
	}
	hideText() {
		this.isTextShowed = false
		this.countdownContainer.y = constants.viewHeight + QuestionCountdown.textWrapperHeight / 2
	}
}
