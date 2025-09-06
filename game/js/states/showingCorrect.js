import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingCorrectState extends State {
	constructor({ session, index }) {
		super({ session })
		this.index = index
	}
	enter() {
		this.emit(sessionStates.showingCorrect, { index: this.index })
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
