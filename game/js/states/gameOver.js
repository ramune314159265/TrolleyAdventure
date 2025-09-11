import { inputs, outputs, sessionStates } from '../enum'
import { Scene } from '../io/trolley/scene'

export class GameOverState extends Scene {
	constructor({ session, index }) {
		super({ session })
		this.index = index
	}
	enter() {
		this.emit(sessionStates.gameOver, {
			correctContent: this.session.questionData.answer.explanation,
			incorrectContent: this.session.questionData.option.explanation,
			imageUrl: this.session.questionData.answer.explanationImage,
			index: this.index
		})
		this.on(inputs.next, () => {
			this.emit(outputs.changeAvailableControls, { controls: { a: '終わる' } })
			this.on(inputs.confirm, () => {
				this.session.end()
			})
		})
	}
}
