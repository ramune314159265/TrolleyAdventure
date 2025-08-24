import { GlowFilter } from 'pixi-filters'
import { Container, Graphics, NoiseFilter } from 'pixi.js'
import { TrolleyIO } from '..'
import { colors, constants } from '../constants'
import { CountdownText } from './countdownText'

export class QuestionCountdown extends Container {
	static gaugeHeight = 15
	static textStart = 5000
	static animationDuration = 500
	constructor() {
		super()
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
		this.countDownText = new CountdownText({
			styleOverride: {
				fontSize: 200,
				fill: colors.hologramText
			},
			additionalScale: 0.5
		})
		this.countDownText.x = constants.viewWidth / 2
		this.countDownText.y = constants.viewHeight - 100
		this.addChild(this.countDownText)
		this.visible = false
	}
	start({ periodMs }) {
		this.visible = true
		const startMs = performance.now()
		const endsMs = performance.now() + periodMs
		this.countDownText.start({ periodMs })
		this.ticker = () => {
			this.underGauge.clear()
			this.underGauge
				.moveTo(constants.viewWidth * (1 - ((endsMs - performance.now()) / (endsMs - startMs))), 0)
				.lineTo(constants.viewWidth, 0)
				.lineTo(constants.viewWidth, QuestionCountdown.gaugeHeight)
				.lineTo(constants.viewWidth * (1 - ((endsMs - performance.now()) / (endsMs - startMs))), QuestionCountdown.gaugeHeight)
			this.underGauge.fill({ color: colors.hologramMain })
			const remain = endsMs - performance.now()
			if (remain < 0) {
				this.visible = false
				this.onEnded()
				TrolleyIO.instance.app.ticker.remove(this.ticker)
				return
			}
		}
		TrolleyIO.instance.app.ticker.add(this.ticker)
	}
}
