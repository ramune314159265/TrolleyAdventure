import { Assets, Container, Graphics } from 'pixi.js'
import { Scene } from '.'
import { inputs, outputs, sessionStates } from '../../../enum'
import { easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { CountdownText } from '../component/countdownText'
import { FilledHologramContainer } from '../component/filledHologramContainer'
import { FitSprite } from '../component/fitSprite'
import { FitText } from '../component/fitText'
import { HologramContainer } from '../component/hologramContainer'
import { MainText } from '../component/mainText'
import { QuestionCountdown } from '../component/questionCowntdown'
import { QuestionFirstInfoComponent } from '../component/questionFirstInfo'
import { QuestionOverlay } from '../component/questionOverlay'
import { VideoBackground } from '../component/videoBackground'
import { colors, constants } from '../constants'

export class QuestionScene extends Scene {
	constructor() {
		super()
	}
	async init() {
		await Assets.loadBundle('question')
		this.background = new VideoBackground({ width: constants.width, height: constants.height })
		this.background.changeVideo(['stars'])
		this.container.addChild(this.background)
		this.questionOverlay = new QuestionOverlay()
		this.container.addChild(this.questionOverlay)
		this.questionCountdown = new QuestionCountdown()
		this.container.addChild(this.questionCountdown)
	}
	async enter() {
		this.nextQuestion()
	}
	async nextQuestion() {
		const hologramWidth = 750
		const hologramHeight = 650
		const questionFirstInfo = new QuestionFirstInfoComponent()
		questionFirstInfo.x = constants.viewWidth / 2
		this.container.addChild(questionFirstInfo)
		const topHologramInnerContainer = new Container()
		const topHologramWidth = constants.viewWidth * 0.9
		const topHologramHeight = 125
		const topHologram = new FilledHologramContainer({
			maxWidth: topHologramWidth,
			maxHeight: topHologramHeight,
			color: colors.hologramMain,
			innerContainer: topHologramInnerContainer
		})
		topHologram.x = constants.viewWidth / 2
		topHologram.y = constants.viewHeight / 2
		const topText = new FitText({
			content: '',
			styleOverride: {},
			width: topHologramWidth * 0.95,
			height: topHologramHeight,
			maxFontSize: 120,
			minFontSize: 32
		})
		topText.x = topHologramWidth / 2
		topText.y = topHologramHeight / 2
		topHologramInnerContainer.addChild(topText)
		this.container.addChild(topHologram)

		this.on(sessionStates.showingQuestion, async ({ content, level, questionNo, lives }) => {
			this.questionOverlay.changeInfo({ level, questionNo, lives })
			topHologram.y = constants.viewHeight / 2
			questionFirstInfo.setInfo({ questionNo, level, lives })
			await questionFirstInfo.show()
			topText.setText(content)
			await topHologram.show()
			await wait(500 + 1000 * content.length / constants.charactersPerSecond)
			this.emit(inputs.confirm)
		})

		this.emit(inputs.next)

		this.on(sessionStates.showingChoices, async ({ choices, timerMs }) => {
			questionFirstInfo.hide()
			this.questionCountdown.start({ periodMs: timerMs, showCountdown: true })
			animateSimple(rate => {
				topHologram.y = 180 - (rate - 1) * ((constants.viewHeight / 2) - 180)
			}, { easing: easeOutQuint, duration: 1000 })
			await wait(350)
			this.questionContainer = new Container()
			this.container.addChild(this.questionContainer)
			this.optionsContainer = new Container()
			this.optionsContainer.x = constants.viewWidth / 2
			this.optionsContainer.y = 600
			this.questionContainer.addChild(this.optionsContainer)
			const optionPositions = [-1, 1]
			optionPositions.forEach(async (p, i) => {
				await wait(200 * i)
				const optionInnerContainer = new Container()
				const optionHologram = new HologramContainer({
					maxWidth: hologramWidth,
					maxHeight: hologramHeight,
					color: colors.hologramMain,
					innerContainer: optionInnerContainer,
				})
				optionHologram.x = (constants.viewWidth / 4) * p
				this.optionsContainer.addChild(optionHologram)
				const optionCountdown = new CountdownText({
					styleOverride: {
						fontSize: 200,
						fill: colors.hologramText
					},
					additionalScale: 0.5
				})
				optionCountdown.x = (constants.viewWidth / 4) * p
				this.optionsContainer.addChild(optionCountdown)
				optionHologram.show()
				const optionText = new FitText({
					content: choices[i].content,
					width: hologramWidth * 0.9,
					height: 225,
					maxFontSize: 216,
					minFontSize: 32
				})
				optionText.x = hologramWidth / 2
				optionText.y = choices[i].image ? hologramHeight * 0.8 : hologramHeight / 2
				if (choices[i].image) {
					const texture = await Assets.load(`images/question/${choices[i].image}`)
					const image = new FitSprite({ texture, width: hologramWidth * 0.9, height: hologramHeight * 0.9 })
					image.x = hologramWidth / 2
					image.y = hologramHeight / 2
					optionInnerContainer.addChild(image)
				}
				optionInnerContainer.addChild(optionText)
				const deselectedEvent = this.on(outputs.deselectedChoice, ({ index }) => {
					optionHologram.activate()
					optionCountdown.abort()
					if (i === index) {
						animateSimple(rate => {
							optionHologram.scale.set(1.1 - (0.1 * rate))
						}, { easing: easeOutQuint, duration: 500 })
					}
				})
				const selectedEvent = this.on(outputs.selectedChoice, ({ index, timerMs }) => {
					this.questionCountdown.hideText()
					if (i === index) {
						optionHologram.activate()
						animateSimple(rate => {
							optionHologram.scale.set(1 + (0.1 * rate))
						}, { easing: easeOutQuint, duration: 500 })
						optionCountdown.start({ periodMs: timerMs })
					} else {
						optionHologram.deactivate()
						optionCountdown.abort()
						1 < optionHologram.scale.x ? animateSimple(rate => {
							optionHologram.scale = { x: 1.1 - (0.1 * rate), y: 1.1 - (0.1 * rate) }
						}, { easing: easeOutQuint, duration: 500 }) : ''
					}
				})
				this.once(outputs.decidedChoice, async ({ index }) => {
					this.off(deselectedEvent)
					this.off(selectedEvent)
					if (i !== index) {
						await optionHologram.hide()
						optionHologram.destroy()
						return
					}
					optionCountdown.abort()
					this.questionCountdown.abort()
					await wait(1000)
					await animateSimple(rate => {
						optionHologram.x = (1 - rate) * (constants.viewWidth / 4) * p
					}, { easing: easeOutQuint, duration: 1000 })
					topHologram.hide()
					await optionHologram.hide()
					optionHologram.destroy()
				})
			})
		})

		this.on(sessionStates.showingResult, async ({ isCorrect, lives }) => {
			await wait(3000)
			const isCorrectText = new MainText({
				content: isCorrect ? '正解' : '不正解',
				styleOverride: {
					fontSize: 108,
				}
			})
			this.questionOverlay.changeInfo({ lives })
			isCorrectText.x = constants.viewWidth / 2
			isCorrectText.y = constants.viewHeight / 2
			this.questionContainer.addChild(isCorrectText)
			await wait(1000)
			this.questionContainer.removeChild(isCorrectText)

			this.emit(inputs.next)
		})

		this.on(sessionStates.showingExplanation, async ({ correctContent, incorrectContent, imageUrl, timerMs }) => {
			this.questionCountdown.start({ periodMs: timerMs, showCountdown: false })
			const explanationInnerContainer = new Container()
			const explanationHologram = new HologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: colors.hologramMain,
				innerContainer: explanationInnerContainer,
			})
			explanationHologram.x = -constants.viewWidth / 4
			this.optionsContainer.addChild(explanationHologram)
			const explainContent = [
				correctContent,
				incorrectContent
			].filter(c => c).join('\n')
			const explanationText = new MainText({
				content: explainContent,
				styleOverride: {
					fontSize: 72,
					wordWrap: true,
					wordWrapWidth: hologramWidth,
					breakWords: true,
				}
			})
			explanationText.anchor = { x: 0.5, y: 0 }
			explanationText.x = hologramWidth / 2
			explanationText.y = 0
			explanationInnerContainer.addChild(explanationText)
			topText.setText('解説')
			topHologram.show()
			if (imageUrl) {
				const texture = await Assets.load(`images/question/${imageUrl}`)
				const image = new FitSprite({ texture, width: hologramWidth, height: hologramHeight })
				image.x = constants.viewWidth / 4
				this.optionsContainer.addChild(image)
			} else {
				const backgroundGraphics = new Graphics()
				backgroundGraphics.rect(-hologramWidth / 2, -hologramHeight / 2, hologramWidth, hologramHeight)
				backgroundGraphics.x = constants.viewWidth / 4
				backgroundGraphics.fill({ color: `${colors.gray}a0` })
				this.optionsContainer.addChild(backgroundGraphics)
				const noImageText = new MainText({
					content: 'No Image',
					styleOverride: {
						fontSize: 108,
						fill: '#ffffff'
					}
				})
				noImageText.x = constants.viewWidth / 4
				this.optionsContainer.addChild(noImageText)
			}
			const hologramPromise = explanationHologram.show()

			this.once(sessionStates.waitingStage, async () => {
				await hologramPromise
				this.questionCountdown.abort()
				topHologram.hide()
				await explanationHologram.hide()
				this.questionContainer.destroy({ children: true })
				this.emit(inputs.next)
			})
		})
	}
}
