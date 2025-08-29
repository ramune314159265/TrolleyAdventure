import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingResultState extends State {
	constructor({ session, isCorrect }) {
		super({ session })
		this.isCorrect = isCorrect
	}
	enter() {
		if(!this.isCorrect) {
			this.session.lives--
		}
		this.emit(sessionStates.showingResult, { isCorrect: this.isCorrect, lives: this.session.lives })
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
