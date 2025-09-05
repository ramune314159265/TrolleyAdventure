import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingIncorrectState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.showingIncorrect, { lives: this.session.lives })
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
