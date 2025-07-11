import { Assets, Container, Graphics } from 'pixi.js'
import { ioCommands, ioEvents } from '../../../enum'
import { wait } from '../../../util/wait'
import { FitSprite } from '../component/fitSprite'
import { FitText } from '../component/fitText'
import { HologramContainer } from '../component/hologramContainer'
import { MainText } from '../component/mainText'
import { QuestionFirstInfoComponent } from '../component/questionFirstInfo'
import { colors, constants } from '../constants'
import { TrolleyIO } from '../index'

export class QuestionScene {
	constructor() {
		this.container = new Container()
	}
	async init() {
	}
	async enter() {
		this.nextQuestion()
	}
	async nextQuestion() {
		const questionInfo = TrolleyIO.instance.questionInfo
		this.questionFirstInfo = new QuestionFirstInfoComponent({ questionNo: questionInfo.questionNo + 1, level: questionInfo.level })
		this.container.addChild(this.questionFirstInfo)
		await this.questionFirstInfo.show()
		await wait(1000)
		await this.questionFirstInfo.hide()
		this.container.removeChild(this.questionFirstInfo)
		this.questionContainer = new Container()
		this.container.addChild(this.questionContainer)
		const topText = new FitText({
			content: questionInfo.questionData.content,
			styleOverride: {},
			width: constants.viewWidth * 0.9,
			height: 125,
			maxFontSize: 72,
			minFontSize: 16
		})
		topText.x = constants.viewWidth / 2
		topText.y = 125
		this.questionContainer.addChild(topText)
		const optionsContainer = new Container()
		optionsContainer.x = constants.viewWidth / 2
		optionsContainer.y = 400
		const optionPositions = [-1, 1]
		optionPositions.forEach(async (p, i) => {
			await wait(200 * i)
			const optionInnerContainer = new Container()
			const hologramWidth = 500
			const hologramHeight = 425
			const optionHologram = new HologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: colors.hologramMain,
				innerContainer: optionInnerContainer,
			})
			optionHologram.x = (constants.viewWidth / 4) * p
			optionsContainer.addChild(optionHologram)
			optionHologram.show()
			const optionText = new FitText({
				content: questionInfo.questionData.options[i].content,
				styleOverride: {
					fill: colors.hologramText,
				},
				width: hologramWidth * 0.9,
				height: 150,
				maxFontSize: 144,
				minFontSize: 16
			})
			optionText.x = hologramWidth / 2
			optionText.y = questionInfo.questionData.options[i].image ? hologramHeight * 0.8 : hologramHeight / 2
			if (questionInfo.questionData.options[i].image) {
				const texture = await Assets.load(questionInfo.questionData.options[i].image)
				const image = new FitSprite({ texture, width: hologramWidth * 0.9, height: hologramHeight * 0.9 })
				image.x = hologramWidth / 2
				image.y = hologramHeight / 2
				optionInnerContainer.addChild(image)
			}
			optionInnerContainer.addChild(optionText)
			const selectedEvent = TrolleyIO.instance.game.onAny(eventName => {
				const observerEvents = [ioEvents.deselected, ioEvents.leftSelected, ioEvents.rightSelected]
				if (!Object.values(observerEvents).includes(eventName)) {
					return
				}
				const targetEvent = i === 0 ? ioEvents.leftSelected : ioEvents.rightSelected
				if (eventName == targetEvent) {
					optionHologram.scale = { x: 1.05, y: 1.05 }
				} else {
					optionHologram.scale = { x: 1, y: 1 }
				}
			})
			TrolleyIO.instance.game.once(ioCommands.answerQuestion, async ({ index, isCorrect }) => {
				TrolleyIO.instance.game.offAny(selectedEvent)
				if (i !== index) {
					optionHologram.hide()
					return
				}
				await wait(3000)
				this.questionContainer.removeChild(topText)
				await optionHologram.hide()
				await wait(1000)
				const isCorrectText = new MainText({
					content: TrolleyIO.instance.state === TrolleyIO.states.quiz ?
						(isCorrect ? '正解' : '不正解') :
						(TrolleyIO.instance.state === TrolleyIO.states.gameClear) ? 'Game Clear' : 'Game Over',
					styleOverride: {
						fontSize: 72,
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
						fontSize: 72,
					}
				})
				explanationTopText.x = hologramWidth / 2
				explanationTopText.y = 50
				explanationInnerContainer.addChild(explanationTopText)
				const explanationText = new MainText({
					content: [
						questionInfo.questionData.answer.explanation,
						questionInfo.questionData.option.explanation
					].join('\n'),
					styleOverride: {
						fontSize: 48,
						wordWrap: true,
						wordWrapWidth: hologramWidth,
						breakWords: true,
					}
				})
				explanationText.anchor = { x: 0.5, y: 0 }
				explanationText.x = hologramWidth / 2
				explanationText.y = 100
				explanationInnerContainer.addChild(explanationText)
				await explanationHologram.show()
				if (questionInfo.questionData.answer.explanationImage) {
					const texture = await Assets.load(questionInfo.questionData.answer.explanationImage)
					const image = new FitSprite({ texture, width: hologramWidth, height: hologramHeight })
					image.x = (constants.viewWidth / 4) * -p
					optionsContainer.addChild(image)
				} else {
					const backgroundGraphics = new Graphics()
					backgroundGraphics.rect(-hologramWidth / 2, -hologramHeight / 2, hologramWidth, hologramHeight)
					backgroundGraphics.x = (constants.viewWidth / 4) * -p
					backgroundGraphics.fill({ color: colors.gray })
					optionsContainer.addChild(backgroundGraphics)
					const noImageText = new MainText({
						content: 'No Image',
						styleOverride: {
							fontSize: 72,
							fill: '#ffffff'
						}
					})
					noImageText.x = (constants.viewWidth / 4) * -p
					optionsContainer.addChild(noImageText)
				}
				if (TrolleyIO.instance.state === TrolleyIO.states.quiz) {
					await wait(3000)
					await explanationHologram.hide()
					this.container.removeChild(this.questionContainer)
					this.nextQuestion()
				}
			})
		})
		this.questionContainer.addChild(optionsContainer)
	}
}
