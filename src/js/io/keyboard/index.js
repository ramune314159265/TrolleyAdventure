import { gameEvents, ioCommands, ioEvents } from '../../enum'
import { GameIO } from '../index'

export class KeyboardIO extends GameIO {
	static states = {
		difficultSelect: Symbol(),
		questionAnswer: Symbol(),
		ignore: Symbol()
	}
	constructor(game) {
		super(game)
		this.state = KeyboardIO.states.ignore
		this.questionData = null
		this.eventId = document.addEventListener('keydown', e => this.keyPressHandle(e.key))

		game.once(gameEvents.sessionLoaded, data => {
			this.difficultList = data.difficultList
			this.state = KeyboardIO.states.difficultSelect
		})
		game.on(gameEvents.nextQuestionStarted, data => {
			this.questionData = data.questionData
			this.state = KeyboardIO.states.questionAnswer
		})
		game.on(gameEvents.gameCleared, () => {
			this.state = KeyboardIO.states.ignore
		})
		game.on(gameEvents.gameOvered, () => {
			this.state = KeyboardIO.states.ignore
		})
	}
	keyPressHandle(key) {
		console.log(key)
		const keyMap = { a: ioEvents.leftSelected, s: ioEvents.rightSelected, d: ioEvents.deselected }
		Object.keys(keyMap).includes(key) ? this.game.emit(keyMap[key]) : ''
		switch (this.state) {
			case KeyboardIO.states.difficultSelect: {
				const number = parseInt(key)
				if (Number.isNaN(number)) {
					break
				}
				const difficulties = Object.values(this.difficultList)
				if (!(0 < number && number <= difficulties.length)) {
					break
				}
				this.game.emit(ioCommands.gameStart, { difficultId: difficulties[number - 1].id })
				break
			}
			case KeyboardIO.states.questionAnswer: {
				const questionData = this.questionData
				if (!questionData) {
					console.log(questionData)
					break
				}
				const number = parseInt(key)
				if (Number.isNaN(number)) {
					break
				}
				if (!(0 < number && number <= questionData.options.length)) {
					break
				}
				this.questionData = null
				this.game.emit(ioCommands.answerQuestion, { isCorrect: questionData.options[number - 1].isCorrect, index: number - 1 })
			}
		}
	}
}
