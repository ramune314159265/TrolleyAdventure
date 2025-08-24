import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import { ioCommands, ioEvents } from '../../../enum'
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
import { colors, constants } from '../constants'
import { TrolleyIO } from '../index'

export class QuestionScene {
	constructor() {
		this.container = new Container()
	}
	async init() {
		await Assets.loadBundle('question')
		const stars = await Assets.load('stars')
		const starsBackground = new Sprite(stars)
		starsBackground.texture.source.resource.loop = true
		starsBackground.width = constants.viewWidth
		starsBackground.height = constants.viewHeight
		this.container.addChild(starsBackground)
		this.questionOverlay = new QuestionOverlay()
		this.container.addChild(this.questionOverlay)
		this.questionCountdown = new QuestionCountdown()
		this.container.addChild(this.questionCountdown)
	}
	async enter() {
		this.nextQuestion()
	}
	async nextQuestion() {
		const questionInfo = TrolleyIO.instance.questionInfo
		this.questionFirstInfo = new QuestionFirstInfoComponent({ questionNo: questionInfo.questionNo + 1, level: questionInfo.level })
		this.container.addChild(this.questionFirstInfo)
		this.questionOverlay.changeInfo({ questionNo: questionInfo.questionNo + 1, level: questionInfo.level, lives: questionInfo.lives })

		await this.questionFirstInfo.show()
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
			content: questionInfo.questionData.content,
			styleOverride: {},
			width: topHologramWidth,
			height: topHologramHeight,
			maxFontSize: 120,
			minFontSize: 32
		})
		topText.x = topHologramWidth / 2
		topText.y = topHologramHeight / 2
		topHologramInnerContainer.addChild(topText)
		this.container.addChild(topHologram)
		await topHologram.show()
		await wait(500 + 1000 * questionInfo.questionData.content.length / constants.charactersPerSecond)
		this.questionFirstInfo.hide()
		this.container.removeChild(this.questionFirstInfo)
		animateSimple(rate => {
			topHologram.y = 180 - (rate - 1) * ((constants.viewHeight / 2) - 180)
		}, { easing: easeOutQuint, duration: 1000 })
		await wait(350)

		this.questionCountdown.start({ periodMs: TrolleyIO.instance.difficultData.time_limit * 1000 })
		this.questionContainer = new Container()
		this.container.addChild(this.questionContainer)
		const optionsContainer = new Container()
		optionsContainer.x = constants.viewWidth / 2
		optionsContainer.y = 600
		const optionPositions = [-1, 1]
		optionPositions.forEach(async (p, i) => {
			await wait(200 * i)
			const optionInnerContainer = new Container()
			const hologramWidth = 750
			const hologramHeight = 650
			const optionHologram = new HologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: colors.hologramMain,
				innerContainer: optionInnerContainer,
			})
			optionHologram.x = (constants.viewWidth / 4) * p
			optionsContainer.addChild(optionHologram)
			const optionCountdown = new CountdownText({
				styleOverride: {
					fontSize: 200,
					fill: colors.hologramText
				},
				additionalScale: 0.5
			})
			optionCountdown.x = (constants.viewWidth / 4) * p
			optionCountdown.onEnded = () => {
				TrolleyIO.instance.session.emit(ioCommands.answerQuestion, { isCorrect: questionInfo.questionData.options[i].isCorrect, index: i })
			}
			optionsContainer.addChild(optionCountdown)
			optionHologram.show()
			const optionText = new FitText({
				content: questionInfo.questionData.options[i].content,
				width: hologramWidth * 0.9,
				height: 225,
				maxFontSize: 216,
				minFontSize: 32
			})
			optionText.x = hologramWidth / 2
			optionText.y = questionInfo.questionData.options[i].image ? hologramHeight * 0.8 : hologramHeight / 2
			if (questionInfo.questionData.options[i].image) {
				const texture = await Assets.load(`images/question/${questionInfo.questionData.options[i].image}`)
				const image = new FitSprite({ texture, width: hologramWidth * 0.9, height: hologramHeight * 0.9 })
				image.x = hologramWidth / 2
				image.y = hologramHeight / 2
				optionInnerContainer.addChild(image)
			}
			optionInnerContainer.addChild(optionText)
			const selectedEvent = TrolleyIO.instance.session.onAny(eventName => {
				const observerEvents = [ioEvents.deselected, ioEvents.leftSelected, ioEvents.rightSelected]
				if (!Object.values(observerEvents).includes(eventName)) {
					return
				}
				const targetEvent = i === 0 ? ioEvents.leftSelected : ioEvents.rightSelected
				if (eventName === targetEvent) {
					optionHologram.scale.x < 1.1 ? animateSimple(rate => {
						optionHologram.scale = { x: 1 + (0.1 * rate), y: 1 + (0.1 * rate) }
					}, { easing: easeOutQuint, duration: 500 }) : ''
					optionCountdown.start({ periodMs: TrolleyIO.instance.difficultData.selected_time_limit * 1000 })
				} else {
					1 < optionHologram.scale.x ? animateSimple(rate => {
						optionHologram.scale = { x: 1.1 - (0.1 * rate), y: 1.1 - (0.1 * rate) }
					}, { easing: easeOutQuint, duration: 500 }) : ''
					optionCountdown.abort()
				}

				if (eventName === targetEvent || eventName === ioEvents.deselected) {
					optionHologram.activate()
				} else {
					optionHologram.deactivate()
				}
			})
			TrolleyIO.instance.session.once(ioCommands.answerQuestion, async ({ index, isCorrect }) => {
				TrolleyIO.instance.session.offAny(selectedEvent)
				if (i !== index) {
					optionHologram.hide()
					return
				}
				await wait(1000)
				await animateSimple(rate => {
					optionHologram.x = (1 - rate) * (constants.viewWidth / 4) * p
				}, { easing: easeOutQuint, duration: 1000 })
				topHologram.hide()
				await optionHologram.hide()
				this.container.removeChild(topHologram)
				await wait(1000)
				const isCorrectText = new MainText({
					content: TrolleyIO.instance.state === TrolleyIO.states.quiz ?
						(isCorrect ? '正解' : '不正解') :
						(TrolleyIO.instance.state === TrolleyIO.states.gameClear) ? 'Game Clear' : 'Game Over',
					styleOverride: {
						fontSize: 108,
					}
				})
				isCorrectText.x = constants.viewWidth / 2
				isCorrectText.y = constants.viewHeight / 2
				this.questionContainer.addChild(isCorrectText)
				await wait(2000)
				this.questionContainer.removeChild(isCorrectText)
				const explanationInnerContainer = new Container()
				const explanationHologram = new HologramContainer({
					maxWidth: hologramWidth,
					maxHeight: hologramHeight,
					color: colors.hologramMain,
					innerContainer: explanationInnerContainer,
				})
				explanationHologram.x = (constants.viewWidth / 4) * p
				optionsContainer.addChild(explanationHologram)
				const explanationTopText = new MainText({
					content: '解説',
					styleOverride: {
						fontSize: 108,
					}
				})
				explanationTopText.x = hologramWidth / 2
				explanationTopText.y = 75
				explanationInnerContainer.addChild(explanationTopText)
				const explainContent = [
					questionInfo.questionData.answer.explanation,
					questionInfo.questionData.option.explanation
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
				explanationText.y = 125
				explanationInnerContainer.addChild(explanationText)
				await explanationHologram.show()
				if (questionInfo.questionData.answer.explanationImage) {
					const texture = await Assets.load(`images/question/${questionInfo.questionData.answer.explanationImage}`)
					const image = new FitSprite({ texture, width: hologramWidth, height: hologramHeight })
					image.x = (constants.viewWidth / 4) * -p
					optionsContainer.addChild(image)
				} else {
					const backgroundGraphics = new Graphics()
					backgroundGraphics.rect(-hologramWidth / 2, -hologramHeight / 2, hologramWidth, hologramHeight)
					backgroundGraphics.x = (constants.viewWidth / 4) * -p
					backgroundGraphics.fill({ color: `${colors.gray}a0` })
					optionsContainer.addChild(backgroundGraphics)
					const noImageText = new MainText({
						content: 'No Image',
						styleOverride: {
							fontSize: 108,
							fill: '#ffffff'
						}
					})
					noImageText.x = (constants.viewWidth / 4) * -p
					optionsContainer.addChild(noImageText)
				}
				if (TrolleyIO.instance.state === TrolleyIO.states.quiz) {
					await wait(2000 + 1000 * explainContent.length / constants.charactersPerSecond)
					await explanationHologram.hide()
					this.container.removeChild(this.questionContainer)
					this.nextQuestion()
				}
			})
		})
		this.questionContainer.addChild(optionsContainer)
	}
}
