import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingCorrectState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.showingCorrect)
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
