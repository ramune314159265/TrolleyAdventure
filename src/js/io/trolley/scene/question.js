import { Container } from 'pixi.js'
import { ioCommands, ioEvents } from '../../../enum.js'
import { stringSplitByLength } from '../../../util/split.js'
import { wait } from '../../../util/wait.js'
import { HologramContainer } from '../component/hologramContainer.js'
import { MainText } from '../component/mainText.js'
import { QuestionFirstInfoComponent } from '../component/questionFirstInfo.js'
import { colors, constants } from '../constants.js'
import { TrolleyIO } from '../index.js'

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
		this.questionContainer = new Container()
		this.container.addChild(this.questionContainer)
		const topText = new MainText({
			content: questionInfo.questionData.content,
			styleOverride: {
				fontSize: 72
			}
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
			const optionText = new MainText({
				content: questionInfo.questionData.options[i].content,
				styleOverride: {
					fill: colors.hologramText,
					fontSize: 72,
				}
			})
			optionText.x = hologramWidth / 2
			optionText.y = hologramHeight / 2
			optionInnerContainer.addChild(optionText)
			TrolleyIO.instance.game.onAny(eventName => {
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
						...stringSplitByLength(questionInfo.questionData.answer.explanation, 12),
						...stringSplitByLength(questionInfo.questionData.option.explanation, 12)
					].join('\n'),
					styleOverride: {
						fontSize: 48,
					}
				})
				explanationText.anchor = { x: 0, y: 0 }
				explanationText.x = 0
				explanationText.y = 100
				explanationInnerContainer.addChild(explanationText)
				await explanationHologram.show()
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
