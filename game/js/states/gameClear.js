import { State } from '.'
import { inputs, outputs, sessionStates } from '../enum'

export class GameClearState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.gameClear, {
			correctContent: this.session.questionData.answer.explanation,
			incorrectContent: this.session.questionData.option.explanation,
			imageUrl: this.session.questionData.answer.explanationImage
		})
		this.session.playData.setCleared(true)
		this.on(inputs.next, () => {
			this.emit(outputs.changeAvailableControls, { controls: { a: '終わる' } })
			this.on(inputs.confirm, () => {
				this.session.end()
			})
		})
	}
}
