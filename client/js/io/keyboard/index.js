import { gameEvents, inputs } from '../../enum'
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
		const keyMap = { a: inputs.left, s: inputs.center, d: inputs.right, w: inputs.confirm, k: inputs.konami }
		Object.keys(keyMap).includes(key) ? this.session.emit(keyMap[key]) : ''
	}
}
