import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingResultState extends State {
	constructor({ session, isCorrect }) {
		super({ session })
		this.isCorrect = isCorrect
	}
	enter() {
		this.emit(sessionStates.showingResult, { isCorrect: this.isCorrect })
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
