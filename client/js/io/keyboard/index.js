import { gameEvents, ioCommands, ioEvents } from '../../enum'
import { GameIO } from '../index'

export class KeyboardIO extends GameIO {
	static states = {
		difficultSelect: Symbol(),
		questionAnswer: Symbol(),
		ignore: Symbol()
	}
	constructor() {
		super()
		this.state = KeyboardIO.states.ignore
		this.questionData = null
		this.eventId = document.addEventListener('keydown', e => this.keyPressHandle(e.key))
	}
	connectSession(session) {
		this.session = session
		session.once(gameEvents.sessionLoaded, data => {
			this.difficultList = data.difficultList
			this.state = KeyboardIO.states.difficultSelect
		})
		session.on(gameEvents.nextQuestionStarted, data => {
			this.questionData = data.questionData
			this.state = KeyboardIO.states.questionAnswer
		})
		session.on(gameEvents.gameCleared, () => {
			this.state = KeyboardIO.states.ignore
		})
		session.on(gameEvents.gameOvered, () => {
			this.state = KeyboardIO.states.ignore
		})
	}
	keyPressHandle(key) {
		console.log(key)
		const keyMap = { a: ioEvents.leftSelected, s: ioEvents.rightSelected, d: ioEvents.deselected, f: ioEvents.decided, k: ioCommands.konamiCommand }
		Object.keys(keyMap).includes(key) ? this.session.emit(keyMap[key]) : ''
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
				this.session.emit(ioCommands.gameStart, { difficultId: difficulties[number - 1].id })
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
				this.session.emit(ioCommands.answerQuestion, { isCorrect: questionData.options[number - 1].isCorrect, index: number - 1 })
			}
		}
	}
}
